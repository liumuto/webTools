# 📈 股票分析模块 (Stocks)

## 🔹 模块简介

量化选股平台，基于多因子模型的智能选股系统，提供股票筛选、分析和投资建议功能。

## 🔹 功能特性

- **量化选股**：基于多因子模型的股票筛选
- **数据可视化**：股票走势图表和数据分析
- **投资组合管理**：持仓管理和风险评估
- **策略回测**：历史数据验证投资策略
- **实时数据**：获取最新股票行情数据

## 🔹 目录结构

```
stocks/
├── docs/                    # 文档目录
│   ├── prd.md              # 产品需求文档
│   ├── technical.md        # 技术文档
│   └── qa.md              # 对话记录
├── data/                   # 数据目录
│   ├── input/             # 输入数据
│   ├── output/            # 输出数据
│   │   ├── resultsJson.json
│   │   └── stockData.json
│   └── export/            # 导出数据
├── css/                    # 样式目录
│   └── main.css           # 主样式文件
├── js/                     # JavaScript 逻辑目录
│   └── app.js             # 主应用逻辑
├── ui/                     # UI 界面目录
│   ├── index.html         # 主页面（量化选股）
│   ├── selectMyStock.html # 选股页面
│   └── assets/            # 静态资源
│       └── images/        # 图片资源
│           └── pay/       # 支付相关图片
├── backend/                # 后端代码
│   ├── app.py             # Flask 后端
│   └── requirements.txt   # Python 依赖
├── stratege/              # 策略目录
└── README.md              # 模块说明文档
```

## 🔹 使用方法

### 前端使用
1. 打开 `ui/index.html` - 量化选股平台
2. 打开 `ui/selectMyStock.html` - 踏踏实实选股系统
3. 配置选股参数和筛选条件
4. 查看分析结果和投资建议

### 后端启动
```bash
cd backend
pip install -r requirements.txt
python app.py
```

## 🔹 功能说明

### 量化选股平台
- 多因子模型分析
- 股票筛选和排序
- 风险评估和回测
- 数据可视化展示

### 踏踏实实选股系统
- 用户友好的选股界面
- 实时数据更新
- 投资建议生成
- 支付功能集成

## 🔹 数据格式

### 输入数据
- 股票代码列表
- 筛选参数配置
- 用户偏好设置

### 输出数据
- 选股结果列表
- 分析报告
- 投资建议
- 风险评估

## 🔹 技术栈

### 前端
- 原生 HTML5 + CSS3 + JavaScript
- ECharts 数据可视化
- Bootstrap UI 框架
- Font Awesome 图标

### 后端
- Python Flask
- 数据分析和处理库
- 股票数据接口

## 🔹 开发规范

- 遵循项目的编码规范
- 使用语义化 HTML 标签
- CSS 采用 BEM 命名规范
- JavaScript 使用严格模式
- Python 遵循 PEP 8 规范
