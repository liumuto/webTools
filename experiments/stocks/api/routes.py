# coding:utf-8
"""
股票API路由
提供股票相关的Web API接口
"""

from flask import Blueprint, request, jsonify
from .quantitative_selection import get_api
from datetime import datetime
import json

# 创建蓝图
stocks_bp = Blueprint('stocks', __name__, url_prefix='/api/stocks')

@stocks_bp.route('/list', methods=['GET'])
def get_stock_list():
    """
    获取股票列表
    GET /api/stocks/list?market=A股&markets=沪市主板,创业板
    """
    try:
        market = request.args.get('market', 'A股')
        markets_str = request.args.get('markets', '')
        markets = [m.strip() for m in markets_str.split(',')] if markets_str else None
        
        api = get_api()
        result = api.get_stock_list(market, markets)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'获取股票列表失败: {str(e)}',
            'data': []
        }), 500

@stocks_bp.route('/analyze/<stock_code>', methods=['GET'])
def analyze_stock(stock_code):
    """
    分析单只股票
    GET /api/stocks/analyze/000001?start_date=20240101&end_date=20241201
    """
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        api = get_api()
        result = api.analyze_single_stock(stock_code, start_date, end_date)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'分析股票失败: {str(e)}',
            'data': {}
        }), 500

@stocks_bp.route('/select', methods=['POST'])
def select_stocks():
    """
    批量选股
    POST /api/stocks/select
    {
        "stock_codes": ["000001", "000002", "000003"],
        "start_date": "20240101",
        "end_date": "20241201",
        "min_score": 0.5
    }
    """
    try:
        print(f"🌐 [ROUTE] 收到批量选股请求")
        print(f"🌐 [ROUTE] 请求方法: {request.method}")
        print(f"🌐 [ROUTE] 请求头: {dict(request.headers)}")
        print(f"🌐 [ROUTE] 请求内容类型: {request.content_type}")
        
        data = request.get_json()
        print(f"🌐 [ROUTE] 解析的JSON数据: {data}")
        
        if not data:
            print(f"❌ [ROUTE] 错误: 请求数据为空")
            return jsonify({
                'success': False,
                'message': '请求数据不能为空',
                'data': {}
            }), 400
        
        stock_codes = data.get('stock_codes', [])
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        min_score = data.get('min_score', 0.5)
        markets = data.get('markets', [])
        
        print(f"🌐 [ROUTE] 提取参数: 股票数量={len(stock_codes)}, 开始日期={start_date}, 结束日期={end_date}, 最低评分={min_score}, 板块={markets}")
        
        if not stock_codes:
            print(f"❌ [ROUTE] 错误: 股票代码列表为空")
            return jsonify({
                'success': False,
                'message': '股票代码列表不能为空',
                'data': {}
            }), 400
        
        print(f"🌐 [ROUTE] 调用API进行批量选股...")
        api = get_api()
        result = api.batch_select_stocks(stock_codes, start_date, end_date, min_score, markets=markets)
        
        print(f"🌐 [ROUTE] API返回结果: 成功={result.get('success', False)}, 消息={result.get('message', '')}")
        print(f"🌐 [ROUTE] 返回响应给前端")
        
        return jsonify(result)
        
    except Exception as e:
        print(f"❌ [ROUTE] 批量选股异常: {str(e)}")
        print(f"❌ [ROUTE] 异常类型: {e.__class__.__name__}")
        print(f"❌ [ROUTE] 异常堆栈: {e}")
        return jsonify({
            'success': False,
            'message': f'批量选股失败: {str(e)}',
            'data': {
                'selected_stocks': [],
                'report': {}
            }
        }), 500

@stocks_bp.route('/markets', methods=['GET'])
def get_markets():
    """
    获取板块信息
    GET /api/stocks/markets
    """
    try:
        api = get_api()
        result = api.get_market_info()
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'获取板块信息失败: {str(e)}',
            'data': {}
        }), 500

@stocks_bp.route('/strategies', methods=['GET'])
def get_strategies():
    """
    获取选股策略说明
    GET /api/stocks/strategies
    """
    try:
        api = get_api()
        result = api.get_selection_strategies()
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'获取策略说明失败: {str(e)}',
            'data': {}
        }), 500

@stocks_bp.route('/health', methods=['GET'])
def health_check():
    """
    健康检查
    GET /api/stocks/health
    """
    return jsonify({
        'success': True,
        'message': '股票API服务正常',
        'timestamp': str(datetime.now())
    })

# 错误处理
@stocks_bp.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'message': '接口不存在',
        'data': {}
    }), 404

@stocks_bp.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'message': '服务器内部错误',
        'data': {}
    }), 500
