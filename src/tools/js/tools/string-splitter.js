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
    this.filteredData = [];
    this.maxRows = 100;
    this.maxCols = 20;
    this.customRows = 50;
    this.customCols = 10;
    this.useCustomDimensions = false;
    this.filterOptions = {
      enabled: false,
      filters: [
        {
          id: 1,
          type: 'prefix', // prefix, suffix, contains, notContains
          value: '',
          caseSensitive: false,
          enabled: true
        }
      ]
    };
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
            <div class="string-splitter__option-row">
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

            <div class="string-splitter__option-row">
              <div class="string-splitter__option-group">
                <label class="string-splitter__checkbox-label">
                  <input type="checkbox" id="useCustomDimensions" class="string-splitter__checkbox">
                  <span class="string-splitter__checkbox-text">自定义表格尺寸</span>
                </label>
              </div>
              
              <div class="string-splitter__option-group string-splitter__option-group--dimensions" style="display: none;">
                <label class="string-splitter__label" for="customRows">最大行数：</label>
                <input 
                  type="number" 
                  id="customRows" 
                  class="string-splitter__input string-splitter__input--number" 
                  value="${this.customRows}"
                  min="1"
                  max="1000"
                >
              </div>
              
              <div class="string-splitter__option-group string-splitter__option-group--dimensions" style="display: none;">
                <label class="string-splitter__label" for="customCols">最大列数：</label>
                <input 
                  type="number" 
                  id="customCols" 
                  class="string-splitter__input string-splitter__input--number" 
                  value="${this.customCols}"
                  min="1"
                  max="100"
                >
              </div>
            </div>
          </div>

          <div class="string-splitter__filter-section">
            <div class="string-splitter__filter-header">
              <label class="string-splitter__checkbox-label">
                <input type="checkbox" id="enableFilter" class="string-splitter__checkbox">
                <span class="string-splitter__checkbox-text">启用字符串筛选</span>
              </label>
            </div>
            
            <div class="string-splitter__filter-options" style="display: none;">
              <div id="filterList" class="string-splitter__filter-list">
                <!-- 筛选条件将动态生成 -->
              </div>
              
              <div class="string-splitter__filter-actions">
                <button id="addFilterBtn" class="string-splitter__btn string-splitter__btn--small">
                  <svg class="string-splitter__icon" viewBox="0 0 24 24">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                  添加筛选条件
                </button>
              </div>
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
              <button id="exportImageBtn" class="string-splitter__btn string-splitter__btn--small" disabled>
                <svg class="string-splitter__icon" viewBox="0 0 24 24">
                  <path d="M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19M19,19H5V5H19V19M17,12H15.5L13,9.5L11,12H9L12,9L9,6H11L13,8.5L15,6H17L14,9L17,12Z"/>
                </svg>
                导出图片
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
    const useCustomDimensions = document.getElementById('useCustomDimensions');
    const customRows = document.getElementById('customRows');
    const customCols = document.getElementById('customCols');
    const enableFilter = document.getElementById('enableFilter');
    const addFilterBtn = document.getElementById('addFilterBtn');
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

    // 自定义尺寸切换
    useCustomDimensions.addEventListener('change', () => {
      this.useCustomDimensions = useCustomDimensions.checked;
      const dimensionGroups = document.querySelectorAll('.string-splitter__option-group--dimensions');
      dimensionGroups.forEach(group => {
        group.style.display = this.useCustomDimensions ? 'block' : 'none';
      });
    });

    // 自定义行数变化
    customRows.addEventListener('input', () => {
      this.customRows = parseInt(customRows.value) || 50;
    });

    // 自定义列数变化
    customCols.addEventListener('input', () => {
      this.customCols = parseInt(customCols.value) || 10;
    });

    // 筛选功能切换
    enableFilter.addEventListener('change', () => {
      this.filterOptions.enabled = enableFilter.checked;
      const filterOptions = document.querySelector('.string-splitter__filter-options');
      filterOptions.style.display = this.filterOptions.enabled ? 'block' : 'none';
      
      if (this.filterOptions.enabled) {
        this.renderFilters();
      }
    });

    // 添加筛选条件
    addFilterBtn.addEventListener('click', () => {
      this.addFilter();
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

    // 导出图片按钮事件
    const exportImageBtn = document.getElementById('exportImageBtn');
    if (exportImageBtn) {
      exportImageBtn.addEventListener('click', () => {
        this.exportTableAsImage();
      });
    }

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

      // 应用筛选
      this.applyFilter();

      // 获取实际使用的行列限制
      const maxRows = this.useCustomDimensions ? this.customRows : this.maxRows;
      const maxCols = this.useCustomDimensions ? this.customCols : this.maxCols;

      // 处理列数超出：换行显示而不是截断
      const originalRowCount = this.filteredData.length;
      let hasWrappedCols = false;
      const wrappedData = [];
      
      this.filteredData.forEach(row => {
        if (row.length <= maxCols) {
          // 列数未超出，直接添加
          wrappedData.push(row);
        } else {
          // 列数超出，拆分为多行
          hasWrappedCols = true;
          for (let i = 0; i < row.length; i += maxCols) {
            const chunk = row.slice(i, i + maxCols);
            wrappedData.push(chunk);
          }
        }
      });
      
      this.filteredData = wrappedData;
      
      // 显示列换行提示
      if (hasWrappedCols) {
        this.showMessage(`部分行的列数超过 ${maxCols} 列，已自动换行显示`, 'info');
      }

      // 最后应用行数限制
      const finalRowCount = this.filteredData.length;
      if (this.filteredData.length > maxRows) {
        this.filteredData = this.filteredData.slice(0, maxRows);
        this.showMessage(`数据行数超过限制，只显示前 ${maxRows} 行（处理后共 ${finalRowCount} 行）`, 'warning');
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
   * 应用字符串筛选
   */
  applyFilter() {
    if (!this.filterOptions.enabled || this.filterOptions.filters.length === 0) {
      this.filteredData = [...this.data];
      return;
    }

    // 获取启用的筛选条件
    const activeFilters = this.filterOptions.filters.filter(filter => 
      filter.enabled && filter.value.trim()
    );

    if (activeFilters.length === 0) {
      this.filteredData = [...this.data];
      return;
    }

    // 新的筛选逻辑：只排除匹配的单元格，不排除整行
    this.filteredData = [];
    
    this.data.forEach(row => {
      const filteredRow = row.filter(cell => {
        // 检查单元格是否应该被排除
        return activeFilters.every(filter => {
          const filterValue = filter.caseSensitive 
            ? filter.value 
            : filter.value.toLowerCase();
          const cellValue = filter.caseSensitive 
            ? cell 
            : cell.toLowerCase();

          switch (filter.type) {
            case 'prefix':
              // 排除前缀：单元格不以该前缀开头
              return !cellValue.startsWith(filterValue);
            case 'suffix':
              // 排除后缀：单元格不以该后缀结尾
              return !cellValue.endsWith(filterValue);
            case 'contains':
              // 排除包含：单元格不包含该字符串
              return !cellValue.includes(filterValue);
            case 'notContains':
              // 只保留包含：单元格包含该字符串
              return cellValue.includes(filterValue);
            default:
              return true;
          }
        });
      });
      
      // 只添加非空的行
      if (filteredRow.length > 0) {
        this.filteredData.push(filteredRow);
      }
    });
  }

  /**
   * 添加新的筛选条件
   */
  addFilter() {
    const newFilter = {
      id: Date.now(),
      type: 'prefix',
      value: '',
      caseSensitive: false,
      enabled: true
    };
    
    this.filterOptions.filters.push(newFilter);
    this.renderFilters();
  }

  /**
   * 删除筛选条件
   */
  removeFilter(filterId) {
    this.filterOptions.filters = this.filterOptions.filters.filter(f => f.id !== filterId);
    this.renderFilters();
  }

  /**
   * 渲染筛选条件列表
   */
  renderFilters() {
    const filterList = document.getElementById('filterList');
    if (!filterList) return;

    filterList.innerHTML = this.filterOptions.filters.map(filter => `
      <div class="string-splitter__filter-item" data-filter-id="${filter.id}">
        <div class="string-splitter__filter-header">
          <label class="string-splitter__checkbox-label">
            <input type="checkbox" class="string-splitter__checkbox filter-enabled" ${filter.enabled ? 'checked' : ''}>
            <span class="string-splitter__checkbox-text">启用</span>
          </label>
          <button class="string-splitter__btn string-splitter__btn--small string-splitter__btn--danger filter-remove">
            <svg class="string-splitter__icon" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
            删除
          </button>
        </div>
        
        <div class="string-splitter__option-row">
          <div class="string-splitter__option-group">
            <label class="string-splitter__label">筛选类型：</label>
            <select class="string-splitter__select filter-type">
              <option value="prefix" ${filter.type === 'prefix' ? 'selected' : ''}>排除前缀</option>
              <option value="suffix" ${filter.type === 'suffix' ? 'selected' : ''}>排除后缀</option>
              <option value="contains" ${filter.type === 'contains' ? 'selected' : ''}>排除包含</option>
              <option value="notContains" ${filter.type === 'notContains' ? 'selected' : ''}>只保留包含</option>
            </select>
          </div>
          
          <div class="string-splitter__option-group">
            <label class="string-splitter__label">筛选值：</label>
            <input 
              type="text" 
              class="string-splitter__input filter-value" 
              placeholder="输入要筛选的字符串"
              value="${filter.value}"
            >
          </div>
          
          <div class="string-splitter__option-group">
            <label class="string-splitter__checkbox-label">
              <input type="checkbox" class="string-splitter__checkbox filter-case-sensitive" ${filter.caseSensitive ? 'checked' : ''}>
              <span class="string-splitter__checkbox-text">区分大小写</span>
            </label>
          </div>
        </div>
      </div>
    `).join('');

    // 绑定事件
    this.bindFilterEvents();
  }

  /**
   * 绑定筛选条件事件
   */
  bindFilterEvents() {
    const filterList = document.getElementById('filterList');
    if (!filterList) return;

    // 删除筛选条件
    filterList.addEventListener('click', (e) => {
      if (e.target.closest('.filter-remove')) {
        const filterItem = e.target.closest('.string-splitter__filter-item');
        const filterId = parseInt(filterItem.dataset.filterId);
        this.removeFilter(filterId);
      }
    });

    // 筛选条件变化
    filterList.addEventListener('change', (e) => {
      const filterItem = e.target.closest('.string-splitter__filter-item');
      const filterId = parseInt(filterItem.dataset.filterId);
      const filter = this.filterOptions.filters.find(f => f.id === filterId);
      
      if (!filter) return;

      if (e.target.classList.contains('filter-type')) {
        filter.type = e.target.value;
      } else if (e.target.classList.contains('filter-enabled')) {
        filter.enabled = e.target.checked;
      } else if (e.target.classList.contains('filter-case-sensitive')) {
        filter.caseSensitive = e.target.checked;
      }
    });

    // 筛选值输入
    filterList.addEventListener('input', (e) => {
      if (e.target.classList.contains('filter-value')) {
        const filterItem = e.target.closest('.string-splitter__filter-item');
        const filterId = parseInt(filterItem.dataset.filterId);
        const filter = this.filterOptions.filters.find(f => f.id === filterId);
        
        if (filter) {
          filter.value = e.target.value;
        }
      }
    });
  }

  /**
   * 渲染结果表格
   */
  renderTable() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    if (this.filteredData.length === 0) {
      return;
    }

    // 获取实际使用的列数限制
    const maxCols = this.useCustomDimensions ? this.customCols : this.maxCols;
    const actualMaxCols = this.filteredData.length > 0 ? Math.max(...this.filteredData.map(row => row.length)) : 0;
    
    // 表格显示的列数为实际列数和限制中的较小值
    const displayCols = Math.min(actualMaxCols, maxCols);

    // 创建表头
    const headerRow = document.createElement('tr');
    headerRow.className = 'string-splitter__header-row';
    
    // 添加行号列
    const rowNumHeader = document.createElement('th');
    rowNumHeader.textContent = '行号';
    rowNumHeader.className = 'string-splitter__row-num-header';
    headerRow.appendChild(rowNumHeader);

    // 添加数据列标题
    for (let i = 0; i < displayCols; i++) {
      const th = document.createElement('th');
      th.textContent = `列 ${i + 1}`;
      th.className = 'string-splitter__col-header';
      headerRow.appendChild(th);
    }

    tableBody.appendChild(headerRow);

    // 创建数据行
    this.filteredData.forEach((row, rowIndex) => {
      const tr = document.createElement('tr');
      tr.className = 'string-splitter__data-row';

      // 添加行号
      const rowNumCell = document.createElement('td');
      rowNumCell.textContent = rowIndex + 1;
      rowNumCell.className = 'string-splitter__row-num';
      tr.appendChild(rowNumCell);

      // 添加数据单元格
      for (let i = 0; i < displayCols; i++) {
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
    const filteredRows = this.filteredData.length;
    const originalRows = this.data.length;
    
    // 获取实际使用的列数限制
    const maxCols = this.useCustomDimensions ? this.customCols : this.maxCols;
    const actualCols = this.filteredData.length > 0 ? Math.max(...this.filteredData.map(row => row.length)) : 0;
    
    // 显示的列数以实际列数和限制中的较小值为准
    const displayCols = Math.min(actualCols, maxCols);
    
    let infoText = `共 ${filteredRows} 行 ${displayCols} 列`;
    if (this.filterOptions.enabled && filteredRows !== originalRows) {
      infoText += ` (原始 ${originalRows} 行，筛选后显示)`;
    }
    
    dataInfo.textContent = infoText;
  }

  /**
   * 启用导出按钮
   */
  enableExport() {
    const exportBtn = document.getElementById('exportBtn');
    const exportImageBtn = document.getElementById('exportImageBtn');
    exportBtn.disabled = false;
    if (exportImageBtn) {
      exportImageBtn.disabled = false;
    }
  }

  /**
   * 导出为CSV
   */
  exportToCSV() {
    if (this.filteredData.length === 0) {
      this.showMessage('没有数据可导出', 'warning');
      return;
    }

    try {
      let csvContent = '';
      
      this.filteredData.forEach(row => {
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
      
      const fileName = this.filterOptions.enabled 
        ? `字符串分割结果_筛选_${new Date().getTime()}.csv`
        : `字符串分割结果_${new Date().getTime()}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      const exportMessage = this.filterOptions.enabled 
        ? `CSV文件导出成功（已应用筛选条件）`
        : 'CSV文件导出成功';
      this.showMessage(exportMessage, 'success');

    } catch (error) {
      this.showMessage('导出CSV时发生错误：' + error.message, 'error');
    }
  }

  /**
   * 导出表格为图片
   */
  async exportTableAsImage() {
    if (this.filteredData.length === 0) {
      this.showMessage('没有数据可导出', 'warning');
      return;
    }

    try {
      this.showMessage('正在生成图片，请稍候...', 'info');
      
      // 创建临时表格用于渲染
      const tempContainer = this.createExportTable();
      
      // 等待表格渲染完成
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log('开始html2canvas渲染，表格内容：', tempContainer.innerHTML);
      
      // 使用html2canvas转换为图片
      const canvas = await html2canvas(tempContainer, {
        backgroundColor: '#ffffff',
        scale: 2, // 提高图片清晰度
        useCORS: true,
        allowTaint: true,
        logging: true, // 开启日志用于调试
        width: tempContainer.offsetWidth,
        height: tempContainer.offsetHeight
      });
      
      console.log('Canvas尺寸：', canvas.width, 'x', canvas.height);
      
      // 转换为blob并下载
      canvas.toBlob((blob) => {
        if (!blob) {
          this.showMessage('图片生成失败', 'error');
          return;
        }
        
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        const fileName = this.filterOptions.enabled 
          ? `字符串分割结果_筛选_${new Date().getTime()}.png`
          : `字符串分割结果_${new Date().getTime()}.png`;
        
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        
        const exportMessage = this.filterOptions.enabled 
          ? `图片导出成功（已应用筛选条件）`
          : '图片导出成功';
        this.showMessage(exportMessage, 'success');
      }, 'image/png', 0.95);
      
    } catch (error) {
      this.showMessage('导出图片时发生错误：' + error.message, 'error');
      console.error('导出图片错误：', error);
    }
  }

  /**
   * 创建用于导出的表格
   */
  createExportTable() {
    // 创建临时容器
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0px';
    tempContainer.style.width = 'auto';
    tempContainer.style.height = 'auto';
    tempContainer.style.zIndex = '-9999';
    tempContainer.style.pointerEvents = 'none';
    // 不要使用visibility: hidden，这会导致html2canvas无法捕获内容
    
    // 创建表格
    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse';
    table.style.border = '1px solid #333333';
    table.style.fontFamily = 'Arial, sans-serif';
    table.style.fontSize = '14px';
    table.style.backgroundColor = '#ffffff';
    table.style.color = '#000000';
    table.style.width = 'auto';
    table.style.minWidth = '200px';
    
    // 添加数据行
    this.filteredData.forEach((row, rowIndex) => {
      const tr = document.createElement('tr');
      tr.style.backgroundColor = rowIndex % 2 === 0 ? '#ffffff' : '#f9f9f9';
      
      row.forEach(cell => {
        const td = document.createElement('td');
        td.textContent = cell || ''; // 确保不为空
        td.style.border = '1px solid #333333';
        td.style.padding = '8px 12px';
        td.style.textAlign = 'left';
        td.style.backgroundColor = rowIndex % 2 === 0 ? '#ffffff' : '#f9f9f9';
        td.style.color = '#000000';
        td.style.whiteSpace = 'nowrap';
        td.style.minWidth = '80px';
        td.style.fontSize = '14px';
        td.style.fontWeight = 'normal';
        tr.appendChild(td);
      });
      
      table.appendChild(tr);
    });
    
    tempContainer.appendChild(table);
    document.body.appendChild(tempContainer);
    
    console.log('临时表格已创建，包含', this.filteredData.length, '行数据');
    console.log('表格尺寸：', table.offsetWidth, 'x', table.offsetHeight);
    
    // 延迟移除，确保html2canvas完成后再清理
    setTimeout(() => {
      if (tempContainer.parentNode) {
        tempContainer.parentNode.removeChild(tempContainer);
      }
    }, 1000); // 增加延迟时间
    
    return tempContainer; // 返回容器而不是表格，这样html2canvas可以正确捕获
  }

  /**
   * 清空所有数据
   */
  clearAll() {
    const inputText = document.getElementById('inputText');
    const customDelimiter = document.getElementById('customDelimiter');
    const useCustomDimensions = document.getElementById('useCustomDimensions');
    const enableFilter = document.getElementById('enableFilter');
    const tableBody = document.getElementById('tableBody');
    const dataInfo = document.getElementById('dataInfo');
    const exportBtn = document.getElementById('exportBtn');

    // 清空输入
    inputText.value = '';
    customDelimiter.value = '';
    
    // 重置选项
    useCustomDimensions.checked = false;
    enableFilter.checked = false;
    
    // 隐藏相关选项
    const dimensionGroups = document.querySelectorAll('.string-splitter__option-group--dimensions');
    dimensionGroups.forEach(group => {
      group.style.display = 'none';
    });
    
    const filterOptions = document.querySelector('.string-splitter__filter-options');
    filterOptions.style.display = 'none';
    
    // 清空表格和状态
    tableBody.innerHTML = '';
    dataInfo.textContent = '共 0 行 0 列';
    exportBtn.disabled = true;
    const exportImageBtn = document.getElementById('exportImageBtn');
    if (exportImageBtn) {
      exportImageBtn.disabled = true;
    }
    
    // 重置数据
    this.data = [];
    this.filteredData = [];
    this.useCustomDimensions = false;
    this.filterOptions.enabled = false;
    this.filterOptions.filters = [
      {
        id: 1,
        type: 'prefix',
        value: '',
        caseSensitive: false,
        enabled: true
      }
    ];

    this.showMessage('已清空所有数据和设置', 'info');
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

// 导出到全局作用域
if (typeof window !== 'undefined') {
  window.StringSplitterTool = StringSplitterTool;
  console.log('✅ StringSplitterTool 已导出到全局作用域');
} else {
  console.warn('⚠️ window 对象不可用，无法导出 StringSplitterTool');
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
