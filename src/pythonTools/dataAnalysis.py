#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
数据分析示例代码
展示如何使用 Python 进行数据分析和可视化
"""

import json
import csv
import statistics
from typing import List, Dict, Any
import datetime


class DataAnalyzer:
    """数据分析器类"""
    
    def __init__(self):
        self.data = []
    
    def load_stock_data(self, filename: str = "stock_data.json"):
        """加载股票数据"""
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                self.data = json.load(f)
            print(f"成功加载数据，共 {len(self.data)} 条记录")
        except FileNotFoundError:
            print(f"文件 {filename} 不存在，使用模拟数据")
            self.generate_sample_data()
    
    def generate_sample_data(self):
        """生成模拟股票数据"""
        import random
        
        stock_codes = ["000001", "000002", "600036", "600519", "000858"]
        stock_names = ["平安银行", "万科A", "招商银行", "贵州茅台", "五粮液"]
        
        self.data = []
        for i in range(100):  # 生成100条模拟数据
            stock = {
                "code": random.choice(stock_codes),
                "name": random.choice(stock_names),
                "price": round(random.uniform(10, 200), 2),
                "change": round(random.uniform(-10, 10), 2),
                "volume": random.randint(1000, 100000),
                "date": (datetime.datetime.now() - datetime.timedelta(days=i)).strftime("%Y-%m-%d")
            }
            self.data.append(stock)
        
        print(f"生成模拟数据，共 {len(self.data)} 条记录")
    
    def basic_statistics(self):
        """基础统计分析"""
        print("\n=== 基础统计分析 ===")
        
        if not self.data:
            print("没有数据可分析")
            return
        
        prices = [item["price"] for item in self.data]
        changes = [item["change"] for item in self.data]
        volumes = [item["volume"] for item in self.data]
        
        print(f"价格统计:")
        print(f"  最高价: {max(prices):.2f}")
        print(f"  最低价: {min(prices):.2f}")
        print(f"  平均价: {statistics.mean(prices):.2f}")
        print(f"  中位数: {statistics.median(prices):.2f}")
        
        print(f"\n涨跌幅统计:")
        print(f"  最大涨幅: {max(changes):.2f}%")
        print(f"  最大跌幅: {min(changes):.2f}%")
        print(f"  平均涨跌: {statistics.mean(changes):.2f}%")
        
        print(f"\n成交量统计:")
        print(f"  最大成交量: {max(volumes):,}")
        print(f"  最小成交量: {min(volumes):,}")
        print(f"  平均成交量: {statistics.mean(volumes):,.0f}")
    
    def stock_analysis(self):
        """股票分析"""
        print("\n=== 股票分析 ===")
        
        if not self.data:
            print("没有数据可分析")
            return
        
        # 按股票代码分组
        stock_groups = {}
        for item in self.data:
            code = item["code"]
            if code not in stock_groups:
                stock_groups[code] = []
            stock_groups[code].append(item)
        
        print("各股票表现:")
        for code, stocks in stock_groups.items():
            name = stocks[0]["name"]
            avg_price = statistics.mean([s["price"] for s in stocks])
            avg_change = statistics.mean([s["change"] for s in stocks])
            total_volume = sum([s["volume"] for s in stocks])
            
            print(f"  {code} ({name}):")
            print(f"    平均价格: {avg_price:.2f}")
            print(f"    平均涨跌: {avg_change:.2f}%")
            print(f"    总成交量: {total_volume:,}")
    
    def trend_analysis(self):
        """趋势分析"""
        print("\n=== 趋势分析 ===")
        
        if not self.data:
            print("没有数据可分析")
            return
        
        # 按日期排序
        sorted_data = sorted(self.data, key=lambda x: x["date"])
        
        # 计算价格趋势
        prices = [item["price"] for item in sorted_data]
        if len(prices) >= 2:
            price_trend = "上涨" if prices[-1] > prices[0] else "下跌"
            price_change = ((prices[-1] - prices[0]) / prices[0]) * 100
            print(f"价格趋势: {price_trend} ({price_change:.2f}%)")
        
        # 计算涨跌分布
        positive_changes = [item for item in self.data if item["change"] > 0]
        negative_changes = [item for item in self.data if item["change"] < 0]
        neutral_changes = [item for item in self.data if item["change"] == 0]
        
        print(f"涨跌分布:")
        print(f"  上涨: {len(positive_changes)} 条 ({len(positive_changes)/len(self.data)*100:.1f}%)")
        print(f"  下跌: {len(negative_changes)} 条 ({len(negative_changes)/len(self.data)*100:.1f}%)")
        print(f"  平盘: {len(neutral_changes)} 条 ({len(neutral_changes)/len(self.data)*100:.1f}%)")
    
    def export_analysis_report(self, filename: str = "analysis_report.txt"):
        """导出分析报告"""
        print(f"\n=== 导出分析报告到 {filename} ===")
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write("股票数据分析报告\n")
            f.write("=" * 50 + "\n\n")
            f.write(f"分析时间: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"数据条数: {len(self.data)}\n\n")
            
            # 基础统计
            if self.data:
                prices = [item["price"] for item in self.data]
                changes = [item["change"] for item in self.data]
                
                f.write("价格统计:\n")
                f.write(f"  最高价: {max(prices):.2f}\n")
                f.write(f"  最低价: {min(prices):.2f}\n")
                f.write(f"  平均价: {statistics.mean(prices):.2f}\n")
                f.write(f"  中位数: {statistics.median(prices):.2f}\n\n")
                
                f.write("涨跌幅统计:\n")
                f.write(f"  最大涨幅: {max(changes):.2f}%\n")
                f.write(f"  最大跌幅: {min(changes):.2f}%\n")
                f.write(f"  平均涨跌: {statistics.mean(changes):.2f}%\n\n")
        
        print(f"分析报告已保存到 {filename}")
    
    def run_analysis(self):
        """运行完整分析"""
        print("股票数据分析工具")
        print("=" * 50)
        
        self.load_stock_data()
        self.basic_statistics()
        self.stock_analysis()
        self.trend_analysis()
        self.export_analysis_report()
        
        print("\n" + "=" * 50)
        print("分析完成！")


def main():
    """主函数"""
    analyzer = DataAnalyzer()
    analyzer.run_analysis()


if __name__ == "__main__":
    main()
