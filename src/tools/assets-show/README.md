# 📊 资产展示模块 (AssetsShow)

## 🔹 模块简介

个人资产分布管理可视化面板，支持资产数据的导入、导出、编辑和可视化展示。

## 🔹 功能特性

- **数据导入**：支持 Excel (.xlsx/.xls) 和 JSON 格式导入
- **数据导出**：支持导出为 JSON、CSV、Excel 格式
- **数据编辑**：支持新增、编辑、删除资产记录
- **数据筛选**：按类型、金额范围、关键字筛选
- **可视化展示**：Treemap 图表展示资产分布
- **模板下载**：提供标准 Excel 模板

## 🔹 目录结构

```
assetsShow/
├── docs/                    # 文档目录
│   ├── prd.md              # 产品需求文档
│   └── qa.md              # 对话记录
├── data/                   # 数据目录
│   ├── input/             # 输入数据
│   │   └── data.json      # 示例数据
│   ├── output/            # 输出数据
│   └── export/            # 导出数据
├── css/                    # 样式目录
│   └── main.css           # 主样式文件
├── js/                     # JavaScript 逻辑目录
│   └── app.js             # 主应用逻辑
├── ui/                     # UI 界面目录
│   ├── index.html         # 主页面
│   └── assets/            # 静态资源
│       └── images/        # 图片资源
└── README.md              # 模块说明文档
```

## 🔹 使用方法

1. 打开 `ui/index.html` 文件
2. 导入资产数据（Excel 或 JSON 格式）
3. 使用筛选功能查看特定资产
4. 通过 Treemap 图表可视化资产分布
5. 导出处理后的数据

## 🔹 数据格式

### Excel 格式
- 支持列名：name/名称、type/类型、value/金额、currency/币种、remark/备注
- 必填字段：name（名称）、value（金额）

### JSON 格式
```json
[
  {
    "name": "招商中证白酒ETF",
    "type": "场外基金",
    "value": 20000,
    "currency": "CNY",
    "remark": "长期持有"
  }
]
```

## 🔹 技术栈

- 原生 HTML5 + CSS3 + JavaScript
- SheetJS (xlsx) 用于 Excel 文件处理
- 自定义 Treemap 可视化组件
- 响应式设计

## 🔹 开发规范

- 遵循项目的编码规范
- 使用语义化 HTML 标签
- CSS 采用 BEM 命名规范
- JavaScript 使用严格模式
