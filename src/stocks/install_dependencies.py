# coding:utf-8
"""
依赖安装脚本
自动安装量化选股系统所需的所有依赖包
"""

import subprocess
import sys
import os

def install_package(package):
    """安装单个包"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        print(f"✅ {package} 安装成功")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {package} 安装失败: {e}")
        return False

def main():
    """主函数"""
    print("🔧 开始安装量化选股系统依赖包...")
    print("=" * 50)
    
    # 基础依赖包
    basic_packages = [
        "pandas>=1.5.0",
        "numpy>=1.24.0", 
        "akshare>=1.12.0",
        "scipy>=1.10.0",
        "scikit-learn>=1.2.0",
        "matplotlib>=3.6.0",
        "seaborn>=0.12.0"
    ]
    
    # Web框架依赖
    web_packages = [
        "flask>=2.0.0",
        "flask-cors>=3.0.0"
    ]
    
    # 安装基础包
    print("📦 安装基础依赖包...")
    success_count = 0
    for package in basic_packages:
        if install_package(package):
            success_count += 1
    
    print(f"\n基础包安装完成: {success_count}/{len(basic_packages)}")
    
    # 安装Web框架
    print("\n🌐 安装Web框架...")
    web_success = 0
    for package in web_packages:
        if install_package(package):
            web_success += 1
    
    print(f"Web框架安装完成: {web_success}/{len(web_packages)}")
    
    # 测试导入
    print("\n🧪 测试包导入...")
    test_imports = [
        ("pandas", "数据处理"),
        ("numpy", "数值计算"),
        ("akshare", "数据源"),
        ("flask", "Web框架"),
        ("flask_cors", "跨域支持")
    ]
    
    import_success = 0
    for module, desc in test_imports:
        try:
            __import__(module)
            print(f"✅ {desc} ({module}) 导入成功")
            import_success += 1
        except ImportError as e:
            print(f"❌ {desc} ({module}) 导入失败: {e}")
    
    print(f"\n导入测试完成: {import_success}/{len(test_imports)}")
    
    # 总结
    print("\n" + "=" * 50)
    if import_success == len(test_imports):
        print("🎉 所有依赖包安装成功！")
        print("现在可以运行量化选股系统了：")
        print("python start_quantitative.py")
    else:
        print("⚠️  部分依赖包安装失败，请手动安装")
        print("可以尝试运行：pip install -r stratege/requirements_simple.txt")

if __name__ == "__main__":
    main()
