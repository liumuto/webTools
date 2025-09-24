# coding:utf-8
"""
量化选股系统快速启动脚本
"""

import os
import sys
import time
from pathlib import Path

def main():
    """快速启动主函数"""
    print("🚀 量化选股系统快速启动")
    print("=" * 50)
    
    # 切换到stocks目录
    os.chdir(Path(__file__).parent)
    
    try:
        # 导入并启动Flask应用
        from app import create_app
        app = create_app()
        
        print("✅ 系统启动成功！")
        print("=" * 50)
        print("🌐 后端API服务: http://localhost:5000")
        print("📱 前端界面: 打开 ui/myStock.html")
        print("=" * 50)
        print("📋 可用接口:")
        print("   GET  /api/stocks/list - 获取股票列表")
        print("   GET  /api/stocks/analyze/<code> - 分析单只股票")
        print("   POST /api/stocks/select - 批量选股")
        print("   GET  /api/stocks/strategies - 获取选股策略")
        print("   GET  /api/stocks/health - 健康检查")
        print("=" * 50)
        print("⏹️  按 Ctrl+C 停止服务")
        print("=" * 50)
        
        # 启动服务
        app.run(host='0.0.0.0', port=5000, debug=False)
        
    except KeyboardInterrupt:
        print("\n\n👋 服务已停止")
    except Exception as e:
        print(f"\n❌ 启动失败: {e}")
        print("\n请检查:")
        print("1. 是否安装了依赖包: pip install flask flask-cors pandas numpy akshare")
        print("2. 是否在正确的目录下运行")
        print("3. 端口5000是否被占用")

if __name__ == "__main__":
    main()
