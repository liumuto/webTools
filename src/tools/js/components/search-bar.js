'use strict';

/**
 * 搜索栏组件
 */
class SearchBar {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      placeholder: '搜索工具...',
      debounceDelay: 300,
      minLength: 1,
      ...options
    };
    
    this.onSearch = null;
    this.onClear = null;
    this.currentQuery = '';
    this.isActive = false;
    
    this.init();
  }

  /**
   * 初始化搜索栏
   */
  init() {
    this.render();
    this.bindEvents();
  }

  /**
   * 渲染搜索栏
   */
  render() {
    this.container.innerHTML = `
      <div class="search-bar">
        <input type="text" 
               class="search-bar__input" 
               placeholder="${this.options.placeholder}"
               value="${this.currentQuery}">
        <button class="search-bar__btn search-bar__btn--search" type="button">
          <svg class="search-bar__icon" viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
        </button>
        <button class="search-bar__btn search-bar__btn--clear" type="button" style="display: none;">
          <svg class="search-bar__icon" viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
    `;
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    const input = this.container.querySelector('.search-bar__input');
    const searchBtn = this.container.querySelector('.search-bar__btn--search');
    const clearBtn = this.container.querySelector('.search-bar__btn--clear');

    // 输入事件（防抖）
    const debouncedSearch = Utils.debounce((query) => {
      this.performSearch(query);
    }, this.options.debounceDelay);

    Utils.DOMUtils.addEventListener(input, 'input', (e) => {
      const query = e.target.value.trim();
      this.currentQuery = query;
      
      // 显示/隐藏清除按钮
      if (query.length > 0) {
        clearBtn.style.display = 'flex';
        this.isActive = true;
      } else {
        clearBtn.style.display = 'none';
        this.isActive = false;
        this.clearSearch();
      }
      
      // 执行搜索
      if (query.length >= this.options.minLength) {
        debouncedSearch(query);
      } else if (query.length === 0) {
        this.clearSearch();
      }
    });

    // 搜索按钮点击
    Utils.DOMUtils.addEventListener(searchBtn, 'click', () => {
      const query = input.value.trim();
      if (query.length >= this.options.minLength) {
        this.performSearch(query);
      }
    });

    // 清除按钮点击
    Utils.DOMUtils.addEventListener(clearBtn, 'click', () => {
      this.clearSearch();
    });

    // 回车键搜索
    Utils.DOMUtils.addEventListener(input, 'keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const query = e.target.value.trim();
        if (query.length >= this.options.minLength) {
          this.performSearch(query);
        }
      } else if (e.key === 'Escape') {
        this.clearSearch();
      }
    });

    // 焦点事件
    Utils.DOMUtils.addEventListener(input, 'focus', () => {
      this.container.classList.add('search-bar--focused');
    });

    Utils.DOMUtils.addEventListener(input, 'blur', () => {
      this.container.classList.remove('search-bar--focused');
    });
  }

  /**
   * 执行搜索
   */
  performSearch(query) {
    if (this.onSearch) {
      this.onSearch(query);
    }
  }

  /**
   * 清除搜索
   */
  clearSearch() {
    const input = this.container.querySelector('.search-bar__input');
    const clearBtn = this.container.querySelector('.search-bar__btn--clear');
    
    input.value = '';
    this.currentQuery = '';
    this.isActive = false;
    clearBtn.style.display = 'none';
    
    if (this.onClear) {
      this.onClear();
    }
  }

  /**
   * 设置搜索查询
   */
  setQuery(query) {
    const input = this.container.querySelector('.search-bar__input');
    const clearBtn = this.container.querySelector('.search-bar__btn--clear');
    
    input.value = query;
    this.currentQuery = query;
    
    if (query.length > 0) {
      clearBtn.style.display = 'flex';
      this.isActive = true;
    } else {
      clearBtn.style.display = 'none';
      this.isActive = false;
    }
  }

  /**
   * 获取当前查询
   */
  getQuery() {
    return this.currentQuery;
  }

  /**
   * 获取是否激活状态
   */
  isSearchActive() {
    return this.isActive;
  }

  /**
   * 聚焦输入框
   */
  focus() {
    const input = this.container.querySelector('.search-bar__input');
    if (input) {
      input.focus();
    }
  }

  /**
   * 失焦输入框
   */
  blur() {
    const input = this.container.querySelector('.search-bar__input');
    if (input) {
      input.blur();
    }
  }

  /**
   * 设置占位符
   */
  setPlaceholder(placeholder) {
    const input = this.container.querySelector('.search-bar__input');
    if (input) {
      input.placeholder = placeholder;
    }
  }

  /**
   * 销毁组件
   */
  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.onSearch = null;
    this.onClear = null;
  }
}

// 导出搜索栏组件
window.SearchBar = SearchBar;
