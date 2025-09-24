# coding:utf-8
"""
测试批量选股功能，找出问题股票代码
"""

import os
import sys
import pandas as pd
from datetime import datetime, timedelta

# 添加策略模块路径
stratege_path = os.path.join(os.path.dirname(__file__), 'stratege')
sys.path.append(stratege_path)

# 添加API模块路径
api_path = os.path.join(os.path.dirname(__file__), 'api')
sys.path.append(api_path)

def test_batch_loading():
    """测试批量选股功能"""
    try:
        print("🔍 开始测试批量选股功能...")
        
        # 导入API
        from quantitative_selection import QuantitativeSelectionAPI
        
        # 创建API实例
        api = QuantitativeSelectionAPI()
        print("✅ 成功创建API实例")
        
        # 获取股票列表
        print("📊 获取股票列表...")
        stock_list_result = api.get_stock_list('A股')
        
        if not stock_list_result['success']:
            print(f"❌ 获取股票列表失败: {stock_list_result['message']}")
            return
        
        stock_codes = [stock['code'] for stock in stock_list_result['data']]
        print(f"✅ 获取到 {len(stock_codes)} 只股票")
        print(f"📋 前10只股票代码: {stock_codes[:10]}")
        
        # 测试前5只股票的数据加载
        test_codes = stock_codes[:5]
        print(f"\n🧪 测试前5只股票的数据加载...")
        
        for i, stock_code in enumerate(test_codes):
            print(f"\n📊 测试第{i+1}只股票: {stock_code}")
            
            try:
                # 使用重试机制加载数据
                df = api._load_stock_data_with_retry(stock_code, '20240101', '20241201')
                
                if df.empty:
                    print(f"❌ {stock_code} 数据为空")
                else:
                    print(f"✅ {stock_code} 数据加载成功，形状: {df.shape}")
                    print(f"📋 列名: {df.columns.tolist()}")
                    
            except Exception as e:
                print(f"❌ {stock_code} 加载失败: {e}")
        
        # 测试批量选股（只分析前3只股票）
        print(f"\n🚀 测试批量选股（前3只股票）...")
        test_codes = stock_codes[:3]
        
        result = api.batch_select_stocks(
            stock_codes=test_codes,
            start_date='20240101',
            end_date='20241201',
            min_score=0.5,
            max_stocks=3
        )
        
        print(f"📊 批量选股结果:")
        print(f"  成功: {result['success']}")
        print(f"  消息: {result['message']}")
        if result['success']:
            print(f"  选中股票数: {len(result['data']['selected_stocks'])}")
            print(f"  报告: {result['data']['report']}")
        
        return result
        
    except Exception as e:
        print(f"❌ 批量选股测试失败: {e}")
        print(f"❌ 异常类型: {e.__class__.__name__}")
        import traceback
        print(f"❌ 异常堆栈: {traceback.format_exc()}")
        return None

def test_specific_stock_codes():
    """测试特定的股票代码"""
    try:
        print("\n🔍 测试特定股票代码...")
        
        # 导入API
        from quantitative_selection import QuantitativeSelectionAPI
        
        # 创建API实例
        api = QuantitativeSelectionAPI()
        
        # 测试一些常见的股票代码
        test_codes = ['000001', '000002', '600000', '600036', '000858']
        
        for stock_code in test_codes:
            print(f"\n📊 测试股票代码: {stock_code}")
            
            try:
                df = api._load_stock_data_with_retry(stock_code, '20240101', '20241201')
                
                if df.empty:
                    print(f"❌ {stock_code} 数据为空")
                else:
                    print(f"✅ {stock_code} 数据加载成功，形状: {df.shape}")
                    
            except Exception as e:
                print(f"❌ {stock_code} 加载失败: {e}")
        
    except Exception as e:
        print(f"❌ 特定股票代码测试失败: {e}")

if __name__ == "__main__":
    print("=" * 60)
    print("🧪 批量选股功能测试")
    print("=" * 60)
    
    # 测试1: 批量选股功能
    result1 = test_batch_loading()
    
    # 测试2: 特定股票代码
    test_specific_stock_codes()
    
    print("\n" + "=" * 60)
    print("🏁 测试完成")
    print("=" * 60)
