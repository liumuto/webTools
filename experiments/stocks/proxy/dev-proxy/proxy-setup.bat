@echo off
setlocal
chcp 65001 >nul

set "PROXY_HOST=127.0.0.1"
set "PROXY_PORT=7897"
set "PROXY_URL=http://%PROXY_HOST%:%PROXY_PORT%"

if /I "%~1"=="" goto :help
if /I "%~1"=="set" goto :set_proxy
if /I "%~1"=="unset" goto :unset_proxy
if /I "%~1"=="status" goto :status_proxy
goto :help

:set_proxy
if not "%~2"=="" set "PROXY_HOST=%~2"
if not "%~3"=="" set "PROXY_PORT=%~3"
set "PROXY_URL=http://%PROXY_HOST%:%PROXY_PORT%"

echo [1/4] 设置 Git 代理...
git config --global http.proxy %PROXY_URL%
git config --global https.proxy %PROXY_URL%

echo [2/4] 设置 npm 代理...
npm config set proxy %PROXY_URL%
npm config set https-proxy %PROXY_URL%

echo [3/4] 设置当前终端环境变量...
set HTTP_PROXY=%PROXY_URL%
set HTTPS_PROXY=%PROXY_URL%
set ALL_PROXY=%PROXY_URL%

echo [4/4] 当前代理已启用: %PROXY_URL%
goto :status_proxy

:unset_proxy
echo [1/3] 清理 Git 代理...
git config --global --unset http.proxy 2>nul
git config --global --unset https.proxy 2>nul

echo [2/3] 清理 npm 代理...
npm config delete proxy
npm config delete https-proxy

echo [3/3] 清理当前终端环境变量...
set HTTP_PROXY=
set HTTPS_PROXY=
set ALL_PROXY=

echo 代理已清理。
goto :status_proxy

:status_proxy
echo.
echo ===== Git 代理 =====
git config --global --get http.proxy
git config --global --get https.proxy
echo.
echo ===== npm 代理 =====
npm config get proxy
npm config get https-proxy
echo.
echo ===== 当前终端环境变量 =====
echo HTTP_PROXY=%HTTP_PROXY%
echo HTTPS_PROXY=%HTTPS_PROXY%
echo ALL_PROXY=%ALL_PROXY%
goto :end

:help
echo 用法:
echo   proxy-setup.bat set [host] [port]
echo   proxy-setup.bat unset
echo   proxy-setup.bat status
echo.
echo 示例:
echo   proxy-setup.bat set
echo   proxy-setup.bat set 127.0.0.1 7897
echo   proxy-setup.bat unset
echo   proxy-setup.bat status

:end
endlocal
