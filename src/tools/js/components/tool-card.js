'use strict';

/**
 * 工具卡片组件
 */
class ToolCard {
  constructor(toolData) {
    this.data = {
      id: toolData.id,
      name: toolData.name,
      description: toolData.description,
      icon: toolData.icon,
      category: toolData.category,
      tags: toolData.tags || [],
      favorite: false
    };
    
    this.element = null;
    this.onFavoriteChange = null;
    this.onClick = null;
  }

  /**
   * 渲染工具卡片
   */
  render() {
    this.element = this.createElement();
    this.bindEvents();
    return this.element;
  }

  /**
   * 创建卡片元素
   */
  createElement() {
    const card = Utils.DOMUtils.createElement('div', 'tool-card');
    card.dataset.toolId = this.data.id;
    
    card.innerHTML = `
      <div class="tool-card__header">
        <div class="tool-card__icon">
          ${this.getIconSvg()}
        </div>
        <div class="tool-card__info">
          <h3 class="tool-card__title">${this.data.name}</h3>
          <span class="tool-card__category">${this.data.category}</span>
        </div>
        <button class="tool-card__favorite ${this.data.favorite ? 'tool-card__favorite--active' : ''}" 
                data-tooltip="${this.data.favorite ? '取消收藏' : '添加收藏'}">
          <svg viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </button>
      </div>
      <p class="tool-card__description">${this.data.description}</p>
      <div class="tool-card__footer">
        <div class="tool-card__tags">
          ${this.data.tags.map(tag => `<span class="tool-card__tag">${tag}</span>`).join('')}
        </div>
        <div class="tool-card__action">
          <span>使用工具</span>
          <svg viewBox="0 0 24 24">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
          </svg>
        </div>
      </div>
    `;

    return card;
  }

  /**
   * 获取图标SVG
   */
  getIconSvg() {
    const icons = {
      'scissors': '<path d="M9.64 7.64c.23-.5.36-1.05.36-1.64 0-2.21-1.79-4-4-4S2 3.79 2 6s1.79 4 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.59-.13-1.14-.36-1.64L12 14l2.36 2.36c-.5.23-1.05.36-1.64.36-2.21 0-4-1.79-4-4s1.79-4 4-4c.59 0 1.14.13 1.64.36L14 12l2.36-2.36C16.86 9.87 17.41 10 18 10c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4c0 .59.13 1.14.36 1.64L14 12l-2.36-2.36z"/>',
      'clock': '<path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>',
      'code': '<path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>',
      'palette': '<path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>',
      'text': '<path d="M5 4v3h5.5v12h3V7H19V4z"/>',
      'image': '<path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>',
      'link': '<path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>',
      'calculator': '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4zm.5-9.5h-7V4h7v3.5z"/>',
      'settings': '<path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>',
      'help': '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>'
    };
    
    return icons[this.data.icon] || icons['help'];
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    if (!this.element) return;

    // 收藏按钮点击事件
    const favoriteBtn = this.element.querySelector('.tool-card__favorite');
    if (favoriteBtn) {
      Utils.DOMUtils.addEventListener(favoriteBtn, 'click', (e) => {
        e.stopPropagation();
        this.toggleFavorite();
      });
    }

    // 卡片点击事件
    Utils.DOMUtils.addEventListener(this.element, 'click', () => {
      if (this.onClick) {
        this.onClick(this.data.id);
      }
    });
  }

  /**
   * 切换收藏状态
   */
  toggleFavorite() {
    this.data.favorite = !this.data.favorite;
    this.updateFavoriteUI();
    
    if (this.onFavoriteChange) {
      this.onFavoriteChange(this.data.id, this.data.favorite);
    }
  }

  /**
   * 更新收藏UI
   */
  updateFavoriteUI() {
    if (!this.element) return;

    const favoriteBtn = this.element.querySelector('.tool-card__favorite');
    if (favoriteBtn) {
      if (this.data.favorite) {
        favoriteBtn.classList.add('tool-card__favorite--active');
        favoriteBtn.setAttribute('data-tooltip', '取消收藏');
      } else {
        favoriteBtn.classList.remove('tool-card__favorite--active');
        favoriteBtn.setAttribute('data-tooltip', '添加收藏');
      }
    }
  }

  /**
   * 设置收藏状态
   */
  setFavorite(favorite) {
    this.data.favorite = favorite;
    this.updateFavoriteUI();
  }

  /**
   * 更新数据
   */
  updateData(newData) {
    this.data = { ...this.data, ...newData };
    if (this.element) {
      // 重新渲染
      const parent = this.element.parentNode;
      const newElement = this.render();
      parent.replaceChild(newElement, this.element);
      this.element = newElement;
    }
  }

  /**
   * 销毁组件
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
    this.onFavoriteChange = null;
    this.onClick = null;
  }
}

// 导出工具卡片组件
window.ToolCard = ToolCard;
