'use strict';

/**
 * 颜色选择器工具
 * 支持HEX/RGB/HSL格式转换、配色方案、渐变生成器
 */
class ColorPickerTool {
  constructor() {
    this.currentColor = '#3498db';
    this.colorHistory = [];
    this.maxHistory = 10;
    this.gradientStops = [
      { color: '#ff6b6b', position: 0 },
      { color: '#4ecdc4', position: 100 }
    ];
  }

  /**
   * 渲染工具界面
   */
  render() {
    return `
      <div class="color-picker">
        <div class="color-picker__main">
          <div class="color-picker__section">
            <h3 class="color-picker__title">颜色选择器</h3>
            
            <div class="color-picker__picker-area">
              <div class="color-picker__canvas-container">
                <canvas id="colorCanvas" class="color-picker__canvas" width="300" height="200"></canvas>
                <div id="colorPointer" class="color-picker__pointer"></div>
              </div>
              
              <div class="color-picker__hue-slider">
                <canvas id="hueCanvas" class="color-picker__hue-canvas" width="300" height="20"></canvas>
                <div id="huePointer" class="color-picker__hue-pointer"></div>
              </div>
              
              <div class="color-picker__alpha-slider">
                <canvas id="alphaCanvas" class="color-picker__alpha-canvas" width="300" height="20"></canvas>
                <div id="alphaPointer" class="color-picker__alpha-pointer"></div>
              </div>
            </div>
            
            <div class="color-picker__preview">
              <div id="colorPreview" class="color-picker__preview-color" style="background-color: ${this.currentColor};"></div>
              <div class="color-picker__preview-text">
                <span class="color-picker__preview-label">当前颜色</span>
              </div>
            </div>
          </div>

          <div class="color-picker__section">
            <h3 class="color-picker__title">颜色格式</h3>
            
            <div class="color-picker__formats">
              <div class="color-picker__format-group">
                <label class="color-picker__label" for="hexInput">HEX:</label>
                <input type="text" id="hexInput" class="color-picker__input" value="${this.currentColor}">
              </div>
              
              <div class="color-picker__format-group">
                <label class="color-picker__label" for="rgbInput">RGB:</label>
                <input type="text" id="rgbInput" class="color-picker__input" readonly>
              </div>
              
              <div class="color-picker__format-group">
                <label class="color-picker__label" for="hslInput">HSL:</label>
                <input type="text" id="hslInput" class="color-picker__input" readonly>
              </div>
              
              <div class="color-picker__format-group">
                <label class="color-picker__label" for="rgbaInput">RGBA:</label>
                <input type="text" id="rgbaInput" class="color-picker__input" readonly>
              </div>
            </div>
            
            <div class="color-picker__actions">
              <button id="copyHexBtn" class="color-picker__btn color-picker__btn--primary">复制HEX</button>
              <button id="copyRgbBtn" class="color-picker__btn color-picker__btn--secondary">复制RGB</button>
              <button id="copyHslBtn" class="color-picker__btn color-picker__btn--secondary">复制HSL</button>
            </div>
          </div>
        </div>

        <div class="color-picker__sidebar">
          <div class="color-picker__section">
            <h3 class="color-picker__title">颜色历史</h3>
            <div id="colorHistory" class="color-picker__history">
              <div class="color-picker__history-placeholder">暂无颜色历史</div>
            </div>
            <button id="clearHistoryBtn" class="color-picker__btn color-picker__btn--small">清空历史</button>
          </div>

          <div class="color-picker__section">
            <h3 class="color-picker__title">配色方案</h3>
            <div class="color-picker__scheme-options">
              <button class="color-picker__scheme-btn color-picker__scheme-btn--active" data-scheme="monochromatic">单色</button>
              <button class="color-picker__scheme-btn" data-scheme="complementary">互补</button>
              <button class="color-picker__scheme-btn" data-scheme="triadic">三色</button>
              <button class="color-picker__scheme-btn" data-scheme="analogous">邻近</button>
            </div>
            <div id="colorScheme" class="color-picker__scheme">
              <!-- 配色方案将在这里显示 -->
            </div>
          </div>

          <div class="color-picker__section">
            <h3 class="color-picker__title">渐变生成器</h3>
            
            <div class="color-picker__gradient-controls">
              <div class="color-picker__gradient-stops" id="gradientStops">
                <!-- 渐变控制点将在这里显示 -->
              </div>
              
              <div class="color-picker__gradient-actions">
                <button id="addStopBtn" class="color-picker__btn color-picker__btn--small">添加色标</button>
                <button id="randomGradientBtn" class="color-picker__btn color-picker__btn--small">随机渐变</button>
              </div>
            </div>
            
            <div class="color-picker__gradient-preview">
              <div id="gradientPreview" class="color-picker__gradient-canvas"></div>
            </div>
            
            <div class="color-picker__gradient-code">
              <label class="color-picker__label">CSS代码:</label>
              <textarea id="gradientCode" class="color-picker__textarea" readonly></textarea>
              <button id="copyGradientBtn" class="color-picker__btn color-picker__btn--small">复制CSS</button>
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
    this.initColorPicker();
    this.initColorFormats();
    this.initColorHistory();
    this.initColorScheme();
    this.initGradientGenerator();
    this.updateColorFormats();
    this.updateColorScheme();
    this.updateGradient();
  }

  /**
   * 初始化颜色选择器
   */
  initColorPicker() {
    this.drawColorCanvas();
    this.drawHueCanvas();
    this.drawAlphaCanvas();
    
    this.bindColorCanvasEvents();
    this.bindHueCanvasEvents();
    this.bindAlphaCanvasEvents();
    this.bindFormatInputEvents();
  }

  /**
   * 绘制颜色选择画布
   */
  drawColorCanvas() {
    const canvas = document.getElementById('colorCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // 绘制饱和度渐变（水平）
    const saturationGradient = ctx.createLinearGradient(0, 0, width, 0);
    saturationGradient.addColorStop(0, '#ffffff');
    saturationGradient.addColorStop(1, `hsl(${this.getHue()}, 100%, 50%)`);
    
    ctx.fillStyle = saturationGradient;
    ctx.fillRect(0, 0, width, height);
    
    // 绘制亮度渐变（垂直）
    const lightnessGradient = ctx.createLinearGradient(0, 0, 0, height);
    lightnessGradient.addColorStop(0, 'rgba(0,0,0,0)');
    lightnessGradient.addColorStop(1, 'rgba(0,0,0,1)');
    
    ctx.fillStyle = lightnessGradient;
    ctx.fillRect(0, 0, width, height);
    
    this.updateColorPointer();
  }

  /**
   * 绘制色相选择画布
   */
  drawHueCanvas() {
    const canvas = document.getElementById('hueCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    for (let i = 0; i <= 6; i++) {
      gradient.addColorStop(i / 6, `hsl(${i * 60}, 100%, 50%)`);
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    this.updateHuePointer();
  }

  /**
   * 绘制透明度选择画布
   */
  drawAlphaCanvas() {
    const canvas = document.getElementById('alphaCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // 绘制棋盘背景
    const checkerSize = 10;
    for (let x = 0; x < width; x += checkerSize) {
      for (let y = 0; y < height; y += checkerSize) {
        ctx.fillStyle = (x / checkerSize + y / checkerSize) % 2 ? '#ffffff' : '#cccccc';
        ctx.fillRect(x, y, checkerSize, checkerSize);
      }
    }
    
    // 绘制透明度渐变
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, this.currentColor + '00');
    gradient.addColorStop(1, this.currentColor + 'ff');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    this.updateAlphaPointer();
  }

  /**
   * 绑定颜色画布事件
   */
  bindColorCanvasEvents() {
    const canvas = document.getElementById('colorCanvas');
    const pointer = document.getElementById('colorPointer');
    
    if (!canvas || !pointer) return;
    
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = Math.max(0, Math.min(canvas.width, e.clientX - rect.left));
      const y = Math.max(0, Math.min(canvas.height, e.clientY - rect.top));
      
      const saturation = x / canvas.width;
      const lightness = 1 - (y / canvas.height);
      
      this.updateColorFromHSL(this.getHue(), saturation * 100, lightness * 100);
      this.updateColorPointer(x, y);
    };
    
    canvas.addEventListener('mousedown', (e) => {
      handleMouseMove(e);
      canvas.addEventListener('mousemove', handleMouseMove);
    });
    
    canvas.addEventListener('mouseup', () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
    });
    
    canvas.addEventListener('click', handleMouseMove);
  }

  /**
   * 绑定色相画布事件
   */
  bindHueCanvasEvents() {
    const canvas = document.getElementById('hueCanvas');
    const pointer = document.getElementById('huePointer');
    
    if (!canvas || !pointer) return;
    
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = Math.max(0, Math.min(canvas.width, e.clientX - rect.left));
      
      const hue = (x / canvas.width) * 360;
      this.updateColorFromHSL(hue, this.getSaturation(), this.getLightness());
      this.updateHuePointer(x);
      this.drawColorCanvas();
    };
    
    canvas.addEventListener('mousedown', (e) => {
      handleMouseMove(e);
      canvas.addEventListener('mousemove', handleMouseMove);
    });
    
    canvas.addEventListener('mouseup', () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
    });
    
    canvas.addEventListener('click', handleMouseMove);
  }

  /**
   * 绑定透明度画布事件
   */
  bindAlphaCanvasEvents() {
    const canvas = document.getElementById('alphaCanvas');
    const pointer = document.getElementById('alphaPointer');
    
    if (!canvas || !pointer) return;
    
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = Math.max(0, Math.min(canvas.width, e.clientX - rect.left));
      
      const alpha = x / canvas.width;
      this.updateAlpha(alpha);
      this.updateAlphaPointer(x);
    };
    
    canvas.addEventListener('mousedown', (e) => {
      handleMouseMove(e);
      canvas.addEventListener('mousemove', handleMouseMove);
    });
    
    canvas.addEventListener('mouseup', () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
    });
    
    canvas.addEventListener('click', handleMouseMove);
  }

  /**
   * 绑定格式输入事件
   */
  bindFormatInputEvents() {
    const hexInput = document.getElementById('hexInput');
    
    if (hexInput) {
      hexInput.addEventListener('input', (e) => {
        const value = e.target.value;
        if (this.isValidHex(value)) {
          this.currentColor = value.startsWith('#') ? value : '#' + value;
          this.updateColorPreview();
          this.updateColorFormats();
          this.drawColorCanvas();
          this.drawHueCanvas();
          this.drawAlphaCanvas();
          this.updateColorScheme();
        }
      });
    }
  }

  /**
   * 初始化颜色格式功能
   */
  initColorFormats() {
    const copyHexBtn = document.getElementById('copyHexBtn');
    const copyRgbBtn = document.getElementById('copyRgbBtn');
    const copyHslBtn = document.getElementById('copyHslBtn');

    if (copyHexBtn) {
      copyHexBtn.addEventListener('click', () => {
        this.copyToClipboard(document.getElementById('hexInput').value);
      });
    }

    if (copyRgbBtn) {
      copyRgbBtn.addEventListener('click', () => {
        this.copyToClipboard(document.getElementById('rgbInput').value);
      });
    }

    if (copyHslBtn) {
      copyHslBtn.addEventListener('click', () => {
        this.copyToClipboard(document.getElementById('hslInput').value);
      });
    }
  }

  /**
   * 初始化颜色历史功能
   */
  initColorHistory() {
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    
    if (clearHistoryBtn) {
      clearHistoryBtn.addEventListener('click', () => {
        this.colorHistory = [];
        this.updateColorHistory();
      });
    }
    
    this.updateColorHistory();
  }

  /**
   * 初始化配色方案功能
   */
  initColorScheme() {
    const schemeBtns = document.querySelectorAll('.color-picker__scheme-btn');
    
    schemeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        schemeBtns.forEach(b => b.classList.remove('color-picker__scheme-btn--active'));
        e.target.classList.add('color-picker__scheme-btn--active');
        this.updateColorScheme(e.target.dataset.scheme);
      });
    });
  }

  /**
   * 初始化渐变生成器
   */
  initGradientGenerator() {
    const addStopBtn = document.getElementById('addStopBtn');
    const randomGradientBtn = document.getElementById('randomGradientBtn');
    const copyGradientBtn = document.getElementById('copyGradientBtn');
    
    if (addStopBtn) {
      addStopBtn.addEventListener('click', () => {
        this.addGradientStop();
      });
    }
    
    if (randomGradientBtn) {
      randomGradientBtn.addEventListener('click', () => {
        this.generateRandomGradient();
      });
    }
    
    if (copyGradientBtn) {
      copyGradientBtn.addEventListener('click', () => {
        this.copyToClipboard(document.getElementById('gradientCode').value);
      });
    }
    
    this.updateGradientStops();
  }

  /**
   * 更新颜色格式显示
   */
  updateColorFormats() {
    const rgb = this.hexToRgb(this.currentColor);
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    const hexInput = document.getElementById('hexInput');
    const rgbInput = document.getElementById('rgbInput');
    const hslInput = document.getElementById('hslInput');
    const rgbaInput = document.getElementById('rgbaInput');
    
    if (hexInput) hexInput.value = this.currentColor;
    if (rgbInput) rgbInput.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    if (hslInput) hslInput.value = `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
    if (rgbaInput) rgbaInput.value = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`;
  }

  /**
   * 更新颜色预览
   */
  updateColorPreview() {
    const preview = document.getElementById('colorPreview');
    if (preview) {
      preview.style.backgroundColor = this.currentColor;
    }
  }

  /**
   * 更新颜色历史
   */
  updateColorHistory() {
    const historyContainer = document.getElementById('colorHistory');
    if (!historyContainer) return;
    
    if (this.colorHistory.length === 0) {
      historyContainer.innerHTML = '<div class="color-picker__history-placeholder">暂无颜色历史</div>';
      return;
    }
    
    historyContainer.innerHTML = this.colorHistory.map(color => `
      <div class="color-picker__history-item" style="background-color: ${color};" data-color="${color}">
        <span class="color-picker__history-color">${color}</span>
      </div>
    `).join('');
    
    // 绑定历史颜色点击事件
    historyContainer.querySelectorAll('.color-picker__history-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const color = e.currentTarget.dataset.color;
        this.currentColor = color;
        this.updateColorPreview();
        this.updateColorFormats();
        this.drawColorCanvas();
        this.drawHueCanvas();
        this.drawAlphaCanvas();
        this.updateColorScheme();
      });
    });
  }

  /**
   * 更新配色方案
   */
  updateColorScheme(scheme = 'monochromatic') {
    const schemeContainer = document.getElementById('colorScheme');
    if (!schemeContainer) return;
    
    const colors = this.generateColorScheme(this.currentColor, scheme);
    
    schemeContainer.innerHTML = colors.map(color => `
      <div class="color-picker__scheme-color" style="background-color: ${color};" data-color="${color}">
        <span class="color-picker__scheme-value">${color}</span>
      </div>
    `).join('');
    
    // 绑定配色方案点击事件
    schemeContainer.querySelectorAll('.color-picker__scheme-color').forEach(item => {
      item.addEventListener('click', (e) => {
        const color = e.currentTarget.dataset.color;
        this.selectColor(color);
      });
    });
  }

  /**
   * 更新渐变控制点
   */
  updateGradientStops() {
    const stopsContainer = document.getElementById('gradientStops');
    if (!stopsContainer) return;
    
    stopsContainer.innerHTML = this.gradientStops.map((stop, index) => `
      <div class="color-picker__gradient-stop" data-index="${index}">
        <div class="color-picker__stop-color" style="background-color: ${stop.color};"></div>
        <input type="color" class="color-picker__stop-picker" value="${stop.color}" data-index="${index}">
        <input type="range" class="color-picker__stop-position" min="0" max="100" value="${stop.position}" data-index="${index}">
        <span class="color-picker__stop-label">${stop.position}%</span>
        ${this.gradientStops.length > 2 ? `<button class="color-picker__stop-remove" data-index="${index}">×</button>` : ''}
      </div>
    `).join('');
    
    // 绑定渐变控制点事件
    stopsContainer.querySelectorAll('.color-picker__stop-picker').forEach(picker => {
      picker.addEventListener('input', (e) => {
        const index = parseInt(e.target.dataset.index);
        this.gradientStops[index].color = e.target.value;
        this.updateGradient();
      });
    });
    
    stopsContainer.querySelectorAll('.color-picker__stop-position').forEach(slider => {
      slider.addEventListener('input', (e) => {
        const index = parseInt(e.target.dataset.index);
        this.gradientStops[index].position = parseInt(e.target.value);
        this.updateGradientStops();
        this.updateGradient();
      });
    });
    
    stopsContainer.querySelectorAll('.color-picker__stop-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        this.removeGradientStop(index);
      });
    });
  }

  /**
   * 更新渐变显示
   */
  updateGradient() {
    const preview = document.getElementById('gradientPreview');
    const code = document.getElementById('gradientCode');
    
    if (!preview || !code) return;
    
    // 排序渐变控制点
    const sortedStops = [...this.gradientStops].sort((a, b) => a.position - b.position);
    
    // 生成CSS渐变
    const gradientColors = sortedStops.map(stop => `${stop.color} ${stop.position}%`).join(', ');
    const gradientCSS = `linear-gradient(to right, ${gradientColors})`;
    
    preview.style.background = gradientCSS;
    code.value = `background: ${gradientCSS};`;
  }

  /**
   * 选择颜色
   */
  selectColor(color) {
    this.currentColor = color;
    this.addToHistory(color);
    this.updateColorPreview();
    this.updateColorFormats();
    this.drawColorCanvas();
    this.drawHueCanvas();
    this.drawAlphaCanvas();
    this.updateColorScheme();
  }

  /**
   * 添加到历史记录
   */
  addToHistory(color) {
    if (this.colorHistory.includes(color)) return;
    
    this.colorHistory.unshift(color);
    if (this.colorHistory.length > this.maxHistory) {
      this.colorHistory.pop();
    }
    this.updateColorHistory();
  }

  /**
   * 添加渐变控制点
   */
  addGradientStop() {
    if (this.gradientStops.length >= 5) {
      this.showMessage('最多只能添加5个色标', 'warning');
      return;
    }
    
    const newStop = {
      color: this.currentColor,
      position: Math.round(Math.random() * 100)
    };
    
    this.gradientStops.push(newStop);
    this.updateGradientStops();
    this.updateGradient();
  }

  /**
   * 移除渐变控制点
   */
  removeGradientStop(index) {
    if (this.gradientStops.length <= 2) {
      this.showMessage('至少需要2个色标', 'warning');
      return;
    }
    
    this.gradientStops.splice(index, 1);
    this.updateGradientStops();
    this.updateGradient();
  }

  /**
   * 生成随机渐变
   */
  generateRandomGradient() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
    this.gradientStops = [
      { color: colors[Math.floor(Math.random() * colors.length)], position: 0 },
      { color: colors[Math.floor(Math.random() * colors.length)], position: 100 }
    ];
    
    // 随机添加1-3个中间色标
    const numStops = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numStops; i++) {
      this.gradientStops.push({
        color: colors[Math.floor(Math.random() * colors.length)],
        position: Math.floor(Math.random() * 100)
      });
    }
    
    this.updateGradientStops();
    this.updateGradient();
  }

  /**
   * 生成配色方案
   */
  generateColorScheme(baseColor, scheme) {
    const hsl = this.hexToHsl(baseColor);
    const colors = [baseColor];
    
    switch (scheme) {
      case 'monochromatic':
        // 单色方案：改变饱和度和亮度
        colors.push(this.hslToHex(hsl.h, Math.max(0, hsl.s - 20), Math.max(0, hsl.l - 20)));
        colors.push(this.hslToHex(hsl.h, Math.min(100, hsl.s + 20), Math.min(100, hsl.l + 20)));
        colors.push(this.hslToHex(hsl.h, Math.max(0, hsl.s - 40), Math.max(0, hsl.l - 40)));
        colors.push(this.hslToHex(hsl.h, Math.min(100, hsl.s + 40), Math.min(100, hsl.l + 40)));
        break;
        
      case 'complementary':
        // 互补色方案
        const complementH = (hsl.h + 180) % 360;
        colors.push(this.hslToHex(complementH, hsl.s, hsl.l));
        colors.push(this.hslToHex(hsl.h, Math.max(0, hsl.s - 30), Math.max(0, hsl.l - 20)));
        colors.push(this.hslToHex(complementH, Math.max(0, hsl.s - 30), Math.max(0, hsl.l - 20)));
        colors.push(this.hslToHex(hsl.h, Math.min(100, hsl.s + 30), Math.min(100, hsl.l + 20)));
        break;
        
      case 'triadic':
        // 三色方案
        colors.push(this.hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l));
        colors.push(this.hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l));
        colors.push(this.hslToHex(hsl.h, Math.max(0, hsl.s - 20), Math.max(0, hsl.l - 10)));
        colors.push(this.hslToHex((hsl.h + 120) % 360, Math.max(0, hsl.s - 20), Math.max(0, hsl.l - 10)));
        break;
        
      case 'analogous':
        // 邻近色方案
        colors.push(this.hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l));
        colors.push(this.hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l));
        colors.push(this.hslToHex((hsl.h + 60) % 360, Math.max(0, hsl.s - 20), Math.max(0, hsl.l - 10)));
        colors.push(this.hslToHex((hsl.h - 60 + 360) % 360, Math.max(0, hsl.s - 20), Math.max(0, hsl.l - 10)));
        break;
    }
    
    return colors;
  }

  /**
   * 颜色转换工具方法
   */
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

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
      h: h * 360,
      s: s * 100,
      l: l * 100
    };
  }

  hexToHsl(hex) {
    const rgb = this.hexToRgb(hex);
    return this.rgbToHsl(rgb.r, rgb.g, rgb.b);
  }

  hslToHex(h, s, l) {
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
    
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    const toHex = (c) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  isValidHex(hex) {
    return /^#?[0-9A-Fa-f]{6}$/.test(hex);
  }

  getHue() {
    return this.hexToHsl(this.currentColor).h;
  }

  getSaturation() {
    return this.hexToHsl(this.currentColor).s;
  }

  getLightness() {
    return this.hexToHsl(this.currentColor).l;
  }

  updateColorFromHSL(h, s, l) {
    this.currentColor = this.hslToHex(h, s, l);
    this.updateColorPreview();
    this.updateColorFormats();
  }

  updateAlpha(alpha) {
    const rgb = this.hexToRgb(this.currentColor);
    const rgba = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
    
    const rgbaInput = document.getElementById('rgbaInput');
    if (rgbaInput) rgbaInput.value = rgba;
  }

  updateColorPointer(x = null, y = null) {
    const pointer = document.getElementById('colorPointer');
    const canvas = document.getElementById('colorCanvas');
    
    if (!pointer || !canvas) return;
    
    if (x === null || y === null) {
      const hsl = this.hexToHsl(this.currentColor);
      x = (hsl.s / 100) * canvas.width;
      y = (1 - hsl.l / 100) * canvas.height;
    }
    
    pointer.style.left = `${x - 8}px`;
    pointer.style.top = `${y - 8}px`;
  }

  updateHuePointer(x = null) {
    const pointer = document.getElementById('huePointer');
    const canvas = document.getElementById('hueCanvas');
    
    if (!pointer || !canvas) return;
    
    if (x === null) {
      x = (this.getHue() / 360) * canvas.width;
    }
    
    pointer.style.left = `${x - 8}px`;
  }

  updateAlphaPointer(x = null) {
    const pointer = document.getElementById('alphaPointer');
    const canvas = document.getElementById('alphaCanvas');
    
    if (!pointer || !canvas) return;
    
    if (x === null) {
      x = canvas.width; // 默认不透明度100%
    }
    
    pointer.style.left = `${x - 8}px`;
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
    messageEl.className = `color-picker__message color-picker__message--${type}`;
    messageEl.textContent = message;

    const container = document.querySelector('.color-picker');
    container.appendChild(messageEl);

    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.parentNode.removeChild(messageEl);
      }
    }, 3000);
  }
}

// 导出到全局作用域
if (typeof window !== 'undefined') {
  window.ColorPickerTool = ColorPickerTool;
  console.log('✅ ColorPickerTool 已导出到全局作用域');
} else {
  console.warn('⚠️ window 对象不可用，无法导出 ColorPickerTool');
}

// 注册工具
if (typeof window !== 'undefined' && window.ToolRegistry) {
  window.ToolRegistry.register({
    id: 'color-picker',
    name: '颜色选择器',
    description: 'HEX/RGB/HSL格式转换、配色方案、渐变生成器',
    category: 'color',
    icon: 'palette',
    component: ColorPickerTool
  });
}
