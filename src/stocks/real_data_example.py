"""
使用真实股票数据的底部反转信号策略示例
需要安装: pip install yfinance pandas numpy
"""

import pandas as pd
import numpy as np
import yfinance as yf
from bottom_reversal_signal import BottomReversalSignal, TradingStrategy


def load_real_stock_data(symbol: str, period: str = "1y") -> pd.DataFrame:
    """
    加载真实股票数据
    
    Args:
        symbol: 股票代码，如 '000001.SZ' 或 'AAPL'
        period: 数据周期，如 '1y', '2y', '6mo' 等
        
    Returns:
        包含OHLCV数据的DataFrame
    """
    try:
        ticker = yf.Ticker(symbol)
        data = ticker.history(period=period)
        
        if data.empty:
            raise ValueError(f"无法获取股票 {symbol} 的数据")
        
        # 重命名列以匹配我们的代码
        data.columns = [col.lower() for col in data.columns]
        data = data.rename(columns={
            'adj close': 'close'
        })
        
        # 确保列名正确
        required_columns = ['open', 'high', 'low', 'close', 'volume']
        for col in required_columns:
            if col not in data.columns:
                raise ValueError(f"缺少必要的列: {col}")
        
        print(f"成功加载 {symbol} 的数据，共 {len(data)} 条记录")
        print(f"数据时间范围: {data.index[0].strftime('%Y-%m-%d')} 到 {data.index[-1].strftime('%Y-%m-%d')}")
        
        return data
        
    except Exception as e:
        print(f"加载股票数据失败: {e}")
        return None


def analyze_stock(symbol: str, period: str = "1y"):
    """
    分析单只股票的底部反转信号
    
    Args:
        symbol: 股票代码
        period: 数据周期
    """
    print(f"\n分析股票: {symbol}")
    print("=" * 60)
    
    # 加载数据
    data = load_real_stock_data(symbol, period)
    if data is None:
        return None
    
    # 计算底部反转信号
    signal_calculator = BottomReversalSignal(data)
    signal_data = signal_calculator.get_bottom_reversal_signals()
    
    # 统计信号
    signal_count = signal_data['底部拐点信号'].sum()
    print(f"发现 {signal_count} 个底部反转信号")
    
    if signal_count > 0:
        # 显示信号日期
        signal_dates = signal_data[signal_data['底部拐点信号']].index
        print("\n底部反转信号日期:")
        for date in signal_dates:
            print(f"  {date.strftime('%Y-%m-%d')} 收盘价: ¥{signal_data.loc[date, 'close']:.2f}")
    
    # 运行交易策略
    strategy = TradingStrategy(data)
    results = strategy.run_strategy(signal_data)
    
    # 输出结果
    print(f"\n策略结果:")
    print(f"  初始资金: ¥{results['initial_cash']:,.2f}")
    print(f"  最终总价值: ¥{results['final_total_value']:,.2f}")
    print(f"  总收益率: {results['total_return_pct']:.2f}%")
    print(f"  总交易次数: {results['total_trades']}")
    
    return signal_data, results


def compare_multiple_stocks(symbols: list, period: str = "1y"):
    """
    比较多只股票的底部反转信号策略表现
    
    Args:
        symbols: 股票代码列表
        period: 数据周期
    """
    print("多股票底部反转信号策略比较")
    print("=" * 80)
    
    results_summary = []
    
    for symbol in symbols:
        try:
            signal_data, results = analyze_stock(symbol, period)
            if results:
                results_summary.append({
                    'symbol': symbol,
                    'total_return': results['total_return_pct'],
                    'total_trades': results['total_trades'],
                    'final_value': results['final_total_value']
                })
        except Exception as e:
            print(f"分析 {symbol} 时出错: {e}")
    
    # 输出比较结果
    if results_summary:
        print("\n策略表现比较:")
        print("-" * 80)
        print(f"{'股票代码':<15} {'收益率(%)':<12} {'交易次数':<10} {'最终价值':<15}")
        print("-" * 80)
        
        # 按收益率排序
        results_summary.sort(key=lambda x: x['total_return'], reverse=True)
        
        for result in results_summary:
            print(f"{result['symbol']:<15} {result['total_return']:<12.2f} "
                  f"{result['total_trades']:<10} ¥{result['final_value']:<14,.2f}")


def main():
    """主函数"""
    print("底部反转信号策略 - 真实股票数据示例")
    print("=" * 60)
    
    # 示例股票代码（可以根据需要修改）
    # 中国股票示例
    chinese_stocks = [
        '000001.SZ',  # 平安银行
        '000002.SZ',  # 万科A
        '600036.SS',  # 招商银行
        '600519.SS',  # 贵州茅台
    ]
    
    # 美股示例
    us_stocks = [
        'AAPL',   # 苹果
        'MSFT',   # 微软
        'GOOGL',  # 谷歌
        'TSLA',   # 特斯拉
    ]
    
    print("选择要分析的股票类型:")
    print("1. 中国股票")
    print("2. 美股")
    print("3. 自定义股票代码")
    
    choice = input("请输入选择 (1/2/3): ").strip()
    
    if choice == "1":
        symbols = chinese_stocks
        print(f"\n分析中国股票: {', '.join(symbols)}")
    elif choice == "2":
        symbols = us_stocks
        print(f"\n分析美股: {', '.join(symbols)}")
    elif choice == "3":
        custom_symbols = input("请输入股票代码（用逗号分隔）: ").strip()
        symbols = [s.strip() for s in custom_symbols.split(',')]
    else:
        print("无效选择，使用默认中国股票")
        symbols = chinese_stocks
    
    # 选择数据周期
    period = input("请输入数据周期 (如: 1y, 2y, 6mo，默认1y): ").strip() or "1y"
    
    # 运行分析
    compare_multiple_stocks(symbols, period)


if __name__ == "__main__":
    main()

