# coding:utf-8
"""
图形识别增强模块
增加更多完美图形的识别功能
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple
# import matplotlib.pyplot as plt  # 注释掉可选依赖
# from scipy import signal  # 注释掉可选依赖
# from sklearn.cluster import KMeans  # 注释掉可选依赖

class AdvancedPatternRecognition:
    """高级图形识别类"""
    
    @staticmethod
    def detect_cup_and_handle(df: pd.DataFrame, cup_period: int = 60, handle_period: int = 20) -> pd.DataFrame:
        """
        识别杯柄形态
        :param df: 包含OHLCV数据的DataFrame
        :param cup_period: 杯形周期
        :param handle_period: 柄形周期
        :return: 包含杯柄信号的DataFrame
        """
        df['cup_handle'] = 0
        
        for i in range(cup_period + handle_period, len(df)):
            # 获取杯形数据
            cup_data = df.iloc[i-cup_period-handle_period:i-handle_period]
            handle_data = df.iloc[i-handle_period:i]
            
            if len(cup_data) < cup_period or len(handle_data) < handle_period:
                continue
            
            # 杯形条件：U型底部
            cup_high = cup_data['high'].max()
            cup_low = cup_data['low'].min()
            cup_mid = (cup_high + cup_low) / 2
            
            # 检查是否为U型（中间部分较低）
            left_high = cup_data.iloc[:cup_period//2]['high'].max()
            right_high = cup_data.iloc[cup_period//2:]['high'].max()
            center_low = cup_data.iloc[cup_period//4:3*cup_period//4]['low'].min()
            
            # 柄形条件：小幅回调
            handle_start_price = handle_data.iloc[0]['close']
            handle_end_price = handle_data.iloc[-1]['close']
            handle_high = handle_data['high'].max()
            
            # 杯柄形态判断
            if (left_high > center_low and right_high > center_low and  # U型底部
                handle_high < cup_high * 0.95 and  # 柄部低于杯口
                handle_end_price > handle_start_price * 0.98):  # 柄部轻微上升
                df.loc[df.index[i], 'cup_handle'] = 1
        
        return df
    
    @staticmethod
    def detect_double_bottom(df: pd.DataFrame, lookback: int = 40) -> pd.DataFrame:
        """
        识别双底形态
        :param df: 包含OHLCV数据的DataFrame
        :param lookback: 回看周期
        :return: 包含双底信号的DataFrame
        """
        df['double_bottom'] = 0
        
        for i in range(lookback, len(df)):
            recent_data = df.iloc[i-lookback:i]
            
            # 寻找两个低点
            low_points = []
            for j in range(1, len(recent_data)-1):
                if (recent_data.iloc[j]['low'] < recent_data.iloc[j-1]['low'] and 
                    recent_data.iloc[j]['low'] < recent_data.iloc[j+1]['low']):
                    low_points.append((j, recent_data.iloc[j]['low']))
            
            if len(low_points) >= 2:
                # 获取最后两个低点
                last_two_lows = sorted(low_points, key=lambda x: x[0])[-2:]
                
                # 双底条件：两个低点价格相近，第二个低点高于第一个
                low1_price = last_two_lows[0][1]
                low2_price = last_two_lows[1][1]
                
                if (abs(low1_price - low2_price) / low1_price < 0.03 and  # 价格相近（3%以内）
                    low2_price > low1_price * 0.98):  # 第二个低点略高
                    df.loc[df.index[i], 'double_bottom'] = 1
        
        return df
    
    @staticmethod
    def detect_triangle_pattern(df: pd.DataFrame, lookback: int = 30) -> pd.DataFrame:
        """
        识别三角形整理形态
        :param df: 包含OHLCV数据的DataFrame
        :param lookback: 回看周期
        :return: 包含三角形信号的DataFrame
        """
        df['triangle'] = 0
        
        for i in range(lookback, len(df)):
            recent_data = df.iloc[i-lookback:i]
            
            # 计算趋势线
            highs = recent_data['high'].values
            lows = recent_data['low'].values
            x = np.arange(len(highs))
            
            # 高点趋势线（下降）
            high_slope, high_intercept = np.polyfit(x, highs, 1)
            
            # 低点趋势线（上升）
            low_slope, low_intercept = np.polyfit(x, lows, 1)
            
            # 三角形条件：高点下降，低点上升，收敛
            if (high_slope < -0.1 and low_slope > 0.1 and  # 趋势线方向相反
                abs(high_slope) > 0.05 and abs(low_slope) > 0.05):  # 趋势明显
                
                # 检查是否收敛（最后几个点的高点低点距离缩小）
                last_10_highs = recent_data.iloc[-10:]['high']
                last_10_lows = recent_data.iloc[-10:]['low']
                recent_range = last_10_highs.max() - last_10_lows.min()
                early_range = recent_data.iloc[:10]['high'].max() - recent_data.iloc[:10]['low'].min()
                
                if recent_range < early_range * 0.7:  # 范围缩小
                    df.loc[df.index[i], 'triangle'] = 1
        
        return df
    
    @staticmethod
    def detect_head_and_shoulders(df: pd.DataFrame, lookback: int = 50) -> pd.DataFrame:
        """
        识别头肩底形态
        :param df: 包含OHLCV数据的DataFrame
        :param lookback: 回看周期
        :return: 包含头肩底信号的DataFrame
        """
        df['head_shoulders'] = 0
        
        for i in range(lookback, len(df)):
            recent_data = df.iloc[i-lookback:i]
            
            # 寻找三个低点
            low_points = []
            for j in range(2, len(recent_data)-2):
                if (recent_data.iloc[j]['low'] < recent_data.iloc[j-1]['low'] and 
                    recent_data.iloc[j]['low'] < recent_data.iloc[j+1]['low'] and
                    recent_data.iloc[j]['low'] < recent_data.iloc[j-2]['low'] and 
                    recent_data.iloc[j]['low'] < recent_data.iloc[j+2]['low']):
                    low_points.append((j, recent_data.iloc[j]['low']))
            
            if len(low_points) >= 3:
                # 获取最后三个低点
                last_three_lows = sorted(low_points, key=lambda x: x[0])[-3:]
                
                left_shoulder = last_three_lows[0][1]
                head = last_three_lows[1][1]
                right_shoulder = last_three_lows[2][1]
                
                # 头肩底条件：中间低点最低，两侧低点相近
                if (head < left_shoulder and head < right_shoulder and  # 头最低
                    abs(left_shoulder - right_shoulder) / left_shoulder < 0.05):  # 两肩相近
                    df.loc[df.index[i], 'head_shoulders'] = 1
        
        return df
    
    @staticmethod
    def detect_breakout(df: pd.DataFrame, lookback: int = 20) -> pd.DataFrame:
        """
        识别突破形态
        :param df: 包含OHLCV数据的DataFrame
        :param lookback: 回看周期
        :return: 包含突破信号的DataFrame
        """
        df['breakout'] = 0
        
        for i in range(lookback, len(df)):
            recent_data = df.iloc[i-lookback:i-1]  # 排除当前点
            current_data = df.iloc[i]
            
            # 计算阻力位和支撑位
            resistance = recent_data['high'].max()
            support = recent_data['low'].min()
            
            # 突破条件：收盘价突破阻力位，成交量放大
            volume_avg = recent_data['volume'].mean()
            
            if (current_data['close'] > resistance * 1.02 and  # 突破阻力位
                current_data['volume'] > volume_avg * 1.5):  # 成交量放大
                df.loc[df.index[i], 'breakout'] = 1
        
        return df
    
    @staticmethod
    def detect_golden_cross(df: pd.DataFrame, short_period: int = 5, long_period: int = 20) -> pd.DataFrame:
        """
        识别金叉形态
        :param df: 包含OHLCV数据的DataFrame
        :param short_period: 短期均线周期
        :param long_period: 长期均线周期
        :return: 包含金叉信号的DataFrame
        """
        df['golden_cross'] = 0
        
        # 计算均线
        df[f'ma{short_period}'] = df['close'].rolling(window=short_period).mean()
        df[f'ma{long_period}'] = df['close'].rolling(window=long_period).mean()
        
        for i in range(long_period, len(df)):
            # 金叉条件：短期均线上穿长期均线
            if (df.iloc[i][f'ma{short_period}'] > df.iloc[i][f'ma{long_period}'] and
                df.iloc[i-1][f'ma{short_period}'] <= df.iloc[i-1][f'ma{long_period}']):
                df.loc[df.index[i], 'golden_cross'] = 1
        
        return df

class PatternScorer:
    """图形评分系统"""
    
    def __init__(self):
        self.pattern_weights = {
            'cup_handle': 0.20,
            'double_bottom': 0.18,
            'triangle': 0.15,
            'head_shoulders': 0.17,
            'breakout': 0.15,
            'golden_cross': 0.15
        }
    
    def calculate_advanced_score(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        计算高级图形评分
        :param df: 包含各种信号的DataFrame
        :return: 包含评分的DataFrame
        """
        df['advanced_pattern_score'] = 0.0
        
        for i in range(len(df)):
            score = 0.0
            
            for pattern, weight in self.pattern_weights.items():
                if pattern in df.columns and df.iloc[i][pattern] == 1:
                    score += weight
            
            df.loc[df.index[i], 'advanced_pattern_score'] = min(score, 1.0)
        
        return df
    
    def calculate_combined_score(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        计算综合评分（基础+高级）
        :param df: 包含各种信号的DataFrame
        :return: 包含综合评分的DataFrame
        """
        if 'pattern_score' in df.columns and 'advanced_pattern_score' in df.columns:
            df['combined_score'] = (df['pattern_score'] * 0.6 + 
                                  df['advanced_pattern_score'] * 0.4)
        else:
            df['combined_score'] = df.get('pattern_score', 0)
        
        return df

def test_pattern_recognition():
    """测试图形识别功能"""
    print("测试图形识别功能...")
    
    # 创建测试数据
    dates = pd.date_range('2023-01-01', periods=100, freq='D')
    np.random.seed(42)
    
    # 生成模拟价格数据
    prices = [100]
    for i in range(1, 100):
        change = np.random.normal(0, 0.02)
        new_price = prices[-1] * (1 + change)
        prices.append(max(new_price, 10))
    
    df = pd.DataFrame({
        'date': dates,
        'open': [p * (1 + np.random.normal(0, 0.01)) for p in prices],
        'close': prices,
        'high': [p * (1 + abs(np.random.normal(0, 0.02))) for p in prices],
        'low': [p * (1 - abs(np.random.normal(0, 0.02))) for p in prices],
        'volume': [np.random.randint(1000, 10000) for _ in range(100)]
    })
    
    df = df.set_index('date')
    
    # 测试各种图形识别
    recognizer = AdvancedPatternRecognition()
    scorer = PatternScorer()
    
    df = recognizer.detect_cup_and_handle(df)
    df = recognizer.detect_double_bottom(df)
    df = recognizer.detect_triangle_pattern(df)
    df = recognizer.detect_head_and_shoulders(df)
    df = recognizer.detect_breakout(df)
    df = recognizer.detect_golden_cross(df)
    
    df = scorer.calculate_advanced_score(df)
    
    print("图形识别测试完成")
    print(f"检测到的图形数量:")
    for pattern in ['cup_handle', 'double_bottom', 'triangle', 'head_shoulders', 'breakout', 'golden_cross']:
        count = df[pattern].sum()
        print(f"  {pattern}: {count}")

if __name__ == "__main__":
    test_pattern_recognition()