'use strict';

/**
 * 主应用类 - 管理整个工具集平台
 */
class WebToolsApp {
  constructor() {
    console.log('🏗️ WebToolsApp 构造函数开始执行...');
    
    this.tools = [];
    this.categories = ['all', 'text', 'time', 'encode', 'color'];
    this.favorites = new Set();
    this.currentCategory = 'all';
    this.searchQuery = '';
    this.isFavoritesMode = false;
    this.toolRegistry = new Map();
    
    console.log('📊 应用状态初始化完成:', {
      toolsCount: this.tools.length,
      categories: this.categories,
      searchQuery: this.searchQuery,
      currentCategory: this.currentCategory,
      isFavoritesMode: this.isFavoritesMode,
      favoritesCount: this.favorites.size,
      toolRegistrySize: this.toolRegistry.size
    });
    
    console.log('🚀 开始调用 init() 方法...');
    this.init();
  }

  /**
   * 初始化应用
   */
  init() {
    try {
      console.log('🚀 应用开始初始化...');
      
      // 等待一小段时间确保所有脚本都已加载
      setTimeout(() => {
        console.log('📋 步骤1: 加载收藏');
        this.loadFavorites();
        console.log('📋 步骤2: 注册工具');
        this.registerTools();
        console.log('📋 步骤3: 绑定事件');
        this.bindEvents();
        console.log('📋 步骤4: 渲染工具');
        this.renderTools();
        console.log('📋 步骤5: 隐藏加载动画');
        this.hideLoading();
        console.log('✅ 应用初始化完成');
      }, 100);
      
    } catch (error) {
      console.error('❌ 应用初始化失败:', error);
      console.error('❌ 错误堆栈:', error.stack);
      this.showError('应用初始化失败，请刷新页面重试');
    }
  }

  /**
   * 注册所有工具
   */
  registerTools() {
    console.log('🔧 开始注册工具...');
    
    // 检查工具类是否可用
    const toolClasses = {
      'StringSplitterTool': window.StringSplitterTool,
      'TimeDisplayTool': window.TimeDisplayTool,
      'EncoderTool': window.EncoderTool,
      'ColorPickerTool': window.ColorPickerTool
    };

    console.log('🔍 检查工具类可用性:');
    Object.entries(toolClasses).forEach(([name, cls]) => {
      console.log(`  ${cls ? '✅' : '❌'} ${name}:`, cls ? '已加载' : '未找到');
    });

    // 检查缺失的工具类
    const missingTools = Object.entries(toolClasses)
      .filter(([name, cls]) => !cls)
      .map(([name]) => name);

    if (missingTools.length > 0) {
      console.error('❌ 缺少工具类:', missingTools);
      this.showError(`缺少工具类: ${missingTools.join(', ')}`);
      return;
    }

    console.log('✅ 所有工具类检查通过，开始注册...');

    // 字符串分割工具
    console.log('📝 注册字符串分割工具...');
    this.registerTool({
      id: 'string-splitter',
      name: '字符串分割器',
      description: '将字符串按分隔符分割为网格数据，支持自定义分隔符和CSV导出',
      category: 'text',
      icon: 'scissors',
      component: window.StringSplitterTool
    });

    // 时间显示工具
    console.log('⏰ 注册时间显示工具...');
    this.registerTool({
      id: 'time-display',
      name: '网络时间显示',
      description: '显示当前网络时间，支持时区转换、时间戳转换和倒计时功能',
      category: 'time',
      icon: 'clock',
      component: window.TimeDisplayTool
    });

    // 编码转换工具
    console.log('🔐 注册编码转换工具...');
    this.registerTool({
      id: 'encoder',
      name: '编码转换器',
      description: '支持Base64编解码、URL编解码、JSON格式化和二维码生成',
      category: 'encode',
      icon: 'code',
      component: window.EncoderTool
    });

    // 颜色选择器工具
    console.log('🎨 注册颜色选择器工具...');
    this.registerTool({
      id: 'color-picker',
      name: '颜色选择器',
      description: '支持HEX、RGB、HSL格式转换，提供配色方案和渐变生成器',
      category: 'color',
      icon: 'palette',
      component: window.ColorPickerTool
    });

    console.log('✅ 所有工具注册完成，已注册工具数量:', this.toolRegistry.size);
  }

  /**
   * 注册单个工具
   */
  registerTool(toolConfig) {
    this.toolRegistry.set(toolConfig.id, toolConfig);
    this.tools.push(toolConfig);
  }

  /**
   * 绑定事件监听器
   */
  bindEvents() {
    console.log('🔗 开始绑定事件...');
    
    // 搜索功能
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    console.log('🔍 搜索元素检查:', {
      searchInput: !!searchInput,
      searchBtn: !!searchBtn
    });
    
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim();
        this.renderTools();
      });

      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.renderTools();
        }
      });
    }

    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        this.renderTools();
      });
    }

    // 分类筛选
    const navBtns = document.querySelectorAll('.header__nav-btn');
    navBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const category = e.target.dataset.category;
        this.setCategory(category);
      });
    });

    // 收藏功能
    const favoritesBtn = document.getElementById('favoritesBtn');
    if (favoritesBtn) {
      favoritesBtn.addEventListener('click', () => {
        this.toggleFavoritesMode();
      });
    }

    // 弹窗关闭
    const modalClose = document.getElementById('modalClose');
    const modalOverlay = document.getElementById('modalOverlay');
    
    if (modalClose) {
      modalClose.addEventListener('click', () => {
        this.closeModal();
      });
    }

    if (modalOverlay) {
      modalOverlay.addEventListener('click', () => {
        this.closeModal();
      });
    }

    // ESC键关闭弹窗
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
      }
    });

    // 窗口大小变化时重新渲染
    window.addEventListener('resize', this.debounce(() => {
      this.renderTools();
    }, 300));
  }

  /**
   * 设置当前分类
   */
  setCategory(category) {
    this.currentCategory = category;
    
    // 更新导航按钮状态
    const navBtns = document.querySelectorAll('.header__nav-btn');
    navBtns.forEach(btn => {
      btn.classList.remove('header__nav-btn--active');
      if (btn.dataset.category === category) {
        btn.classList.add('header__nav-btn--active');
      }
    });

    this.renderTools();
  }

  /**
   * 切换收藏模式
   */
  toggleFavoritesMode() {
    this.isFavoritesMode = !this.isFavoritesMode;
    
    const favoritesBtn = document.getElementById('favoritesBtn');
    if (favoritesBtn) {
      if (this.isFavoritesMode) {
        favoritesBtn.classList.add('favorites-toggle__btn--active');
      } else {
        favoritesBtn.classList.remove('favorites-toggle__btn--active');
      }
    }

    this.renderTools();
  }

  /**
   * 切换工具收藏状态
   */
  toggleToolFavorite(toolId) {
    if (this.favorites.has(toolId)) {
      this.favorites.delete(toolId);
    } else {
      this.favorites.add(toolId);
    }

    this.saveFavorites();
    this.renderTools();
  }

  /**
   * 渲染工具列表
   */
  renderTools() {
    console.log('🎨 开始渲染工具...');
    
    const toolsGrid = document.getElementById('toolsGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (!toolsGrid) {
      console.error('❌ 找不到 toolsGrid 元素');
      return;
    }

    console.log('📊 工具注册表大小:', this.toolRegistry.size);
    console.log('📊 已注册的工具:', Array.from(this.toolRegistry.keys()));

    // 获取过滤后的工具列表
    const filteredTools = this.getFilteredTools();
    console.log('🔍 过滤后的工具数量:', filteredTools.length);
    console.log('🔍 过滤后的工具列表:', filteredTools.map(t => t.id));

    // 清空网格
    toolsGrid.innerHTML = '';

    if (filteredTools.length === 0) {
      console.log('📭 没有工具需要显示，显示空状态');
      // 显示空状态
      if (emptyState) {
        emptyState.style.display = 'block';
        this.updateEmptyStateMessage();
      }
    } else {
      console.log('📦 开始渲染工具卡片...');
      // 隐藏空状态
      if (emptyState) {
        emptyState.style.display = 'none';
      }

      // 渲染工具卡片
      filteredTools.forEach((tool, index) => {
        console.log(`📦 渲染第 ${index + 1} 个工具:`, tool.id);
        const toolCard = this.createToolCard(tool);
        if (toolCard) {
          toolsGrid.appendChild(toolCard);
          console.log(`✅ 工具 ${tool.id} 渲染成功`);
        } else {
          console.error(`❌ 工具 ${tool.id} 渲染失败`);
        }
      });
      
      console.log('✅ 工具渲染完成');
    
      // 调试：检查工具网格容器的实际内容
      console.log('🔍 工具网格容器检查:', {
        childrenCount: toolsGrid.children.length,
        innerHTML: toolsGrid.innerHTML.substring(0, 200) + '...',
        computedStyle: {
          display: window.getComputedStyle(toolsGrid).display,
          visibility: window.getComputedStyle(toolsGrid).visibility,
          opacity: window.getComputedStyle(toolsGrid).opacity,
          height: window.getComputedStyle(toolsGrid).height
        }
      });
    }
  }

  /**
   * 获取过滤后的工具列表
   */
  getFilteredTools() {
    let filteredTools = [...this.tools];

    // 分类筛选
    if (this.currentCategory !== 'all') {
      filteredTools = filteredTools.filter(tool => tool.category === this.currentCategory);
    }

    // 收藏模式筛选
    if (this.isFavoritesMode) {
      filteredTools = filteredTools.filter(tool => this.favorites.has(tool.id));
    }

    // 搜索筛选
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filteredTools = filteredTools.filter(tool => 
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.category.toLowerCase().includes(query)
      );
    }

    return filteredTools;
  }

  /**
   * 创建工具卡片
   */
  createToolCard(tool) {
    const card = document.createElement('div');
    card.className = 'tool-card';
    card.dataset.toolId = tool.id;

    const isFavorite = this.favorites.has(tool.id);

    card.innerHTML = `
      <div class="tool-card__header">
        <div class="tool-card__icon">
          ${this.getToolIcon(tool.icon)}
        </div>
        <h3 class="tool-card__title">${tool.name}</h3>
        <button class="tool-card__favorite ${isFavorite ? 'tool-card__favorite--active' : ''}" 
                data-tool-id="${tool.id}">
          <svg viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </button>
      </div>
      <p class="tool-card__description">${tool.description}</p>
      <span class="tool-card__category tool-card__category--${tool.category}">${this.getCategoryName(tool.category)}</span>
    `;

    // 绑定卡片点击事件
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.tool-card__favorite')) {
        this.openTool(tool.id);
      }
    });

    // 绑定收藏按钮事件
    const favoriteBtn = card.querySelector('.tool-card__favorite');
    if (favoriteBtn) {
      favoriteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleToolFavorite(tool.id);
      });
    }

    return card;
  }

  /**
   * 获取工具图标
   */
  getToolIcon(iconName) {
    const icons = {
      scissors: `<svg viewBox="0 0 24 24"><path d="M9.64 7.64c.23-.5.36-1.05.36-1.64 0-2.21-1.79-4-4-4S2 3.79 2 6s1.79 4 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.59-.13-1.14-.36-1.64L12 14l7 7 3-3-7-7 2.36-2.36c.23.5.36 1.05.36 1.64 0 2.21 1.79 4 4 4s4-1.79 4-4-1.79-4-4-4c-.59 0-1.14.13-1.64.36L14 12l-2.36-2.36z"/></svg>`,
      clock: `<svg viewBox="0 0 24 24"><path d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"/></svg>`,
      code: `<svg viewBox="0 0 24 24"><path d="M8,3A2,2 0 0,0 6,5V9A2,2 0 0,1 4,11H3V13H4A2,2 0 0,1 6,15V19A2,2 0 0,0 8,21H10V19H8V14A2,2 0 0,0 6,12A2,2 0 0,0 8,10V5H10V3M16,3A2,2 0 0,1 18,5V9A2,2 0 0,0 20,11H21V13H20A2,2 0 0,0 18,15V19A2,2 0 0,1 16,21H14V19H16V14A2,2 0 0,1 18,12A2,2 0 0,1 16,10V5H14V3H16Z"/></svg>`,
      palette: `<svg viewBox="0 0 24 24"><path d="M12,3C12.55,3 13,3.45 13,4C13,4.55 12.55,5 12,5C11.45,5 11,4.55 11,4C11,3.45 11.45,3 12,3M7.5,8C8.33,8 9,8.67 9,9.5C9,10.33 8.33,11 7.5,11C6.67,11 6,10.33 6,9.5C6,8.67 6.67,8 7.5,8M16.5,8C17.33,8 18,8.67 18,9.5C18,10.33 17.33,11 16.5,11C15.67,11 15,10.33 15,9.5C15,8.67 15.67,8 16.5,8M12,6C9.79,6 8,7.79 8,10C8,11.38 8.56,12.63 9.5,13.5L10.5,14.5C11.33,15.33 12.67,15.33 13.5,14.5L14.5,13.5C15.44,12.63 16,11.38 16,10C16,7.79 14.21,6 12,6M12,2C13.1,2 14,2.9 14,4C14,5.1 13.1,6 12,6C10.9,6 10,5.1 10,4C10,2.9 10.9,2 12,2Z"/></svg>`
    };

    return icons[iconName] || icons.code;
  }

  /**
   * 获取分类中文名称
   */
  getCategoryName(category) {
    const categoryNames = {
      text: '文本处理',
      time: '时间工具',
      encode: '编码转换',
      color: '颜色工具'
    };

    return categoryNames[category] || category;
  }

  /**
   * 打开工具
   */
  openTool(toolId) {
    const toolConfig = this.toolRegistry.get(toolId);
    if (!toolConfig) {
      console.error('Tool not found:', toolId);
      return;
    }

    this.showModal(toolConfig);
  }

  /**
   * 显示弹窗
   */
  showModal(toolConfig) {
    const modal = document.getElementById('toolModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    if (!modal || !modalTitle || !modalBody) return;

    // 设置标题
    modalTitle.textContent = toolConfig.name;

    // 显示加载状态
    modalBody.innerHTML = `
      <div class="loading">
        <div class="loading__spinner"></div>
        <p class="loading__text">加载工具中...</p>
      </div>
    `;

    // 显示弹窗
    modal.classList.add('modal--active');
    document.body.style.overflow = 'hidden';

    // 延迟加载工具内容（模拟加载时间）
    setTimeout(() => {
      try {
        const toolInstance = new toolConfig.component();
        modalBody.innerHTML = toolInstance.render();
        toolInstance.init();
      } catch (error) {
        console.error('Failed to load tool:', error);
        modalBody.innerHTML = `
          <div class="empty-state">
            <div class="empty-state__icon">
              <svg viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h3 class="empty-state__title">工具加载失败</h3>
            <p class="empty-state__description">无法加载该工具，请稍后重试</p>
          </div>
        `;
      }
    }, 300);
  }

  /**
   * 关闭弹窗
   */
  closeModal() {
    const modal = document.getElementById('toolModal');
    if (!modal) return;

    modal.classList.remove('modal--active');
    document.body.style.overflow = '';
  }

  /**
   * 更新空状态消息
   */
  updateEmptyStateMessage() {
    const emptyStateTitle = document.querySelector('.empty-state__title');
    const emptyStateDescription = document.querySelector('.empty-state__description');

    if (!emptyStateTitle || !emptyStateDescription) return;

    if (this.isFavoritesMode) {
      emptyStateTitle.textContent = '暂无收藏';
      emptyStateDescription.textContent = '您还没有收藏任何工具';
    } else if (this.searchQuery) {
      emptyStateTitle.textContent = '未找到相关工具';
      emptyStateDescription.textContent = `没有找到包含"${this.searchQuery}"的工具，请尝试其他搜索条件`;
    } else {
      emptyStateTitle.textContent = '暂无工具';
      emptyStateDescription.textContent = '没有找到匹配的工具，请尝试其他搜索条件';
    }
  }

  /**
   * 保存收藏到本地存储
   */
  saveFavorites() {
    try {
      localStorage.setItem('webtools_favorites', JSON.stringify([...this.favorites]));
    } catch (error) {
      console.error('Failed to save favorites:', error);
    }
  }

  /**
   * 从本地存储加载收藏
   */
  loadFavorites() {
    try {
      const saved = localStorage.getItem('webtools_favorites');
      if (saved) {
        this.favorites = new Set(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
      this.favorites = new Set();
    }
  }

  /**
   * 隐藏加载动画
   */
  hideLoading() {
    console.log('🔄 隐藏加载动画...');
    const loading = document.getElementById('loading');
    if (loading) {
      console.log('🔍 找到加载动画元素:', loading);
      console.log('🔍 加载动画当前类名:', loading.className);
      
      // 强制隐藏加载动画 - 多重保障
      loading.classList.add('loading--hidden');
      loading.style.display = 'none';
      loading.style.visibility = 'hidden';
      loading.style.opacity = '0';
      loading.style.pointerEvents = 'none';
      
      console.log('🔍 添加隐藏类后的类名:', loading.className);
      console.log('🔍 强制设置display为none');
      console.log('✅ 加载动画已隐藏');
    } else {
      console.error('❌ 找不到加载动画元素 #loading');
      console.log('🔍 当前页面所有元素:', document.querySelectorAll('*'));
    }
  }

  /**
   * 显示错误信息
   */
  showError(message) {
    console.error('🚨 显示错误信息:', message);
    const toolsGrid = document.getElementById('toolsGrid');
    if (toolsGrid) {
      toolsGrid.innerHTML = `
        <div class="error-state">
          <div class="error-state__icon">
            <svg viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h3 class="error-state__title">加载失败</h3>
          <p class="error-state__description">${message}</p>
          <button class="error-state__btn" onclick="location.reload()">重新加载</button>
        </div>
      `;
    }
    // 确保隐藏加载动画
    this.hideLoading();
  }

  /**
   * 防抖函数
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// 工具注册表
window.ToolRegistry = {
  tools: new Map(),
  
  register(toolConfig) {
    this.tools.set(toolConfig.id, toolConfig);
  },
  
  getTool(id) {
    return this.tools.get(id);
  },
  
  getAllTools() {
    return Array.from(this.tools.values());
  }
};

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 DOM 内容加载完成，开始初始化应用...');
  console.log('🌍 当前环境信息:', {
    userAgent: navigator.userAgent,
    location: window.location.href,
    timestamp: new Date().toISOString()
  });
  
  // 检查关键元素是否存在
  const criticalElements = ['toolsGrid', 'loading', 'searchInput'];
  criticalElements.forEach(id => {
    const element = document.getElementById(id);
    console.log(`🔍 检查关键元素 #${id}:`, element ? '✅ 存在' : '❌ 不存在');
  });
  
  try {
    window.webToolsApp = new WebToolsApp();
    console.log('✅ 应用实例创建成功:', window.webToolsApp);
  } catch (error) {
    console.error('❌ 应用实例创建失败:', error);
    console.error('❌ 错误堆栈:', error.stack);
  }
});

// 导出应用类（如果使用模块化）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WebToolsApp;
}
