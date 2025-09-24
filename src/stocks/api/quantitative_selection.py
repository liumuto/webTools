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
        
    def get_stock_list(self, market: str = 'A股', markets: List[str] = None) -> Dict:
        """
        获取股票列表
        :param market: 市场类型
        :param markets: 要筛选的板块列表
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
            
            # 如果指定了板块筛选，则进行筛选
            if markets and len(markets) > 0:
                df = self.data_manager.filter_stocks_by_market(df, markets)
                print(f"📊 [API] 按板块筛选: {markets}, 筛选后股票数量: {len(df)}")
            
            # 转换为前端需要的格式
            stock_list = []
            for _, row in df.iterrows():
                stock_info = {
                    'code': row['code'],
                    'name': row['name']
                }
                # 如果包含板块信息，则添加
                if 'market' in row:
                    stock_info['market'] = row['market']
                stock_list.append(stock_info)
            
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
    
    def get_all_a_stock_codes(self) -> List[str]:
        """
        获取所有A股股票代码列表
        :return: 股票代码列表
        """
        try:
            df = self.data_manager.get_stock_list('A股')
            if df.empty:
                print("❌ [API] 无法获取A股股票列表")
                return []
            
            stock_codes = df['code'].tolist()
            print(f"✅ [API] 成功获取 {len(stock_codes)} 只A股股票代码")
            return stock_codes
            
        except Exception as e:
            print(f"❌ [API] 获取A股股票代码失败: {e}")
            return []
    
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
                          end_date: str = None, min_score: float = 0.5, 
                          max_stocks: int = None, request_interval: float = 0.2,
                          markets: List[str] = None) -> Dict:
        """
        批量选股
        :param stock_codes: 股票代码列表
        :param start_date: 开始日期
        :param end_date: 结束日期
        :param min_score: 最低评分阈值
        :param max_stocks: 最大分析股票数量（None表示分析所有）
        :param request_interval: 请求间隔（秒）
        :param markets: 要筛选的板块列表
        :return: API响应
        """
        try:
            # 如果指定了板块筛选，则先筛选股票代码
            if markets and len(markets) > 0:
                print(f"🔍 [API] 按板块筛选股票: {markets}")
                # 获取所有股票列表
                all_stocks_df = self.data_manager.get_stock_list('A股')
                if not all_stocks_df.empty:
                    # 按板块筛选
                    filtered_df = self.data_manager.filter_stocks_by_market(all_stocks_df, markets)
                    # 只保留在筛选结果中的股票代码
                    filtered_codes = set(filtered_df['code'].tolist())
                    stock_codes = [code for code in stock_codes if code in filtered_codes]
                    print(f"📊 [API] 板块筛选后股票数量: {len(stock_codes)}")
                else:
                    print(f"⚠️ [API] 无法获取股票列表进行板块筛选")
            
            # 如果设置了最大股票数量，则限制分析数量
            if max_stocks and max_stocks > 0:
                stock_codes = stock_codes[:max_stocks]
            
            print(f"🔍 [API] 开始批量选股分析")
            print(f"📊 [API] 参数: 股票数量={len(stock_codes)}, 开始日期={start_date}, 结束日期={end_date}, 最低评分={min_score}")
            print(f"📋 [API] 股票代码列表: {stock_codes[:10]}...")
            
            results = []
            total_analyzed = len(stock_codes)
            selected_count = 0
            failed_count = 0
            
            print(f"🚀 [API] 开始分析 {len(stock_codes)} 只股票...")
            
            for i, stock_code in enumerate(stock_codes):
                try:
                    # 显示进度（每10只股票显示一次，或者最后一只）
                    if (i + 1) % 10 == 0 or (i + 1) == len(stock_codes):
                        print(f"📈 [API] 分析进度: {i+1}/{len(stock_codes)} - {stock_code}")
                    
                    # 使用真实股票数据，添加重试机制
                    df = self._load_stock_data_with_retry(stock_code, start_date, end_date)
                    if df.empty:
                        failed_count += 1
                        print(f"  ❌ [API] 无法获取数据: {stock_code} (失败次数: {failed_count})")
                        continue
                    
                    # 计算所有技术指标和图形识别
                    df = self.selector.calculate_all_indicators(df)
                    
                    # 获取最新数据
                    latest_data = df.iloc[-1].copy()
                    
                    # 构建分析结果（确保所有值都是JSON可序列化的）
                    stock_data = {
                        'stock_code': stock_code,
                        'analysis_date': datetime.now().isoformat(),
                        'current_price': float(latest_data.get('close', 0)),
                        'change_pct': float(latest_data.get('change_pct', 0)),
                        'volume': int(latest_data.get('volume', 0)),
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
                            'combined_score': float(latest_data.get('pattern_score', 0))  # 使用真实评分
                        },
                        'selection_criteria': self._check_selection_criteria(latest_data)
                    }
                    
                    print(f"📊 [API] {stock_code} 数据生成完成: 评分={stock_data['scores']['combined_score']:.3f}, 符合条件={stock_data['selection_criteria']['meets_all_criteria']}")
                    
                    # 检查是否满足选股条件
                    meets_criteria = stock_data['selection_criteria']['meets_all_criteria']
                    score_ok = stock_data['scores']['combined_score'] >= min_score
                    
                    if score_ok and meets_criteria:
                        selected_count += 1
                        results.append(stock_data)
                        print(f"  ✅ [API] 符合条件: {stock_code} (评分: {stock_data['scores']['combined_score']:.3f})")
                    else:
                        print(f"  ❌ [API] 不符合条件: {stock_code} (评分: {stock_data['scores']['combined_score']:.3f})")
                    
                    # 避免请求过于频繁
                    time.sleep(request_interval)
                    
                except Exception as e:
                    failed_count += 1
                    print(f"  ❌ [API] 分析失败: {stock_code} - {e} (失败次数: {failed_count})")
                    continue
            
            print(f"📊 [API] 分析完成，开始生成报告...")
            
            # 按评分排序
            results.sort(key=lambda x: x['scores']['combined_score'], reverse=True)
            
            # 生成统计报告
            report = {
                'total_stocks': len(stock_codes),
                'analyzed_stocks': total_analyzed - failed_count,
                'failed_stocks': failed_count,
                'selected_stocks': selected_count,
                'selection_rate': (selected_count / (total_analyzed - failed_count) * 100) if (total_analyzed - failed_count) > 0 else 0,
                'success_rate': ((total_analyzed - failed_count) / total_analyzed * 100) if total_analyzed > 0 else 0,
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
    
    def analyze_all_a_stocks(self, start_date: str = None, end_date: str = None, 
                            min_score: float = 0.5, max_stocks: int = None, 
                            request_interval: float = 0.2) -> Dict:
        """
        分析所有A股股票
        :param start_date: 开始日期
        :param end_date: 结束日期
        :param min_score: 最低评分阈值
        :param max_stocks: 最大分析股票数量（None表示分析所有）
        :param request_interval: 请求间隔（秒）
        :return: API响应
        """
        try:
            print("🚀 [API] 开始分析所有A股股票...")
            
            # 获取所有A股股票代码
            stock_codes = self.get_all_a_stock_codes()
            if not stock_codes:
                return {
                    'success': False,
                    'message': '无法获取A股股票列表',
                    'data': {
                        'selected_stocks': [],
                        'report': {}
                    }
                }
            
            print(f"📊 [API] 共获取到 {len(stock_codes)} 只A股股票")
            
            # 调用批量选股方法
            return self.batch_select_stocks(
                stock_codes=stock_codes,
                start_date=start_date,
                end_date=end_date,
                min_score=min_score,
                max_stocks=max_stocks,
                request_interval=request_interval
            )
            
        except Exception as e:
            print(f"❌ [API] 分析所有A股股票失败: {str(e)}")
            return {
                'success': False,
                'message': f'分析所有A股股票失败: {str(e)}',
                'data': {
                    'selected_stocks': [],
                    'report': {}
                }
            }
    
    def _load_stock_data_with_retry(self, stock_code: str, start_date: str = None, 
                                   end_date: str = None, max_retries: int = 3) -> pd.DataFrame:
        """
        带重试机制的股票数据加载
        :param stock_code: 股票代码
        :param start_date: 开始日期
        :param end_date: 结束日期
        :param max_retries: 最大重试次数
        :return: 股票数据DataFrame
        """
        for attempt in range(max_retries):
            try:
                df = self.selector.load_stock_data(stock_code, start_date, end_date)
                if not df.empty:
                    return df
                else:
                    if attempt < max_retries - 1:
                        print(f"  ⚠️ [API] 第{attempt + 1}次获取数据为空，{1}秒后重试...")
                        time.sleep(1)
                    else:
                        print(f"  ❌ [API] 重试{max_retries}次后仍无法获取数据: {stock_code}")
            except Exception as e:
                if attempt < max_retries - 1:
                    print(f"  ⚠️ [API] 第{attempt + 1}次获取数据失败: {e}，{1}秒后重试...")
                    time.sleep(1)
                else:
                    print(f"  ❌ [API] 重试{max_retries}次后仍失败: {stock_code} - {e}")
        
        return pd.DataFrame()
    
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
    
    def get_market_info(self) -> Dict:
        """
        获取板块信息
        :return: 板块信息
        """
        try:
            market_info = {
                'success': True,
                'message': '获取板块信息成功',
                'data': {
                    'markets': list(self.data_manager.market_rules.keys()),
                    'rules': self.data_manager.market_rules,
                    'descriptions': {
                        '沪市主板': '上海证券交易所主板，代码以600、601、603、605开头',
                        '深市主板': '深圳证券交易所主板，代码以000、001、002、003、004开头',
                        '创业板': '深圳证券交易所创业板，代码以300、301开头',
                        '科创板': '上海证券交易所科创板，代码以688开头',
                        '北交所': '北京证券交易所，代码以8开头（82优先股、83/87普通股、88公开发行）'
                    }
                }
            }
            return market_info
        except Exception as e:
            return {
                'success': False,
                'message': f'获取板块信息失败: {str(e)}',
                'data': {}
            }
    
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
