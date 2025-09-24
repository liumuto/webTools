'use strict';

/**
 * 日程提醒工具主类
 * 提供日程事件的创建、编辑、删除、导出等功能
 */
class CalendarReminderTool {
  constructor() {
    this.events = [];              // 事件列表
    this.categories = [            // 预设分类
      { id: 'work', name: '工作', color: '#3498db' },
      { id: 'personal', name: '个人', color: '#e74c3c' },
      { id: 'study', name: '学习', color: '#2ecc71' },
      { id: 'entertainment', name: '娱乐', color: '#f39c12' },
      { id: 'other', name: '其他', color: '#95a5a6' }
    ];
    this.reminderOptions = [       // 提醒选项
      { value: 5, label: '提前5分钟' },
      { value: 15, label: '提前15分钟' },
      { value: 30, label: '提前30分钟' },
      { value: 60, label: '提前1小时' },
      { value: 1440, label: '提前1天' }
    ];
    this.repeatOptions = [         // 重复选项
      { value: 'none', label: '不重复' },
      { value: 'daily', label: '每天' },
      { value: 'weekly', label: '每周' },
      { value: 'monthly', label: '每月' },
      { value: 'yearly', label: '每年' }
    ];
    this.currentFilter = {
      search: '',
      category: 'all',
      timeRange: 'all'
    };
    this.editingEventId = null;
    
    this.init();
  }

  /**
   * 初始化工具
   */
  init() {
    this.loadFromLocalStorage();
    // 不在这里调用render，由外部调用
  }

  /**
   * 渲染主界面
   */
  render() {
    return `
      <div class="calendar-reminder">
        <!-- 头部工具栏 -->
        <div class="calendar-reminder__header">
          <h2 class="calendar-reminder__title">📅 日程提醒工具</h2>
          <div class="calendar-reminder__toolbar">
            <div class="calendar-reminder__search">
              <input type="text" id="search-input" placeholder="搜索事件..." class="calendar-reminder__search-input">
              <button class="calendar-reminder__search-btn">🔍</button>
            </div>
            <select id="category-filter" class="calendar-reminder__filter">
              <option value="all">所有分类</option>
              ${this.categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('')}
            </select>
            <select id="time-filter" class="calendar-reminder__filter">
              <option value="all">所有时间</option>
              <option value="today">今天</option>
              <option value="week">本周</option>
              <option value="month">本月</option>
            </select>
            <button id="add-event-btn" class="calendar-reminder__btn calendar-reminder__btn--primary">+ 添加事件</button>
          </div>
        </div>

        <!-- 事件列表 -->
        <div class="calendar-reminder__content">
          <div class="calendar-reminder__events-header">
            <span class="calendar-reminder__events-count">事件列表 (共 ${this.events.length} 个事件)</span>
            <div class="calendar-reminder__bulk-actions">
              <button id="bulk-export-btn" class="calendar-reminder__btn calendar-reminder__btn--secondary">📤 批量导出</button>
              <button id="clear-all-btn" class="calendar-reminder__btn calendar-reminder__btn--danger">🗑️ 清空所有</button>
            </div>
          </div>
          <div id="events-list" class="calendar-reminder__events-list">
            ${this.renderEventsList()}
          </div>
        </div>

        <!-- 底部操作栏 -->
        <div class="calendar-reminder__footer">
          <button id="import-btn" class="calendar-reminder__btn calendar-reminder__btn--secondary">📥 导入</button>
          <button id="settings-btn" class="calendar-reminder__btn calendar-reminder__btn--secondary">⚙️ 设置</button>
        </div>
      </div>

      <!-- 事件表单模态框 -->
      <div id="event-modal" class="calendar-reminder__modal">
        <div class="calendar-reminder__modal-content">
          <div class="calendar-reminder__modal-header">
            <h3 id="modal-title">添加新事件</h3>
            <button id="close-modal" class="calendar-reminder__close-btn">×</button>
          </div>
          <div class="calendar-reminder__modal-body">
            ${this.renderEventForm()}
          </div>
        </div>
      </div>

      <!-- 导出设置模态框 -->
      <div id="export-modal" class="calendar-reminder__modal">
        <div class="calendar-reminder__modal-content">
          <div class="calendar-reminder__modal-header">
            <h3>📤 导出设置</h3>
            <button id="close-export-modal" class="calendar-reminder__close-btn">×</button>
          </div>
          <div class="calendar-reminder__modal-body">
            ${this.renderExportForm()}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 渲染事件列表
   */
  renderEventsList() {
    const filteredEvents = this.getFilteredEvents();
    
    if (filteredEvents.length === 0) {
      return `
        <div class="calendar-reminder__empty">
          <div class="calendar-reminder__empty-icon">📅</div>
          <div class="calendar-reminder__empty-text">暂无事件</div>
          <div class="calendar-reminder__empty-hint">点击"添加事件"开始创建您的日程</div>
        </div>
      `;
    }

    return filteredEvents.map(event => this.renderEventCard(event)).join('');
  }

  /**
   * 渲染单个事件卡片
   */
  renderEventCard(event) {
    const category = this.categories.find(cat => cat.id === event.category);
    const startTime = new Date(event.startTime);
    const endTime = new Date(event.endTime);
    const timeStr = this.formatEventTime(startTime, endTime);
    const reminderStr = this.getReminderText(event.reminder);

    return `
      <div class="calendar-reminder__event-card" data-event-id="${event.id}">
        <div class="calendar-reminder__event-header">
          <h4 class="calendar-reminder__event-title">${event.title}</h4>
          <div class="calendar-reminder__event-actions">
            <button class="calendar-reminder__action-btn" data-action="edit" data-event-id="${event.id}" title="编辑">✏️</button>
            <button class="calendar-reminder__action-btn" data-action="export" data-event-id="${event.id}" title="导出">📤</button>
            <button class="calendar-reminder__action-btn" data-action="delete" data-event-id="${event.id}" title="删除">🗑️</button>
          </div>
        </div>
        <div class="calendar-reminder__event-details">
          <div class="calendar-reminder__event-time">
            <span class="calendar-reminder__time-icon">🕐</span>
            <span class="calendar-reminder__time-text">${timeStr}</span>
          </div>
          <div class="calendar-reminder__event-category">
            <span class="calendar-reminder__category-icon" style="color: ${category.color}">🏷️</span>
            <span class="calendar-reminder__category-text">${category.name}</span>
          </div>
          <div class="calendar-reminder__event-reminder">
            <span class="calendar-reminder__reminder-icon">⏰</span>
            <span class="calendar-reminder__reminder-text">${reminderStr}</span>
          </div>
        </div>
        ${event.location ? `
          <div class="calendar-reminder__event-location">
            <span class="calendar-reminder__location-icon">📍</span>
            <span class="calendar-reminder__location-text">${event.location}</span>
          </div>
        ` : ''}
        ${event.description ? `
          <div class="calendar-reminder__event-description">
            <span class="calendar-reminder__description-icon">📝</span>
            <span class="calendar-reminder__description-text">${event.description}</span>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * 渲染事件表单
   */
  renderEventForm() {
    return `
      <form id="event-form" class="calendar-reminder__form">
        <div class="calendar-reminder__form-section">
          <h4>基本信息</h4>
          <div class="calendar-reminder__form-group">
            <label for="event-title" class="calendar-reminder__label">事件标题 *</label>
            <input type="text" id="event-title" class="calendar-reminder__input" required>
          </div>
          <div class="calendar-reminder__form-row">
            <div class="calendar-reminder__form-group">
              <label for="event-start-date" class="calendar-reminder__label">开始时间 *</label>
              <input type="date" id="event-start-date" class="calendar-reminder__input" required>
              <input type="time" id="event-start-time" class="calendar-reminder__input" required>
            </div>
            <div class="calendar-reminder__form-group">
              <label for="event-end-date" class="calendar-reminder__label">结束时间</label>
              <input type="date" id="event-end-date" class="calendar-reminder__input">
              <input type="time" id="event-end-time" class="calendar-reminder__input">
            </div>
          </div>
          <div class="calendar-reminder__form-group">
            <label for="event-location" class="calendar-reminder__label">位置</label>
            <input type="text" id="event-location" class="calendar-reminder__input" placeholder="如：会议室A">
          </div>
          <div class="calendar-reminder__form-group">
            <label for="event-category" class="calendar-reminder__label">分类</label>
            <select id="event-category" class="calendar-reminder__select">
              ${this.categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="calendar-reminder__form-section">
          <h4>提醒设置</h4>
          <div class="calendar-reminder__form-group">
            <label for="event-reminder" class="calendar-reminder__label">提醒时间</label>
            <select id="event-reminder" class="calendar-reminder__select">
              ${this.reminderOptions.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
            </select>
          </div>
          <div class="calendar-reminder__form-group">
            <label for="event-repeat" class="calendar-reminder__label">重复设置</label>
            <select id="event-repeat" class="calendar-reminder__select">
              ${this.repeatOptions.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="calendar-reminder__form-section">
          <h4>详细描述</h4>
          <div class="calendar-reminder__form-group">
            <textarea id="event-description" class="calendar-reminder__textarea" placeholder="输入事件描述..."></textarea>
          </div>
        </div>

        <div class="calendar-reminder__form-actions">
          <button type="submit" class="calendar-reminder__btn calendar-reminder__btn--primary">💾 保存</button>
          <button type="button" id="cancel-form" class="calendar-reminder__btn calendar-reminder__btn--secondary">❌ 取消</button>
        </div>
      </form>
    `;
  }

  /**
   * 渲染导出表单
   */
  renderExportForm() {
    return `
      <form id="export-form" class="calendar-reminder__form">
        <div class="calendar-reminder__form-section">
          <h4>选择事件</h4>
          <div class="calendar-reminder__form-group">
            <div class="calendar-reminder__checkbox-group">
              <label class="calendar-reminder__checkbox">
                <input type="checkbox" id="select-all" checked>
                <span>全选</span>
              </label>
              <label class="calendar-reminder__checkbox">
                <input type="checkbox" id="select-today">
                <span>今天</span>
              </label>
              <label class="calendar-reminder__checkbox">
                <input type="checkbox" id="select-week">
                <span>本周</span>
              </label>
              <label class="calendar-reminder__checkbox">
                <input type="checkbox" id="select-month">
                <span>本月</span>
              </label>
            </div>
          </div>
          <div class="calendar-reminder__form-row">
            <div class="calendar-reminder__form-group">
              <label for="export-start-date" class="calendar-reminder__label">开始日期</label>
              <input type="date" id="export-start-date" class="calendar-reminder__input">
            </div>
            <div class="calendar-reminder__form-group">
              <label for="export-end-date" class="calendar-reminder__label">结束日期</label>
              <input type="date" id="export-end-date" class="calendar-reminder__input">
            </div>
          </div>
        </div>

        <div class="calendar-reminder__form-section">
          <h4>导出格式</h4>
          <div class="calendar-reminder__form-group">
            <div class="calendar-reminder__radio-group">
              <label class="calendar-reminder__radio">
                <input type="radio" name="export-format" value="ics" checked>
                <span>📱 手机日历 (.ics) - iOS/Android/Google Calendar</span>
              </label>
              <label class="calendar-reminder__radio">
                <input type="radio" name="export-format" value="vcs">
                <span>💻 电脑日历 (.vcs) - Outlook/Windows Calendar</span>
              </label>
            </div>
          </div>
        </div>

        <div class="calendar-reminder__form-section">
          <h4>高级选项</h4>
          <div class="calendar-reminder__form-group">
            <div class="calendar-reminder__checkbox-group">
              <label class="calendar-reminder__checkbox">
                <input type="checkbox" id="include-reminders" checked>
                <span>包含提醒设置</span>
              </label>
              <label class="calendar-reminder__checkbox">
                <input type="checkbox" id="include-repeat" checked>
                <span>包含重复规则</span>
              </label>
              <label class="calendar-reminder__checkbox">
                <input type="checkbox" id="include-categories" checked>
                <span>包含分类信息</span>
              </label>
              <label class="calendar-reminder__checkbox">
                <input type="checkbox" id="include-location" checked>
                <span>包含位置信息</span>
              </label>
              <label class="calendar-reminder__checkbox">
                <input type="checkbox" id="include-description" checked>
                <span>包含描述信息</span>
              </label>
            </div>
          </div>
        </div>

        <div class="calendar-reminder__form-actions">
          <button type="submit" class="calendar-reminder__btn calendar-reminder__btn--primary">📤 开始导出</button>
          <button type="button" id="cancel-export" class="calendar-reminder__btn calendar-reminder__btn--secondary">❌ 取消</button>
        </div>
      </form>
    `;
  }

  /**
   * 绑定事件监听器
   */
  bindEvents() {
    console.log('开始绑定事件...');
    
    // 搜索功能
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.currentFilter.search = e.target.value;
        this.updateEventsList();
      });
      console.log('✅ 搜索功能绑定成功');
    }

    // 分类筛选
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
      categoryFilter.addEventListener('change', (e) => {
        this.currentFilter.category = e.target.value;
        this.updateEventsList();
      });
      console.log('✅ 分类筛选绑定成功');
    }

    // 时间筛选
    const timeFilter = document.getElementById('time-filter');
    if (timeFilter) {
      timeFilter.addEventListener('change', (e) => {
        this.currentFilter.timeRange = e.target.value;
        this.updateEventsList();
      });
      console.log('✅ 时间筛选绑定成功');
    }

    // 添加事件按钮
    const addEventBtn = document.getElementById('add-event-btn');
    if (addEventBtn) {
      addEventBtn.addEventListener('click', () => this.showEventForm());
      console.log('✅ 添加事件按钮绑定成功');
    }

    // 批量导出按钮
    const bulkExportBtn = document.getElementById('bulk-export-btn');
    if (bulkExportBtn) {
      bulkExportBtn.addEventListener('click', () => this.showExportForm());
      console.log('✅ 批量导出按钮绑定成功');
    }

    // 清空所有按钮
    const clearAllBtn = document.getElementById('clear-all-btn');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => this.clearAllEvents());
      console.log('✅ 清空所有按钮绑定成功');
    }

    // 模态框关闭
    const closeModal = document.getElementById('close-modal');
    const closeExportModal = document.getElementById('close-export-modal');
    const cancelForm = document.getElementById('cancel-form');
    const cancelExport = document.getElementById('cancel-export');

    if (closeModal) closeModal.addEventListener('click', () => this.hideEventForm());
    if (closeExportModal) closeExportModal.addEventListener('click', () => this.hideExportForm());
    if (cancelForm) cancelForm.addEventListener('click', () => this.hideEventForm());
    if (cancelExport) cancelExport.addEventListener('click', () => this.hideExportForm());

    // 事件表单提交
    const eventForm = document.getElementById('event-form');
    if (eventForm) {
      eventForm.addEventListener('submit', (e) => this.handleEventSubmit(e));
      console.log('✅ 事件表单绑定成功');
    }

    // 导出表单提交
    const exportForm = document.getElementById('export-form');
    if (exportForm) {
      exportForm.addEventListener('submit', (e) => this.handleExportSubmit(e));
      console.log('✅ 导出表单绑定成功');
    }

    // 点击模态框外部关闭
    const eventModal = document.getElementById('event-modal');
    const exportModal = document.getElementById('export-modal');
    
    if (eventModal) {
      eventModal.addEventListener('click', (e) => {
        if (e.target === eventModal) this.hideEventForm();
      });
    }
    
    if (exportModal) {
      exportModal.addEventListener('click', (e) => {
        if (e.target === exportModal) this.hideExportForm();
      });
    }

    // 事件卡片操作按钮 - 使用事件委托
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('calendar-reminder__action-btn')) {
        const action = e.target.dataset.action;
        const eventId = e.target.dataset.eventId;
        
        console.log('按钮点击:', action, eventId); // 调试日志
        
        switch (action) {
          case 'edit':
            this.editEvent(eventId);
            break;
          case 'export':
            this.exportEvent(eventId);
            break;
          case 'delete':
            this.deleteEvent(eventId);
            break;
        }
      }
    });
    console.log('✅ 事件委托绑定成功');

    // 导入按钮
    const importBtn = document.getElementById('import-btn');
    if (importBtn) {
      console.log('✅ 导入按钮绑定成功');
      importBtn.addEventListener('click', () => {
        console.log('📥 导入按钮被点击');
        this.importEvents();
      });
    } else {
      console.error('❌ 导入按钮未找到');
    }

    // 设置按钮
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
      console.log('✅ 设置按钮绑定成功');
      settingsBtn.addEventListener('click', () => {
        console.log('🔧 设置按钮被点击');
        this.showSettings();
      });
    } else {
      console.error('❌ 设置按钮未找到');
    }
    
    console.log('事件绑定完成');
  }

  /**
   * 获取筛选后的事件列表
   */
  getFilteredEvents() {
    let filtered = [...this.events];

    // 搜索筛选
    if (this.currentFilter.search) {
      const searchTerm = this.currentFilter.search.toLowerCase();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchTerm) ||
        (event.description && event.description.toLowerCase().includes(searchTerm)) ||
        (event.location && event.location.toLowerCase().includes(searchTerm))
      );
    }

    // 分类筛选
    if (this.currentFilter.category !== 'all') {
      filtered = filtered.filter(event => event.category === this.currentFilter.category);
    }

    // 时间范围筛选
    if (this.currentFilter.timeRange !== 'all') {
      const now = new Date();
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.startTime);
        switch (this.currentFilter.timeRange) {
          case 'today':
            return this.isSameDay(eventDate, now);
          case 'week':
            return this.isSameWeek(eventDate, now);
          case 'month':
            return this.isSameMonth(eventDate, now);
          default:
            return true;
        }
      });
    }

    // 按时间排序
    return filtered.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  }

  /**
   * 格式化事件时间
   */
  formatEventTime(startTime, endTime) {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const isToday = this.isSameDay(start, now);
    const isTomorrow = this.isSameDay(start, new Date(now.getTime() + 24 * 60 * 60 * 1000));
    
    let dateStr = '';
    if (isToday) {
      dateStr = '今天';
    } else if (isTomorrow) {
      dateStr = '明天';
    } else {
      dateStr = start.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
    
    const timeStr = `${start.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
    
    return `${dateStr} ${timeStr}`;
  }

  /**
   * 获取提醒文本
   */
  getReminderText(reminderMinutes) {
    const option = this.reminderOptions.find(opt => opt.value === reminderMinutes);
    return option ? option.label : '无提醒';
  }

  /**
   * 判断是否为同一天
   */
  isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  /**
   * 判断是否为同一周
   */
  isSameWeek(date1, date2) {
    const startOfWeek = new Date(date2);
    startOfWeek.setDate(date2.getDate() - date2.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return date1 >= startOfWeek && date1 <= endOfWeek;
  }

  /**
   * 判断是否为同一月
   */
  isSameMonth(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth();
  }

  /**
   * 显示事件表单
   */
  showEventForm(eventId = null) {
    this.editingEventId = eventId;
    const modal = document.getElementById('event-modal');
    const modalTitle = document.getElementById('modal-title');
    
    if (modalTitle) {
      modalTitle.textContent = eventId ? '编辑事件' : '添加新事件';
    }
    
    if (modal) {
      modal.style.display = 'flex';
      
      // 如果是编辑模式，填充表单数据
      if (eventId) {
        this.fillEventForm(eventId);
      } else {
        this.resetEventForm();
      }
    }
  }

  /**
   * 隐藏事件表单
   */
  hideEventForm() {
    const modal = document.getElementById('event-modal');
    if (modal) {
      modal.style.display = 'none';
    }
    this.editingEventId = null;
  }

  /**
   * 显示导出表单
   */
  showExportForm() {
    const modal = document.getElementById('export-modal');
    if (modal) {
      modal.style.display = 'flex';
    }
  }

  /**
   * 隐藏导出表单
   */
  hideExportForm() {
    const modal = document.getElementById('export-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  /**
   * 填充事件表单
   */
  fillEventForm(eventId) {
    const event = this.events.find(e => e.id === eventId);
    if (!event) return;

    const startTime = new Date(event.startTime);
    const endTime = new Date(event.endTime);

    document.getElementById('event-title').value = event.title;
    document.getElementById('event-start-date').value = startTime.toISOString().split('T')[0];
    document.getElementById('event-start-time').value = startTime.toTimeString().slice(0, 5);
    document.getElementById('event-end-date').value = endTime.toISOString().split('T')[0];
    document.getElementById('event-end-time').value = endTime.toTimeString().slice(0, 5);
    document.getElementById('event-location').value = event.location || '';
    document.getElementById('event-category').value = event.category;
    document.getElementById('event-reminder').value = event.reminder;
    document.getElementById('event-repeat').value = event.repeat;
    document.getElementById('event-description').value = event.description || '';
  }

  /**
   * 重置事件表单
   */
  resetEventForm() {
    const form = document.getElementById('event-form');
    if (form) {
      form.reset();
    }
    
    // 设置默认值
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    document.getElementById('event-start-date').value = now.toISOString().split('T')[0];
    document.getElementById('event-start-time').value = now.toTimeString().slice(0, 5);
    document.getElementById('event-end-date').value = now.toISOString().split('T')[0];
    document.getElementById('event-end-time').value = new Date(now.getTime() + 60 * 60 * 1000).toTimeString().slice(0, 5);
  }

  /**
   * 处理事件表单提交
   */
  handleEventSubmit(e) {
    e.preventDefault();
    
    const formData = {
      title: document.getElementById('event-title').value.trim(),
      startDate: document.getElementById('event-start-date').value,
      startTime: document.getElementById('event-start-time').value,
      endDate: document.getElementById('event-end-date').value,
      endTime: document.getElementById('event-end-time').value,
      location: document.getElementById('event-location').value.trim(),
      category: document.getElementById('event-category').value,
      reminder: parseInt(document.getElementById('event-reminder').value),
      repeat: document.getElementById('event-repeat').value,
      description: document.getElementById('event-description').value.trim()
    };

    // 验证必填字段
    if (!formData.title) {
      alert('请输入事件标题');
      return;
    }

    if (!formData.startDate || !formData.startTime) {
      alert('请选择开始时间');
      return;
    }

    // 构建事件数据
    const eventData = {
      id: this.editingEventId || this.generateEventId(),
      title: formData.title,
      startTime: new Date(`${formData.startDate}T${formData.startTime}`).toISOString(),
      endTime: formData.endDate && formData.endTime ? 
        new Date(`${formData.endDate}T${formData.endTime}`).toISOString() :
        new Date(`${formData.startDate}T${formData.startTime}`).toISOString(),
      location: formData.location,
      category: formData.category,
      reminder: formData.reminder,
      repeat: formData.repeat,
      description: formData.description,
      createdAt: this.editingEventId ? 
        this.events.find(e => e.id === this.editingEventId).createdAt :
        new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 保存事件
    if (this.editingEventId) {
      this.updateEvent(this.editingEventId, eventData);
    } else {
      this.addEvent(eventData);
    }

    this.hideEventForm();
    this.updateEventsList();
    this.saveToLocalStorage();
  }

  /**
   * 处理导出表单提交
   */
  handleExportSubmit(e) {
    e.preventDefault();
    
    const format = document.querySelector('input[name="export-format"]:checked').value;
    const includeReminders = document.getElementById('include-reminders').checked;
    const includeRepeat = document.getElementById('include-repeat').checked;
    const includeCategories = document.getElementById('include-categories').checked;
    const includeLocation = document.getElementById('include-location').checked;
    const includeDescription = document.getElementById('include-description').checked;

    // 获取要导出的事件
    const eventsToExport = this.getEventsToExport();
    
    if (eventsToExport.length === 0) {
      alert('没有选择要导出的事件');
      return;
    }

    // 导出事件
    this.exportEvents(eventsToExport, format, {
      includeReminders,
      includeRepeat,
      includeCategories,
      includeLocation,
      includeDescription
    });

    this.hideExportForm();
  }

  /**
   * 获取要导出的事件
   */
  getEventsToExport() {
    const selectAll = document.getElementById('select-all').checked;
    const selectToday = document.getElementById('select-today').checked;
    const selectWeek = document.getElementById('select-week').checked;
    const selectMonth = document.getElementById('select-month').checked;
    const startDate = document.getElementById('export-start-date').value;
    const endDate = document.getElementById('export-end-date').value;

    if (selectAll) {
      return this.events;
    }

    let events = [...this.events];
    const now = new Date();

    if (selectToday) {
      events = events.filter(event => this.isSameDay(new Date(event.startTime), now));
    } else if (selectWeek) {
      events = events.filter(event => this.isSameWeek(new Date(event.startTime), now));
    } else if (selectMonth) {
      events = events.filter(event => this.isSameMonth(new Date(event.startTime), now));
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      events = events.filter(event => {
        const eventDate = new Date(event.startTime);
        return eventDate >= start && eventDate <= end;
      });
    }

    return events;
  }

  /**
   * 添加事件
   */
  addEvent(eventData) {
    this.events.push(eventData);
  }

  /**
   * 更新事件
   */
  updateEvent(eventId, eventData) {
    const index = this.events.findIndex(e => e.id === eventId);
    if (index !== -1) {
      this.events[index] = eventData;
    }
  }

  /**
   * 删除事件
   */
  deleteEvent(eventId) {
    if (confirm('确定要删除这个事件吗？')) {
      this.events = this.events.filter(e => e.id !== eventId);
      this.updateEventsList();
      this.saveToLocalStorage();
    }
  }

  /**
   * 编辑事件
   */
  editEvent(eventId) {
    this.showEventForm(eventId);
  }

  /**
   * 导出单个事件
   */
  exportEvent(eventId) {
    console.log('导出事件被调用:', eventId);
    const event = this.events.find(e => e.id === eventId);
    if (event) {
      console.log('找到事件:', event);
      this.showSingleExportFormat(event);
    } else {
      console.error('未找到事件:', eventId);
    }
  }

  /**
   * 显示单条导出格式选择
   */
  showSingleExportFormat(event) {
    // 创建格式选择模态框
    const formatModal = document.createElement('div');
    formatModal.id = 'single-export-modal';
    formatModal.className = 'calendar-reminder__modal';
    formatModal.innerHTML = `
      <div class="calendar-reminder__modal-content">
        <div class="calendar-reminder__modal-header">
          <h3>📤 导出事件格式选择</h3>
          <button id="close-single-export-modal" class="calendar-reminder__close-btn">×</button>
        </div>
        <div class="calendar-reminder__modal-body">
          <div class="calendar-reminder__form-section">
            <h4>选择导出格式</h4>
            <div class="calendar-reminder__form-group">
              <div class="calendar-reminder__radio-group">
                <label class="calendar-reminder__radio">
                  <input type="radio" name="single-export-format" value="ics" checked>
                  <span>📱 手机日历 (.ics) - iOS/Android/Google Calendar</span>
                </label>
                <label class="calendar-reminder__radio">
                  <input type="radio" name="single-export-format" value="vcs">
                  <span>💻 电脑日历 (.vcs) - Outlook/Windows Calendar</span>
                </label>
                <label class="calendar-reminder__radio">
                  <input type="radio" name="single-export-format" value="json">
                  <span>📄 工具备份 (.json) - 完整数据备份</span>
                </label>
              </div>
            </div>
          </div>
          
          <div class="calendar-reminder__form-section">
            <h4>事件信息预览</h4>
            <div class="calendar-reminder__event-preview">
              <div class="calendar-reminder__event-preview-title">${event.title}</div>
              <div class="calendar-reminder__event-preview-time">
                ${this.formatEventTime(new Date(event.startTime), new Date(event.endTime))}
              </div>
              ${event.location ? `<div class="calendar-reminder__event-preview-location">📍 ${event.location}</div>` : ''}
              ${event.description ? `<div class="calendar-reminder__event-preview-description">${event.description}</div>` : ''}
            </div>
          </div>
          
          <div class="calendar-reminder__form-actions">
            <button id="confirm-single-export" class="calendar-reminder__btn calendar-reminder__btn--primary">📤 开始导出</button>
            <button id="cancel-single-export" class="calendar-reminder__btn calendar-reminder__btn--secondary">❌ 取消</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(formatModal);
    
    // 显示模态框
    formatModal.style.display = 'flex';
    
    // 绑定事件
    const closeBtn = document.getElementById('close-single-export-modal');
    const confirmBtn = document.getElementById('confirm-single-export');
    const cancelBtn = document.getElementById('cancel-single-export');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hideSingleExportFormat());
    }
    
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.hideSingleExportFormat());
    }
    
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        const format = document.querySelector('input[name="single-export-format"]:checked').value;
        this.exportEvents([event], format, {
          includeReminders: true,
          includeRepeat: true,
          includeCategories: true,
          includeLocation: true,
          includeDescription: true
        });
        this.hideSingleExportFormat();
      });
    }
    
    // 点击模态框外部关闭
    formatModal.addEventListener('click', (e) => {
      if (e.target === formatModal) this.hideSingleExportFormat();
    });
  }

  /**
   * 隐藏单条导出格式选择
   */
  hideSingleExportFormat() {
    const formatModal = document.getElementById('single-export-modal');
    if (formatModal) {
      formatModal.remove();
    }
  }

  /**
   * 导出事件
   */
  exportEvents(events, format, options = {}) {
    try {
      let content = '';
      let filename = '';

      if (format === 'ics') {
        content = this.generateICS(events, options);
        filename = `events_${new Date().toISOString().split('T')[0]}.ics`;
      } else if (format === 'vcs') {
        content = this.generateVCS(events, options);
        filename = `events_${new Date().toISOString().split('T')[0]}.vcs`;
      }

      // 创建下载链接
      const blob = new Blob([content], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert(`成功导出 ${events.length} 个事件到 ${filename}`);
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请重试');
    }
  }

  /**
   * 生成iCal格式
   */
  generateICS(events, options = {}) {
    let ics = 'BEGIN:VCALENDAR\r\n';
    ics += 'VERSION:2.0\r\n';
    ics += 'PRODID:-//WebTools//Calendar Reminder//EN\r\n';
    ics += 'CALSCALE:GREGORIAN\r\n';
    ics += 'METHOD:PUBLISH\r\n';

    events.forEach(event => {
      ics += 'BEGIN:VEVENT\r\n';
      ics += `UID:${event.id}@webtools.com\r\n`;
      ics += `DTSTART:${this.formatICSDate(event.startTime)}\r\n`;
      ics += `DTEND:${this.formatICSDate(event.endTime)}\r\n`;
      ics += `SUMMARY:${this.escapeICS(event.title)}\r\n`;
      
      if (options.includeDescription && event.description) {
        ics += `DESCRIPTION:${this.escapeICS(event.description)}\r\n`;
      }
      
      if (options.includeLocation && event.location) {
        ics += `LOCATION:${this.escapeICS(event.location)}\r\n`;
      }
      
      if (options.includeCategories && event.category) {
        const category = this.categories.find(cat => cat.id === event.category);
        if (category) {
          ics += `CATEGORIES:${this.escapeICS(category.name)}\r\n`;
        }
      }
      
      ics += `DTSTAMP:${this.formatICSDate(new Date().toISOString())}\r\n`;
      ics += `CREATED:${this.formatICSDate(event.createdAt)}\r\n`;
      ics += `LAST-MODIFIED:${this.formatICSDate(event.updatedAt)}\r\n`;
      
      if (options.includeReminders && event.reminder > 0) {
        ics += 'BEGIN:VALARM\r\n';
        ics += `TRIGGER:-PT${event.reminder}M\r\n`;
        ics += 'ACTION:DISPLAY\r\n';
        ics += `DESCRIPTION:提醒：${this.escapeICS(event.title)}\r\n`;
        ics += 'END:VALARM\r\n';
      }
      
      ics += 'END:VEVENT\r\n';
    });

    ics += 'END:VCALENDAR\r\n';
    return ics;
  }

  /**
   * 生成VCS格式
   */
  generateVCS(events, options = {}) {
    let vcs = 'BEGIN:VCALENDAR\r\n';
    vcs += 'VERSION:1.0\r\n';
    vcs += 'PRODID:-//WebTools//Calendar Reminder//EN\r\n';

    events.forEach(event => {
      vcs += 'BEGIN:VEVENT\r\n';
      vcs += `DTSTART:${this.formatICSDate(event.startTime)}\r\n`;
      vcs += `DTEND:${this.formatICSDate(event.endTime)}\r\n`;
      vcs += `SUMMARY:${this.escapeICS(event.title)}\r\n`;
      
      if (options.includeDescription && event.description) {
        vcs += `DESCRIPTION:${this.escapeICS(event.description)}\r\n`;
      }
      
      if (options.includeLocation && event.location) {
        vcs += `LOCATION:${this.escapeICS(event.location)}\r\n`;
      }
      
      if (options.includeCategories && event.category) {
        const category = this.categories.find(cat => cat.id === event.category);
        if (category) {
          vcs += `CATEGORIES:${this.escapeICS(category.name)}\r\n`;
        }
      }
      
      vcs += 'END:VEVENT\r\n';
    });

    vcs += 'END:VCALENDAR\r\n';
    return vcs;
  }

  /**
   * 格式化ICS日期
   */
  formatICSDate(dateString) {
    const date = new Date(dateString);
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  /**
   * 转义ICS特殊字符
   */
  escapeICS(text) {
    return text.replace(/[\\,;]/g, '\\$&').replace(/\n/g, '\\n');
  }

  /**
   * 生成事件ID
   */
  generateEventId() {
    return 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * 生成通用ID
   */
  generateId() {
    return Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * 清空所有事件
   */
  clearAllEvents() {
    if (confirm('确定要清空所有事件吗？此操作不可恢复！')) {
      this.events = [];
      this.updateEventsList();
      this.saveToLocalStorage();
    }
  }

  /**
   * 保存到本地存储
   */
  saveToLocalStorage() {
    try {
      localStorage.setItem('calendar_reminder_events', JSON.stringify(this.events));
    } catch (error) {
      console.error('保存到本地存储失败:', error);
    }
  }

  /**
   * 从本地存储加载
   */
  loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem('calendar_reminder_events');
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch (error) {
      console.error('从本地存储加载失败:', error);
      this.events = [];
    }
  }

  /**
   * 更新事件列表显示
   */
  updateEventsList() {
    const eventsList = document.getElementById('events-list');
    if (eventsList) {
      eventsList.innerHTML = this.renderEventsList();
    }
    
    this.updateEventsCount();
  }

  /**
   * 更新事件计数
   */
  updateEventsCount() {
    const eventsCount = document.querySelector('.calendar-reminder__events-count');
    if (eventsCount) {
      eventsCount.textContent = `事件列表 (共 ${this.events.length} 个事件)`;
    }
  }

  /**
   * 导入事件功能
   */
  importEvents() {
    console.log('导入事件被调用');
    this.showImportFormatHelp();
  }

  /**
   * 显示导入格式帮助
   */
  showImportFormatHelp() {
    // 创建导入帮助模态框
    const importModal = document.createElement('div');
    importModal.id = 'import-help-modal';
    importModal.className = 'calendar-reminder__modal';
    importModal.innerHTML = `
      <div class="calendar-reminder__modal-content">
        <div class="calendar-reminder__modal-header">
          <h3>📥 导入日程文件</h3>
          <button id="close-import-help-modal" class="calendar-reminder__close-btn">×</button>
        </div>
        <div class="calendar-reminder__modal-body">
          <div class="calendar-reminder__form-section">
            <h4>支持的导入格式</h4>
            <div class="calendar-reminder__format-list">
              <div class="calendar-reminder__format-item">
                <div class="calendar-reminder__format-icon">📄</div>
                <div class="calendar-reminder__format-info">
                  <div class="calendar-reminder__format-name">JSON 格式 (.json)</div>
                  <div class="calendar-reminder__format-desc">工具导出的完整备份文件，包含所有事件数据和设置</div>
                  <div class="calendar-reminder__format-compatibility">✅ 本工具专用格式，数据最完整</div>
                </div>
              </div>
              
              <div class="calendar-reminder__format-item">
                <div class="calendar-reminder__format-icon">📱</div>
                <div class="calendar-reminder__format-info">
                  <div class="calendar-reminder__format-name">ICS 格式 (.ics)</div>
                  <div class="calendar-reminder__format-desc">国际标准日历格式，广泛支持各种日历应用</div>
                  <div class="calendar-reminder__format-compatibility">✅ iOS Calendar、✅ Android Calendar、✅ Google Calendar、✅ Outlook</div>
                </div>
              </div>
              
              <div class="calendar-reminder__format-item">
                <div class="calendar-reminder__format-icon">💻</div>
                <div class="calendar-reminder__format-info">
                  <div class="calendar-reminder__format-name">VCS 格式 (.vcs)</div>
                  <div class="calendar-reminder__format-desc">微软日历格式，主要用于 Outlook 和 Windows Calendar</div>
                  <div class="calendar-reminder__format-compatibility">✅ Outlook、✅ Windows Calendar</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="calendar-reminder__form-section">
            <h4>导入说明</h4>
            <div class="calendar-reminder__import-tips">
              <div class="calendar-reminder__tip-item">
                <span class="calendar-reminder__tip-icon">💡</span>
                <span class="calendar-reminder__tip-text">导入的事件会自动添加到现有事件列表中，不会覆盖现有数据</span>
              </div>
              <div class="calendar-reminder__tip-item">
                <span class="calendar-reminder__tip-icon">⚠️</span>
                <span class="calendar-reminder__tip-text">导入的日历文件需要包含有效的事件信息才能成功导入</span>
              </div>
              <div class="calendar-reminder__tip-item">
                <span class="calendar-reminder__tip-icon">🔄</span>
                <span class="calendar-reminder__tip-text">支持批量导入多个事件，导入后可以正常编辑和管理</span>
              </div>
            </div>
          </div>
          
          <div class="calendar-reminder__form-actions">
            <button id="start-import" class="calendar-reminder__btn calendar-reminder__btn--primary">📥 选择文件导入</button>
            <button id="cancel-import-help" class="calendar-reminder__btn calendar-reminder__btn--secondary">❌ 取消</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(importModal);
    
    // 显示模态框
    importModal.style.display = 'flex';
    
    // 绑定事件
    const closeBtn = document.getElementById('close-import-help-modal');
    const startImportBtn = document.getElementById('start-import');
    const cancelBtn = document.getElementById('cancel-import-help');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hideImportFormatHelp());
    }
    
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.hideImportFormatHelp());
    }
    
    if (startImportBtn) {
      startImportBtn.addEventListener('click', () => {
        this.hideImportFormatHelp();
        this.startFileImport();
      });
    }
    
    // 点击模态框外部关闭
    importModal.addEventListener('click', (e) => {
      if (e.target === importModal) this.hideImportFormatHelp();
    });
  }

  /**
   * 隐藏导入格式帮助
   */
  hideImportFormatHelp() {
    const importModal = document.getElementById('import-help-modal');
    if (importModal) {
      importModal.remove();
    }
  }

  /**
   * 开始文件导入
   */
  startFileImport() {
    // 创建文件输入元素
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json,.ics,.vcs';
    fileInput.style.display = 'none';
    
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target.result;
          let importedEvents = [];
          
          // 根据文件类型解析
          if (file.name.endsWith('.json')) {
            importedEvents = this.parseJSONFile(content);
          } else if (file.name.endsWith('.ics')) {
            importedEvents = this.parseICSFile(content);
          } else if (file.name.endsWith('.vcs')) {
            importedEvents = this.parseVCSFile(content);
          }
          
          if (Array.isArray(importedEvents) && importedEvents.length > 0) {
            // 合并导入的事件
            this.events = [...this.events, ...importedEvents];
            this.saveToLocalStorage();
            this.updateEventsList();
            this.updateEventsCount();
            
            // 显示成功提示
            this.showNotification(`成功导入 ${importedEvents.length} 个事件`, 'success');
          } else {
            this.showNotification('导入失败：文件格式不正确或为空', 'error');
          }
        } catch (error) {
          console.error('导入失败:', error);
          this.showNotification('导入失败：文件解析错误', 'error');
        }
      };
      
      reader.readAsText(file);
    });
    
    // 触发文件选择
    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
  }

  /**
   * 解析JSON文件
   */
  parseJSONFile(content) {
    const data = JSON.parse(content);
    
    // 如果是工具导出的完整备份文件
    if (data.events && Array.isArray(data.events)) {
      return data.events;
    }
    
    // 如果是事件数组
    if (Array.isArray(data)) {
      return data;
    }
    
    return [];
  }

  /**
   * 解析ICS文件
   */
  parseICSFile(content) {
    const events = [];
    const lines = content.split('\n');
    let currentEvent = {};
    let inEvent = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line === 'BEGIN:VEVENT') {
        inEvent = true;
        currentEvent = {};
      } else if (line === 'END:VEVENT' && inEvent) {
        if (currentEvent.title && currentEvent.startTime) {
          events.push({
            id: this.generateId(),
            title: currentEvent.title,
            description: currentEvent.description || '',
            location: currentEvent.location || '',
            startTime: currentEvent.startTime,
            endTime: currentEvent.endTime || currentEvent.startTime,
            category: 'imported',
            reminder: 15,
            repeat: 'none',
            createdAt: new Date().toISOString()
          });
        }
        inEvent = false;
        currentEvent = {};
      } else if (inEvent) {
        if (line.startsWith('SUMMARY:')) {
          currentEvent.title = line.substring(8);
        } else if (line.startsWith('DESCRIPTION:')) {
          currentEvent.description = line.substring(12);
        } else if (line.startsWith('LOCATION:')) {
          currentEvent.location = line.substring(9);
        } else if (line.startsWith('DTSTART:')) {
          const dateStr = line.substring(8);
          currentEvent.startTime = this.parseICSDate(dateStr);
        } else if (line.startsWith('DTEND:')) {
          const dateStr = line.substring(6);
          currentEvent.endTime = this.parseICSDate(dateStr);
        }
      }
    }
    
    return events;
  }

  /**
   * 解析VCS文件
   */
  parseVCSFile(content) {
    const events = [];
    const lines = content.split('\n');
    let currentEvent = {};
    let inEvent = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line === 'BEGIN:VEVENT') {
        inEvent = true;
        currentEvent = {};
      } else if (line === 'END:VEVENT' && inEvent) {
        if (currentEvent.title && currentEvent.startTime) {
          events.push({
            id: this.generateId(),
            title: currentEvent.title,
            description: currentEvent.description || '',
            location: currentEvent.location || '',
            startTime: currentEvent.startTime,
            endTime: currentEvent.endTime || currentEvent.startTime,
            category: 'imported',
            reminder: 15,
            repeat: 'none',
            createdAt: new Date().toISOString()
          });
        }
        inEvent = false;
        currentEvent = {};
      } else if (inEvent) {
        if (line.startsWith('SUMMARY:')) {
          currentEvent.title = line.substring(8);
        } else if (line.startsWith('DESCRIPTION:')) {
          currentEvent.description = line.substring(12);
        } else if (line.startsWith('LOCATION:')) {
          currentEvent.location = line.substring(9);
        } else if (line.startsWith('DTSTART:')) {
          const dateStr = line.substring(8);
          currentEvent.startTime = this.parseVCSDate(dateStr);
        } else if (line.startsWith('DTEND:')) {
          const dateStr = line.substring(6);
          currentEvent.endTime = this.parseVCSDate(dateStr);
        }
      }
    }
    
    return events;
  }

  /**
   * 解析ICS日期格式
   */
  parseICSDate(dateStr) {
    // 处理格式：20231201T090000Z 或 20231201T090000
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const hour = dateStr.substring(9, 11);
    const minute = dateStr.substring(11, 13);
    const second = dateStr.substring(13, 15);
    
    return new Date(year, month - 1, day, hour, minute, second).toISOString();
  }

  /**
   * 解析VCS日期格式
   */
  parseVCSDate(dateStr) {
    // VCS格式通常与ICS相同
    return this.parseICSDate(dateStr);
  }

  /**
   * 显示设置功能
   */
  showSettings() {
    console.log('🔧 显示设置功能');
    
    // 创建设置模态框
    const settingsModal = document.createElement('div');
    settingsModal.id = 'settings-modal';
    settingsModal.className = 'calendar-reminder__modal';
    settingsModal.innerHTML = `
      <div class="calendar-reminder__modal-content">
        <div class="calendar-reminder__modal-header">
          <h3>⚙️ 设置</h3>
          <button id="close-settings-modal" class="calendar-reminder__close-btn">×</button>
        </div>
        <div class="calendar-reminder__modal-body">
          <div class="calendar-reminder__form-section">
            <h4>分类管理</h4>
            <div id="categories-list" class="calendar-reminder__categories-list">
              ${this.categories.map(cat => `
                <div class="calendar-reminder__category-item">
                  <div class="calendar-reminder__category-color" style="background-color: ${cat.color}"></div>
                  <span class="calendar-reminder__category-name">${cat.name}</span>
                  <button class="calendar-reminder__btn calendar-reminder__btn--small edit-category-btn" data-category-id="${cat.id}">编辑</button>
                </div>
              `).join('')}
            </div>
            <button id="add-category-btn" class="calendar-reminder__btn calendar-reminder__btn--secondary">+ 添加分类</button>
          </div>
          
          <div class="calendar-reminder__form-section">
            <h4>数据管理</h4>
            <div class="calendar-reminder__form-group">
              <button id="export-data-btn" class="calendar-reminder__btn calendar-reminder__btn--secondary">📤 导出数据</button>
              <button id="import-data-btn" class="calendar-reminder__btn calendar-reminder__btn--secondary">📥 导入数据</button>
            </div>
            <div class="calendar-reminder__form-group">
              <button id="clear-data-btn" class="calendar-reminder__btn calendar-reminder__btn--danger">🗑️ 清空所有数据</button>
            </div>
          </div>
          
          <div class="calendar-reminder__form-section">
            <h4>关于</h4>
            <p>日程提醒工具 v1.0.0</p>
            <p>一个简单易用的日程管理工具</p>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(settingsModal);
    
    // 显示模态框
    settingsModal.style.display = 'flex';
    
    // 绑定设置模态框事件
    const closeBtn = document.getElementById('close-settings-modal');
    const exportDataBtn = document.getElementById('export-data-btn');
    const importDataBtn = document.getElementById('import-data-btn');
    const clearDataBtn = document.getElementById('clear-data-btn');
    const addCategoryBtn = document.getElementById('add-category-btn');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hideSettings());
    }
    
    if (exportDataBtn) {
      exportDataBtn.addEventListener('click', () => this.exportAllData());
    }
    
    if (importDataBtn) {
      importDataBtn.addEventListener('click', () => this.importEvents());
    }
    
    if (clearDataBtn) {
      clearDataBtn.addEventListener('click', () => this.clearAllData());
    }
    
    if (addCategoryBtn) {
      addCategoryBtn.addEventListener('click', () => this.addCategory());
    }
    
    // 使用事件委托绑定分类编辑按钮
    settingsModal.addEventListener('click', (e) => {
      if (e.target.classList.contains('edit-category-btn')) {
        const categoryId = e.target.dataset.categoryId;
        this.editCategory(categoryId);
      }
    });
    
    // 点击模态框外部关闭
    settingsModal.addEventListener('click', (e) => {
      if (e.target === settingsModal) this.hideSettings();
    });
  }

  /**
   * 隐藏设置模态框
   */
  hideSettings() {
    const settingsModal = document.getElementById('settings-modal');
    if (settingsModal) {
      settingsModal.remove();
    }
  }

  /**
   * 导出所有数据
   */
  exportAllData() {
    const data = {
      events: this.events,
      categories: this.categories,
      exportTime: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calendar-reminder-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.showNotification('数据导出成功', 'success');
  }

  /**
   * 清空所有数据
   */
  clearAllData() {
    if (confirm('确定要清空所有数据吗？此操作不可恢复！')) {
      this.events = [];
      this.categories = [
        { id: 'work', name: '工作', color: '#3498db' },
        { id: 'personal', name: '个人', color: '#e74c3c' },
        { id: 'study', name: '学习', color: '#2ecc71' },
        { id: 'entertainment', name: '娱乐', color: '#f39c12' },
        { id: 'other', name: '其他', color: '#95a5a6' }
      ];
      this.saveToLocalStorage();
      this.updateEventsList();
      this.updateEventsCount();
      this.hideSettings();
      this.showNotification('所有数据已清空', 'success');
    }
  }

  /**
   * 添加新分类
   */
  addCategory() {
    const name = prompt('请输入分类名称：');
    if (!name) return;
    
    const color = prompt('请输入颜色代码（如：#ff0000）：', '#95a5a6');
    if (!color) return;
    
    const newCategory = {
      id: this.generateId(),
      name: name,
      color: color
    };
    
    this.categories.push(newCategory);
    this.saveToLocalStorage();
    this.hideSettings();
    this.showSettings(); // 重新显示设置以更新分类列表
    this.showNotification('分类添加成功', 'success');
  }

  /**
   * 编辑分类
   */
  editCategory(categoryId) {
    const category = this.categories.find(cat => cat.id === categoryId);
    if (!category) return;
    
    const newName = prompt('请输入新的分类名称：', category.name);
    if (!newName) return;
    
    const newColor = prompt('请输入新的颜色代码：', category.color);
    if (!newColor) return;
    
    category.name = newName;
    category.color = newColor;
    
    this.saveToLocalStorage();
    this.hideSettings();
    this.showSettings(); // 重新显示设置以更新分类列表
    this.showNotification('分类更新成功', 'success');
  }

  /**
   * 显示通知
   */
  showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `calendar-reminder__notification calendar-reminder__notification--${type}`;
    notification.textContent = message;
    
    // 添加样式
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 6px;
      color: white;
      font-weight: 500;
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
      max-width: 300px;
      word-wrap: break-word;
    `;
    
    // 根据类型设置背景色
    switch (type) {
      case 'success':
        notification.style.backgroundColor = '#27ae60';
        break;
      case 'error':
        notification.style.backgroundColor = '#e74c3c';
        break;
      case 'warning':
        notification.style.backgroundColor = '#f39c12';
        break;
      default:
        notification.style.backgroundColor = '#3498db';
    }
    
    document.body.appendChild(notification);
    
    // 3秒后自动移除
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }
}

// 暴露到全局作用域
window.CalendarReminderTool = CalendarReminderTool;

// 全局实例
let calendarTool = null;

// 初始化工具
document.addEventListener('DOMContentLoaded', function() {
  calendarTool = new CalendarReminderTool();
  console.log('📅 日程提醒工具初始化完成');
});
