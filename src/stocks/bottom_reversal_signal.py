"""
底部反转信号交易策略
基于通达信主力成本逻辑中的底部拐点信号实现
"""

import pandas as pd
import numpy as np
from typing import Tuple, List


class BottomReversalSignal:
    """底部反转信号计算类"""
    
    def __init__(self, data: pd.DataFrame):
        """
        初始化
        
        Args:
            data: 包含OHLCV数据的DataFrame，必须包含columns: ['open', 'high', 'low', 'close', 'volume']
        """
        self.data = data.copy()
        self._calculate_indicators()
    
    def _calculate_indicators(self):
        """计算所有必要的技术指标"""
        # 计算短期多空线（3日典型价格移动平均）
        typical_price = (self.data['open'] + self.data['high'] + self.data['low'] + self.data['close']) / 4
        self.data['短期多空线'] = typical_price.rolling(window=3).mean()
        
        # 计算5日均量
        self.data['MA5_VOL'] = self.data['volume'].rolling(window=5).mean()
        
        # 计算短期多空线斜率（5日线性拟合斜率）
        self.data['短期多空线斜率'] = self._calculate_slope(self.data['短期多空线'], 5)
        
        # 计算前一日和前两日斜率
        self.data['前日短期斜率'] = self.data['短期多空线斜率'].shift(1)
        self.data['前2日短期斜率'] = self.data['短期多空线斜率'].shift(2)
    
    def _calculate_slope(self, series: pd.Series, window: int) -> pd.Series:
        """
        计算线性拟合斜率
        
        Args:
            series: 时间序列
            window: 窗口大小
            
        Returns:
            斜率序列
        """
        slopes = []
        for i in range(len(series)):
            if i < window - 1:
                slopes.append(np.nan)
            else:
                y = series.iloc[i-window+1:i+1].values
                x = np.arange(window)
                if len(y) == window and not np.isnan(y).any():
                    slope = np.polyfit(x, y, 1)[0]
                    slopes.append(slope)
                else:
                    slopes.append(np.nan)
        return pd.Series(slopes, index=series.index)
    
    def _calculate_signal_conditions(self) -> pd.DataFrame:
        """计算信号条件"""
        df = self.data.copy()
        
        # 斜率变化趋势判断
        df['斜率上升'] = df['短期多空线斜率'] > df['前日短期斜率']
        df['斜率转正'] = (df['短期多空线斜率'] > -0.01) & (df['前日短期斜率'] < -0.01)
        df['斜率持续上升'] = (df['短期多空线斜率'] > df['前日短期斜率']) & \
                            (df['前日短期斜率'] > df['前2日短期斜率'])
        
        # 价格条件：收盘价在短期多空线上方
        df['价格条件'] = df['close'] > df['短期多空线']
        
        # 成交量条件：成交量大于5日均量的1.2倍
        df['成交量条件'] = df['volume'] > df['MA5_VOL'] * 1.2
        
        # 底部拐点信号定义
        df['基础拐点'] = df['斜率上升'] & (df['前日短期斜率'] < -0.02)
        df['强化拐点'] = df['斜率转正']
        df['完美拐点'] = df['斜率持续上升'] & df['价格条件'] & df['成交量条件']
        
        # 综合底部拐点信号
        df['拐点信号原始'] = df['基础拐点'] & df['强化拐点'] & df['完美拐点']
        
        return df
    
    def get_bottom_reversal_signals(self) -> pd.DataFrame:
        """
        获取底部反转信号
        
        Returns:
            包含信号的DataFrame
        """
        df = self._calculate_signal_conditions()
        
        # 过滤信号：3日内只显示一次
        df['底部拐点信号'] = False
        last_signal_idx = -3  # 初始化为-3，确保第一个信号可以通过
        
        for i in range(len(df)):
            if df.iloc[i]['拐点信号原始'] and (i - last_signal_idx >= 3):
                df.iloc[i, df.columns.get_loc('底部拐点信号')] = True
                last_signal_idx = i
        
        return df


class TradingStrategy:
    """交易策略类"""
    
    def __init__(self, data: pd.DataFrame):
        """
        初始化交易策略
        
        Args:
            data: 包含OHLCV数据的DataFrame
        """
        self.data = data.copy()
        self.positions = []  # 持仓记录
        self.trades = []     # 交易记录
        self.cash = 100000  # 初始资金
        self.position_size = 0  # 当前持仓数量
        
    def run_strategy(self, signal_data: pd.DataFrame) -> dict:
        """
        运行交易策略
        
        Args:
            signal_data: 包含信号的DataFrame
            
        Returns:
            策略结果字典
        """
        for i in range(1, len(signal_data)):
            current_date = signal_data.index[i]
            current_price = signal_data.iloc[i]['close']
            prev_signal = signal_data.iloc[i-1]['底部拐点信号']
            current_signal = signal_data.iloc[i]['底部拐点信号']
            
            # 买入逻辑：底部反转信号次日开盘买入
            if prev_signal and self.position_size == 0:
                # 次日开盘买入
                open_price = signal_data.iloc[i]['open']
                shares_to_buy = int(self.cash / open_price)
                if shares_to_buy > 0:
                    cost = shares_to_buy * open_price
                    self.cash -= cost
                    self.position_size = shares_to_buy
                    
                    self.trades.append({
                        'date': current_date,
                        'action': 'BUY',
                        'price': open_price,
                        'shares': shares_to_buy,
                        'cash_after': self.cash
                    })
            
            # 卖出逻辑：下跌信号当天卖出
            # 这里我们定义下跌信号为：收盘价跌破短期多空线
            if self.position_size > 0:
                short_ma_line = signal_data.iloc[i]['短期多空线']
                if current_price < short_ma_line:
                    # 当天收盘卖出
                    sell_price = current_price
                    proceeds = self.position_size * sell_price
                    self.cash += proceeds
                    
                    self.trades.append({
                        'date': current_date,
                        'action': 'SELL',
                        'price': sell_price,
                        'shares': self.position_size,
                        'cash_after': self.cash
                    })
                    
                    self.position_size = 0
        
        # 计算最终结果
        final_value = self.cash + (self.position_size * signal_data.iloc[-1]['close'])
        total_return = (final_value - 100000) / 100000 * 100
        
        return {
            'initial_cash': 100000,
            'final_cash': self.cash,
            'final_position_value': self.position_size * signal_data.iloc[-1]['close'],
            'final_total_value': final_value,
            'total_return_pct': total_return,
            'trades': self.trades,
            'total_trades': len(self.trades)
        }


def load_sample_data() -> pd.DataFrame:
    """
    加载示例数据（实际使用时替换为真实数据）
    
    Returns:
        示例OHLCV数据
    """
    # 生成示例数据
    np.random.seed(42)
    dates = pd.date_range('2023-01-01', periods=250, freq='D')
    
    # 模拟股价数据
    price = 100
    prices = [price]
    for _ in range(249):
        change = np.random.normal(0, 0.02)
        price *= (1 + change)
        prices.append(price)
    
    # 生成OHLC数据
    data = []
    for i, close in enumerate(prices):
        high = close * (1 + abs(np.random.normal(0, 0.01)))
        low = close * (1 - abs(np.random.normal(0, 0.01)))
        open_price = prices[i-1] if i > 0 else close
        volume = np.random.randint(1000000, 5000000)
        
        data.append({
            'open': open_price,
            'high': high,
            'low': low,
            'close': close,
            'volume': volume
        })
    
    df = pd.DataFrame(data, index=dates)
    return df


def main():
    """主函数"""
    print("底部反转信号交易策略")
    print("=" * 50)
    
    # 加载数据
    print("加载数据...")
    data = load_sample_data()
    print(f"数据加载完成，共{len(data)}条记录")
    print(f"数据预览:")
    print(data.head())
    
    # 计算底部反转信号
    print("\n计算底部反转信号...")
    signal_calculator = BottomReversalSignal(data)
    signal_data = signal_calculator.get_bottom_reversal_signals()
    
    # 统计信号数量
    signal_count = signal_data['底部拐点信号'].sum()
    print(f"发现{signal_count}个底部反转信号")
    
    # 运行交易策略
    print("\n运行交易策略...")
    strategy = TradingStrategy(data)
    results = strategy.run_strategy(signal_data)
    
    # 输出结果
    print("\n策略结果:")
    print(f"初始资金: ¥{results['initial_cash']:,.2f}")
    print(f"最终现金: ¥{results['final_cash']:,.2f}")
    print(f"最终持仓价值: ¥{results['final_position_value']:,.2f}")
    print(f"最终总价值: ¥{results['final_total_value']:,.2f}")
    print(f"总收益率: {results['total_return_pct']:.2f}%")
    print(f"总交易次数: {results['total_trades']}")
    
    # 显示交易记录
    if results['trades']:
        print("\n交易记录:")
        for trade in results['trades']:
            print(f"{trade['date'].strftime('%Y-%m-%d')} {trade['action']} "
                  f"价格:¥{trade['price']:.2f} 数量:{trade['shares']} "
                  f"现金:¥{trade['cash_after']:,.2f}")
    
    return signal_data, results


if __name__ == "__main__":
    signal_data, results = main()
