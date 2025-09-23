'use strict';

/**
 * 字符串分割工具
 * 将字符串按分隔符分割为网格数据，支持自定义分隔符和CSV导出
 */
class StringSplitterTool {
  constructor() {
    this.delimiter = ',';
    this.delimiterOptions = [
      { value: ',', label: '逗号 (,)' },
      { value: ';', label: '分号 (;)' },
      { value: '|', label: '竖线 (|)' },
      { value: '\t', label: '制表符 (Tab)' },
      { value: ' ', label: '空格' },
      { value: '\n', label: '换行符' }
    ];
    this.data = [];
    this.maxRows = 100;
    this.maxCols = 20;
  }

  /**
   * 渲染工具界面
   */
  render() {
    return `
      <div class="string-splitter">
        <div class="string-splitter__input-section">
          <div class="string-splitter__input-group">
            <label class="string-splitter__label" for="inputText">输入字符串：</label>
            <textarea 
              id="inputText" 
              class="string-splitter__textarea" 
              placeholder="请输入需要分割的字符串，例如：姓名,年龄,城市&#10;张三,25,北京&#10;李四,30,上海"
              rows="6"
            ></textarea>
          </div>
          
          <div class="string-splitter__options">
            <div class="string-splitter__option-group">
              <label class="string-splitter__label" for="delimiterSelect">分隔符：</label>
              <select id="delimiterSelect" class="string-splitter__select">
                ${this.delimiterOptions.map(option => 
                  `<option value="${option.value}">${option.label}</option>`
                ).join('')}
              </select>
            </div>
            
            <div class="string-splitter__option-group">
              <label class="string-splitter__label" for="customDelimiter">自定义分隔符：</label>
              <input 
                type="text" 
                id="customDelimiter" 
                class="string-splitter__input" 
                placeholder="输入自定义分隔符"
                maxlength="5"
              >
            </div>
          </div>
          
          <div class="string-splitter__actions">
            <button id="splitBtn" class="string-splitter__btn string-splitter__btn--primary">
              <svg class="string-splitter__icon" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
              </svg>
              分割处理
            </button>
            <button id="clearBtn" class="string-splitter__btn string-splitter__btn--secondary">
              <svg class="string-splitter__icon" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
              清空
            </button>
          </div>
        </div>
        
        <div class="string-splitter__output-section">
          <div class="string-splitter__output-header">
            <h3 class="string-splitter__output-title">分割结果</h3>
            <div class="string-splitter__output-info">
              <span id="dataInfo" class="string-splitter__info">共 0 行 0 列</span>
              <button id="exportBtn" class="string-splitter__btn string-splitter__btn--small" disabled>
                <svg class="string-splitter__icon" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
                导出CSV
              </button>
            </div>
          </div>
          
          <div class="string-splitter__table-container">
            <table id="resultTable" class="string-splitter__table">
              <tbody id="tableBody"></tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 初始化事件监听
   */
  init() {
    const inputText = document.getElementById('inputText');
    const delimiterSelect = document.getElementById('delimiterSelect');
    const customDelimiter = document.getElementById('customDelimiter');
    const splitBtn = document.getElementById('splitBtn');
    const clearBtn = document.getElementById('clearBtn');
    const exportBtn = document.getElementById('exportBtn');

    // 分隔符选择变化
    delimiterSelect.addEventListener('change', () => {
      this.delimiter = delimiterSelect.value;
      customDelimiter.value = '';
    });

    // 自定义分隔符输入
    customDelimiter.addEventListener('input', () => {
      if (customDelimiter.value.trim()) {
        this.delimiter = customDelimiter.value;
        delimiterSelect.value = '';
      }
    });

    // 分割处理
    splitBtn.addEventListener('click', () => {
      this.processString();
    });

    // 清空
    clearBtn.addEventListener('click', () => {
      this.clearAll();
    });

    // 导出CSV
    exportBtn.addEventListener('click', () => {
      this.exportToCSV();
    });

    // 回车键快速处理
    inputText.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        this.processString();
      }
    });
  }

  /**
   * 处理字符串分割
   */
  processString() {
    const inputText = document.getElementById('inputText');
    const text = inputText.value.trim();

    if (!text) {
      this.showMessage('请输入要分割的字符串', 'warning');
      return;
    }

    try {
      // 分割字符串
      const lines = text.split('\n');
      this.data = lines.map(line => {
        if (this.delimiter === '\t') {
          return line.split('\t');
        } else {
          return line.split(this.delimiter);
        }
      });

      // 限制数据大小
      if (this.data.length > this.maxRows) {
        this.data = this.data.slice(0, this.maxRows);
        this.showMessage(`数据行数超过限制，只显示前 ${this.maxRows} 行`, 'warning');
      }

      // 检查列数
      const maxColsInData = Math.max(...this.data.map(row => row.length));
      if (maxColsInData > this.maxCols) {
        this.showMessage(`数据列数超过限制，只显示前 ${this.maxCols} 列`, 'warning');
      }

      // 渲染表格
      this.renderTable();
      this.updateDataInfo();
      this.enableExport();

    } catch (error) {
      this.showMessage('处理字符串时发生错误：' + error.message, 'error');
    }
  }

  /**
   * 渲染结果表格
   */
  renderTable() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    if (this.data.length === 0) {
      return;
    }

    // 计算最大列数
    const maxCols = Math.min(Math.max(...this.data.map(row => row.length)), this.maxCols);

    // 创建表头
    const headerRow = document.createElement('tr');
    headerRow.className = 'string-splitter__header-row';
    
    // 添加行号列
    const rowNumHeader = document.createElement('th');
    rowNumHeader.textContent = '行号';
    rowNumHeader.className = 'string-splitter__row-num-header';
    headerRow.appendChild(rowNumHeader);

    // 添加数据列标题
    for (let i = 0; i < maxCols; i++) {
      const th = document.createElement('th');
      th.textContent = `列 ${i + 1}`;
      th.className = 'string-splitter__col-header';
      headerRow.appendChild(th);
    }

    tableBody.appendChild(headerRow);

    // 创建数据行
    this.data.forEach((row, rowIndex) => {
      const tr = document.createElement('tr');
      tr.className = 'string-splitter__data-row';

      // 添加行号
      const rowNumCell = document.createElement('td');
      rowNumCell.textContent = rowIndex + 1;
      rowNumCell.className = 'string-splitter__row-num';
      tr.appendChild(rowNumCell);

      // 添加数据单元格
      for (let i = 0; i < maxCols; i++) {
        const td = document.createElement('td');
        td.textContent = row[i] || '';
        td.className = 'string-splitter__cell';
        td.title = row[i] || '';
        tr.appendChild(td);
      }

      tableBody.appendChild(tr);
    });
  }

  /**
   * 更新数据信息
   */
  updateDataInfo() {
    const dataInfo = document.getElementById('dataInfo');
    const rows = this.data.length;
    const cols = this.data.length > 0 ? Math.max(...this.data.map(row => row.length)) : 0;
    dataInfo.textContent = `共 ${rows} 行 ${cols} 列`;
  }

  /**
   * 启用导出按钮
   */
  enableExport() {
    const exportBtn = document.getElementById('exportBtn');
    exportBtn.disabled = false;
  }

  /**
   * 导出为CSV
   */
  exportToCSV() {
    if (this.data.length === 0) {
      this.showMessage('没有数据可导出', 'warning');
      return;
    }

    try {
      let csvContent = '';
      
      this.data.forEach(row => {
        const csvRow = row.map(cell => {
          // 处理包含逗号、引号或换行符的单元格
          if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
            return '"' + cell.replace(/"/g, '""') + '"';
          }
          return cell;
        });
        csvContent += csvRow.join(',') + '\n';
      });

      // 创建下载链接
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `字符串分割结果_${new Date().getTime()}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      this.showMessage('CSV文件导出成功', 'success');

    } catch (error) {
      this.showMessage('导出CSV时发生错误：' + error.message, 'error');
    }
  }

  /**
   * 清空所有数据
   */
  clearAll() {
    const inputText = document.getElementById('inputText');
    const customDelimiter = document.getElementById('customDelimiter');
    const tableBody = document.getElementById('tableBody');
    const dataInfo = document.getElementById('dataInfo');
    const exportBtn = document.getElementById('exportBtn');

    inputText.value = '';
    customDelimiter.value = '';
    tableBody.innerHTML = '';
    dataInfo.textContent = '共 0 行 0 列';
    exportBtn.disabled = true;
    this.data = [];

    this.showMessage('已清空所有数据', 'info');
  }

  /**
   * 显示消息提示
   */
  showMessage(message, type = 'info') {
    // 创建消息元素
    const messageEl = document.createElement('div');
    messageEl.className = `string-splitter__message string-splitter__message--${type}`;
    messageEl.textContent = message;

    // 添加到页面
    const container = document.querySelector('.string-splitter');
    container.appendChild(messageEl);

    // 自动移除
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
    id: 'string-splitter',
    name: '字符串分割器',
    description: '将字符串按分隔符分割为网格数据，支持自定义分隔符和CSV导出',
    category: 'text',
    icon: 'scissors',
    component: StringSplitterTool
  });
}
