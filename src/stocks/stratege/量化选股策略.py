# coding:utf-8
"""
量化选股策略核心模块
基于技术指标和图形识别的智能选股系统

选股逻辑：
1. N型上涨趋势
2. 趋势向上
3. KDJ的J小于13（不是负13）
4. 缩量回调（增加多种完美图形的图形识别）
5. 顶部无量（优化）带假阴真阳判断，大绿帽判断
6. 知行趋势线判断（白线金叉+K线带量上黄线+不跌破黄线）
7. 识别无异常涨停
8. 加入完美图形的图像识别评分功能（beta测试版）

数据源：AKShare
"""

import os
import sys
import time
import warnings
import pandas as pd
import numpy as np
import akshare as ak
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
import talib
from scipy import stats
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt
import seaborn as sns

warnings.filterwarnings('ignore')

class TechnicalIndicators:
    """技术指标计算类"""
    
    @staticmethod
    def calculate_kdj(df: pd.DataFrame, n: int = 9, m1: int = 3, m2: int = 3) -> pd.DataFrame:
        """
        计算KDJ指标
        :param df: 包含OHLCV数据的DataFrame
        :param n: RSV计算周期
        :param m1: K值平滑周期
        :param m2: D值平滑周期
        :return: 包含K、D、J值的DataFrame
        """
        low_list = df['low'].rolling(window=n).min()
        high_list = df['high'].rolling(window=n).max()
        
        rsv = (df['close'] - low_list) / (high_list - low_list) * 100
        rsv = rsv.fillna(0)
        
        k = rsv.ewm(alpha=1/m1).mean()
        d = k.ewm(alpha=1/m2).mean()
        j = 3 * k - 2 * d
        
        df['k'] = k
        df['d'] = d
        df['j'] = j
        
        return df
    
    @staticmethod
    def calculate_ma(df: pd.DataFrame, periods: List[int] = [5, 10, 20, 60, 120, 250]) -> pd.DataFrame:
        """计算移动平均线"""
        for period in periods:
            df[f'ma{period}'] = df['close'].rolling(window=period).mean()
        return df
    
    @staticmethod
    def calculate_volume_ma(df: pd.DataFrame, periods: List[int] = [5, 10, 20]) -> pd.DataFrame:
        """计算成交量移动平均线"""
        for period in periods:
            df[f'volume_ma{period}'] = df['volume'].rolling(window=period).mean()
        return df
    
    @staticmethod
    def calculate_macd(df: pd.DataFrame, fast: int = 12, slow: int = 26, signal: int = 9) -> pd.DataFrame:
        """计算MACD指标"""
        exp1 = df['close'].ewm(span=fast).mean()
        exp2 = df['close'].ewm(span=slow).mean()
        
        df['macd'] = exp1 - exp2
        df['macd_signal'] = df['macd'].ewm(span=signal).mean()
        df['macd_histogram'] = df['macd'] - df['macd_signal']
        
        return df
    
    @staticmethod
    def calculate_rsi(df: pd.DataFrame, period: int = 14) -> pd.DataFrame:
        """计算RSI指标"""
        delta = df['close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        
        rs = gain / loss
        df['rsi'] = 100 - (100 / (1 + rs))
        
        return df
    
    @staticmethod
    def calculate_bollinger_bands(df: pd.DataFrame, period: int = 20, std: float = 2) -> pd.DataFrame:
        """计算布林带"""
        df['bb_middle'] = df['close'].rolling(window=period).mean()
        bb_std = df['close'].rolling(window=period).std()
        df['bb_upper'] = df['bb_middle'] + (bb_std * std)
        df['bb_lower'] = df['bb_middle'] - (bb_std * std)
        df['bb_width'] = df['bb_upper'] - df['bb_lower']
        df['bb_position'] = (df['close'] - df['bb_lower']) / (df['bb_upper'] - df['bb_lower'])
        
        return df

class PatternRecognition:
    """图形识别类"""
    
    @staticmethod
    def detect_n_pattern(df: pd.DataFrame, lookback: int = 20) -> pd.DataFrame:
        """
        识别N型上涨趋势
        :param df: 包含OHLCV数据的DataFrame
        :param lookback: 回看周期
        :return: 包含N型信号的DataFrame
        """
        df['n_pattern'] = 0
        
        for i in range(lookback, len(df)):
            # 获取最近lookback天的数据
            recent_data = df.iloc[i-lookback:i+1]
            
            # 寻找第一个低点
            first_low_idx = recent_data['low'].idxmin()
            first_low_price = recent_data.loc[first_low_idx, 'low']
            
            # 寻找第一个高点（在第一个低点之后）
            first_high_data = recent_data[recent_data.index > first_low_idx]
            if len(first_high_data) > 0:
                first_high_idx = first_high_data['high'].idxmax()
                first_high_price = first_high_data.loc[first_high_idx, 'high']
                
                # 寻找第二个低点（在第一个高点之后）
                second_low_data = recent_data[recent_data.index > first_high_idx]
                if len(second_low_data) > 0:
                    second_low_idx = second_low_data['low'].idxmin()
                    second_low_price = second_low_data.loc[second_low_idx, 'low']
                    
                    # 寻找第二个高点（在第二个低点之后）
                    second_high_data = recent_data[recent_data.index > second_low_idx]
                    if len(second_high_data) > 0:
                        second_high_idx = second_high_data['high'].idxmax()
                        second_high_price = second_high_data.loc[second_high_idx, 'high']
                        
                        # N型条件：第二个低点高于第一个低点，第二个高点高于第一个高点
                        if (second_low_price > first_low_price and 
                            second_high_price > first_high_price and
                            second_high_idx == recent_data.index[-1]):  # 当前是第二个高点
                            df.loc[df.index[i], 'n_pattern'] = 1
        
        return df
    
    @staticmethod
    def detect_volume_contraction(df: pd.DataFrame, lookback: int = 10) -> pd.DataFrame:
        """
        识别缩量回调
        :param df: 包含OHLCV数据的DataFrame
        :param lookback: 回看周期
        :return: 包含缩量信号的DataFrame
        """
        df['volume_contraction'] = 0
        
        for i in range(lookback, len(df)):
            recent_volumes = df.iloc[i-lookback:i]['volume']
            current_volume = df.iloc[i]['volume']
            
            # 当前成交量小于过去lookback天平均成交量的70%
            if current_volume < recent_volumes.mean() * 0.7:
                df.loc[df.index[i], 'volume_contraction'] = 1
        
        return df
    
    @staticmethod
    def detect_fake_yin_real_yang(df: pd.DataFrame) -> pd.DataFrame:
        """
        识别假阴真阳
        假阴真阳：收盘价高于开盘价，但K线显示为阴线（收盘价低于前一日收盘价）
        """
        df['fake_yin_real_yang'] = 0
        
        for i in range(1, len(df)):
            current_open = df.iloc[i]['open']
            current_close = df.iloc[i]['close']
            prev_close = df.iloc[i-1]['close']
            
            # 假阴真阳条件：当日收盘价高于开盘价，但低于前一日收盘价
            if (current_close > current_open and current_close < prev_close):
                df.loc[df.index[i], 'fake_yin_real_yang'] = 1
        
        return df
    
    @staticmethod
    def detect_green_hat(df: pd.DataFrame) -> pd.DataFrame:
        """
        识别大绿帽（长上影线阴线）
        """
        df['green_hat'] = 0
        
        for i in range(len(df)):
            open_price = df.iloc[i]['open']
            close_price = df.iloc[i]['close']
            high_price = df.iloc[i]['high']
            low_price = df.iloc[i]['low']
            
            # 计算实体和上影线长度
            body_length = abs(close_price - open_price)
            upper_shadow = high_price - max(open_price, close_price)
            lower_shadow = min(open_price, close_price) - low_price
            
            # 大绿帽条件：阴线，上影线长度大于实体长度，下影线较短
            if (close_price < open_price and 
                upper_shadow > body_length and 
                lower_shadow < body_length * 0.5):
                df.loc[df.index[i], 'green_hat'] = 1
        
        return df
    
    @staticmethod
    def detect_zhixing_trend(df: pd.DataFrame) -> pd.DataFrame:
        """
        知行趋势线判断
        白线金叉+K线带量上黄线+不跌破黄线
        """
        df['zhixing_trend'] = 0
        
        # 计算短期和长期均线
        df['ma5'] = df['close'].rolling(window=5).mean()
        df['ma20'] = df['close'].rolling(window=20).mean()
        df['volume_ma5'] = df['volume'].rolling(window=5).mean()
        
        for i in range(20, len(df)):
            # 白线金叉（MA5上穿MA20）
            if (df.iloc[i]['ma5'] > df.iloc[i]['ma20'] and 
                df.iloc[i-1]['ma5'] <= df.iloc[i-1]['ma20']):
                
                # K线带量上黄线（收盘价突破MA20，成交量放大）
                if (df.iloc[i]['close'] > df.iloc[i]['ma20'] and 
                    df.iloc[i]['volume'] > df.iloc[i]['volume_ma5'] * 1.2):
                    
                    # 检查后续是否不跌破黄线（MA20）
                    future_periods = min(5, len(df) - i - 1)
                    not_broken = True
                    
                    for j in range(1, future_periods + 1):
                        if df.iloc[i + j]['close'] < df.iloc[i + j]['ma20']:
                            not_broken = False
                            break
                    
                    if not_broken:
                        df.loc[df.index[i], 'zhixing_trend'] = 1
        
        return df
    
    @staticmethod
    def detect_abnormal_limit_up(df: pd.DataFrame) -> pd.DataFrame:
        """
        识别异常涨停
        排除正常涨停，识别异常涨停
        """
        df['abnormal_limit_up'] = 0
        
        for i in range(1, len(df)):
            current_close = df.iloc[i]['close']
            prev_close = df.iloc[i-1]['close']
            current_volume = df.iloc[i]['volume']
            avg_volume = df.iloc[i-20:i]['volume'].mean() if i >= 20 else df.iloc[:i]['volume'].mean()
            
            # 涨停条件（涨幅接近10%）
            price_change_pct = (current_close - prev_close) / prev_close
            
            if price_change_pct >= 0.095:  # 接近涨停
                # 异常涨停：成交量异常放大或异常缩小
                volume_ratio = current_volume / avg_volume if avg_volume > 0 else 1
                
                if volume_ratio > 3 or volume_ratio < 0.3:  # 成交量异常
                    df.loc[df.index[i], 'abnormal_limit_up'] = 1
        
        return df

class PerfectPatternScorer:
    """完美图形评分系统（Beta版）"""
    
    def __init__(self):
        self.pattern_weights = {
            'n_pattern': 0.25,
            'volume_contraction': 0.15,
            'fake_yin_real_yang': 0.15,
            'zhixing_trend': 0.20,
            'kdj_signal': 0.15,
            'trend_up': 0.10
        }
    
    def calculate_pattern_score(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        计算完美图形评分
        :param df: 包含各种信号的DataFrame
        :return: 包含评分的DataFrame
        """
        df['pattern_score'] = 0.0
        
        for i in range(len(df)):
            score = 0.0
            
            # N型上涨趋势
            if df.iloc[i]['n_pattern'] == 1:
                score += self.pattern_weights['n_pattern']
            
            # 缩量回调
            if df.iloc[i]['volume_contraction'] == 1:
                score += self.pattern_weights['volume_contraction']
            
            # 假阴真阳
            if df.iloc[i]['fake_yin_real_yang'] == 1:
                score += self.pattern_weights['fake_yin_real_yang']
            
            # 知行趋势线
            if df.iloc[i]['zhixing_trend'] == 1:
                score += self.pattern_weights['zhixing_trend']
            
            # KDJ信号（J < 13）
            if df.iloc[i]['j'] < 13:
                score += self.pattern_weights['kdj_signal']
            
            # 趋势向上（短期均线在长期均线之上）
            if (i >= 20 and 
                df.iloc[i]['ma5'] > df.iloc[i]['ma20'] and 
                df.iloc[i]['ma20'] > df.iloc[i]['ma60']):
                score += self.pattern_weights['trend_up']
            
            df.loc[df.index[i], 'pattern_score'] = min(score, 1.0)  # 最高分为1.0
        
        return df

class QuantitativeStockSelector:
    """量化选股主类"""
    
    def __init__(self):
        self.data_path = 'data_day/'
        self.stock_codes_file = 'stock_code_names.csv'
        self.technical_indicators = TechnicalIndicators()
        self.pattern_recognition = PatternRecognition()
        self.pattern_scorer = PerfectPatternScorer()
        
    def load_stock_data(self, stock_code: str, start_date: str = None, end_date: str = None) -> pd.DataFrame:
        """
        加载股票数据
        :param stock_code: 股票代码
        :param start_date: 开始日期
        :param end_date: 结束日期
        :return: 股票数据DataFrame
        """
        try:
            if start_date is None:
                start_date = (datetime.now() - timedelta(days=365)).strftime('%Y%m%d')
            if end_date is None:
                end_date = datetime.now().strftime('%Y%m%d')
            
            # 使用AKShare获取数据
            df = ak.stock_zh_a_hist(symbol=stock_code, 
                                  period="daily", 
                                  start_date=start_date, 
                                  end_date=end_date, 
                                  adjust="qfq")
            
            if df.empty:
                return pd.DataFrame()
            
            # 重命名列
            df.columns = ['date', 'open', 'close', 'high', 'low', 'volume', 'turnover', 'amplitude', 'change_pct', 'change_amount', 'turnover_rate']
            
            # 转换数据类型
            df['date'] = pd.to_datetime(df['date'])
            df = df.set_index('date')
            
            # 确保数值列为float类型
            numeric_columns = ['open', 'close', 'high', 'low', 'volume', 'turnover', 'amplitude', 'change_pct', 'change_amount', 'turnover_rate']
            for col in numeric_columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')
            
            return df
            
        except Exception as e:
            print(f"加载股票数据失败 {stock_code}: {e}")
            return pd.DataFrame()
    
    def calculate_all_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """计算所有技术指标"""
        if df.empty:
            return df
        
        # 计算技术指标
        df = self.technical_indicators.calculate_kdj(df)
        df = self.technical_indicators.calculate_ma(df)
        df = self.technical_indicators.calculate_volume_ma(df)
        df = self.technical_indicators.calculate_macd(df)
        df = self.technical_indicators.calculate_rsi(df)
        df = self.technical_indicators.calculate_bollinger_bands(df)
        
        # 图形识别
        df = self.pattern_recognition.detect_n_pattern(df)
        df = self.pattern_recognition.detect_volume_contraction(df)
        df = self.pattern_recognition.detect_fake_yin_real_yang(df)
        df = self.pattern_recognition.detect_green_hat(df)
        df = self.pattern_recognition.detect_zhixing_trend(df)
        df = self.pattern_recognition.detect_abnormal_limit_up(df)
        
        # 计算完美图形评分
        df = self.pattern_scorer.calculate_pattern_score(df)
        
        return df
    
    def apply_selection_criteria(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        应用选股条件
        1. N型上涨趋势
        2. 趋势向上
        3. KDJ的J小于13
        4. 缩量回调
        5. 顶部无量（假阴真阳判断，大绿帽判断）
        6. 知行趋势线判断
        7. 识别无异常涨停
        8. 完美图形评分
        """
        if df.empty:
            return df
        
        # 创建筛选条件
        conditions = []
        
        # 1. N型上涨趋势
        conditions.append(df['n_pattern'] == 1)
        
        # 2. 趋势向上（短期均线在长期均线之上）
        conditions.append(df['ma5'] > df['ma20'])
        conditions.append(df['ma20'] > df['ma60'])
        
        # 3. KDJ的J小于13
        conditions.append(df['j'] < 13)
        
        # 4. 缩量回调
        conditions.append(df['volume_contraction'] == 1)
        
        # 5. 顶部无量（假阴真阳或大绿帽）
        conditions.append((df['fake_yin_real_yang'] == 1) | (df['green_hat'] == 1))
        
        # 6. 知行趋势线判断
        conditions.append(df['zhixing_trend'] == 1)
        
        # 7. 无异常涨停
        conditions.append(df['abnormal_limit_up'] == 0)
        
        # 8. 完美图形评分大于0.5
        conditions.append(df['pattern_score'] > 0.5)
        
        # 应用所有条件
        mask = pd.Series(True, index=df.index)
        for condition in conditions:
            mask = mask & condition
        
        return df[mask]
    
    def select_stocks(self, stock_codes: List[str], start_date: str = None, end_date: str = None) -> pd.DataFrame:
        """
        批量选股
        :param stock_codes: 股票代码列表
        :param start_date: 开始日期
        :param end_date: 结束日期
        :return: 符合条件的股票DataFrame
        """
        results = []
        
        print(f"开始分析 {len(stock_codes)} 只股票...")
        
        for i, stock_code in enumerate(stock_codes):
            try:
                print(f"分析进度: {i+1}/{len(stock_codes)} - {stock_code}")
                
                # 加载数据
                df = self.load_stock_data(stock_code, start_date, end_date)
                if df.empty:
                    continue
                
                # 计算指标
                df = self.calculate_all_indicators(df)
                
                # 应用选股条件
                selected_df = self.apply_selection_criteria(df)
                
                if not selected_df.empty:
                    # 获取最新数据
                    latest_data = selected_df.iloc[-1].copy()
                    latest_data['stock_code'] = stock_code
                    latest_data['analysis_date'] = datetime.now()
                    results.append(latest_data)
                    
                    print(f"  ✓ 符合条件: {stock_code}")
                else:
                    print(f"  ✗ 不符合条件: {stock_code}")
                
                # 避免请求过于频繁
                time.sleep(0.1)
                
            except Exception as e:
                print(f"  ✗ 分析失败: {stock_code} - {e}")
                continue
        
        if results:
            result_df = pd.DataFrame(results)
            result_df = result_df.sort_values('pattern_score', ascending=False)
            return result_df
        else:
            return pd.DataFrame()
    
    def generate_analysis_report(self, selected_stocks: pd.DataFrame) -> Dict:
        """
        生成分析报告
        :param selected_stocks: 选中的股票DataFrame
        :return: 分析报告字典
        """
        if selected_stocks.empty:
            return {
                'total_stocks': 0,
                'selected_stocks': 0,
                'selection_rate': 0,
                'avg_pattern_score': 0,
                'top_stocks': []
            }
        
        report = {
            'total_stocks': len(selected_stocks),
            'selected_stocks': len(selected_stocks),
            'selection_rate': len(selected_stocks) / len(selected_stocks) * 100,
            'avg_pattern_score': selected_stocks['pattern_score'].mean(),
            'max_pattern_score': selected_stocks['pattern_score'].max(),
            'min_pattern_score': selected_stocks['pattern_score'].min(),
            'top_stocks': selected_stocks.head(10).to_dict('records')
        }
        
        return report

def main():
    """主函数"""
    print("=" * 60)
    print("量化选股系统 - 基于技术指标和图形识别")
    print("=" * 60)
    
    # 创建选股器
    selector = QuantitativeStockSelector()
    
    # 读取股票代码列表
    try:
        stock_codes_df = pd.read_csv('stock_code_names.csv')
        stock_codes = stock_codes_df['代码'].tolist()[:100]  # 测试前100只股票
        print(f"加载股票代码: {len(stock_codes)} 只")
    except Exception as e:
        print(f"加载股票代码失败: {e}")
        return
    
    # 设置时间范围
    end_date = datetime.now().strftime('%Y%m%d')
    start_date = (datetime.now() - timedelta(days=365)).strftime('%Y%m%d')
    
    print(f"分析时间范围: {start_date} - {end_date}")
    
    # 执行选股
    selected_stocks = selector.select_stocks(stock_codes, start_date, end_date)
    
    # 生成报告
    report = selector.generate_analysis_report(selected_stocks)
    
    # 输出结果
    print("\n" + "=" * 60)
    print("选股结果")
    print("=" * 60)
    print(f"总分析股票数: {len(stock_codes)}")
    print(f"符合条件股票数: {report['selected_stocks']}")
    print(f"选股成功率: {report['selection_rate']:.2f}%")
    print(f"平均图形评分: {report['avg_pattern_score']:.3f}")
    print(f"最高图形评分: {report['max_pattern_score']:.3f}")
    
    if not selected_stocks.empty:
        print("\n前10只推荐股票:")
        print("-" * 60)
        for i, (_, stock) in enumerate(selected_stocks.head(10).iterrows(), 1):
            print(f"{i:2d}. {stock['stock_code']:10s} | "
                  f"图形评分: {stock['pattern_score']:.3f} | "
                  f"KDJ-J: {stock['j']:.1f} | "
                  f"收盘价: {stock['close']:.2f}")
    
    # 保存结果
    if not selected_stocks.empty:
        output_file = f"selected_stocks_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        selected_stocks.to_csv(output_file, index=False, encoding='utf-8-sig')
        print(f"\n结果已保存到: {output_file}")

if __name__ == "__main__":
    main()