# 股票选股系统 - CORS问题解决方案

## 问题描述
由于浏览器的CORS（跨域资源共享）限制，直接访问外部API会遇到跨域问题。本系统提供了多种解决方案。

## 解决方案

### 方案1：使用本地数据文件（推荐，立即可用）

系统会自动尝试加载本地数据文件 `src/stocks/data/resultsJson.json`，如果加载成功则直接使用，失败则尝试API。

**优点：**
- 立即可用，无需额外配置
- 数据加载速度快
- 不依赖网络连接

**缺点：**
- 数据可能不是最新的
- 需要手动更新数据文件

### 方案2：使用代理服务器（推荐，支持实时数据）

#### 安装依赖
```bash
npm install
```

#### 启动代理服务器
```bash
npm start
```

#### 访问页面
打开浏览器访问：http://localhost:3000/stock.html

**优点：**
- 支持实时数据
- 完全绕过CORS限制
- 支持所有API功能

**缺点：**
- 需要安装Node.js
- 需要启动代理服务器

### 方案3：修改服务器端支持JSONP

如果服务器支持修改，可以添加JSONP支持：

```python
# Flask示例
@app.route('/api/stock_results')
def stock_results():
    data = get_stock_data()
    callback = request.args.get('callback')
    
    if callback:
        # 返回JSONP格式
        return f"{callback}({json.dumps(data)})"
    else:
        # 返回普通JSON格式
        return jsonify(data)
```

```php
// PHP示例
<?php
header('Content-Type: application/javascript');
$data = get_stock_data();
$callback = $_GET['callback'] ?? '';

if ($callback) {
    echo $callback . '(' . json_encode($data) . ')';
} else {
    echo json_encode($data);
}
?>
```

## 使用说明

### 直接使用（方案1）
1. 直接打开 `src/stocks/ui/stock.html` 文件
2. 系统会自动加载本地数据

### 使用代理服务器（方案2）
1. 确保已安装Node.js
2. 在项目根目录运行 `npm install`
3. 运行 `npm start`
4. 访问 http://localhost:3000/stock.html

### 更新数据
如果需要更新本地数据，可以：
1. 从API获取最新数据
2. 替换 `src/stocks/data/resultsJson.json` 文件
3. 刷新页面

## 技术说明

### CORS问题
CORS是浏览器的安全机制，阻止网页从不同域请求资源。本系统通过以下方式解决：

1. **本地数据文件**：完全避免跨域请求
2. **代理服务器**：将跨域请求转换为同域请求
3. **JSONP**：使用动态脚本标签绕过CORS限制

### 自动降级
系统采用自动降级策略：
1. 首先尝试加载本地数据
2. 如果失败，尝试通过代理服务器加载API数据
3. 如果代理服务器不可用，尝试JSONP方式
4. 如果所有方式都失败，显示错误信息

## 故障排除

### 常见问题

1. **JSONP请求失败**
   - 原因：服务器不支持JSONP格式
   - 解决：使用代理服务器或本地数据文件

2. **代理服务器无法启动**
   - 检查Node.js是否正确安装
   - 检查端口3000是否被占用
   - 运行 `npm install` 安装依赖

3. **数据不更新**
   - 检查本地数据文件是否为最新
   - 检查API服务器是否正常
   - 检查网络连接

### 调试方法

1. 打开浏览器开发者工具
2. 查看Console标签页的错误信息
3. 查看Network标签页的请求状态
4. 根据错误信息选择相应的解决方案

## 文件结构

```
项目根目录/
├── src/stocks/
│   ├── ui/
│   │   └── stock.html          # 主页面
│   └── data/
│       └── resultsJson.json    # 本地数据文件
├── proxy-server.js             # 代理服务器
├── package.json                # 依赖配置
└── README.md                   # 说明文档
```

## 联系支持

如果遇到问题，请：
1. 查看浏览器控制台错误信息
2. 检查网络连接
3. 尝试不同的解决方案
4. 联系技术支持