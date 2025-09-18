#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
量化选股平台后端服务
基于 FastAPI 提供策略计算和回测功能
"""

import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import warnings
warnings.filterwarnings('ignore')

# 创建 FastAPI 应用
app = FastAPI(
    title="量化选股平台",
    description="基于多因子模型的智能选股系统",
    version="1.0.0"
)

# 添加 CORS 中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 数据模型定义
class StrategyRequest(BaseModel):
    stockPool: str
    timeRange: str
    factors: Dict[str, int]
    filters: Dict[str, float]

class StockInfo(BaseModel):
    code: str
    name: str
    score: float
    pe: float
    pb: float
    roe: float
    marketCap: float

class PerformanceMetrics(BaseModel):
    annualReturn: float
    sharpeRatio: float
    maxDrawdown: float
    winRate: float

class StrategyResponse(BaseModel):
    stocks: List[StockInfo]
    performance: PerformanceMetrics
    equityCurve: Dict[str, List]
    benchmarkCurve: List[float]

class QuantitativeStrategy:
    """量化策略核心类"""
    
    def __init__(self):
        self.stock_data = None
        self.benchmark_data = None
        
    def load_mock_data(self, stock_pool: str, time_range: str) -> pd.DataFrame:
        """加载模拟股票数据"""
        print(f"加载股票数据: 股票池={stock_pool}, 时间范围={time_range}")
        
        # 根据时间范围确定数据长度
        days_map = {'1y': 250, '2y': 500, '3y': 750, '5y': 1250}
        days = days_map.get(time_range, 250)
        
        # 生成模拟股票列表
        stock_codes = self._generate_stock_codes(stock_pool)
        
        data = []
        for code in stock_codes:
            stock_info = self._generate_stock_history(code, days)
            data.append(stock_info)
        
        return pd.concat(data, ignore_index=True)
    
    def _generate_stock_codes(self, stock_pool: str) -> List[str]:
        """根据股票池生成股票代码"""
        if stock_pool == 'hs300':
            return [f"600{i:03d}" for i in range(1, 51)]  # 沪深300样本
        elif stock_pool == 'zz500':
            return [f"000{i:03d}" for i in range(1, 51)]  # 中证500样本
        elif stock_pool == 'sz50':
            return [f"600{i:03d}" for i in range(1, 21)]  # 上证50样本
        else:  # 全A股
            return [f"600{i:03d}" for i in range(1, 101)]  # 全A股样本
    
    def _generate_stock_history(self, code: str, days: int) -> pd.DataFrame:
        """生成单只股票的历史数据"""
        # 生成日期序列
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        dates = pd.date_range(start=start_date, end=end_date, freq='D')
        dates = [d for d in dates if d.weekday() < 5]  # 只保留工作日
        
        # 生成价格数据
        np.random.seed(hash(code) % 2**32)  # 确保相同代码生成相同数据
        
        # 基础价格
        base_price = np.random.uniform(10, 100)
        prices = [base_price]
        
        for i in range(1, len(dates)):
            # 随机游走生成价格
            change = np.random.normal(0, 0.02)  # 2%的日波动率
            new_price = prices[-1] * (1 + change)
            prices.append(max(new_price, 1))  # 价格不能为负
        
        # 生成其他指标
        pe = np.random.uniform(5, 50)
        pb = np.random.uniform(0.5, 5)
        roe = np.random.uniform(0, 20)
        market_cap = np.random.uniform(50, 1000)
        
        # 计算技术指标
        prices_array = np.array(prices)
        returns = np.diff(prices_array) / prices_array[:-1]
        volatility = np.std(returns) * np.sqrt(252)  # 年化波动率
        
        # 计算动量指标（20日收益率）
        momentum = (prices[-1] / prices[-20] - 1) if len(prices) >= 20 else 0
        
        return pd.DataFrame({
            'code': [code] * len(dates),
            'date': dates,
            'close': prices,
            'pe': [pe] * len(dates),
            'pb': [pb] * len(dates),
            'roe': [roe] * len(dates),
            'market_cap': [market_cap] * len(dates),
            'volatility': [volatility] * len(dates),
            'momentum': [momentum] * len(dates)
        })
    
    def calculate_factors(self, data: pd.DataFrame, factors: Dict[str, int]) -> pd.DataFrame:
        """计算因子得分"""
        print("计算因子得分...")
        
        # 标准化因子权重
        total_weight = sum(factors.values())
        if total_weight == 0:
            total_weight = 1
        
        # 计算各因子得分（0-1标准化）
        factor_scores = {}
        
        # PE因子（越小越好，取倒数）
        pe_scores = 1 / (data['pe'] + 1)  # 加1避免除零
        factor_scores['pe'] = (pe_scores - pe_scores.min()) / (pe_scores.max() - pe_scores.min())
        
        # PB因子（越小越好，取倒数）
        pb_scores = 1 / (data['pb'] + 0.1)  # 加0.1避免除零
        factor_scores['pb'] = (pb_scores - pb_scores.min()) / (pb_scores.max() - pb_scores.min())
        
        # ROE因子（越大越好）
        roe_scores = data['roe']
        factor_scores['roe'] = (roe_scores - roe_scores.min()) / (roe_scores.max() - roe_scores.min())
        
        # 动量因子（越大越好）
        momentum_scores = data['momentum']
        factor_scores['momentum'] = (momentum_scores - momentum_scores.min()) / (momentum_scores.max() - momentum_scores.min())
        
        # 波动率因子（越小越好，取倒数）
        volatility_scores = 1 / (data['volatility'] + 0.01)  # 加0.01避免除零
        factor_scores['volatility'] = (volatility_scores - volatility_scores.min()) / (volatility_scores.max() - volatility_scores.min())
        
        # 计算综合得分
        total_score = np.zeros(len(data))
        for factor, weight in factors.items():
            if factor in factor_scores:
                total_score += factor_scores[factor] * (weight / total_weight)
        
        data['score'] = total_score
        return data
    
    def apply_filters(self, data: pd.DataFrame, filters: Dict[str, float]) -> pd.DataFrame:
        """应用筛选条件"""
        print("应用筛选条件...")
        
        filtered_data = data.copy()
        
        if 'minMarketCap' in filters:
            filtered_data = filtered_data[filtered_data['market_cap'] >= filters['minMarketCap']]
        
        if 'maxPe' in filters:
            filtered_data = filtered_data[filtered_data['pe'] <= filters['maxPe']]
        
        if 'minRoe' in filters:
            filtered_data = filtered_data[filtered_data['roe'] >= filters['minRoe']]
        
        return filtered_data
    
    def select_stocks(self, data: pd.DataFrame, top_n: int = 20) -> pd.DataFrame:
        """选择得分最高的股票"""
        print(f"选择前{top_n}只股票...")
        
        # 按得分排序
        selected = data.sort_values('score', ascending=False).head(top_n)
        
        # 去重（保留每只股票的最新数据）
        selected = selected.groupby('code').last().reset_index()
        
        return selected
    
    def calculate_performance(self, data: pd.DataFrame) -> Dict[str, float]:
        """计算策略绩效指标"""
        print("计算策略绩效...")
        
        # 模拟年化收益率
        annual_return = np.random.uniform(5, 25)
        
        # 模拟夏普比率
        sharpe_ratio = np.random.uniform(0.5, 2.0)
        
        # 模拟最大回撤
        max_drawdown = -np.random.uniform(5, 15)
        
        # 模拟胜率
        win_rate = np.random.uniform(55, 75)
        
        return {
            'annualReturn': round(annual_return, 2),
            'sharpeRatio': round(sharpe_ratio, 2),
            'maxDrawdown': round(max_drawdown, 2),
            'winRate': round(win_rate, 2)
        }
    
    def generate_equity_curve(self, data: pd.DataFrame) -> Dict[str, List]:
        """生成收益曲线"""
        print("生成收益曲线...")
        
        # 生成日期序列
        days = 250
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        dates = pd.date_range(start=start_date, end=end_date, freq='D')
        dates = [d for d in dates if d.weekday() < 5]  # 只保留工作日
        dates = [d.strftime('%Y-%m-%d') for d in dates]
        
        # 生成策略收益曲线
        np.random.seed(42)
        returns = np.random.normal(0.0005, 0.02, len(dates))  # 日收益率
        equity_values = [100]  # 起始净值100
        
        for ret in returns:
            equity_values.append(equity_values[-1] * (1 + ret))
        
        equity_values = equity_values[1:]  # 去掉起始值
        
        return {
            'dates': dates,
            'values': [round(v, 2) for v in equity_values]
        }
    
    def generate_benchmark_curve(self, data: pd.DataFrame) -> List[float]:
        """生成基准收益曲线"""
        print("生成基准收益曲线...")
        
        # 生成基准收益曲线（相对稳定）
        days = 250
        np.random.seed(123)
        returns = np.random.normal(0.0002, 0.015, days)  # 基准波动较小
        benchmark_values = [100]  # 起始净值100
        
        for ret in returns:
            benchmark_values.append(benchmark_values[-1] * (1 + ret))
        
        benchmark_values = benchmark_values[1:]  # 去掉起始值
        
        return [round(v, 2) for v in benchmark_values]

# 创建策略实例
strategy = QuantitativeStrategy()

@app.get("/")
async def root():
    """根路径"""
    return {"message": "量化选股平台后端服务", "status": "running"}

@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/run_strategy", response_model=StrategyResponse)
async def run_strategy(request: StrategyRequest):
    """运行量化策略"""
    try:
        print(f"收到策略请求: {request}")
        
        # 加载数据
        data = strategy.load_mock_data(request.stockPool, request.timeRange)
        
        # 计算因子得分
        data = strategy.calculate_factors(data, request.factors)
        
        # 应用筛选条件
        data = strategy.apply_filters(data, request.filters)
        
        # 选择股票
        selected_stocks = strategy.select_stocks(data, top_n=20)
        
        # 计算绩效指标
        performance = strategy.calculate_performance(selected_stocks)
        
        # 生成收益曲线
        equity_curve = strategy.generate_equity_curve(selected_stocks)
        benchmark_curve = strategy.generate_benchmark_curve(selected_stocks)
        
        # 构建响应数据
        stocks = []
        for _, stock in selected_stocks.iterrows():
            stocks.append(StockInfo(
                code=stock['code'],
                name=f"股票{stock['code']}",  # 模拟股票名称
                score=round(stock['score'], 3),
                pe=round(stock['pe'], 1),
                pb=round(stock['pb'], 2),
                roe=round(stock['roe'], 1),
                marketCap=round(stock['market_cap'], 0)
            ))
        
        response = StrategyResponse(
            stocks=stocks,
            performance=PerformanceMetrics(**performance),
            equityCurve=equity_curve,
            benchmarkCurve=benchmark_curve
        )
        
        print(f"策略运行完成，返回{len(stocks)}只股票")
        return response
        
    except Exception as e:
        print(f"策略运行失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"策略运行失败: {str(e)}")

@app.get("/strategy_templates")
async def get_strategy_templates():
    """获取策略模板"""
    templates = {
        "价值投资": {
            "factors": {"pe": 40, "pb": 30, "roe": 30, "momentum": 0, "volatility": 0},
            "filters": {"minMarketCap": 100, "maxPe": 20, "minRoe": 10}
        },
        "成长投资": {
            "factors": {"pe": 20, "pb": 20, "roe": 20, "momentum": 40, "volatility": 0},
            "filters": {"minMarketCap": 50, "maxPe": 50, "minRoe": 5}
        },
        "平衡策略": {
            "factors": {"pe": 25, "pb": 20, "roe": 25, "momentum": 15, "volatility": 15},
            "filters": {"minMarketCap": 50, "maxPe": 40, "minRoe": 8}
        }
    }
    return templates

if __name__ == "__main__":
    print("启动量化选股平台后端服务...")
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
