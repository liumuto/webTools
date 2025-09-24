# coding:utf-8
"""
图形识别增强模块
提供高级图形模式识别功能
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
import warnings

warnings.filterwarnings('ignore')

class AdvancedPatternRecognition:
    """高级图形识别类"""
    
    def __init__(self):
        self.patterns = {
            'cup_and_handle': '杯柄形态',
            'double_bottom': '双底形态', 
            'triangle': '三角形整理',
            'head_and_shoulders': '头肩底形态',
            'breakout': '突破形态',
            'golden_cross': '金叉形态'
        }
    
    def detect_cup_and_handle(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        检测杯柄形态
        :param df: 股票数据
        :return: 添加杯柄形态标记的数据
        """
        if df.empty or len(df) < 20:
            df['cup_handle'] = False
            return df
        
        df = df.copy()
        df['cup_handle'] = False
        
        # 简化的杯柄形态检测
        # 1. 寻找U型底部（杯底）
        # 2. 寻找右侧上升趋势（杯柄）
        for i in range(20, len(df)):
            # 检查前20天是否有U型底部
            recent_data = df.iloc[i-20:i]
            if len(recent_data) < 20:
                continue
                
            # 寻找最低点
            min_idx = recent_data['low'].idxmin()
            min_pos = recent_data.index.get_loc(min_idx)
            
            # 检查U型：左侧下降，右侧上升
            left_data = recent_data.iloc[:min_pos]
            right_data = recent_data.iloc[min_pos:]
            
            if len(left_data) >= 5 and len(right_data) >= 5:
                # 左侧下降趋势
                left_trend = np.polyfit(range(len(left_data)), left_data['close'], 1)[0]
                # 右侧上升趋势  
                right_trend = np.polyfit(range(len(right_data)), right_data['close'], 1)[0]
                
                if left_trend < -0.1 and right_trend > 0.1:
                    df.loc[df.index[i], 'cup_handle'] = True
        
        return df
    
    def detect_double_bottom(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        检测双底形态
        :param df: 股票数据
        :return: 添加双底形态标记的数据
        """
        if df.empty or len(df) < 20:
            df['double_bottom'] = False
            return df
        
        df = df.copy()
        df['double_bottom'] = False
        
        # 简化的双底形态检测
        for i in range(20, len(df)):
            recent_data = df.iloc[i-20:i]
            if len(recent_data) < 20:
                continue
            
            # 寻找两个相近的低点
            lows = recent_data['low'].values
            min_indices = []
            
            # 寻找局部最低点
            for j in range(2, len(lows)-2):
                if (lows[j] < lows[j-1] and lows[j] < lows[j+1] and 
                    lows[j] < lows[j-2] and lows[j] < lows[j+2]):
                    min_indices.append(j)
            
            # 检查是否有两个相近的低点
            if len(min_indices) >= 2:
                for k in range(len(min_indices)-1):
                    idx1, idx2 = min_indices[k], min_indices[k+1]
                    if (5 <= idx2 - idx1 <= 15 and  # 两个低点间隔5-15天
                        abs(lows[idx1] - lows[idx2]) / lows[idx1] < 0.05):  # 价格相近
                        df.loc[df.index[i], 'double_bottom'] = True
                        break
        
        return df
    
    def detect_triangle_pattern(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        检测三角形整理形态
        :param df: 股票数据
        :return: 添加三角形形态标记的数据
        """
        if df.empty or len(df) < 15:
            df['triangle'] = False
            return df
        
        df = df.copy()
        df['triangle'] = False
        
        # 简化的三角形形态检测
        for i in range(15, len(df)):
            recent_data = df.iloc[i-15:i]
            if len(recent_data) < 15:
                continue
            
            highs = recent_data['high'].values
            lows = recent_data['low'].values
            
            # 计算高点和低点的趋势线
            x = np.arange(len(highs))
            high_trend = np.polyfit(x, highs, 1)[0]
            low_trend = np.polyfit(x, lows, 1)[0]
            
            # 三角形特征：高点下降，低点上升
            if high_trend < -0.05 and low_trend > 0.05:
                # 检查收敛程度
                high_std = np.std(highs)
                low_std = np.std(lows)
                if high_std < np.mean(highs) * 0.1 and low_std < np.mean(lows) * 0.1:
                    df.loc[df.index[i], 'triangle'] = True
        
        return df
    
    def detect_head_and_shoulders(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        检测头肩底形态
        :param df: 股票数据
        :return: 添加头肩底形态标记的数据
        """
        if df.empty or len(df) < 25:
            df['head_shoulders'] = False
            return df
        
        df = df.copy()
        df['head_shoulders'] = False
        
        # 简化的头肩底形态检测
        for i in range(25, len(df)):
            recent_data = df.iloc[i-25:i]
            if len(recent_data) < 25:
                continue
            
            lows = recent_data['low'].values
            
            # 寻找三个低点：左肩、头、右肩
            min_indices = []
            for j in range(3, len(lows)-3):
                if (lows[j] < lows[j-1] and lows[j] < lows[j+1] and 
                    lows[j] < lows[j-2] and lows[j] < lows[j+2] and
                    lows[j] < lows[j-3] and lows[j] < lows[j+3]):
                    min_indices.append(j)
            
            if len(min_indices) >= 3:
                # 检查头肩底模式
                for k in range(len(min_indices)-2):
                    left_shoulder = min_indices[k]
                    head = min_indices[k+1] 
                    right_shoulder = min_indices[k+2]
                    
                    # 头应该是最低的
                    if (lows[head] < lows[left_shoulder] and 
                        lows[head] < lows[right_shoulder] and
                        abs(lows[left_shoulder] - lows[right_shoulder]) / lows[head] < 0.03):
                        df.loc[df.index[i], 'head_shoulders'] = True
                        break
        
        return df
    
    def detect_breakout(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        检测突破形态
        :param df: 股票数据
        :return: 添加突破形态标记的数据
        """
        if df.empty or len(df) < 10:
            df['breakout'] = False
            return df
        
        df = df.copy()
        df['breakout'] = False
        
        # 简化的突破形态检测
        for i in range(10, len(df)):
            recent_data = df.iloc[i-10:i]
            current_data = df.iloc[i]
            
            if len(recent_data) < 10:
                continue
            
            # 计算阻力位（近期最高价）
            resistance = recent_data['high'].max()
            
            # 检查是否突破阻力位
            if (current_data['close'] > resistance and 
                current_data['volume'] > recent_data['volume'].mean() * 1.5):
                df.loc[df.index[i], 'breakout'] = True
        
        return df
    
    def detect_golden_cross(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        检测金叉形态
        :param df: 股票数据
        :return: 添加金叉形态标记的数据
        """
        if df.empty or len(df) < 20:
            df['golden_cross'] = False
            return df
        
        df = df.copy()
        df['golden_cross'] = False
        
        # 计算移动平均线
        df['ma5'] = df['close'].rolling(window=5).mean()
        df['ma10'] = df['close'].rolling(window=10).mean()
        df['ma20'] = df['close'].rolling(window=20).mean()
        
        # 检测金叉
        for i in range(1, len(df)):
            if (pd.notna(df.iloc[i]['ma5']) and pd.notna(df.iloc[i]['ma10']) and
                pd.notna(df.iloc[i-1]['ma5']) and pd.notna(df.iloc[i-1]['ma10'])):
                
                # MA5上穿MA10
                if (df.iloc[i-1]['ma5'] <= df.iloc[i-1]['ma10'] and 
                    df.iloc[i]['ma5'] > df.iloc[i]['ma10']):
                    df.loc[df.index[i], 'golden_cross'] = True
        
        return df

class PatternScorer:
    """图形模式评分类"""
    
    def __init__(self):
        self.pattern_weights = {
            'cup_handle': 0.2,
            'double_bottom': 0.15,
            'triangle': 0.1,
            'head_shoulders': 0.15,
            'breakout': 0.2,
            'golden_cross': 0.2
        }
    
    def calculate_advanced_score(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        计算高级图形评分
        :param df: 股票数据
        :return: 添加评分的数据
        """
        if df.empty:
            df['advanced_score'] = 0
            return df
        
        df = df.copy()
        
        # 初始化评分
        df['advanced_score'] = 0
        
        # 计算各模式评分
        for pattern, weight in self.pattern_weights.items():
            if pattern in df.columns:
                df['advanced_score'] += df[pattern].astype(int) * weight * 100
        
        return df
    
    def calculate_combined_score(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        计算综合评分
        :param df: 股票数据
        :return: 添加综合评分的数据
        """
        if df.empty:
            df['combined_score'] = 0
            return df
        
        df = df.copy()
        
        # 基础评分（如果有的话）
        base_score = df.get('score', 0)
        advanced_score = df.get('advanced_score', 0)
        
        # 综合评分 = 基础评分 * 0.6 + 高级评分 * 0.4
        df['combined_score'] = base_score * 0.6 + advanced_score * 0.4
        
        return df
