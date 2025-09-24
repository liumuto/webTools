#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
网络爬虫示例代码
展示如何使用 Python 进行网页数据抓取
"""

import requests
import json
import time
import random
from typing import List, Dict, Any
from urllib.parse import urljoin, urlparse
import re


class WebScraper:
    """网络爬虫类"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.scraped_data = []
    
    def get_page_content(self, url: str) -> str:
        """获取网页内容"""
        try:
            print(f"正在访问: {url}")
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            response.encoding = 'utf-8'
            return response.text
        except requests.RequestException as e:
            print(f"请求失败: {e}")
            return ""
    
    def parse_json_data(self, json_text: str) -> List[Dict]:
        """解析 JSON 数据"""
        try:
            data = json.loads(json_text)
            return data if isinstance(data, list) else [data]
        except json.JSONDecodeError as e:
            print(f"JSON 解析失败: {e}")
            return []
    
    def extract_stock_info(self, html_content: str) -> List[Dict]:
        """从 HTML 中提取股票信息（示例）"""
        # 这是一个示例函数，实际使用时需要根据具体网站调整
        stocks = []
        
        # 使用正则表达式提取股票信息（示例模式）
        stock_pattern = r'股票代码[：:]\s*(\d{6})[，,]\s*股票名称[：:]\s*([^，,]+)'
        matches = re.findall(stock_pattern, html_content)
        
        for code, name in matches:
            stocks.append({
                "code": code,
                "name": name.strip(),
                "scraped_time": time.strftime("%Y-%m-%d %H:%M:%S")
            })
        
        return stocks
    
    def scrape_mock_stock_data(self) -> List[Dict]:
        """模拟抓取股票数据"""
        print("=== 模拟股票数据抓取 ===")
        
        # 模拟股票数据
        mock_stocks = [
            {"code": "000001", "name": "平安银行", "price": 12.50, "change": 2.5},
            {"code": "000002", "name": "万科A", "price": 18.30, "change": -1.2},
            {"code": "600036", "name": "招商银行", "price": 35.80, "change": 1.8},
            {"code": "600519", "name": "贵州茅台", "price": 1680.00, "change": 0.5},
            {"code": "000858", "name": "五粮液", "price": 245.60, "change": -0.8}
        ]
        
        # 模拟网络延迟
        time.sleep(random.uniform(0.5, 1.5))
        
        print(f"成功抓取 {len(mock_stocks)} 条股票数据")
        return mock_stocks
    
    def scrape_news_data(self) -> List[Dict]:
        """模拟抓取新闻数据"""
        print("=== 模拟新闻数据抓取 ===")
        
        # 模拟新闻数据
        mock_news = [
            {
                "title": "A股市场今日表现强劲，科技股领涨",
                "content": "今日A股市场整体表现良好，科技板块表现尤为突出...",
                "publish_time": "2024-01-15 09:30:00",
                "source": "财经网"
            },
            {
                "title": "央行发布最新货币政策，市场反应积极",
                "content": "央行今日发布最新货币政策，市场对此反应积极...",
                "publish_time": "2024-01-15 10:15:00",
                "source": "证券时报"
            },
            {
                "title": "新能源汽车板块持续走强，多只个股涨停",
                "content": "新能源汽车板块今日继续走强，多只相关个股涨停...",
                "publish_time": "2024-01-15 11:00:00",
                "source": "中国证券报"
            }
        ]
        
        # 模拟网络延迟
        time.sleep(random.uniform(0.3, 1.0))
        
        print(f"成功抓取 {len(mock_news)} 条新闻数据")
        return mock_news
    
    def save_data_to_json(self, data: List[Dict], filename: str):
        """保存数据到 JSON 文件"""
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"数据已保存到 {filename}")
        except Exception as e:
            print(f"保存文件失败: {e}")
    
    def save_data_to_csv(self, data: List[Dict], filename: str):
        """保存数据到 CSV 文件"""
        try:
            if not data:
                print("没有数据可保存")
                return
            
            import csv
            with open(filename, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=data[0].keys())
                writer.writeheader()
                writer.writerows(data)
            print(f"数据已保存到 {filename}")
        except Exception as e:
            print(f"保存CSV文件失败: {e}")
    
    def rate_limit_delay(self, min_delay: float = 1.0, max_delay: float = 3.0):
        """速率限制延迟"""
        delay = random.uniform(min_delay, max_delay)
        print(f"等待 {delay:.1f} 秒...")
        time.sleep(delay)
    
    def run_scraping_demo(self):
        """运行爬虫演示"""
        print("网络爬虫演示")
        print("=" * 50)
        
        # 抓取股票数据
        stock_data = self.scrape_mock_stock_data()
        self.save_data_to_json(stock_data, "scraped_stocks.json")
        self.save_data_to_csv(stock_data, "scraped_stocks.csv")
        
        # 速率限制
        self.rate_limit_delay()
        
        # 抓取新闻数据
        news_data = self.scrape_news_data()
        self.save_data_to_json(news_data, "scraped_news.json")
        self.save_data_to_csv(news_data, "scraped_news.csv")
        
        print("\n" + "=" * 50)
        print("爬虫演示完成！")
        print(f"共抓取股票数据: {len(stock_data)} 条")
        print(f"共抓取新闻数据: {len(news_data)} 条")


class APIClient:
    """API 客户端类"""
    
    def __init__(self, base_url: str = ""):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'Python-API-Client/1.0'
        })
    
    def get(self, endpoint: str, params: Dict = None) -> Dict:
        """GET 请求"""
        url = urljoin(self.base_url, endpoint)
        try:
            response = self.session.get(url, params=params)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"API 请求失败: {e}")
            return {}
    
    def post(self, endpoint: str, data: Dict) -> Dict:
        """POST 请求"""
        url = urljoin(self.base_url, endpoint)
        try:
            response = self.session.post(url, json=data)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"API 请求失败: {e}")
            return {}


def main():
    """主函数"""
    # 运行爬虫演示
    scraper = WebScraper()
    scraper.run_scraping_demo()
    
    # API 客户端示例
    print("\n=== API 客户端示例 ===")
    api_client = APIClient("https://api.example.com")
    
    # 模拟 API 调用
    print("模拟 API 调用...")
    # result = api_client.get("/stocks")
    # print(f"API 响应: {result}")


if __name__ == "__main__":
    main()
