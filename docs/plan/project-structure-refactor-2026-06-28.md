# 项目结构重构建议（2026-06-28）

## 结论

当前项目的主线应定义为：**一个静态网页工具集 WebTools Hub**。股票探索、Python 爬虫、资产展示、聚宽策略资料都不应继续混在主应用源码边界里。

建议目标结构：

```text
webTools/
├── src/
│   └── tools/                 # 主应用：WebTools Hub
├── experiments/               # 可运行但非主线的实验项目
│   ├── stocks/                # 原 src/stocks
│   ├── python-tools/          # 原 src/pythonTools
│   └── assets-show/           # 原 src/assetsShow，可选
├── archive/                   # 大型资料归档，不参与主应用开发
│   └── stock-strategies/      # 原 others/聚宽策略
├── docs/
│   ├── architecture/
│   ├── guide/
│   ├── plan/
│   └── tech/
└── AGENTS.md
```

如果你只想维护网页工具集，最小改法是：保留 `src/tools/`，把 `src/stocks/`、`src/pythonTools/`、`src/assetsShow/`、`others/聚宽策略/` 全部移出主源码树。

## 当前功能边界

### 主应用：WebTools Hub

入口是 `src/tools/index.html` 跳转到 `src/tools/ui/index.html`。工具页按固定脚本顺序加载：第三方 CDN、`utils.js`、各工具脚本、最后 `app.js`，见 `src/tools/ui/index.html:131-150`。

工具注册机制已经存在：

- `src/tools/js/utils.js:430` 定义全局 `window.ToolRegistry`。
- `src/tools/js/app.js:6` 定义 `WebToolsApp`。
- `src/tools/js/app.js:68-73` 从 `ToolRegistry.getAllTools()` 读取工具。
- 各工具通过 `window.ToolRegistry.register` 自注册，例如：
  - `src/tools/js/tools/string-splitter.js:1072`
  - `src/tools/js/tools/time-display.js:577`
  - `src/tools/js/tools/encoder.js:865`
  - `src/tools/js/tools/color-picker.js:933`
  - `src/tools/js/tools/markdown-editor.js:1246`

这个模块应作为项目主线保留并继续简化。

### 股票系统：独立 Flask 实验项目

`src/stocks/` 不是静态网页工具，而是完整后端应用：

- `src/stocks/app.py:18` 创建 Flask app。
- `src/stocks/app.py:30` 注册股票 API 蓝图。
- `src/stocks/app.py:33-42` 服务 `ui/myStock.html` 和静态 UI 文件。
- `src/stocks/api/routes.py:13` 定义 `/api/stocks` 前缀。
- `src/stocks/api/routes.py:15-162` 提供 list/analyze/select/markets/strategies/health 等接口。
- `src/stocks/js/quantitative.js:4` 前端硬编码 `http://localhost:5000/api/stocks`。
- `src/stocks/api/quantitative_selection.py:21` 动态导入中文命名策略模块。
- `src/stocks/stratege/量化选股策略.py:36`、`:115`、`:289`、`:343` 分别定义技术指标、形态识别、评分和选股类。
- `src/stocks/stratege/数据获取模块.py:18` 定义 `DataManager`。

它应迁出 `src/` 主应用区域，作为 `experiments/stocks/` 或单独仓库。

### PythonTools：演示/爬虫实验

`src/pythonTools/` 与股票探索强相关，但不服务当前网页工具集：

- `src/pythonTools/backend/webScraping.py:8` 使用 `requests`。
- `src/pythonTools/backend/webScraping.py:66` 是 mock 股票数据抓取。
- `src/pythonTools/backend/webScraping.py:117`、`:126` 写 JSON/CSV。
- `src/pythonTools/backend/webScraping.py:154-164` 生成 `scraped_stocks` 和 `scraped_news`。

建议作为实验项目迁到 `experiments/python-tools/`，或如果没有继续使用，直接归档。

### AssetsShow：可选独立小工具

`src/assetsShow/` 是个人资产可视化面板：

- `src/assetsShow/ui/index.html:9` 依赖 SheetJS。
- `src/assetsShow/js/app.js:623-694` 处理 JSON/XLSX 导入导出。
- `src/assetsShow/js/app.js:146` 开始实现 treemap 布局。

它是可用的网页工具，但目前没有接入 `WebTools Hub` 的工具注册体系。这里有两个选择：

1. 如果它属于网页工具集，把它改造成 `src/tools/js/tools/assets-show.js` 中的一个工具，统一从 Hub 打开。
2. 如果它是私人资产看板，迁到 `experiments/assets-show/`，不要污染主工具集。

### others/聚宽策略：资料库，不是源码

`others/聚宽策略/` 包含大量 `.py`、`.ipynb`、`.zip`、`.pdf`。这类文件不参与主应用运行，也不适合放在源码树和普通 Git 历史里。

建议迁移到 `archive/stock-strategies/` 或仓库外资料目录；若必须版本化，使用 Git LFS 或单独资料仓库。

## 主要问题

### 1. `src/` 语义失真

现在 `src/` 同时包含：

- 正式网页工具：`src/tools/`
- Flask 股票系统：`src/stocks/`
- Python 爬虫/教学脚本：`src/pythonTools/`
- 资产看板：`src/assetsShow/`

这会导致“修改主应用”时必须先判断很多无关代码，增加维护成本。

### 2. 股票探索侵入了仓库根部

`others/package.json` 和 `others/proxy-server.js` 是股票代理服务：

- `others/package.json:2` 包名是 `stock-proxy-server`。
- `others/proxy-server.js:12` 静态服务 `src/stocks/ui`。
- `others/proxy-server.js:16` 代理到 `http://stock.dyqvideo.com`。
- `src/stocks/ui/tatashishiStock.html:1401-1404` 也依赖 `stock.dyqvideo.com` 和 `/api/stock_results` 等接口。

这说明 `others/` 不是普通杂项目录，而是混入了一套股票运行辅助服务。应迁到 `experiments/stocks/proxy/`，或删除。

### 3. 生成物已入库

当前有明显不应入库的生成物：

- `src/stocks/__pycache__/`
- `src/stocks/api/__pycache__/`
- `src/stocks/stratege/__pycache__/`
- `src/stocks/data/output/resultsJson.json`
- `src/stocks/data/output/stockData.json`
- `src/pythonTools/data/output/*.json`
- `src/pythonTools/data/export/*.csv`

`.gitignore` 目前只有 `docs/temp/*` 规则，见 `.gitignore:1-3`，没有排除 Python 缓存、输出数据、压缩包或本地运行产物。

### 4. 文档分散

项目约定要求文档统一放 `docs/`，但现在各模块内都有 `docs/` 和 `qa.md`：

- `src/tools/docs/`
- `src/stocks/docs/`
- `src/pythonTools/docs/`
- `src/assetsShow/docs/`

建议保留模块内 README，但 PRD、技术方案、QA 逐步迁到顶层 `docs/`，例如：

- `docs/prd/tools/`
- `docs/prd/stocks-archive/`
- `docs/tech/tools/`
- `docs/architecture/tools/`

## 删除、合并、迁移建议

### 立即可删除

这些是生成物或本地缓存，删除风险低：

- `src/stocks/**/__pycache__/`
- `src/stocks/**/*.pyc`
- `src/pythonTools/data/output/*`
- `src/pythonTools/data/export/*`
- `src/stocks/data/output/*`

删除后补 `.gitignore`：

```gitignore
__pycache__/
*.py[cod]
*.log

src/**/data/output/
src/**/data/export/
docs/temp/*
!docs/temp/README.md
```

### 建议迁移

- `src/stocks/` → `experiments/stocks/`
- `src/pythonTools/` → `experiments/python-tools/`
- `others/proxy-server.js`、`others/package.json`、`others/dev-proxy/` → `experiments/stocks/proxy/`
- `others/聚宽策略/` → `archive/stock-strategies/` 或仓库外
- `others/get-pip.py`、`others/get-pip-3.7.py` → 删除；安装 pip 不应作为项目源码保存

### 建议合并

`src/assetsShow/` 是否合并取决于产品定位：

- 若它是网页工具集的一员：改成 `src/tools` 下一个工具模块，复用 `ToolRegistry`。
- 若它只是个人资产页：迁到 `experiments/assets-show/`。

不建议继续保持 `src/assetsShow/` 与 `src/tools/` 平级，因为两者都是前端工具，但入口和架构完全不同。

### 暂不建议动

- `src/tools/ui/markdown-editor.html`：虽然和 `src/tools/js/tools/markdown-editor.js` 有重复逻辑，但从 `src/tools/docs/qa.md` 看它被设计成可单文件分发，属于有意分叉。
- `src/tools/js/app.js` 的日志和注册逻辑：可以后续清理，但不应和目录迁移混在一批做。

## 分阶段执行计划

### 第 1 阶段：冻结主线边界

目标：明确仓库主应用只等于 `src/tools/`。

步骤：

1. 新增根 README，说明主入口 `src/tools/index.html`。
2. 标注 `src/stocks/`、`src/pythonTools/`、`src/assetsShow/` 为实验/归档候选。
3. 补 `.gitignore`，阻止新的缓存和输出数据入库。

验证：

- 打开 `src/tools/index.html` 能进入 Hub。
- `git status --ignored` 能看到缓存和输出目录被忽略。

### 第 2 阶段：清理生成物

目标：删除所有缓存和输出文件，不改变源码行为。

步骤：

1. 删除 `__pycache__` 和 `.pyc`。
2. 删除 `data/output`、`data/export` 下的生成数据。
3. 保留必要的示例输入数据，若示例需要入库，统一命名为 `sample.*`。

验证：

- `git ls-files | rg "__pycache__|\\.pyc|data/output|data/export"` 无结果。

### 第 3 阶段：迁移股票系统

目标：把股票探索从主源码树隔离出来。

步骤：

1. 移动 `src/stocks/` 到 `experiments/stocks/`。
2. 移动 `others/proxy-server.js`、`others/package.json`、`others/dev-proxy/` 到 `experiments/stocks/proxy/`。
3. 修正 README 和启动命令中的路径。
4. 如仍需运行，给 `experiments/stocks/` 单独补 `requirements.txt` 或启动说明。

验证：

- `python experiments/stocks/start.py dev` 能启动或给出明确缺失依赖提示。
- `src/tools/index.html` 不受影响。

### 第 4 阶段：处理资产看板和 PythonTools

目标：消除第二、第三套“工具集”入口。

步骤：

1. 决定 `assetsShow` 是合并进 Hub 还是迁到 experiments。
2. 将 `pythonTools` 迁到 `experiments/python-tools/` 或删除。
3. 迁移模块内文档到顶层 `docs/`，模块内只留 README。

验证：

- `rg "src/pythonTools|src/assetsShow" src/tools docs` 只出现历史说明，不再作为主入口依赖。

### 第 5 阶段：精简 WebTools Hub

目标：在边界清楚后再做内部重构。

步骤：

1. 清理 `src/tools/js/app.js` 中过量调试日志。
2. 将工具元数据集中到一个小型清单，保留现有 `ToolRegistry` 机制。
3. 给每个工具建立最小 smoke test 或浏览器检查脚本。

验证：

- 所有工具卡片仍能显示。
- Markdown 编辑器、日程提醒、编码器至少完成一次手动 smoke test。

## 推荐优先级

1. 先补 `.gitignore` 并删生成物。
2. 再迁移 `src/stocks/` 和股票代理。
3. 再决定 `assetsShow` 的去留。
4. 最后整理 `src/tools/` 内部代码。

不要一上来重构 `src/tools`。当前最大收益来自边界隔离和删除污染物，而不是改主工具代码。

