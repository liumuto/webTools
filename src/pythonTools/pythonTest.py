#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Python 基础示例代码
包含常用的 Python 编程模式和技巧
"""

import json
import csv
import datetime
import random
import os
from typing import List, Dict, Any


class PythonExamples:
    """Python 示例类，展示各种编程技巧"""
    
    def __init__(self):
        self.data = []
    
    def basic_operations(self):
        """基础操作示例"""
        print("=== Python 基础操作示例 ===")
        
        # 列表操作
        numbers = [1, 2, 3, 4, 5]
        print(f"原始列表: {numbers}")
        print(f"列表推导式: {[x**2 for x in numbers]}")
        print(f"过滤偶数: {[x for x in numbers if x % 2 == 0]}")
        
        # 字典操作
        person = {"name": "张三", "age": 25, "city": "北京"}
        print(f"字典: {person}")
        print(f"键值对: {list(person.items())}")
        
        # 字符串操作
        text = "Hello, Python!"
        print(f"字符串: {text}")
        print(f"大写: {text.upper()}")
        print(f"分割: {text.split(', ')}")
    
    def file_operations(self):
        """文件操作示例"""
        print("\n=== 文件操作示例 ===")
        
        # 写入文件
        data = {
            "股票代码": "000001",
            "股票名称": "平安银行",
            "当前价格": 12.50,
            "涨跌幅": 2.5
        }
        
        # JSON 文件操作
        with open('stock_data.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print("JSON 文件写入完成")
        
        # CSV 文件操作
        csv_data = [
            ["股票代码", "股票名称", "价格", "涨跌幅"],
            ["000001", "平安银行", "12.50", "2.5%"],
            ["000002", "万科A", "18.30", "-1.2%"]
        ]
        
        with open('stock_data.csv', 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerows(csv_data)
        print("CSV 文件写入完成")
    
    def data_processing(self):
        """数据处理示例"""
        print("\n=== 数据处理示例 ===")
        
        # 模拟股票数据
        stocks = [
            {"code": "000001", "name": "平安银行", "price": 12.50, "change": 2.5},
            {"code": "000002", "name": "万科A", "price": 18.30, "change": -1.2},
            {"code": "600036", "name": "招商银行", "price": 35.80, "change": 1.8},
            {"code": "600519", "name": "贵州茅台", "price": 1680.00, "change": 0.5}
        ]
        
        # 数据筛选
        rising_stocks = [stock for stock in stocks if stock["change"] > 0]
        print(f"上涨股票数量: {len(rising_stocks)}")
        
        # 数据排序
        sorted_stocks = sorted(stocks, key=lambda x: x["change"], reverse=True)
        print("按涨跌幅排序:")
        for stock in sorted_stocks:
            print(f"  {stock['name']}: {stock['change']}%")
        
        # 数据统计
        total_value = sum(stock["price"] for stock in stocks)
        avg_price = total_value / len(stocks)
        print(f"平均价格: {avg_price:.2f}")
    
    def error_handling(self):
        """错误处理示例"""
        print("\n=== 错误处理示例 ===")
        
        def safe_divide(a, b):
            try:
                result = a / b
                return result
            except ZeroDivisionError:
                print("错误: 除数不能为零")
                return None
            except TypeError:
                print("错误: 参数类型不正确")
                return None
            finally:
                print("计算完成")
        
        print(f"10 / 2 = {safe_divide(10, 2)}")
        print(f"10 / 0 = {safe_divide(10, 0)}")
        print(f"10 / 'a' = {safe_divide(10, 'a')}")
    
    def decorator_example(self):
        """装饰器示例"""
        print("\n=== 装饰器示例 ===")
        
        def timing_decorator(func):
            """计时装饰器"""
            def wrapper(*args, **kwargs):
                start_time = datetime.datetime.now()
                result = func(*args, **kwargs)
                end_time = datetime.datetime.now()
                print(f"函数 {func.__name__} 执行时间: {(end_time - start_time).total_seconds():.4f}秒")
                return result
            return wrapper
        
        @timing_decorator
        def slow_function():
            """模拟耗时操作"""
            import time
            time.sleep(0.1)
            return "操作完成"
        
        result = slow_function()
        print(f"结果: {result}")
    
    def generator_example(self):
        """生成器示例"""
        print("\n=== 生成器示例 ===")
        
        def fibonacci(n):
            """斐波那契数列生成器"""
            a, b = 0, 1
            for _ in range(n):
                yield a
                a, b = b, a + b
        
        print("斐波那契数列前10项:")
        for i, num in enumerate(fibonacci(10)):
            print(f"  F({i}) = {num}")
    
    def class_inheritance(self):
        """类继承示例"""
        print("\n=== 类继承示例 ===")
        
        class Animal:
            def __init__(self, name):
                self.name = name
            
            def speak(self):
                return f"{self.name} 发出声音"
        
        class Dog(Animal):
            def speak(self):
                return f"{self.name} 汪汪叫"
        
        class Cat(Animal):
            def speak(self):
                return f"{self.name} 喵喵叫"
        
        dog = Dog("旺财")
        cat = Cat("咪咪")
        
        print(dog.speak())
        print(cat.speak())
    
    def run_all_examples(self):
        """运行所有示例"""
        print("Python 示例代码演示")
        print("=" * 50)
        
        self.basic_operations()
        self.file_operations()
        self.data_processing()
        self.error_handling()
        self.decorator_example()
        self.generator_example()
        self.class_inheritance()
        
        print("\n" + "=" * 50)
        print("所有示例运行完成！")


def main():
    """主函数"""
    examples = PythonExamples()
    examples.run_all_examples()


if __name__ == "__main__":
    main()
