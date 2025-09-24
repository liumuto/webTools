#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
量化选股系统生产级启动脚本
使用Gunicorn WSGI服务器
"""

import os
import sys
import subprocess
from pathlib import Path

def main():
    """生产级启动函数"""
    print("🚀 启动量化选股系统生产级服务...")
    
    # 确保在正确的目录
    current_dir = Path(__file__).parent
    os.chdir(current_dir)
    
    # 检查依赖
    try:
        import gunicorn
        print("✅ Gunicorn已安装")
    except ImportError:
        print("❌ 请先安装Gunicorn: pip install gunicorn")
        return
    
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
    except Exception as e:
        print(f"❌ 未知错误: {e}")

if __name__ == "__main__":
    main()
