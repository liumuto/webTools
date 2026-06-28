# coding:utf-8
"""
测试股票数据加载功能
"""

import os
import sys
import pandas as pd
import akshare as ak
from datetime import datetime, timedelta

# 添加策略模块路径
stratege_path = os.path.join(os.path.dirname(__file__), 'stratege')
sys.path.append(stratege_path)

def test_load_stock_data():
    """测试股票数据加载"""
    try:
        print("🔍 开始测试股票数据加载...")
        
        # 测试参数
        stock_code = '000001'
        start_date = '20240101'
        end_date = '20241201'
        
        print(f"📊 测试参数: 股票代码={stock_code}, 开始日期={start_date}, 结束日期={end_date}")
        
        # 直接使用AKShare获取数据
        print("🌐 使用AKShare获取数据...")
        df = ak.stock_zh_a_hist(symbol=stock_code, 
                              period="daily", 
                              start_date=start_date, 
                              end_date=end_date, 
                              adjust="qfq")
        
        print(f"✅ AKShare返回数据形状: {df.shape}")
        print(f"📋 原始列名: {df.columns.tolist()}")
        
        if df.empty:
            print("❌ AKShare返回空数据")
            return
        
        # 重命名列
        print("🔄 重命名列...")
        df.columns = ['date', 'stock_code', 'open', 'close', 'high', 'low', 'volume', 'turnover', 'amplitude', 'change_pct', 'change_amount', 'turnover_rate']
        print(f"📋 重命名后列名: {df.columns.tolist()}")
        
        # 删除股票代码列
        print("🗑️ 删除股票代码列...")
        df = df.drop('stock_code', axis=1)
        print(f"📊 删除后数据形状: {df.shape}")
        
        # 转换数据类型
        print("🔄 转换数据类型...")
        df['date'] = pd.to_datetime(df['date'])
        df = df.set_index('date')
        
        # 确保数值列为float类型
        numeric_columns = ['open', 'close', 'high', 'low', 'volume', 'turnover', 'amplitude', 'change_pct', 'change_amount', 'turnover_rate']
        for col in numeric_columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
        
        print(f"✅ 最终数据形状: {df.shape}")
        print(f"📋 最终列名: {df.columns.tolist()}")
        print(f"📊 前5行数据:")
        print(df.head())
        
        return df
        
    except Exception as e:
        print(f"❌ 测试失败: {e}")
        print(f"❌ 异常类型: {e.__class__.__name__}")
        import traceback
        print(f"❌ 异常堆栈: {traceback.format_exc()}")
        return pd.DataFrame()

def test_quantitative_selector():
    """测试量化选股策略的数据加载"""
    try:
        print("\n🔍 开始测试量化选股策略...")
        
        # 导入策略模块
        from 量化选股策略 import QuantitativeStockSelector
        
        # 创建实例
        selector = QuantitativeStockSelector()
        print("✅ 成功创建QuantitativeStockSelector实例")
        
        # 测试数据加载
        stock_code = '000001'
        start_date = '20240101'
        end_date = '20241201'
        
        print(f"📊 测试参数: 股票代码={stock_code}, 开始日期={start_date}, 结束日期={end_date}")
        
        df = selector.load_stock_data(stock_code, start_date, end_date)
        
        if df.empty:
            print("❌ QuantitativeStockSelector.load_stock_data 返回空数据")
        else:
            print(f"✅ QuantitativeStockSelector.load_stock_data 返回数据形状: {df.shape}")
            print(f"📋 列名: {df.columns.tolist()}")
            print(f"📊 前5行数据:")
            print(df.head())
        
        return df
        
    except Exception as e:
        print(f"❌ 量化选股策略测试失败: {e}")
        print(f"❌ 异常类型: {e.__class__.__name__}")
        import traceback
        print(f"❌ 异常堆栈: {traceback.format_exc()}")
        return pd.DataFrame()

if __name__ == "__main__":
    print("=" * 50)
    print("🧪 股票数据加载测试")
    print("=" * 50)
    
    # 测试1: 直接使用AKShare
    print("\n📋 测试1: 直接使用AKShare")
    df1 = test_load_stock_data()
    
    # 测试2: 使用QuantitativeStockSelector
    print("\n📋 测试2: 使用QuantitativeStockSelector")
    df2 = test_quantitative_selector()
    
    print("\n" + "=" * 50)
    print("🏁 测试完成")
    print("=" * 50)
