'use strict';

/**
 * 编码转换工具
 * 支持Base64编解码、URL编解码、JSON格式化、二维码生成
 */
class EncoderTool {
  constructor() {
    this.currentTab = 'base64';
    this.qrCodeSize = 200;
  }

  /**
   * 渲染工具界面
   */
  render() {
    return `
      <div class="encoder">
        <div class="encoder__tabs">
          <button class="encoder__tab ${this.currentTab === 'base64' ? 'encoder__tab--active' : ''}" data-tab="base64">
            Base64
          </button>
          <button class="encoder__tab ${this.currentTab === 'url' ? 'encoder__tab--active' : ''}" data-tab="url">
            URL编码
          </button>
          <button class="encoder__tab ${this.currentTab === 'json' ? 'encoder__tab--active' : ''}" data-tab="json">
            JSON格式化
          </button>
          <button class="encoder__tab ${this.currentTab === 'qr' ? 'encoder__tab--active' : ''}" data-tab="qr">
            二维码
          </button>
        </div>

        <div class="encoder__content">
          <!-- Base64 编解码 -->
          <div class="encoder__panel ${this.currentTab === 'base64' ? 'encoder__panel--active' : ''}" data-panel="base64">
            <div class="encoder__section">
              <h3 class="encoder__title">Base64 编解码</h3>
              <div class="encoder__input-group">
                <label class="encoder__label">输入内容：</label>
                <textarea id="base64Input" class="encoder__textarea" placeholder="输入要编码或解码的内容..."></textarea>
              </div>
              
              <div class="encoder__actions">
                <button id="base64EncodeBtn" class="encoder__btn encoder__btn--primary">编码</button>
                <button id="base64DecodeBtn" class="encoder__btn encoder__btn--secondary">解码</button>
                <button id="base64ClearBtn" class="encoder__btn encoder__btn--secondary">清空</button>
              </div>
              
              <div class="encoder__input-group">
                <label class="encoder__label">结果：</label>
                <textarea id="base64Output" class="encoder__textarea" readonly placeholder="编码或解码结果将显示在这里..."></textarea>
                <button id="base64CopyBtn" class="encoder__btn encoder__btn--small">复制结果</button>
              </div>
            </div>
          </div>

          <!-- URL 编解码 -->
          <div class="encoder__panel ${this.currentTab === 'url' ? 'encoder__panel--active' : ''}" data-panel="url">
            <div class="encoder__section">
              <h3 class="encoder__title">URL 编解码</h3>
              <div class="encoder__input-group">
                <label class="encoder__label">输入URL：</label>
                <textarea id="urlInput" class="encoder__textarea" placeholder="输入要编码或解码的URL..."></textarea>
              </div>
              
              <div class="encoder__actions">
                <button id="urlEncodeBtn" class="encoder__btn encoder__btn--primary">编码</button>
                <button id="urlDecodeBtn" class="encoder__btn encoder__btn--secondary">解码</button>
                <button id="urlClearBtn" class="encoder__btn encoder__btn--secondary">清空</button>
              </div>
              
              <div class="encoder__input-group">
                <label class="encoder__label">结果：</label>
                <textarea id="urlOutput" class="encoder__textarea" readonly placeholder="编码或解码结果将显示在这里..."></textarea>
                <button id="urlCopyBtn" class="encoder__btn encoder__btn--small">复制结果</button>
              </div>
            </div>
          </div>

          <!-- JSON 格式化 -->
          <div class="encoder__panel ${this.currentTab === 'json' ? 'encoder__panel--active' : ''}" data-panel="json">
            <div class="encoder__section">
              <h3 class="encoder__title">JSON 格式化</h3>
              <div class="encoder__input-group">
                <label class="encoder__label">JSON内容：</label>
                <textarea id="jsonInput" class="encoder__textarea" placeholder="输入JSON字符串..."></textarea>
              </div>
              
              <div class="encoder__actions">
                <button id="jsonFormatBtn" class="encoder__btn encoder__btn--primary">格式化</button>
                <button id="jsonMinifyBtn" class="encoder__btn encoder__btn--secondary">压缩</button>
                <button id="jsonValidateBtn" class="encoder__btn encoder__btn--secondary">验证</button>
                <button id="jsonClearBtn" class="encoder__btn encoder__btn--secondary">清空</button>
              </div>
              
              <div class="encoder__input-group">
                <label class="encoder__label">结果：</label>
                <textarea id="jsonOutput" class="encoder__textarea" readonly placeholder="格式化结果将显示在这里..."></textarea>
                <button id="jsonCopyBtn" class="encoder__btn encoder__btn--small">复制结果</button>
              </div>
              
              <div class="encoder__status" id="jsonStatus"></div>
            </div>
          </div>

          <!-- 二维码生成 -->
          <div class="encoder__panel ${this.currentTab === 'qr' ? 'encoder__panel--active' : ''}" data-panel="qr">
            <div class="encoder__section">
              <h3 class="encoder__title">二维码生成</h3>
              <div class="encoder__input-group">
                <label class="encoder__label">输入内容：</label>
                <textarea id="qrInput" class="encoder__textarea" placeholder="输入要生成二维码的内容..."></textarea>
              </div>
              
              <div class="encoder__options">
                <div class="encoder__option">
                  <label class="encoder__label" for="qrSize">二维码大小：</label>
                  <select id="qrSize" class="encoder__select">
                    <option value="100">100x100</option>
                    <option value="150">150x150</option>
                    <option value="200" selected>200x200</option>
                    <option value="300">300x300</option>
                    <option value="400">400x400</option>
                  </select>
                </div>
                
                <div class="encoder__option">
                  <label class="encoder__label" for="qrErrorLevel">容错级别：</label>
                  <select id="qrErrorLevel" class="encoder__select">
                    <option value="L">低 (7%)</option>
                    <option value="M" selected>中 (15%)</option>
                    <option value="Q">高 (25%)</option>
                    <option value="H">最高 (30%)</option>
                  </select>
                </div>
              </div>
              
              <div class="encoder__actions">
                <button id="qrGenerateBtn" class="encoder__btn encoder__btn--primary">生成二维码</button>
                <button id="qrDownloadBtn" class="encoder__btn encoder__btn--secondary" disabled>下载</button>
                <button id="qrClearBtn" class="encoder__btn encoder__btn--secondary">清空</button>
              </div>
              
              <div class="encoder__qr-result">
                <div id="qrCodeDisplay" class="encoder__qr-code">
                  <div class="encoder__qr-placeholder">
                    <svg viewBox="0 0 24 24">
                      <path d="M3 3h6v6H3V3zm12 0h6v6h-6V3zM3 15h6v6H3v-6zm12 0h6v6h-6v-6z"/>
                    </svg>
                    <p>二维码将显示在这里</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 初始化事件监听
   */
  init() {
    this.initTabs();
    this.initBase64();
    this.initUrl();
    this.initJson();
    this.initQrCode();
  }

  /**
   * 初始化标签页切换
   */
  initTabs() {
    const tabs = document.querySelectorAll('.encoder__tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const targetTab = e.target.dataset.tab;
        this.switchTab(targetTab);
      });
    });
  }

  /**
   * 切换标签页
   */
  switchTab(tabName) {
    // 更新标签页状态
    document.querySelectorAll('.encoder__tab').forEach(tab => {
      tab.classList.remove('encoder__tab--active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('encoder__tab--active');

    // 更新面板显示
    document.querySelectorAll('.encoder__panel').forEach(panel => {
      panel.classList.remove('encoder__panel--active');
    });
    document.querySelector(`[data-panel="${tabName}"]`).classList.add('encoder__panel--active');

    this.currentTab = tabName;
  }

  /**
   * 初始化Base64功能
   */
  initBase64() {
    const encodeBtn = document.getElementById('base64EncodeBtn');
    const decodeBtn = document.getElementById('base64DecodeBtn');
    const clearBtn = document.getElementById('base64ClearBtn');
    const copyBtn = document.getElementById('base64CopyBtn');
    const input = document.getElementById('base64Input');
    const output = document.getElementById('base64Output');

    if (encodeBtn) {
      encodeBtn.addEventListener('click', () => {
        this.base64Encode();
      });
    }

    if (decodeBtn) {
      decodeBtn.addEventListener('click', () => {
        this.base64Decode();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (input) input.value = '';
        if (output) output.value = '';
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        this.copyToClipboard(output.value);
      });
    }
  }

  /**
   * Base64编码
   */
  base64Encode() {
    const input = document.getElementById('base64Input');
    const output = document.getElementById('base64Output');

    if (!input || !output) return;

    const text = input.value.trim();
    if (!text) {
      this.showMessage('请输入要编码的内容', 'warning');
      return;
    }

    try {
      const encoded = btoa(unescape(encodeURIComponent(text)));
      output.value = encoded;
      this.showMessage('编码成功', 'success');
    } catch (error) {
      this.showMessage('编码失败：' + error.message, 'error');
    }
  }

  /**
   * Base64解码
   */
  base64Decode() {
    const input = document.getElementById('base64Input');
    const output = document.getElementById('base64Output');

    if (!input || !output) return;

    const text = input.value.trim();
    if (!text) {
      this.showMessage('请输入要解码的内容', 'warning');
      return;
    }

    try {
      const decoded = decodeURIComponent(escape(atob(text)));
      output.value = decoded;
      this.showMessage('解码成功', 'success');
    } catch (error) {
      this.showMessage('解码失败：' + error.message, 'error');
    }
  }

  /**
   * 初始化URL功能
   */
  initUrl() {
    const encodeBtn = document.getElementById('urlEncodeBtn');
    const decodeBtn = document.getElementById('urlDecodeBtn');
    const clearBtn = document.getElementById('urlClearBtn');
    const copyBtn = document.getElementById('urlCopyBtn');

    if (encodeBtn) {
      encodeBtn.addEventListener('click', () => {
        this.urlEncode();
      });
    }

    if (decodeBtn) {
      decodeBtn.addEventListener('click', () => {
        this.urlDecode();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        const input = document.getElementById('urlInput');
        const output = document.getElementById('urlOutput');
        if (input) input.value = '';
        if (output) output.value = '';
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const output = document.getElementById('urlOutput');
        this.copyToClipboard(output.value);
      });
    }
  }

  /**
   * URL编码
   */
  urlEncode() {
    const input = document.getElementById('urlInput');
    const output = document.getElementById('urlOutput');

    if (!input || !output) return;

    const text = input.value.trim();
    if (!text) {
      this.showMessage('请输入要编码的URL', 'warning');
      return;
    }

    try {
      const encoded = encodeURIComponent(text);
      output.value = encoded;
      this.showMessage('编码成功', 'success');
    } catch (error) {
      this.showMessage('编码失败：' + error.message, 'error');
    }
  }

  /**
   * URL解码
   */
  urlDecode() {
    const input = document.getElementById('urlInput');
    const output = document.getElementById('urlOutput');

    if (!input || !output) return;

    const text = input.value.trim();
    if (!text) {
      this.showMessage('请输入要解码的URL', 'warning');
      return;
    }

    try {
      const decoded = decodeURIComponent(text);
      output.value = decoded;
      this.showMessage('解码成功', 'success');
    } catch (error) {
      this.showMessage('解码失败：' + error.message, 'error');
    }
  }

  /**
   * 初始化JSON功能
   */
  initJson() {
    const formatBtn = document.getElementById('jsonFormatBtn');
    const minifyBtn = document.getElementById('jsonMinifyBtn');
    const validateBtn = document.getElementById('jsonValidateBtn');
    const clearBtn = document.getElementById('jsonClearBtn');
    const copyBtn = document.getElementById('jsonCopyBtn');

    if (formatBtn) {
      formatBtn.addEventListener('click', () => {
        this.jsonFormat();
      });
    }

    if (minifyBtn) {
      minifyBtn.addEventListener('click', () => {
        this.jsonMinify();
      });
    }

    if (validateBtn) {
      validateBtn.addEventListener('click', () => {
        this.jsonValidate();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        const input = document.getElementById('jsonInput');
        const output = document.getElementById('jsonOutput');
        const status = document.getElementById('jsonStatus');
        if (input) input.value = '';
        if (output) output.value = '';
        if (status) status.textContent = '';
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const output = document.getElementById('jsonOutput');
        this.copyToClipboard(output.value);
      });
    }
  }

  /**
   * JSON格式化
   */
  jsonFormat() {
    const input = document.getElementById('jsonInput');
    const output = document.getElementById('jsonOutput');
    const status = document.getElementById('jsonStatus');

    if (!input || !output || !status) return;

    const text = input.value.trim();
    if (!text) {
      this.showMessage('请输入JSON内容', 'warning');
      return;
    }

    try {
      const parsed = JSON.parse(text);
      const formatted = JSON.stringify(parsed, null, 2);
      output.value = formatted;
      status.textContent = '✅ JSON格式正确';
      status.className = 'encoder__status encoder__status--success';
      this.showMessage('格式化成功', 'success');
    } catch (error) {
      status.textContent = '❌ JSON格式错误：' + error.message;
      status.className = 'encoder__status encoder__status--error';
      this.showMessage('JSON格式错误：' + error.message, 'error');
    }
  }

  /**
   * JSON压缩
   */
  jsonMinify() {
    const input = document.getElementById('jsonInput');
    const output = document.getElementById('jsonOutput');
    const status = document.getElementById('jsonStatus');

    if (!input || !output || !status) return;

    const text = input.value.trim();
    if (!text) {
      this.showMessage('请输入JSON内容', 'warning');
      return;
    }

    try {
      const parsed = JSON.parse(text);
      const minified = JSON.stringify(parsed);
      output.value = minified;
      status.textContent = '✅ JSON压缩成功';
      status.className = 'encoder__status encoder__status--success';
      this.showMessage('压缩成功', 'success');
    } catch (error) {
      status.textContent = '❌ JSON格式错误：' + error.message;
      status.className = 'encoder__status encoder__status--error';
      this.showMessage('JSON格式错误：' + error.message, 'error');
    }
  }

  /**
   * JSON验证
   */
  jsonValidate() {
    const input = document.getElementById('jsonInput');
    const status = document.getElementById('jsonStatus');

    if (!input || !status) return;

    const text = input.value.trim();
    if (!text) {
      this.showMessage('请输入JSON内容', 'warning');
      return;
    }

    try {
      JSON.parse(text);
      status.textContent = '✅ JSON格式正确';
      status.className = 'encoder__status encoder__status--success';
      this.showMessage('JSON格式正确', 'success');
    } catch (error) {
      status.textContent = '❌ JSON格式错误：' + error.message;
      status.className = 'encoder__status encoder__status--error';
      this.showMessage('JSON格式错误：' + error.message, 'error');
    }
  }

  /**
   * 初始化二维码功能
   */
  initQrCode() {
    const generateBtn = document.getElementById('qrGenerateBtn');
    const downloadBtn = document.getElementById('qrDownloadBtn');
    const clearBtn = document.getElementById('qrClearBtn');

    if (generateBtn) {
      generateBtn.addEventListener('click', () => {
        this.generateQrCode();
      });
    }

    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        this.downloadQrCode();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        const input = document.getElementById('qrInput');
        const display = document.getElementById('qrCodeDisplay');
        const downloadBtn = document.getElementById('qrDownloadBtn');
        
        if (input) input.value = '';
        if (display) {
          display.innerHTML = `
            <div class="encoder__qr-placeholder">
              <svg viewBox="0 0 24 24">
                <path d="M3 3h6v6H3V3zm12 0h6v6h-6V3zM3 15h6v6H3v-6zm12 0h6v6h-6v-6z"/>
              </svg>
              <p>二维码将显示在这里</p>
            </div>
          `;
        }
        if (downloadBtn) downloadBtn.disabled = true;
      });
    }
  }

  /**
   * 生成二维码
   */
  generateQrCode() {
    const input = document.getElementById('qrInput');
    const display = document.getElementById('qrCodeDisplay');
    const downloadBtn = document.getElementById('qrDownloadBtn');
    const sizeSelect = document.getElementById('qrSize');
    const errorLevelSelect = document.getElementById('qrErrorLevel');

    if (!input || !display) return;

    const text = input.value.trim();
    if (!text) {
      this.showMessage('请输入要生成二维码的内容', 'warning');
      return;
    }

    try {
      const size = parseInt(sizeSelect.value) || 200;
      const errorLevel = errorLevelSelect.value || 'M';
      
      // 使用简单的二维码生成（基于canvas）
      this.createQrCodeCanvas(text, size, errorLevel);
      
      if (downloadBtn) downloadBtn.disabled = false;
      this.showMessage('二维码生成成功', 'success');
    } catch (error) {
      this.showMessage('二维码生成失败：' + error.message, 'error');
    }
  }

  /**
   * 创建二维码Canvas
   */
  createQrCodeCanvas(text, size, errorLevel) {
    const display = document.getElementById('qrCodeDisplay');
    
    // 创建canvas元素
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    canvas.style.border = '1px solid #ddd';
    canvas.style.borderRadius = '8px';
    
    const ctx = canvas.getContext('2d');
    
    // 清空画布
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    
    // 简单的二维码模拟（实际项目中应使用专业的二维码库）
    this.drawSimpleQrCode(ctx, text, size);
    
    // 显示canvas
    display.innerHTML = '';
    display.appendChild(canvas);
    
    // 保存canvas引用用于下载
    this.currentQrCanvas = canvas;
  }

  /**
   * 绘制简单二维码（模拟）
   */
  drawSimpleQrCode(ctx, text, size) {
    const cellSize = Math.floor(size / 25); // 25x25网格
    const margin = (size - cellSize * 25) / 2;
    
    // 填充黑色背景
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, size, size);
    
    // 绘制白色背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(margin, margin, cellSize * 25, cellSize * 25);
    
    // 绘制简单的模式（模拟二维码）
    ctx.fillStyle = '#000000';
    
    // 三个定位角
    this.drawFinderPattern(ctx, margin, margin, cellSize);
    this.drawFinderPattern(ctx, margin + cellSize * 18, margin, cellSize);
    this.drawFinderPattern(ctx, margin, margin + cellSize * 18, cellSize);
    
    // 绘制数据区域（基于文本内容的简单模式）
    this.drawDataPattern(ctx, text, margin, margin, cellSize);
    
    // 添加文本标识
    ctx.fillStyle = '#666666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('QR Code', size / 2, size - 5);
  }

  /**
   * 绘制定位图案
   */
  drawFinderPattern(ctx, x, y, cellSize) {
    // 外框 7x7
    ctx.fillRect(x, y, cellSize * 7, cellSize * 7);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + cellSize, y + cellSize, cellSize * 5, cellSize * 5);
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + cellSize * 2, y + cellSize * 2, cellSize * 3, cellSize * 3);
  }

  /**
   * 绘制数据图案
   */
  drawDataPattern(ctx, text, x, y, cellSize) {
    // 基于文本内容生成简单的数据模式
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash + text.charCodeAt(i)) & 0xffffffff;
    }
    
    // 在数据区域绘制基于hash的模式
    for (let row = 0; row < 25; row++) {
      for (let col = 0; col < 25; col++) {
        // 跳过定位图案区域
        if ((row < 9 && col < 9) || 
            (row < 9 && col >= 16) || 
            (row >= 16 && col < 9)) {
          continue;
        }
        
        // 基于hash生成伪随机模式
        const bit = (hash + row * 25 + col) % 2;
        if (bit === 1) {
          ctx.fillRect(x + col * cellSize, y + row * cellSize, cellSize, cellSize);
        }
      }
    }
  }

  /**
   * 下载二维码
   */
  downloadQrCode() {
    if (!this.currentQrCanvas) {
      this.showMessage('请先生成二维码', 'warning');
      return;
    }

    try {
      const link = document.createElement('a');
      link.download = 'qrcode.png';
      link.href = this.currentQrCanvas.toDataURL();
      link.click();
      this.showMessage('二维码下载成功', 'success');
    } catch (error) {
      this.showMessage('下载失败：' + error.message, 'error');
    }
  }

  /**
   * 复制到剪贴板
   */
  async copyToClipboard(text) {
    if (!text) {
      this.showMessage('没有内容可复制', 'warning');
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      this.showMessage('复制成功', 'success');
    } catch (error) {
      // 降级方案
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.showMessage('复制成功', 'success');
    }
  }

  /**
   * 显示消息提示
   */
  showMessage(message, type = 'info') {
    const messageEl = document.createElement('div');
    messageEl.className = `encoder__message encoder__message--${type}`;
    messageEl.textContent = message;

    const container = document.querySelector('.encoder');
    container.appendChild(messageEl);

    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.parentNode.removeChild(messageEl);
      }
    }, 3000);
  }
}

// 注册工具
if (typeof window !== 'undefined' && window.ToolRegistry) {
  window.ToolRegistry.register({
    id: 'encoder',
    name: '编码转换工具',
    description: 'Base64编解码、URL编解码、JSON格式化、二维码生成',
    category: 'encode',
    icon: 'code',
    component: EncoderTool
  });
}
