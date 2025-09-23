'use strict';

/**
 * 工具函数库
 */

// 防抖函数
function debounce(func, wait, immediate = false) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
}

// 节流函数
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// 深拷贝
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

// 生成唯一ID
function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 格式化文件大小
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 格式化时间
function formatTime(timestamp, format = 'YYYY-MM-DD HH:mm:ss') {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

// 获取网络时间
async function getNetworkTime() {
  try {
    const response = await fetch('/api/time', {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error('Network request failed');
    }
    
    const data = await response.json();
    return new Date(data.timestamp);
  } catch (error) {
    console.warn('Failed to fetch network time, using local time:', error);
    return new Date();
  }
}

// 复制到剪贴板
async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // 降级方案
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

// 下载文件
function downloadFile(content, filename, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// 验证JSON格式
function isValidJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (error) {
    return false;
  }
}

// 美化JSON
function formatJSON(jsonString) {
  try {
    const obj = JSON.parse(jsonString);
    return JSON.stringify(obj, null, 2);
  } catch (error) {
    return jsonString;
  }
}

// 压缩JSON
function minifyJSON(jsonString) {
  try {
    const obj = JSON.parse(jsonString);
    return JSON.stringify(obj);
  } catch (error) {
    return jsonString;
  }
}

// Base64编码
function base64Encode(str) {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch (error) {
    console.error('Base64 encode error:', error);
    return '';
  }
}

// Base64解码
function base64Decode(str) {
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch (error) {
    console.error('Base64 decode error:', error);
    return '';
  }
}

// URL编码
function urlEncode(str) {
  return encodeURIComponent(str);
}

// URL解码
function urlDecode(str) {
  return decodeURIComponent(str);
}

// 颜色转换工具
const ColorUtils = {
  // HEX转RGB
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },

  // RGB转HEX
  rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  },

  // RGB转HSL
  rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  },

  // HSL转RGB
  hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    if (s === 0) {
      return { r: l * 255, g: l * 255, b: l * 255 };
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      return {
        r: Math.round(hue2rgb(p, q, h + 1/3) * 255),
        g: Math.round(hue2rgb(p, q, h) * 255),
        b: Math.round(hue2rgb(p, q, h - 1/3) * 255)
      };
    }
  }
};

// DOM操作工具
const DOMUtils = {
  // 创建元素
  createElement(tag, className = '', content = '') {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content) element.innerHTML = content;
    return element;
  },

  // 添加事件监听器
  addEventListener(element, event, handler, options = {}) {
    element.addEventListener(event, handler, options);
  },

  // 移除事件监听器
  removeEventListener(element, event, handler) {
    element.removeEventListener(event, handler);
  },

  // 显示元素
  show(element) {
    element.style.display = '';
    element.classList.remove('hidden');
  },

  // 隐藏元素
  hide(element) {
    element.style.display = 'none';
    element.classList.add('hidden');
  },

  // 切换元素显示状态
  toggle(element) {
    if (element.style.display === 'none') {
      this.show(element);
    } else {
      this.hide(element);
    }
  }
};

// 通知工具
const NotificationUtils = {
  // 显示成功通知
  success(message, duration = 3000) {
    this.show(message, 'success', duration);
  },

  // 显示错误通知
  error(message, duration = 3000) {
    this.show(message, 'error', duration);
  },

  // 显示警告通知
  warning(message, duration = 3000) {
    this.show(message, 'warning', duration);
  },

  // 显示信息通知
  info(message, duration = 3000) {
    this.show(message, 'info', duration);
  },

  // 显示通知
  show(message, type = 'info', duration = 3000) {
    const notification = DOMUtils.createElement('div', `notification notification--${type}`);
    notification.innerHTML = `
      <div class="notification__content">
        <svg class="notification__icon" viewBox="0 0 24 24">
          ${this.getIcon(type)}
        </svg>
        <span class="notification__message">${message}</span>
        <button class="notification__close">
          <svg viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    // 添加关闭事件
    const closeBtn = notification.querySelector('.notification__close');
    DOMUtils.addEventListener(closeBtn, 'click', () => {
      this.remove(notification);
    });

    // 自动移除
    setTimeout(() => {
      this.remove(notification);
    }, duration);

    // 添加动画
    setTimeout(() => {
      notification.classList.add('notification--show');
    }, 10);
  },

  // 移除通知
  remove(notification) {
    notification.classList.remove('notification--show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  },

  // 获取图标
  getIcon(type) {
    const icons = {
      success: '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>',
      error: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>',
      warning: '<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>',
      info: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>'
    };
    return icons[type] || icons.info;
  }
};

// 导出所有工具函数
window.Utils = {
  debounce,
  throttle,
  deepClone,
  generateId,
  formatFileSize,
  formatTime,
  getNetworkTime,
  copyToClipboard,
  downloadFile,
  isValidJSON,
  formatJSON,
  minifyJSON,
  base64Encode,
  base64Decode,
  urlEncode,
  urlDecode,
  ColorUtils,
  DOMUtils,
  NotificationUtils
};
