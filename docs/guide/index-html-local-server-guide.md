# index.html 本地服务端部署指南

本文说明如何把 [src/tools/ui/index.html](../../src/tools/ui/index.html) 部署到本地 HTTP 服务中访问。

## 适用场景

- 在本机浏览器中访问 WebTools Hub。
- 在同一局域网内给其他设备访问。
- 验证 `index.html`、CSS、JavaScript 和第三方 CDN 资源是否能正常加载。

## 目录关系

当前页面依赖这些本地资源：

```text
src/tools/
  ui/index.html
  css/*.css
  js/*.js
```

`index.html` 中的本地资源路径使用了 `../css/...` 和 `../js/...`，因此本地服务端建议把 `src/tools` 作为站点根目录。`src/tools/index.html` 会自动打开 `ui/index.html`，所以浏览器直接访问根路径即可：

```text
http://localhost:8000/
```

不要直接把 `src/tools/ui` 当作站点根目录，否则浏览器可能找不到 `../css` 和 `../js` 对应的文件。

## 方式一：使用 Python 启动临时服务

适合快速预览和开发调试。

1. 打开 PowerShell，进入项目根目录：

   ```powershell
   cd E:\Project\github\webTools
   ```

2. 启动 HTTP 服务：

   ```powershell
   python -m http.server 8000 --directory src\tools
   ```

3. 在浏览器打开：

   ```text
   http://localhost:8000/
   ```

4. 停止服务：

   在 PowerShell 窗口按 `Ctrl + C`。

如果 `python` 命令不可用，可以尝试：

```powershell
py -m http.server 8000 --directory src\tools
```

## 方式二：使用 Node.js 启动静态服务

适合已经安装 Node.js 的环境。

1. 进入项目根目录：

   ```powershell
   cd E:\Project\github\webTools
   ```

2. 启动静态服务：

   ```powershell
   npx http-server src\tools -p 8000
   ```

3. 在浏览器打开：

   ```text
   http://localhost:8000/
   ```

首次运行 `npx http-server` 可能需要联网下载依赖。

## 局域网访问

如果想让同一 Wi-Fi 或局域网内的其他设备访问：

1. 查询本机局域网 IP：

   ```powershell
   ipconfig
   ```

2. 找到当前网络适配器下的 `IPv4 地址`，例如：

   ```text
   192.168.1.23
   ```

3. 在其他设备浏览器打开：

   ```text
   http://192.168.1.23:8000/
   ```

如果无法访问，检查 Windows 防火墙是否允许 Python、Node.js 或对应端口 `8000` 入站访问。

## 固定部署到本机 Nginx

适合长期本地运行。

示例配置：

```nginx
server {
    listen 8000;
    server_name localhost;

    root E:/Project/github/webTools/src/tools;
    index ui/index.html;

    location / {
        try_files $uri $uri/ /ui/index.html;
    }
}
```

配置完成后访问：

```text
http://localhost:8000/
```

修改 Nginx 配置后需要重新加载配置。

## 第三方 CDN 依赖

`index.html` 还会从 CDN 加载以下第三方库：

- `highlight.js`
- `html2canvas`
- `jspdf`
- `marked`
- `dompurify`
- `mermaid`

如果部署环境不能访问外网，页面中的部分功能可能不可用。离线部署时，需要把这些库下载到本地目录，并把 `index.html` 中对应的 CDN 地址替换为本地路径。

## 常见问题

### 页面样式丢失

确认服务端根目录是 `src/tools`，访问地址是：

```text
http://localhost:8000/
```

如果服务根目录是 `src/tools/ui`，CSS 和 JS 资源可能加载失败。

### 页面功能按钮无响应

打开浏览器开发者工具，检查 `Console` 和 `Network`：

- 是否有 `.js` 文件加载失败。
- 是否有 CDN 文件加载失败。
- 是否有浏览器安全策略或网络错误。

### 端口 8000 被占用

换一个端口启动，例如：

```powershell
python -m http.server 8080 --directory src\tools
```

然后访问：

```text
http://localhost:8080/
```

## 推荐命令

日常本地预览优先使用：

```powershell
cd E:\Project\github\webTools
python -m http.server 8000 --directory src\tools
```

访问：

```text
http://localhost:8000/
```
