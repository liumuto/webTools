# coding:utf-8
"""
更新A股股票列表
从AKShare获取最新的A股股票列表
"""

import os
import sys
import pandas as pd
import akshare as ak
from datetime import datetime

# 添加策略模块路径
stratege_path = os.path.join(os.path.dirname(__file__), 'stratege')
sys.path.append(stratege_path)

def update_a_stock_list():
    """更新A股股票列表"""
    try:
        print("🚀 开始获取A股股票列表...")
        
        # 从AKShare获取A股实时行情数据
        df = ak.stock_zh_a_spot()
        print(f"✅ 成功获取 {len(df)} 只A股股票数据")
        
        # 只保留代码和名称列
        if '代码' in df.columns and '名称' in df.columns:
            stock_df = df[['代码', '名称']].copy()
            stock_df.columns = ['code', 'name']
            
            # 过滤掉ST股票和退市股票
            stock_df = stock_df[~stock_df['name'].str.contains('ST|退市', na=False)]
            
            print(f"📊 过滤后剩余 {len(stock_df)} 只股票")
            
            # 保存到文件
            output_file = os.path.join(stratege_path, 'stock_code_names.csv')
            stock_df.to_csv(output_file, index=False, encoding='utf-8-sig')
            
            print(f"✅ 股票列表已保存到: {output_file}")
            print(f"📈 包含股票数量: {len(stock_df)}")
            
            # 显示前10只股票
            print("\n前10只股票:")
            for i, (_, row) in enumerate(stock_df.head(10).iterrows()):
                print(f"  {i+1}. {row['code']} - {row['name']}")
            
            return True
            
        else:
            print("❌ 数据格式不正确，缺少代码或名称列")
            return False
            
    except Exception as e:
        print(f"❌ 获取A股股票列表失败: {e}")
        return False

def test_stock_data():
    """测试股票数据获取"""
    try:
        print("\n🧪 测试股票数据获取...")
        
        # 测试获取平安银行数据
        test_code = "000001"
        print(f"测试股票代码: {test_code}")
        
        df = ak.stock_zh_a_hist(symbol=test_code, period="daily", 
                               start_date="20240101", end_date="20241201", 
                               adjust="qfq")
        
        if not df.empty:
            print(f"✅ 成功获取 {test_code} 数据，共 {len(df)} 条记录")
            print(f"数据列: {list(df.columns)}")
            print(f"最新数据: {df.iloc[-1].to_dict()}")
            return True
        else:
            print(f"❌ 无法获取 {test_code} 数据")
            return False
            
    except Exception as e:
        print(f"❌ 测试股票数据获取失败: {e}")
        return False

def main():
    """主函数"""
    print("=" * 60)
    print("A股股票列表更新工具")
    print("=" * 60)
    print(f"运行时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # 更新股票列表
    success1 = update_a_stock_list()
    
    # 测试数据获取
    success2 = test_stock_data()
    
    print("\n" + "=" * 60)
    print("更新结果")
    print("=" * 60)
    print(f"更新股票列表: {'✅ 成功' if success1 else '❌ 失败'}")
    print(f"测试数据获取: {'✅ 成功' if success2 else '❌ 失败'}")
    
    if success1 and success2:
        print("🎉 所有操作成功完成！")
    else:
        print("⚠️ 部分操作失败，请检查网络连接和AKShare状态")

if __name__ == "__main__":
    main()
