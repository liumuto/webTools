@echo off
chcp 65001
echo 🚀 量化选股系统启动中...
echo.

cd /d "%~dp0"

echo 检查Python环境...
python --version
if errorlevel 1 (
    echo ❌ Python未安装或未添加到PATH
    pause
    exit /b 1
)

echo.
echo 启动后端服务...
python start.py

pause
