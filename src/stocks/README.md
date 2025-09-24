# 量化选股系统

一个基于Python的量化选股系统，提供股票分析、选股策略和Web API服务；基于技术指标和图形识别的智能选股系统，提供专业的股票分析和投资建议。

## 🌟 功能特色

### 核心选股策略
- **N型上涨趋势识别** - 识别股票价格走势中的N型上涨模式
- **趋势向上判断** - MA5 > MA20 > MA60 的多重趋势确认
- **KDJ超卖信号** - J值小于13的超卖机会识别
- **缩量回调识别** - 成交量萎缩的回调机会
- **顶部无量判断** - 假阴真阳、大绿帽等特殊K线形态
- **知行趋势线判断** - 白线金叉+K线带量上黄线+不跌破黄线
- **异常涨停识别** - 排除异常涨停，识别正常机会
- **完美图形评分** - 综合评分系统量化图形质量

### 高级图形识别
- **杯柄形态** - 经典的突破形态识别
- **双底形态** - 底部反转信号识别
- **三角形整理** - 整理形态的突破机会
- **头肩底形态** - 反转形态的确认
- **突破形态** - 价格突破的确认信号
- **金叉形态** - 均线金叉的买入信号

## 🚀 快速开始

### 1. 安装依赖
```bash
pip install flask flask-cors pandas numpy akshare
```

### 2. 启动系统
```bash
# 开发模式
python start.py

# 生产模式
python start.py prod
```

### 3. 访问系统
- 后端API: http://localhost:5000
- 前端界面: 打开 `ui/myStock.html`

## 📋 功能特性

### 核心功能
- ✅ 股票数据获取（基于AKShare）
- ✅ 量化选股策略
- ✅ 技术指标分析
- ✅ 批量股票分析
- ✅ Web API服务
- ✅ 前端界面

### 选股策略
- 移动平均线策略
- RSI相对强弱指标
- MACD指标
- 布林带策略
- 成交量分析
- 综合评分系统

### API接口
- `GET /api/stocks/list` - 获取股票列表
- `GET /api/stocks/analyze/<code>` - 分析单只股票
- `POST /api/stocks/select` - 批量选股
- `GET /api/stocks/strategies` - 获取选股策略
- `GET /api/stocks/health` - 健康检查

## 📁 项目结构

```
src/stocks/
├── api/                    # API模块
│   ├── quantitative_selection.py  # 量化选股API
│   └── routes.py          # 路由定义
├── stratege/              # 策略模块
│   ├── 量化选股策略.py     # 核心选股策略
│   ├── 数据获取模块.py     # 数据获取模块
│   └── stock_code_names.csv # 股票代码列表
├── ui/                    # 前端界面
│   ├── myStock.html       # 主界面
│   └── tatashishiStock.html # 实时行情
├── css/                   # 样式文件
├── js/                    # JavaScript文件
├── data/                  # 数据目录
│   ├── input/            # 输入数据
│   ├── output/           # 输出结果
│   └── export/           # 导出文件
├── docs/                  # 文档
├── start.py              # 统一启动脚本
├── app.py                # Flask应用
└── README.md             # 说明文档
```

## 🔧 配置说明

### 环境要求
- Python 3.7+
- 网络连接（用于获取股票数据）

### 依赖包
- **必需**: flask, flask-cors, pandas, numpy, akshare
- **可选**: talib, scipy, scikit-learn, matplotlib, seaborn

### 配置参数
- `max_stocks`: 最大分析股票数量（None表示分析所有）
- `request_interval`: 请求间隔（秒）
- `min_score`: 最低评分阈值

## 📊 使用示例

### Python API使用
```python
from api.quantitative_selection import QuantitativeSelectionAPI

# 创建API实例
api = QuantitativeSelectionAPI()

# 分析单只股票
result = api.analyze_stock('000001', '20240101', '20241201')

# 批量选股
result = api.batch_select_stocks(
    stock_codes=['000001', '000002', '600000'],
    min_score=0.5
)

# 分析所有A股股票
result = api.analyze_all_a_stocks(
    start_date='20240101',
    end_date='20241201',
    min_score=0.5,
    max_stocks=100  # 限制分析数量
)
```

### HTTP API使用
```bash
# 获取股票列表
curl http://localhost:5000/api/stocks/list

# 分析单只股票
curl http://localhost:5000/api/stocks/analyze/000001

# 批量选股
curl -X POST http://localhost:5000/api/stocks/select \
  -H "Content-Type: application/json" \
  -d '{"stock_codes":["000001","000002"],"min_score":0.5}'
```

## 🛠️ 开发说明

### 启动开发环境
```bash
python start.py dev
```

### 启动生产环境
```bash
python start.py prod
```

### 更新股票列表
```bash
python update_stock_list.py
```

## 📈 性能优化

### 数据获取优化
- 添加重试机制（最多3次）
- 请求间隔控制（避免频率限制）
- 错误处理和日志记录

### 内存优化
- 分批处理大量股票
- 及时释放不需要的数据
- 使用生成器处理大数据集

## 🔍 故障排除

### 常见问题
1. **数据获取失败**: 检查网络连接和AKShare服务状态
2. **依赖包缺失**: 运行 `pip install -r requirements.txt`
3. **端口占用**: 修改端口号或停止占用进程
4. **内存不足**: 减少 `max_stocks` 参数值

### 日志查看
- 开发模式: 控制台输出
- 生产模式: Gunicorn日志

## 📝 更新日志

### v2.0.0 (2024-12-01)
- ✅ 修复数据获取问题
- ✅ 支持分析所有A股股票
- ✅ 优化API接口
- ✅ 改进错误处理
- ✅ 统一启动脚本

### v1.0.0 (2024-11-01)
- ✅ 基础量化选股功能
- ✅ Web API服务
- ✅ 前端界面

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证。

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 Issue
- 发送邮件
- 微信群交流

---

**注意**: 本系统仅供学习和研究使用，不构成投资建议。投资有风险，入市需谨慎。