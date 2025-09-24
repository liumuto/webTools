'use strict';

/**
 * 时间显示工具
 * 显示网络时间、时区转换、时间戳转换、倒计时功能
 */
class TimeDisplayTool {
  constructor() {
    this.timezones = [
      { name: 'UTC', offset: 0, label: '协调世界时 (UTC)' },
      { name: 'CST', offset: 8, label: '中国标准时间 (UTC+8)' },
      { name: 'EST', offset: -5, label: '美国东部时间 (UTC-5)' },
      { name: 'PST', offset: -8, label: '美国太平洋时间 (UTC-8)' },
      { name: 'JST', offset: 9, label: '日本标准时间 (UTC+9)' },
      { name: 'GMT', offset: 0, label: '格林威治时间 (GMT)' },
      { name: 'CET', offset: 1, label: '中欧时间 (UTC+1)' },
      { name: 'AEST', offset: 10, label: '澳大利亚东部时间 (UTC+10)' }
    ];
    
    this.currentTime = new Date();
    this.selectedTimezone = 'CST';
    this.countdownTimer = null;
    this.timeUpdateInterval = null;
    this.countdownInterval = null;
  }

  /**
   * 渲染工具界面
   */
  render() {
    return `
      <div class="time-display">
        <div class="time-display__section">
          <h3 class="time-display__title">当前时间</h3>
          <div class="time-display__current-time">
            <div class="time-display__time-info">
              <div class="time-display__timezone-selector">
                <label class="time-display__label" for="timezoneSelect">时区选择：</label>
                <select id="timezoneSelect" class="time-display__select">
                  ${this.timezones.map(tz => 
                    `<option value="${tz.name}" ${tz.name === this.selectedTimezone ? 'selected' : ''}>${tz.label}</option>`
                  ).join('')}
                </select>
              </div>
              
              <div class="time-display__time-display">
                <div class="time-display__main-time" id="mainTime">--:--:--</div>
                <div class="time-display__date" id="currentDate">----年--月--日</div>
                <div class="time-display__timezone" id="currentTimezone">中国标准时间</div>
              </div>
              
              <div class="time-display__timestamp-info">
                <div class="time-display__timestamp-item">
                  <label>时间戳 (秒)：</label>
                  <input type="text" id="timestampSeconds" class="time-display__input" readonly>
                  <button class="time-display__btn time-display__btn--small" onclick="navigator.clipboard.writeText(document.getElementById('timestampSeconds').value)">
                    复制
                  </button>
                </div>
                <div class="time-display__timestamp-item">
                  <label>时间戳 (毫秒)：</label>
                  <input type="text" id="timestampMilliseconds" class="time-display__input" readonly>
                  <button class="time-display__btn time-display__btn--small" onclick="navigator.clipboard.writeText(document.getElementById('timestampMilliseconds').value)">
                    复制
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="time-display__section">
          <h3 class="time-display__title">时间戳转换</h3>
          <div class="time-display__converter">
            <div class="time-display__converter-input">
              <label class="time-display__label" for="timestampInput">时间戳：</label>
              <input type="text" id="timestampInput" class="time-display__input" placeholder="输入时间戳（秒或毫秒）">
              <button id="convertBtn" class="time-display__btn time-display__btn--primary">转换</button>
            </div>
            
            <div class="time-display__converter-result">
              <div class="time-display__result-item">
                <label>转换结果：</label>
                <div id="convertedTime" class="time-display__result">--</div>
              </div>
            </div>
          </div>
        </div>

        <div class="time-display__section">
          <h3 class="time-display__title">倒计时器</h3>
          <div class="time-display__countdown">
            <div class="time-display__countdown-input">
              <div class="time-display__input-group">
                <label class="time-display__label">目标时间：</label>
                <input type="datetime-local" id="targetDateTime" class="time-display__input">
              </div>
              <div class="time-display__input-group">
                <label class="time-display__label">或倒计时时长：</label>
                <div class="time-display__duration-inputs">
                  <input type="number" id="countdownHours" class="time-display__input time-display__input--small" placeholder="时" min="0">
                  <span>:</span>
                  <input type="number" id="countdownMinutes" class="time-display__input time-display__input--small" placeholder="分" min="0" max="59">
                  <span>:</span>
                  <input type="number" id="countdownSeconds" class="time-display__input time-display__input--small" placeholder="秒" min="0" max="59">
                </div>
              </div>
            </div>
            
            <div class="time-display__countdown-controls">
              <button id="startCountdownBtn" class="time-display__btn time-display__btn--primary">开始倒计时</button>
              <button id="stopCountdownBtn" class="time-display__btn time-display__btn--secondary" disabled>停止</button>
              <button id="resetCountdownBtn" class="time-display__btn time-display__btn--secondary">重置</button>
            </div>
            
            <div class="time-display__countdown-display">
              <div id="countdownDisplay" class="time-display__countdown-time">00:00:00</div>
              <div id="countdownStatus" class="time-display__countdown-status">未开始</div>
            </div>
          </div>
        </div>

        <div class="time-display__section">
          <h3 class="time-display__title">时区对比</h3>
          <div class="time-display__timezone-comparison">
            <div class="time-display__comparison-grid">
              ${this.timezones.map(tz => `
                <div class="time-display__comparison-item">
                  <div class="time-display__comparison-name">${tz.name}</div>
                  <div class="time-display__comparison-time" data-timezone="${tz.name}">--:--:--</div>
                  <div class="time-display__comparison-date" data-timezone="${tz.name}">----/--/--</div>
                </div>
              `).join('')}
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
    this.initTimeDisplay();
    this.initTimestampConverter();
    this.initCountdown();
    this.initTimezoneComparison();
  }

  /**
   * 初始化时间显示
   */
  initTimeDisplay() {
    const timezoneSelect = document.getElementById('timezoneSelect');
    
    if (timezoneSelect) {
      timezoneSelect.addEventListener('change', (e) => {
        this.selectedTimezone = e.target.value;
        this.updateCurrentTime();
      });
    }

    // 开始时间更新
    this.updateCurrentTime();
    this.timeUpdateInterval = setInterval(() => {
      this.updateCurrentTime();
      this.updateTimezoneComparison();
    }, 1000);
  }

  /**
   * 更新当前时间显示
   */
  updateCurrentTime() {
    const now = new Date();
    const timezone = this.timezones.find(tz => tz.name === this.selectedTimezone);
    
    if (!timezone) return;

    // 计算目标时区时间
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const targetTime = new Date(utcTime + (timezone.offset * 3600000));

    // 更新显示
    const mainTime = document.getElementById('mainTime');
    const currentDate = document.getElementById('currentDate');
    const currentTimezone = document.getElementById('currentTimezone');
    const timestampSeconds = document.getElementById('timestampSeconds');
    const timestampMilliseconds = document.getElementById('timestampMilliseconds');

    if (mainTime) {
      mainTime.textContent = this.formatTime(targetTime);
    }

    if (currentDate) {
      currentDate.textContent = this.formatDate(targetTime);
    }

    if (currentTimezone) {
      currentTimezone.textContent = timezone.label;
    }

    if (timestampSeconds) {
      timestampSeconds.value = Math.floor(now.getTime() / 1000);
    }

    if (timestampMilliseconds) {
      timestampMilliseconds.value = now.getTime();
    }
  }

  /**
   * 初始化时间戳转换
   */
  initTimestampConverter() {
    const timestampInput = document.getElementById('timestampInput');
    const convertBtn = document.getElementById('convertBtn');

    if (convertBtn) {
      convertBtn.addEventListener('click', () => {
        this.convertTimestamp();
      });
    }

    if (timestampInput) {
      timestampInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.convertTimestamp();
        }
      });
    }
  }

  /**
   * 转换时间戳
   */
  convertTimestamp() {
    const timestampInput = document.getElementById('timestampInput');
    const convertedTime = document.getElementById('convertedTime');

    if (!timestampInput || !convertedTime) return;

    const input = timestampInput.value.trim();
    if (!input) {
      this.showMessage('请输入时间戳', 'warning');
      return;
    }

    try {
      let timestamp = parseInt(input);
      
      // 判断是秒还是毫秒时间戳
      if (timestamp < 10000000000) {
        // 秒时间戳
        timestamp *= 1000;
      }

      const date = new Date(timestamp);
      
      if (isNaN(date.getTime())) {
        throw new Error('无效的时间戳');
      }

      const timezone = this.timezones.find(tz => tz.name === this.selectedTimezone);
      const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
      const targetTime = new Date(utcTime + (timezone.offset * 3600000));

      convertedTime.innerHTML = `
        <div class="time-display__converted-item">
          <strong>日期时间：</strong>${this.formatDate(targetTime)} ${this.formatTime(targetTime)}
        </div>
        <div class="time-display__converted-item">
          <strong>时区：</strong>${timezone.label}
        </div>
        <div class="time-display__converted-item">
          <strong>原始时间戳：</strong>${input}
        </div>
      `;

    } catch (error) {
      convertedTime.innerHTML = `<div class="time-display__error">转换失败：${error.message}</div>`;
    }
  }

  /**
   * 初始化倒计时
   */
  initCountdown() {
    const startBtn = document.getElementById('startCountdownBtn');
    const stopBtn = document.getElementById('stopCountdownBtn');
    const resetBtn = document.getElementById('resetCountdownBtn');
    const targetDateTime = document.getElementById('targetDateTime');

    if (startBtn) {
      startBtn.addEventListener('click', () => {
        this.startCountdown();
      });
    }

    if (stopBtn) {
      stopBtn.addEventListener('click', () => {
        this.stopCountdown();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.resetCountdown();
      });
    }

    // 设置默认目标时间（1小时后）
    if (targetDateTime) {
      const defaultTime = new Date();
      defaultTime.setHours(defaultTime.getHours() + 1);
      targetDateTime.value = this.formatDateTimeLocal(defaultTime);
    }
  }

  /**
   * 开始倒计时
   */
  startCountdown() {
    const targetDateTime = document.getElementById('targetDateTime');
    const hoursInput = document.getElementById('countdownHours');
    const minutesInput = document.getElementById('countdownMinutes');
    const secondsInput = document.getElementById('countdownSeconds');
    const startBtn = document.getElementById('startCountdownBtn');
    const stopBtn = document.getElementById('stopCountdownBtn');

    let targetTime;

    if (targetDateTime.value) {
      // 使用指定日期时间
      targetTime = new Date(targetDateTime.value);
    } else {
      // 使用时长倒计时
      const hours = parseInt(hoursInput.value) || 0;
      const minutes = parseInt(minutesInput.value) || 0;
      const seconds = parseInt(secondsInput.value) || 0;

      if (hours === 0 && minutes === 0 && seconds === 0) {
        this.showMessage('请输入倒计时时长', 'warning');
        return;
      }

      targetTime = new Date();
      targetTime.setTime(targetTime.getTime() + (hours * 3600 + minutes * 60 + seconds) * 1000);
    }

    if (targetTime <= new Date()) {
      this.showMessage('目标时间不能早于当前时间', 'warning');
      return;
    }

    this.countdownTargetTime = targetTime;
    this.isCountdownRunning = true;

    // 更新按钮状态
    startBtn.disabled = true;
    stopBtn.disabled = false;

    // 开始倒计时更新
    this.updateCountdown();
    this.countdownInterval = setInterval(() => {
      this.updateCountdown();
    }, 1000);

    this.showMessage('倒计时已开始', 'success');
  }

  /**
   * 停止倒计时
   */
  stopCountdown() {
    this.isCountdownRunning = false;
    
    const startBtn = document.getElementById('startCountdownBtn');
    const stopBtn = document.getElementById('stopCountdownBtn');

    if (startBtn) startBtn.disabled = false;
    if (stopBtn) stopBtn.disabled = true;

    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }

    this.showMessage('倒计时已停止', 'info');
  }

  /**
   * 重置倒计时
   */
  resetCountdown() {
    this.stopCountdown();

    const countdownDisplay = document.getElementById('countdownDisplay');
    const countdownStatus = document.getElementById('countdownStatus');
    const targetDateTime = document.getElementById('targetDateTime');
    const hoursInput = document.getElementById('countdownHours');
    const minutesInput = document.getElementById('countdownSeconds');
    const secondsInput = document.getElementById('countdownSeconds');

    if (countdownDisplay) countdownDisplay.textContent = '00:00:00';
    if (countdownStatus) countdownStatus.textContent = '未开始';
    if (targetDateTime) targetDateTime.value = '';
    if (hoursInput) hoursInput.value = '';
    if (minutesInput) minutesInput.value = '';
    if (secondsInput) secondsInput.value = '';

    this.countdownTargetTime = null;
    this.isCountdownRunning = false;
  }

  /**
   * 更新倒计时显示
   */
  updateCountdown() {
    if (!this.isCountdownRunning || !this.countdownTargetTime) return;

    const now = new Date();
    const diff = this.countdownTargetTime - now;

    const countdownDisplay = document.getElementById('countdownDisplay');
    const countdownStatus = document.getElementById('countdownStatus');

    if (diff <= 0) {
      // 倒计时结束
      if (countdownDisplay) countdownDisplay.textContent = '00:00:00';
      if (countdownStatus) countdownStatus.textContent = '倒计时结束！';
      
      this.stopCountdown();
      this.showMessage('倒计时结束！', 'success');
      return;
    }

    // 计算剩余时间
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (countdownDisplay) {
      countdownDisplay.textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    if (countdownStatus) {
      countdownStatus.textContent = '倒计时中...';
    }
  }

  /**
   * 初始化时区对比
   */
  initTimezoneComparison() {
    this.updateTimezoneComparison();
  }

  /**
   * 更新时区对比显示
   */
  updateTimezoneComparison() {
    const now = new Date();

    this.timezones.forEach(timezone => {
      const timeElements = document.querySelectorAll(`[data-timezone="${timezone.name}"]`);
      const timeElement = timeElements[0];
      const dateElement = timeElements[1];

      if (timeElement || dateElement) {
        const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
        const targetTime = new Date(utcTime + (timezone.offset * 3600000));

        if (timeElement) {
          timeElement.textContent = this.formatTime(targetTime);
        }

        if (dateElement) {
          dateElement.textContent = this.formatDateShort(targetTime);
        }
      }
    });
  }

  /**
   * 格式化时间
   */
  formatTime(date) {
    return date.toLocaleTimeString('zh-CN', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  /**
   * 格式化日期
   */
  formatDate(date) {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'long'
    });
  }

  /**
   * 格式化短日期
   */
  formatDateShort(date) {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  /**
   * 格式化日期时间本地输入
   */
  formatDateTimeLocal(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  /**
   * 显示消息提示
   */
  showMessage(message, type = 'info') {
    const messageEl = document.createElement('div');
    messageEl.className = `time-display__message time-display__message--${type}`;
    messageEl.textContent = message;

    const container = document.querySelector('.time-display');
    container.appendChild(messageEl);

    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.parentNode.removeChild(messageEl);
      }
    }, 3000);
  }

  /**
   * 清理定时器
   */
  destroy() {
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
    }
    
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}

// 导出到全局作用域
if (typeof window !== 'undefined') {
  window.TimeDisplayTool = TimeDisplayTool;
  console.log('✅ TimeDisplayTool 已导出到全局作用域');
} else {
  console.warn('⚠️ window 对象不可用，无法导出 TimeDisplayTool');
}

// 注册工具
if (typeof window !== 'undefined' && window.ToolRegistry) {
  window.ToolRegistry.register({
    id: 'time-display',
    name: '网络时间显示',
    description: '显示当前网络时间，支持时区转换、时间戳转换和倒计时功能',
    category: 'time',
    icon: 'clock',
    component: TimeDisplayTool
  });
}
