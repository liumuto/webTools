# coding:utf-8
"""
测试股票代码格式修复
"""

import os
import sys
import pandas as pd

# 添加策略模块路径
stratege_path = os.path.join(os.path.dirname(__file__), 'stratege')
sys.path.append(stratege_path)

def test_stock_code_format():
    """测试股票代码格式"""
    try:
        print("🔍 测试股票代码格式修复...")
        
        # 导入数据获取模块
        from 数据获取模块 import DataManager
        
        # 创建实例
        data_manager = DataManager()
        
        # 获取股票列表
        print("📊 获取股票列表...")
        df = data_manager.get_stock_list('A股')
        
        if df.empty:
            print("❌ 获取股票列表失败")
            return
        
        print(f"✅ 获取到 {len(df)} 只股票")
        print(f"📋 前10只股票代码和名称:")
        for i, (_, row) in enumerate(df.head(10).iterrows()):
            print(f"  {i+1:2d}. {row['code']} - {row['name']}")
        
        # 检查股票代码格式
        print(f"\n🔍 检查股票代码格式:")
        sample_codes = df['code'].head(20).tolist()
        for code in sample_codes:
            if any(prefix in code for prefix in ['sh', 'sz', 'bj']):
                print(f"  ❌ 仍包含前缀: {code}")
            else:
                print(f"  ✅ 格式正确: {code}")
        
        # 统计不同长度的股票代码
        print(f"\n📊 股票代码长度统计:")
        code_lengths = df['code'].str.len().value_counts().sort_index()
        for length, count in code_lengths.items():
            print(f"  {length}位: {count}只")
        
        return df
        
    except Exception as e:
        print(f"❌ 测试失败: {e}")
        import traceback
        print(f"❌ 异常堆栈: {traceback.format_exc()}")
        return pd.DataFrame()

def test_akshare_with_clean_codes():
    """测试使用清理后的股票代码调用AKShare"""
    try:
        print("\n🔍 测试使用清理后的股票代码调用AKShare...")
        
        import akshare as ak
        
        # 获取一些清理后的股票代码
        from 数据获取模块 import DataManager
        data_manager = DataManager()
        df = data_manager.get_stock_list('A股')
        
        if df.empty:
            print("❌ 无法获取股票列表")
            return
        
        # 测试前3只股票
        test_codes = df['code'].head(3).tolist()
        print(f"📊 测试股票代码: {test_codes}")
        
        for stock_code in test_codes:
            print(f"\n📈 测试股票: {stock_code}")
            try:
                # 使用AKShare获取数据
                df_data = ak.stock_zh_a_hist(symbol=stock_code, 
                                           period="daily", 
                                           start_date="20241201", 
                                           end_date="20241201", 
                                           adjust="qfq")
                
                if df_data.empty:
                    print(f"  ❌ {stock_code} 数据为空")
                else:
                    print(f"  ✅ {stock_code} 数据获取成功，形状: {df_data.shape}")
                    
            except Exception as e:
                print(f"  ❌ {stock_code} 获取失败: {e}")
        
    except Exception as e:
        print(f"❌ AKShare测试失败: {e}")

if __name__ == "__main__":
    print("=" * 60)
    print("🧪 股票代码格式修复测试")
    print("=" * 60)
    
    # 测试1: 股票代码格式
    df = test_stock_code_format()
    
    # 测试2: 使用清理后的代码调用AKShare
    test_akshare_with_clean_codes()
    
    print("\n" + "=" * 60)
    print("🏁 测试完成")
    print("=" * 60)
