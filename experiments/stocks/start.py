# coding:utf-8
"""
量化选股系统统一启动脚本
支持开发模式和生产模式
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
        'stratege/数据获取模块.py',
        'api/quantitative_selection.py'
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

def start_development():
    """启动开发模式"""
    print("\n🚀 启动量化选股系统（开发模式）...")
    
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
        print("💡 前端界面: 打开 ui/myStock.html")
        print("⏹️  按 Ctrl+C 停止服务")
        print("=" * 60)
        
        app.run(host='0.0.0.0', port=5000, debug=True)
        
    except KeyboardInterrupt:
        print("\n\n👋 服务已停止")
    except Exception as e:
        print(f"\n❌ 启动失败: {e}")
        return False
    
    return True

def start_production():
    """启动生产模式"""
    print("\n🚀 启动量化选股系统（生产模式）...")
    
    # 检查Gunicorn
    try:
        import gunicorn
        print("✅ Gunicorn已安装")
    except ImportError:
        print("❌ 请先安装Gunicorn: pip install gunicorn")
        return False
    
    # 切换到stocks目录
    os.chdir(Path(__file__).parent)
    
    # 启动Gunicorn服务器
    cmd = [
        "gunicorn",
        "--bind", "0.0.0.0:5000",
        "--workers", "4",
        "--timeout", "120",
        "--keep-alive", "2",
        "--max-requests", "1000",
        "--max-requests-jitter", "100",
        "--preload",
        "--access-logfile", "-",
        "--error-logfile", "-",
        "app:app"
    ]
    
    print("📊 启动参数:")
    print(f"   地址: http://0.0.0.0:5000")
    print(f"   工作进程: 4")
    print(f"   超时时间: 120秒")
    print("=" * 50)
    
    try:
        subprocess.run(cmd, check=True)
    except KeyboardInterrupt:
        print("\n⏹️ 服务已停止")
    except subprocess.CalledProcessError as e:
        print(f"❌ 启动失败: {e}")
        return False
    except Exception as e:
        print(f"❌ 未知错误: {e}")
        return False
    
    return True

def show_help():
    """显示帮助信息"""
    print("🔍 量化选股系统启动脚本")
    print("=" * 50)
    print("用法:")
    print("  python start.py [模式]")
    print("")
    print("模式:")
    print("  dev, development  - 开发模式（默认）")
    print("  prod, production  - 生产模式")
    print("  help, -h, --help  - 显示帮助")
    print("")
    print("示例:")
    print("  python start.py           # 开发模式")
    print("  python start.py dev       # 开发模式")
    print("  python start.py prod      # 生产模式")
    print("=" * 50)

def main():
    """主函数"""
    # 获取命令行参数
    mode = sys.argv[1] if len(sys.argv) > 1 else 'dev'
    
    # 显示帮助
    if mode in ['help', '-h', '--help']:
        show_help()
        return
    
    print("🔍 量化选股系统启动检查...")
    
    # 检查依赖
    if not check_dependencies():
        return
    
    # 检查文件
    if not check_data_files():
        return
    
    # 根据模式启动服务
    if mode in ['dev', 'development']:
        start_development()
    elif mode in ['prod', 'production']:
        start_production()
    else:
        print(f"❌ 未知模式: {mode}")
        print("使用 'python start.py help' 查看帮助")
        return

if __name__ == "__main__":
    main()
