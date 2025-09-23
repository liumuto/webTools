# WebTools Hub - H5工具集平台

一个基于原生HTML、CSS、JavaScript开发的实用工具集合平台，提供多种常用工具功能。

## 🚀 功能特性

### 📝 文本处理工具
- **字符串分割器**: 将字符串按分隔符分割为网格数据，支持自定义分隔符和CSV导出

### ⏰ 时间工具
- **网络时间显示**: 显示当前网络时间，支持时区转换、时间戳转换和倒计时功能

### 🔧 编码转换工具
- **编码转换器**: 支持Base64编解码、URL编解码、JSON格式化和二维码生成

### 🎨 颜色工具
- **颜色选择器**: 支持HEX、RGB、HSL格式转换，提供配色方案和渐变生成器

## 🛠️ 技术栈

- **前端**: 原生HTML5 + CSS3 + JavaScript (ES6+)
- **样式**: BEM命名规范，响应式设计
- **架构**: 模块化组件设计，工具注册机制
- **兼容性**: 支持现代浏览器 (Chrome, Firefox, Edge, Safari)

## 📁 项目结构

```
src/tools/
├── tools.html              # 主页面
├── css/                    # 样式文件
│   ├── common.css          # 通用样式
│   ├── layout.css          # 布局样式
│   └── components.css      # 组件样式
├── js/                     # JavaScript文件
│   ├── utils.js            # 工具函数
│   ├── app.js              # 主应用逻辑
│   ├── components/         # 组件
│   │   ├── tool-card.js    # 工具卡片组件
│   │   └── search-bar.js   # 搜索栏组件
│   └── tools/              # 工具实现
│       ├── string-splitter.js
│       ├── time-display.js
│       ├── encoder.js
│       └── color-picker.js
└── README.md               # 项目说明
```

## 🚀 快速开始

### 1. 本地运行

```bash
# 进入项目目录
cd src/tools

# 启动本地服务器
python -m http.server 8000
# 或者使用Node.js
npx serve .
# 或者使用PHP
php -S localhost:8000
```

### 2. 访问应用

打开浏览器访问: `http://localhost:8000/tools.html`

## 💡 使用说明

### 主界面功能

1. **工具分类**: 点击顶部导航栏切换不同类别的工具
2. **搜索功能**: 在搜索框中输入关键词快速查找工具
3. **收藏功能**: 点击收藏按钮查看收藏的工具
4. **工具使用**: 点击工具卡片打开详细功能页面

### 工具详细功能

#### 字符串分割器
- 输入要分割的文本内容
- 选择或自定义分隔符
- 实时预览分割结果
- 导出CSV格式文件

#### 网络时间显示
- 查看当前时间和日期
- 支持多时区显示
- 时间戳转换功能
- 倒计时器功能

#### 编码转换器
- Base64编解码
- URL编解码
- JSON格式化
- 二维码生成

#### 颜色选择器
- 可视化颜色选择
- 多种颜色格式转换
- 配色方案生成
- 渐变生成器

## 🎨 设计规范

### CSS命名规范
- 采用BEM (Block Element Modifier) 命名规范
- 统一使用class选择器，避免使用id选择器
- 样式文件按功能模块分离

### JavaScript规范
- 使用ES6+语法特性
- 采用模块化设计
- 统一使用const/let，避免使用var
- 所有函数开启严格模式

### 响应式设计
- 支持桌面端和移动端
- 使用CSS Grid和Flexbox布局
- 断点设置: 768px, 480px

## 🔧 开发指南

### 添加新工具

1. 在`js/tools/`目录下创建新的工具文件
2. 实现工具类，包含`render()`和`init()`方法
3. 在`app.js`中的`registerTools()`方法中注册工具
4. 添加对应的CSS样式

### 工具类模板

```javascript
'use strict';

class YourTool {
  constructor() {
    // 初始化属性
  }

  render() {
    // 返回HTML字符串
    return `<div class="your-tool">...</div>`;
  }

  init() {
    // 初始化事件监听
  }
}

// 注册工具
if (typeof window !== 'undefined' && window.ToolRegistry) {
  window.ToolRegistry.register({
    id: 'your-tool',
    name: '你的工具',
    description: '工具描述',
    category: 'category',
    icon: 'icon-name',
    component: YourTool
  });
}
```

## 📱 浏览器兼容性

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

---

**WebTools Hub** - 让工具使用更简单！
