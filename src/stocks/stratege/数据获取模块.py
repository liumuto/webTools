# coding:utf-8
"""
数据获取和预处理模块
基于AKShare的数据获取和清洗
"""

import os
import time
import pandas as pd
import numpy as np
import akshare as ak
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import warnings

warnings.filterwarnings('ignore')

class DataManager:
    """数据管理类"""
    
    def __init__(self, data_path: str = 'data/'):
        self.data_path = data_path
        self.ensure_data_path()
        
    def ensure_data_path(self):
        """确保数据目录存在"""
        if not os.path.exists(self.data_path):
            os.makedirs(self.data_path)
            print(f"创建数据目录: {self.data_path}")
    
    def get_stock_list(self, market: str = 'A股') -> pd.DataFrame:
        """
        获取股票列表
        :param market: 市场类型
        :return: 股票列表DataFrame
        """
        try:
            if market == 'A股':
                df = ak.stock_zh_a_spot()
                # 只保留代码和名称
                df = df[['代码', '名称']].copy()
                df.columns = ['code', 'name']
            else:
                raise ValueError(f"不支持的市场类型: {market}")
            
            print(f"获取到 {len(df)} 只股票")
            return df
            
        except Exception as e:
            print(f"获取股票列表失败: {e}")
            return pd.DataFrame()
    
    def get_stock_data(self, stock_code: str, start_date: str = None, end_date: str = None, 
                      adjust: str = 'qfq') -> pd.DataFrame:
        """
        获取单只股票数据
        :param stock_code: 股票代码
        :param start_date: 开始日期
        :param end_date: 结束日期
        :param adjust: 复权类型
        :return: 股票数据DataFrame
        """
        try:
            if start_date is None:
                start_date = (datetime.now() - timedelta(days=365)).strftime('%Y%m%d')
            if end_date is None:
                end_date = datetime.now().strftime('%Y%m%d')
            
            df = ak.stock_zh_a_hist(symbol=stock_code, 
                                  period="daily", 
                                  start_date=start_date, 
                                  end_date=end_date, 
                                  adjust=adjust)
            
            if df.empty:
                return pd.DataFrame()
            
            # 标准化列名
            df.columns = ['date', 'open', 'close', 'high', 'low', 'volume', 
                         'turnover', 'amplitude', 'change_pct', 'change_amount', 'turnover_rate']
            
            # 数据类型转换
            df['date'] = pd.to_datetime(df['date'])
            df = df.set_index('date')
            
            # 确保数值列正确
            numeric_columns = ['open', 'close', 'high', 'low', 'volume', 'turnover', 
                              'amplitude', 'change_pct', 'change_amount', 'turnover_rate']
            for col in numeric_columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')
            
            # 数据清洗
            df = self.clean_data(df)
            
            return df
            
        except Exception as e:
            print(f"获取股票数据失败 {stock_code}: {e}")
            return pd.DataFrame()
    
    def clean_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        数据清洗
        :param df: 原始数据
        :return: 清洗后的数据
        """
        if df.empty:
            return df
        
        # 删除缺失值
        df = df.dropna()
        
        # 删除异常值（价格异常）
        df = df[df['close'] > 0]
        df = df[df['volume'] >= 0]
        
        # 删除停牌数据（成交量为0）
        df = d