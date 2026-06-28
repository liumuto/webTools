# 1、要关闭通过 `python -m http.server 8080` 启动的HTTP服务器，有几种方法：

## 方法1：使用快捷键（推荐）
在运行服务器的终端窗口中按：
```
Ctrl + C
```

## 方法2：如果快捷键无效
在终端窗口中按：
```
Ctrl + Break
```

## 方法3：查找并终止进程
如果上述方法无效，可以：

1. **查找进程ID**：
```bash
netstat -ano | findstr :8080
```

2. **终止进程**（Windows）：
```bash
taskkill /PID <进程ID> /F
```

或者：
```bash
taskkill /IM python.exe /F
```

## 方法4：关闭终端窗口
直接关闭运行服务器的终端窗口也会停止服务。

**注意**：`Ctrl + C` 是最常用和最安全的方法，它会优雅地关闭服务器并释放端口。