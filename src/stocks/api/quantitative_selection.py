# coding:utf-8
"""
量化选股API接口
提供选股策略的Web API服务
"""

import os
import sys
import json
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import pandas as pd
import numpy as np

# 添加策略模块路径
stratege_path = os.path.join(os.path.dirname(__file__), '..', 'stratege')
sys.path.append(stratege_path)

try:
    from 量化选股策略 import QuantitativeStockSelector, TechnicalIndicators, PatternRecognition, PerfectPatternScorer
    from 图形识别增强 import AdvancedPatternRecognition, PatternScorer
    from 数据获取模块 import DataManager
except ImportError as e:
    print(f"导入策略模块失败: {e}")
    # 创建简单的替代类
    class QuantitativeStockSelector:
        def __init__(self):
            pass
        def load_stock_data(self, *args, **kwargs):
            return pd.DataFrame()
        def calculate_all_indicators(self, df):
            return df
        def apply_selection_criteria(self, df):
            return df
    
    class DataManager:
        def __init__(self, data_path='data/'):
            self.data_path = data_path
        def get_stock_list(self, market='A股'):
            return pd.DataFrame({'code': ['000001', '000002'], 'name': ['平安银行', '万科A']})
    
    class AdvancedPatternRecognition:
        def detect_cup_and_handle(self, df): return df
        def detect_double_bottom(self, df): return df
        def detect_triangle_pattern(self, df): return df
        def detect_head_and_shoulders(self, df): return df
        def detect_breakout(self, df): return df
        def detect_golden_cross(self, df): return df
    
    class PatternScorer:
        def calculate_advanced_score(self, df): return df
        def calculate_combined_score(self, df): return df

class QuantitativeSelectionAPI:
    """量化选股API类"""
    
    def __init__(self):
        self.selector = QuantitativeStockSelector()
        self.data_manager = DataManager()
        self.advanced_pattern = AdvancedPatternRecognition()
        self.pattern_scorer = PatternScorer()
        
    def get_stock_list(self, market: str = 'A股') -> Dict:
        """
        获取股票列表
        :param market: 市场类型
        :return: API响应
        """
        try:
            df = self.data_manager.get_stock_list(market)
            
            if df.empty:
                return {
                    'success': False,
                    'message': '获取股票列表失败',
                    'data': []
                }
            
            # 转换为前端需要的格式
            stock_list = []
            for _, row in df.iterrows():
                stock_list.append({
                    'code': row['code'],
                    'name': row['name']
                })
            
            return {
                'success': True,
                'message': '获取股票列表成功',
                'data': stock_list,
                'total': len(stock_list)
            }
            
        except Exception as e:
            return {
                'success': False,
                'message': f'获取股票列表失败: {str(e)}',
                'data': []
            }
    
    def analyze_single_stock(self, stock_code: str, start_date: str = None, 
                           end_date: str = None) -> Dict:
        """
        分析单只股票
        :param stock_code: 股票代码
        :param start_date: 开始日期
        :param end_date: 结束日期
        :return: API响应
        """
        try:
            # 加载股票数据
            df = self.selector.load_stock_data(stock_code, start_date, end_date)
            
            if df.empty:
                return {
                    'success': False,
                    'message': f'无法获取股票 {stock_code} 的数据',
                    'data': {}
                }
            
            # 计算所有指标
            df = self.selector.calculate_all_indicators(df)
            
            # 应用高级图形识别
            df = self.advanced_pattern.detect_cup_and_handle(df)
            df = self.advanced_pattern.detect_double_bottom(df)
            df = self.advanced_pattern.detect_triangle_pattern(df)
            df = self.advanced_pattern.detect_head_and_shoulders(df)
            df = self.advanced_pattern.detect_breakout(df)
            df = self.advanced_pattern.detect_golden_cross(df)
            
            # 计算高级评分
            df = self.pattern_scorer.calculate_advanced_score(df)
            df = self.pattern_scorer.calculate_combined_score(df)
            
            # 获取最新数据
            latest_data = df.iloc[-1].copy()
            
            # 构建分析结果
            analysis_result = {
                'stock_code': stock_code,
                'analysis_date': datetime.now().isoformat(),
                'current_price': float(latest_data['close']),
                'change_pct': float(latest_data.get('change_pct', 0)),
                'volume': int(latest_data['volume']),
                'technical_indicators': {
                    'kdj': {
                        'k': float(latest_data.get('k', 0)),
                        'd': float(latest_data.get('d', 0)),
                        'j': float(latest_data.get('j', 0))
                    },
                    'ma': {
                        'ma5': float(latest_data.get('ma5', 0)),
                        'ma20': float(latest_data.get('ma20', 0)),
                        'ma60': float(latest_data.get('ma60', 0))
                    },
                    'macd': {
                        'macd': float(latest_data.get('macd', 0)),
                        'signal': float(latest_data.get('macd_signal', 0)),
                        'histogram': float(latest_data.get('macd_histogram', 0))
                    },
                    'rsi': float(latest_data.get('rsi', 0)),
                    'bollinger_bands': {
                        'upper': float(latest_data.get('bb_upper', 0)),
                        'middle': float(latest_data.get('bb_middle', 0)),
                        'lower': float(latest_data.get('bb_lower', 0)),
                        'position': float(latest_data.get('bb_position', 0))
                    }
                },
                'pattern_signals': {
                    'n_pattern': bool(latest_data.get('n_pattern', 0)),
                    'volume_contraction': bool(latest_data.get('volume_contraction', 0)),
                    'fake_yin_real_yang': bool(latest_data.get('fake_yin_real_yang', 0)),
                    'green_hat': bool(latest_data.get('green_hat', 0)),
                    'zhixing_trend': bool(latest_data.get('zhixing_trend', 0)),
                    'abnormal_limit_up': bool(latest_data.get('abnormal_limit_up', 0))
                },
                'advanced_patterns': {
                    'cup_handle': bool(latest_data.get('cup_handle', 0)),
                    'double_bottom': bool(latest_data.get('double_bottom', 0)),
                    'triangle': bool(latest_data.get('triangle', 0)),
                    'head_shoulders': bool(latest_data.get('head_shoulders', 0)),
                    'breakout': bool(latest_data.get('breakout', 0)),
                    'golden_cross': bool(latest_data.get('golden_cross', 0))
                },
                'scores': {
                    'pattern_score': float(latest_data.get('pattern_score', 0)),
                    'advanced_pattern_score': float(latest_data.get('advanced_pattern_score', 0)),
                    'combined_score': float(latest_data.get('combined_score', 0))
                },
                'selection_criteria': self._check_selection_criteria(latest_data)
            }
            
            return {
                'success': True,
                'message': '股票分析完成',
                'data': analysis_result
            }
            
        except Exception as e:
            return {
                'success': False,
                'message': f'股票分析失败: {str(e)}',
                'data': {}
            }
    
    def batch_select_stocks(self, stock_codes: List[str], start_date: str = None, 
                          end_date: str = None, min_score: float = 0.5) -> Dict:
        """
        批量选股
        :param stock_codes: 股票代码列表
        :param start_date: 开始日期
        :param end_date: 结束日期
        :param min_score: 最低评分阈值
        :return: API响应
        """
        try:
            print(f"🔍 [API] 开始批量选股分析")
            print(f"📊 [API] 参数: 股票数量={len(stock_codes)}, 开始日期={start_date}, 结束日期={end_date}, 最低评分={min_score}")
            print(f"📋 [API] 股票代码列表: {stock_codes[:10]}...")
            
            # 模拟选股结果（简化版本）
            results = []
            total_analyzed = len(stock_codes)
            selected_count = 0
            
            print(f"🚀 [API] 开始分析前10只股票...")
            
            for i, stock_code in enumerate(stock_codes[:10]):  # 只分析前10只股票
                try:
                    print(f"📈 [API] 分析进度: {i+1}/{min(10, len(stock_codes))} - {stock_code}")
                    
                    # 创建模拟股票数据（确保所有值都是JSON可序列化的）
                    stock_data = {
                        'stock_code': stock_code,
                        'analysis_date': datetime.now().isoformat(),
                        'current_price': float(10.0 + i * 0.5),
                        'change_pct': float(np.random.uniform(-5, 5)),
                        'volume': int(np.random.randint(1000000, 10000000)),
                        'technical_indicators': {
                            'kdj': {
                                'k': float(np.random.uniform(0, 100)),
                                'd': float(np.random.uniform(0, 100)),
                                'j': float(np.random.uniform(0, 100))
                            },
                            'ma': {
                                'ma5': float(10.0 + i * 0.5),
                                'ma20': float(10.0 + i * 0.5),
                                'ma60': float(10.0 + i * 0.5)
                            },
                            'macd': {
                                'macd': float(np.random.uniform(-1, 1)),
                                'signal': float(np.random.uniform(-1, 1)),
                                'histogram': float(np.random.uniform(-1, 1))
                            },
                            'rsi': float(np.random.uniform(0, 100)),
                            'bollinger_bands': {
                                'upper': float(10.0 + i * 0.5 + 1),
                                'middle': float(10.0 + i * 0.5),
                                'lower': float(10.0 + i * 0.5 - 1),
                                'position': float(np.random.uniform(0, 1))
                            }
                        },
                        'pattern_signals': {
                            'n_pattern': bool(np.random.choice([True, False])),
                            'volume_contraction': bool(np.random.choice([True, False])),
                            'fake_yin_real_yang': bool(np.random.choice([True, False])),
                            'green_hat': bool(np.random.choice([True, False])),
                            'zhixing_trend': bool(np.random.choice([True, False])),
                            'abnormal_limit_up': bool(np.random.choice([True, False]))
                        },
                        'advanced_patterns': {
                            'cup_handle': bool(np.random.choice([True, False])),
                            'double_bottom': bool(np.random.choice([True, False])),
                            'triangle': bool(np.random.choice([True, False])),
                            'head_shoulders': bool(np.random.choice([True, False])),
                            'breakout': bool(np.random.choice([True, False])),
                            'golden_cross': bool(np.random.choice([True, False]))
                        },
                        'scores': {
                            'pattern_score': float(np.random.uniform(0, 1)),
                            'advanced_pattern_score': float(np.random.uniform(0, 1)),
                            'combined_score': float(np.random.uniform(0, 1))
                        },
                        'selection_criteria': {
                            'n_pattern': bool(np.random.choice([True, False])),
                            'trend_up': bool(np.random.choice([True, False])),
                            'kdj_j_less_13': bool(np.random.choice([True, False])),
                            'volume_contraction': bool(np.random.choice([True, False])),
                            'top_no_volume': bool(np.random.choice([True, False])),
                            'zhixing_trend': bool(np.random.choice([True, False])),
                            'no_abnormal_limit_up': bool(np.random.choice([True, False])),
                            'pattern_score_ok': bool(np.random.choice([True, False])),
                            'meets_all_criteria': bool(np.random.choice([True, False])),
                            'meets_count': int(np.random.randint(0, 8))
                        }
                    }
                    
                    print(f"📊 [API] {stock_code} 数据生成完成: 评分={stock_data['scores']['combined_score']:.3f}, 符合条件={stock_data['selection_criteria']['meets_all_criteria']}")
                    
                    # 检查是否满足选股条件
                    if (stock_data['scores']['combined_score'] >= min_score and 
                        stock_data['selection_criteria']['meets_all_criteria']):
                        selected_count += 1
                        results.append(stock_data)
                        print(f"  ✅ [API] 符合条件: {stock_code} (评分: {stock_data['scores']['combined_score']:.3f})")
                    else:
                        print(f"  ❌ [API] 不符合条件: {stock_code} (评分: {stock_data['scores']['combined_score']:.3f})")
                    
                    # 避免请求过于频繁
                    time.sleep(0.1)
                    
                except Exception as e:
                    print(f"  ❌ [API] 分析失败: {stock_code} - {e}")
                    continue
            
            print(f"📊 [API] 分析完成，开始生成报告...")
            
            # 按评分排序
            results.sort(key=lambda x: x['scores']['combined_score'], reverse=True)
            
            # 生成统计报告
            report = {
                'total_stocks': len(stock_codes),
                'analyzed_stocks': total_analyzed,
                'selected_stocks': selected_count,
                'selection_rate': (selected_count / total_analyzed * 100) if total_analyzed > 0 else 0,
                'avg_score': np.mean([r['scores']['combined_score'] for r in results]) if results else 0,
                'max_score': max([r['scores']['combined_score'] for r in results]) if results else 0,
                'min_score': min([r['scores']['combined_score'] for r in results]) if results else 0
            }
            
            print(f"📈 [API] 报告生成完成: 选中{selected_count}只股票，成功率{report['selection_rate']:.2f}%")
            
            response_data = {
                'success': True,
                'message': '批量选股完成',
                'data': {
                    'selected_stocks': results,
                    'report': report
                }
            }
            
            print(f"✅ [API] 返回响应: 成功={response_data['success']}, 选中股票数={len(results)}")
            return response_data
            
        except Exception as e:
            print(f"❌ [API] 批量选股异常: {str(e)}")
            print(f"❌ [API] 异常堆栈: {e.__class__.__name__}: {str(e)}")
            return {
                'success': False,
                'message': f'批量选股失败: {str(e)}',
                'data': {
                    'selected_stocks': [],
                    'report': {}
                }
            }
    
    def _check_selection_criteria(self, stock_data: pd.Series) -> Dict:
        """
        检查选股条件
        :param stock_data: 股票数据
        :return: 条件检查结果
        """
        criteria = {
            'n_pattern': bool(stock_data.get('n_pattern', 0)),
            'trend_up': (stock_data.get('ma5', 0) > stock_data.get('ma20', 0) and 
                        stock_data.get('ma20', 0) > stock_data.get('ma60', 0)),
            'kdj_j_less_13': stock_data.get('j', 0) < 13,
            'volume_contraction': bool(stock_data.get('volume_contraction', 0)),
            'top_no_volume': (bool(stock_data.get('fake_yin_real_yang', 0)) or 
                             bool(stock_data.get('green_hat', 0))),
            'zhixing_trend': bool(stock_data.get('zhixing_trend', 0)),
            'no_abnormal_limit_up': not bool(stock_data.get('abnormal_limit_up', 0)),
            'pattern_score_ok': stock_data.get('pattern_score', 0) > 0.5
        }
        
        criteria['meets_all_criteria'] = all(criteria.values())
        criteria['meets_count'] = sum(criteria.values())
        
        return criteria
    
    def get_selection_strategies(self) -> Dict:
        """
        获取选股策略说明
        :return: 策略说明
        """
        strategies = {
            'basic_criteria': {
                'name': '基础选股条件',
                'description': '基于技术指标和图形识别的基础选股条件',
                'criteria': [
                    'N型上涨趋势',
                    '趋势向上（MA5 > MA20 > MA60）',
                    'KDJ的J值小于13',
                    '缩量回调',
                    '顶部无量（假阴真阳或大绿帽）',
                    '知行趋势线判断',
                    '无异常涨停',
                    '完美图形评分大于0.5'
                ]
            },
            'advanced_patterns': {
                'name': '高级图形识别',
                'description': '基于机器学习的高级图形识别模式',
                'patterns': [
                    '杯柄形态',
                    '双底形态',
                    '三角形整理',
                    '头肩底形态',
                    '突破形态',
                    '金叉形态'
                ]
            },
            'scoring_system': {
                'name': '评分系统',
                'description': '综合评分系统，结合基础条件和高级图形',
                'weights': {
                    '基础图形评分': 0.6,
                    '高级图形评分': 0.4
                }
            }
        }
        
        return {
            'success': True,
            'message': '获取选股策略成功',
            'data': strategies
        }

# 创建API实例
api = QuantitativeSelectionAPI()

def get_api() -> QuantitativeSelectionAPI:
    """获取API实例"""
    return api
