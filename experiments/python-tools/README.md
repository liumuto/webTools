# 🐍 Python 工具模块 (PythonTools)

## 🔹 模块简介

Python 数据处理和网络爬虫工具集合，提供股票数据分析和新闻爬取功能。

## 🔹 功能特性

- **股票数据分析**：获取和分析股票数据
- **网络爬虫**：爬取新闻和股票信息
- **数据导出**：支持 JSON 和 CSV 格式导出
- **数据处理**：数据清洗和格式化

## 🔹 目录结构

```
pythonTools/
├── docs/                    # 文档目录
│   ├── technical.md        # 技术文档
│   └── qa.md              # 对话记录
├── data/                   # 数据目录
│   ├── input/             # 输入数据
│   ├── output/            # 输出数据
│   │   ├── scraped_news.json
│   │   ├── scraped_stocks.json
│   │   └── stock_data.json
│   └── export/            # 导出数据
│       ├── scraped_news.csv
│       ├── scraped_stocks.csv
│       └── stock_data.csv
├── css/                    # 样式目录
├── js/                     # JavaScript 逻辑目录
├── ui/                     # UI 界面目录
│   └── assets/            # 静态资源
│       └── images/        # 图片资源
├── backend/                # 后端代码
│   ├── dataAnalysis.py    # 数据分析脚本
│   ├── pythonTest.py      # 测试脚本
│   ├── webScraping.py     # 网络爬虫脚本
│   └── requirements.txt   # Python 依赖
└── README.md              # 模块说明文档
```

## 🔹 使用方法

### 环境准备
```bash
cd backend
pip install -r requirements.txt
```

### 运行脚本
```bash
# 运行数据分析
python dataAnalysis.py

# 运行网络爬虫
python webScraping.py

# 运行测试
python pythonTest.py
```

## 🔹 功能说明

### 数据分析 (dataAnalysis.py)
- 分析股票数据
- 生成统计报告
- 数据可视化

### 网络爬虫 (webScraping.py)
- 爬取股票新闻
- 获取股票数据
- 数据清洗和存储

### 测试脚本 (pythonTest.py)
- 功能测试
- 数据验证
- 性能测试

## 🔹 数据格式

### 输入数据
- 股票代码列表
- 配置参数

### 输出数据
- JSON 格式：结构化数据
- CSV 格式：表格数据

## 🔹 技术栈

- Python 3.x
- 网络爬虫库（requests, BeautifulSoup）
- 数据处理库（pandas, numpy）
- 数据可视化库（matplotlib, seaborn）

## 🔹 开发规范

- 遵循 PEP 8 编码规范
- 使用类型注解
- 完善的错误处理
- 详细的日志记录
