# 量化选股平台

基于 HTML+CSS+JavaScript 前端和 Python FastAPI 后端的量化选股系统，支持多因子模型选股和策略回测。

## 功能特性

- 🎯 **多因子选股**: 支持 PE、PB、ROE、动量、波动率等因子权重调整
- 📊 **实时回测**: 策略参数调整后立即运行回测
- 📈 **可视化展示**: 收益曲线图、绩效指标、选股结果表格
- 💾 **策略管理**: 保存和加载策略配置
- 🔍 **股票筛选**: 支持按市值、PE、ROE等条件筛选
- 📱 **响应式设计**: 支持桌面和移动端访问

## 技术栈

### 前端
- HTML5 + CSS3 + JavaScript (ES6+)
- ECharts 图表库
- 响应式设计

### 后端
- Python 3.8+
- FastAPI Web框架
- Pandas + NumPy 数据处理
- 模拟数据生成

## 快速开始

### 1. 启动后端服务

```bash
# 进入项目目录
cd src/stocks

# 启动后端服务（会自动安装依赖）
python start_backend.py
```

或者手动启动：

```bash
# 安装依赖
pip install -r backend/requirements.txt

# 启动服务
cd backend
python app.py
```

后端服务将在 `http://localhost:8000` 启动

### 2. 打开前端界面

在浏览器中打开 `index.html` 文件，或者使用本地服务器：

```bash
# 使用 Python 内置服务器
python -m http.server 8001

# 访问 http://localhost:8001
```

### 3. 使用系统

1. **配置策略参数**：
   - 选择股票池（全A股、沪深300、中证500等）
   - 调整因子权重（PE、PB、ROE、动量、波动率）
   - 设置筛选条件（最小市值、最大PE、最小ROE）

2. **运行策略**：
   - 点击"运行策略"按钮
   - 等待策略计算完成
   - 查看选股结果和绩效指标

3. **查看结果**：
   - 收益曲线图显示策略表现
   - 绩效指标展示年化收益率、夏普比率等
   - 选股结果表格列出推荐股票

4. **保存策略**：
   - 点击"保存策略"下载配置文件
   - 点击"加载策略"导入之前保存的配置

## 项目结构

```
src/stocks/
├── index.html              # 主页面
├── css/
│   └── style.css          # 样式文件
├── js/
│   └── app.js             # 前端逻辑
├── backend/
│   ├── app.py             # FastAPI 后端服务
│   └── requirements.txt   # Python 依赖
├── start_backend.py       # 后端启动脚本
└── README.md              # 说明文档
```

## API 接口

### 运行策略
- **URL**: `POST /run_strategy`
- **参数**: 策略配置 JSON
- **返回**: 选股结果、绩效指标、收益曲线

### 健康检查
- **URL**: `GET /health`
- **返回**: 服务状态

### 策略模板
- **URL**: `GET /strategy_templates`
- **返回**: 预设策略模板

## 策略因子说明

### 估值因子
- **PE (市盈率)**: 股价相对盈利的倍数，越低越好
- **PB (市净率)**: 股价相对净资产的倍数，越低越好

### 盈利因子
- **ROE (净资产收益率)**: 公司盈利能力，越高越好

### 技术因子
- **动量**: 股票价格趋势强度，越高越好
- **波动率**: 价格波动程度，越低越好

## 性能指标说明

- **年化收益率**: 策略的年化投资回报率
- **夏普比率**: 风险调整后的收益指标，越高越好
- **最大回撤**: 策略运行期间的最大亏损幅度
- **胜率**: 盈利交易占总交易的比例

## 开发说明

### 添加新因子

1. 在 `backend/app.py` 的 `calculate_factors` 方法中添加新因子计算
2. 在前端 `index.html` 中添加因子配置界面
3. 在 `app.js` 中添加因子参数处理

### 自定义数据源

修改 `backend/app.py` 中的 `load_mock_data` 方法，接入真实数据源：

```python
def load_real_data(self, stock_pool: str, time_range: str):
    # 接入 AKShare、Tushare 等数据源
    import akshare as ak
    # 实现真实数据获取逻辑
```

### 扩展回测功能

在 `QuantitativeStrategy` 类中添加更多回测指标：

```python
def calculate_advanced_metrics(self, data):
    # 计算更多绩效指标
    # 如信息比率、卡玛比率等
```

## 注意事项

1. **数据说明**: 当前版本使用模拟数据，生产环境需要接入真实数据源
2. **性能优化**: 大量股票数据时建议使用数据库缓存
3. **安全考虑**: 生产环境需要添加身份验证和权限控制
4. **浏览器兼容**: 建议使用现代浏览器（Chrome、Firefox、Safari、Edge）

## 常见问题

### Q: 后端服务启动失败？
A: 检查 Python 版本（需要 3.8+）和依赖包安装情况

### Q: 前端无法连接后端？
A: 确保后端服务正在运行，检查端口 8000 是否被占用

### Q: 策略运行很慢？
A: 当前使用模拟数据，真实数据源可能需要更长时间

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request 来改进项目！

## 联系方式

如有问题，请通过 GitHub Issues 联系。
