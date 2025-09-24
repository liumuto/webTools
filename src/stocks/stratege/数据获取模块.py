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
                # 优先使用本地文件
                local_file = 'stratege/stock_code_names.csv'
                if os.path.exists(local_file):
                    print(f"从本地文件读取股票列表: {local_file}")
                    df = pd.read_csv(local_file)
                    if '代码' in df.columns and '名称' in df.columns:
                        df = df[['代码', '名称']].copy()
                        df.columns = ['code', 'name']
                        print(f"从本地文件获取到 {len(df)} 只股票")
                        return df
                
                # 如果本地文件不存在或格式不对，尝试从网络获取
                print("本地文件不存在，尝试从网络获取股票列表...")
                df = ak.stock_zh_a_spot()
                # 只保留代码和名称
                df = df[['代码', '名称']].copy()
                df.columns = ['code', 'name']
                
                # 保存到本地文件
                df.to_csv(local_file, index=False, encoding='utf-8-sig')
                print(f"股票列表已保存到本地文件: {local_file}")
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
        df = df[df['volume'] > 0]
        
        return df
    
    def get_stock_codes_from_file(self, file_path: str = 'stock_code_names.csv') -> List[str]:
        """
        从文件读取股票代码列表
        :param file_path: 文件路径
        :return: 股票代码列表
        """
        try:
            df = pd.read_csv(file_path)
            if '代码' in df.columns:
                return df['代码'].tolist()
            elif 'code' in df.columns:
                return df['code'].tolist()
            else:
                print("未找到股票代码列")
                return []
        except Exception as e:
            print(f"读取股票代码文件失败: {e}")
            return []
    
    def batch_get_stock_data(self, stock_codes: List[str], start_date: str = None, 
                           end_date: str = None, max_workers: int = 5) -> Dict[str, pd.DataFrame]:
        """
        批量获取股票数据
        :param stock_codes: 股票代码列表
        :param start_date: 开始日期
        :param end_date: 结束日期
        :param max_workers: 最大并发数
        :return: 股票数据字典
        """
        stock_data = {}
        
        print(f"开始批量获取 {len(stock_codes)} 只股票数据...")
        
        for i, stock_code in enumerate(stock_codes):
            try:
                print(f"获取进度: {i+1}/{len(stock_codes)} - {stock_code}")
                
                df = self.get_stock_data(stock_code, start_date, end_date)
                if not df.empty:
                    stock_data[stock_code] = df
                    print(f"  ✓ 成功获取: {stock_code}")
                else:
                    print(f"  ✗ 数据为空: {stock_code}")
                
                # 避免请求过于频繁
                time.sleep(0.1)
                
            except Exception as e:
                print(f"  ✗ 获取失败: {stock_code} - {e}")
                continue
        
        print(f"批量获取完成，成功获取 {len(stock_data)} 只股票数据")
        return stock_data
    
    def save_stock_data(self, stock_data: Dict[str, pd.DataFrame], 
                       data_path: str = None) -> None:
        """
        保存股票数据到文件
        :param stock_data: 股票数据字典
        :param data_path: 保存路径
        """
        if data_path is None:
            data_path = self.data_path
        
        for stock_code, df in stock_data.items():
            file_path = os.path.join(data_path, f"{stock_code}_data.csv")
            df.to_csv(file_path, encoding='utf-8-sig')
        
        print(f"股票数据已保存到: {data_path}")
    
    def load_stock_data_from_file(self, stock_code: str, 
                                 data_path: str = None) -> pd.DataFrame:
        """
        从文件加载股票数据
        :param stock_code: 股票代码
        :param data_path: 数据路径
        :return: 股票数据DataFrame
        """
        if data_path is None:
            data_path = self.data_path
        
        file_path = os.path.join(data_path, f"{stock_code}_data.csv")
        
        try:
            if os.path.exists(file_path):
                df = pd.read_csv(file_path, index_col=0, parse_dates=True)
                return df
            else:
                print(f"文件不存在: {file_path}")
                return pd.DataFrame()
        except Exception as e:
            print(f"加载股票数据失败 {stock_code}: {e}")
            return pd.DataFrame()