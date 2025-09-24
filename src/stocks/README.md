# 📊 量化选股系统

基于技术指标和图形识别的智能选股系统，提供专业的股票分析和投资建议。

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

### 环境要求
- Python 3.8+
- 依赖包：见 `stratege/requirements.txt`

### 安装依赖
```bash
cd src/stocks
pip install -r stratege/requirements.txt
```

### 启动系统
```bash
python start_quantitative.py
```

### 访问界面
- 后端API：http://localhost:5000
- 前端界面：打开 `ui/myStock.html`

## 📁 项目结构

```
src/stocks/
├── api/                    # API接口
│   ├── quantitative_selection.py  # 量化选股API
│   └── routes.py                 # 路由定义
├── stratege/              # 策略模块
│   ├── 量化选股策略.py      # 核心选股策略
│   ├── 图形识别增强.py      # 高级图形识别
│   ├── 数据获取模块.py      # 数据管理
│   ├── stock_code_names.csv      # 股票代码列表
│   └── requirements.txt          # 依赖包
├── ui/                    # 前端界面
│   ├── myStock.html       # 主界面
│   └── assets/            # 静态资源
├── css/                   # 样式文件
│   └── main.css          # 主样式
├── js/                    # JavaScript
│   └── quantitative.js   # 量化选股逻辑
├── docs/                  # 文档
│   ├── prd.md            # 产品需求文档
│   └── qa.md             # QA记录
├── app.py                # Flask应用
└── start_quantitative.py # 启动脚本
```

## 🔧 API接口

### 获取股票列表
```http
GET /api/stocks/list?market=A股
```

### 分析单只股票
```http
GET /api/stocks/analyze/000001?start_date=20240101&end_date=20241201
```

### 批量选股
```http
POST /api/stocks/select
Content-Type: application/json

{
    "stock_codes": ["000001", "000002", "000003"],
    "start_date": "20240101",
    "end_date": "20241201",
    "min_score": 0.5
}
```

### 获取选股策略
```http
GET /api/stocks/strategies
```

### 健康检查
```http
GET /api/stocks/health
```

## 📊 使用说明

### 1. 配置选股策略
- 选择基础策略（N型趋势、KDJ信号等）
- 选择高级策略（杯柄形态、双底形态等）
- 设置最低评分阈值

### 2. 运行选股
- 点击"运行策略"按钮
- 系统自动分析股票池
- 显示符合条件的股票

### 3. 查看结果
- 股票列表按评分排序
- 显示技术指标和图形信号
- 支持详细分析查看

### 4. 导出数据
- 支持CSV格式导出
- 包含完整的分析结果

## 🎯 选股逻辑

### 基础条件（必须全部满足）
1. **N型上涨趋势** - 价格走势呈现N型上涨
2. **趋势向上** - 短期均线在长期均线之上
3. **KDJ超卖** - J值小于13，处于超卖状态
4. **缩量回调** - 成交量明显萎缩
5. **顶部无量** - 假阴真阳或大绿帽形态
6. **知行趋势线** - 均线金叉且带量突破
7. **无异常涨停** - 排除异常涨停股票
8. **图形评分** - 综合评分大于0.5

### 高级图形（加分项）
- 杯柄形态、双底形态、三角形整理
- 头肩底形态、突破形态、金叉形态

## 📈 评分系统

### 基础评分（60%权重）
- N型上涨趋势：25%
- 缩量回调：15%
- 假阴真阳：15%
- 知行趋势线：20%
- KDJ信号：15%
- 趋势向上：10%

### 高级评分（40%权重）
- 杯柄形态：20%
- 双底形态：18%
- 三角形整理：15%
- 头肩底形态：17%
- 突破形态：15%
- 金叉形态：15%

## 🔍 技术指标

### 趋势指标
- MA5、MA20、MA60 - 移动平均线
- MACD - 指数平滑移动平均线
- 布林带 - 价格通道指标

### 震荡指标
- KDJ - 随机指标
- RSI - 相对强弱指标

### 成交量指标
- 成交量移动平均线
- 量价关系分析

## ⚠️ 风险提示

1. **投资有风险** - 本系统仅供学习研究使用
2. **历史表现不代表未来** - 过去的表现不能保证未来的结果
3. **需要结合基本面** - 技术分析应结合基本面分析
4. **风险控制重要** - 建议设置止损和仓位控制

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进系统：

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 📄 许可证

本项目采用MIT许可证，详见LICENSE文件。

## 📞 联系方式

- 项目地址：https://github.com/your-repo/quantitative-stock-selection
- 问题反馈：https://github.com/your-repo/quantitative-stock-selection/issues

## 🙏 致谢

感谢以下开源项目的支持：
- [AKShare](https://github.com/akfamily/akshare) - 数据源
- [Flask](https://flask.palletsprojects.com/) - Web框架
- [Pandas](https://pandas.pydata.org/) - 数据处理
- [NumPy](https://numpy.org/) - 数值计算
- [TA-Lib](https://ta-lib.org/) - 技术分析库