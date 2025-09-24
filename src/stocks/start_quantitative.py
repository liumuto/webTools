# coding:utf-8
"""
量化选股系统启动脚本
"""

import os
import sys
import subprocess
import time
from pathlib import Path

def check_dependencies():
    """检查依赖包"""
    required_packages = [
        'flask',
        'flask_cors',
        'pandas',
        'numpy',
        'akshare'
    ]
    
    optional_packages = [
        'talib',
        'scipy',
        'scikit-learn',
        'matplotlib',
        'seaborn'
    ]
    
    missing_packages = []
    missing_optional = []
    
    # 检查必需依赖
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    # 检查可选依赖
    for package in optional_packages:
        try:
            __import__(package)
        except ImportError:
            missing_optional.append(package)
    
    if missing_packages:
        print("❌ 缺少以下必需依赖包:")
        for package in missing_packages:
            print(f"   - {package}")
        print("\n请运行以下命令安装依赖:")
        print(f"pip install {' '.join(missing_packages)}")
        return False
    
    if missing_optional:
        print("⚠️  缺少以下可选依赖包（不影响核心功能）:")
        for package in missing_optional:
            print(f"   - {package}")
        print("如需完整功能，可运行: pip install " + " ".join(missing_optional))
    
    print("✅ 核心依赖包已安装")
    return True

def check_data_files():
    """检查数据文件"""
    data_files = [
        'stratege/stock_code_names.csv',
        'stratege/量化选股策略.py',
        'stratege/图形识别增强.py',
        'stratege/数据获取模块.py'
    ]
    
    missing_files = []
    
    for file_path in data_files:
        full_path = Path(__file__).parent / file_path
        if not full_path.exists():
            missing_files.append(file_path)
    
    if missing_files:
        print("❌ 缺少以下文件:")
        for file_path in missing_files:
            print(f"   - {file_path}")
        return False
    
    print("✅ 所有必要文件存在")
    return True

def start_backend():
    """启动后端服务"""
    print("\n🚀 启动量化选股系统后端服务...")
    
    # 切换到stocks目录
    os.chdir(Path(__file__).parent)
    
    try:
        # 启动Flask应用
        from app import create_app
        app = create_app()
        
        print("=" * 60)
        print("📊 量化选股系统API服务")
        print("=" * 60)
        print("🌐 服务地址: http://localhost:5000")
        print("📋 API文档:")
        print("   GET  /api/stocks/list - 获取股票列表")
        print("   GET  /api/stocks/analyze/<code> - 分析单只股票")
        print("   POST /api/stocks/select - 批量选股")
        print("   GET  /api/stocks/strategies - 获取选股策略")
        print("   GET  /api/stocks/health - 健康检查")
        print("=" * 60)
        print("💡 前端界面: 打开 src/stocks/ui/myStock.html")
        print("⏹️  按 Ctrl+C 停止服务")
        print("=" * 60)
        
        app.run(host='0.0.0.0', port=5000, debug=False)
        
    except KeyboardInterrupt:
        print("\n\n👋 服务已停止")
    except Exception as e:
        print(f"\n❌ 启动失败: {e}")
        return False
    
    return True

def main():
    """主函数"""
    print("🔍 量化选股系统启动检查...")
    
    # 检查依赖
    if not check_dependencies():
        return
    
    # 检查文件
    if not check_data_files():
        return
    
    # 启动服务
    start_backend()

if __name__ == "__main__":
    main()
