#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
量化选股平台后端启动脚本
"""

import subprocess
import sys
import os

def install_requirements():
    """安装依赖包"""
    print("正在安装依赖包...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "backend/requirements.txt"])
        print("依赖包安装完成！")
    except subprocess.CalledProcessError as e:
        print(f"依赖包安装失败: {e}")
        return False
    return True

def start_server():
    """启动后端服务"""
    print("启动量化选股平台后端服务...")
    print("服务地址: http://localhost:8000")
    print("API文档: http://localhost:8000/docs")
    print("按 Ctrl+C 停止服务")
    
    try:
        os.chdir("backend")
        subprocess.run([sys.executable, "app.py"])
    except KeyboardInterrupt:
        print("\n服务已停止")
    except Exception as e:
        print(f"启动服务失败: {e}")

if __name__ == "__main__":
    if install_requirements():
        start_server()
    else:
        print("请手动安装依赖包后重试")
        print("命令: pip install -r backend/requirements.txt")
