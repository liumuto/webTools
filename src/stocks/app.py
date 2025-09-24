# coding:utf-8
"""
股票量化选股系统Flask应用
提供Web API服务
"""

from flask import Flask, jsonify, render_template, send_from_directory
from flask_cors import CORS
import os
import sys

# 添加当前目录到Python路径
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

from api.routes import stocks_bp

def create_app():
    """创建Flask应用"""
    app = Flask(__name__)
    
    # 配置
    app.config['JSON_AS_ASCII'] = False
    app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True
    
    # 启用CORS
    CORS(app)
    
    # 注册蓝图
    app.register_blueprint(stocks_bp)
    
    # 根路由 - 重定向到前端页面
    @app.route('/')
    def index():
        """首页 - 重定向到前端页面"""
        return send_from_directory('ui', 'myStock.html')
    
    # 前端页面路由
    @app.route('/ui/<path:filename>')
    def ui_files(filename):
        """前端静态文件"""
        return send_from_directory('ui', filename)
    
    # API信息路由
    @app.route('/api')
    def api_info():
        """API信息"""
        return jsonify({
            'message': '股票量化选股系统API',
            'version': '1.0.0',
            'endpoints': {
                'GET /api/stocks/list': '获取股票列表',
                'GET /api/stocks/analyze/<stock_code>': '分析单只股票',
                'POST /api/stocks/select': '批量选股',
                'GET /api/stocks/strategies': '获取选股策略说明',
                'GET /api/stocks/health': '健康检查'
            }
        })
    
    # 全局错误处理
    @app.errorhandler(Exception)
    def handle_exception(e):
        return jsonify({
            'success': False,
            'message': f'服务器错误: {str(e)}',
            'data': {}
        }), 500
    
    return app

if __name__ == '__main__':
    app = create_app()
    print("=" * 60)
    print("股票量化选股系统API服务启动")
    print("=" * 60)
    print("API文档:")
    print("  GET  /api/stocks/list - 获取股票列表")
    print("  GET  /api/stocks/analyze/<code> - 分析单只股票")
    print("  POST /api/stocks/select - 批量选股")
    print("  GET  /api/stocks/strategies - 获取选股策略")
    print("  GET  /api/stocks/health - 健康检查")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=5000, debug=True)
