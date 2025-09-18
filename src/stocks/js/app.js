'use strict';

/**
 * 量化选股平台前端应用
 * 负责用户交互、数据展示和与后端API通信
 */

class QuantitativeTradingApp {
  constructor() {
    this.equityChart = null;
    this.currentStrategy = null;
    this.stockData = [];
    this.init();
  }

  /**
   * 初始化应用
   */
  init() {
    console.log('开始初始化应用...');
    this.bindEvents();
    this.initCharts();
    this.loadDefaultStrategy();
    console.log('量化选股平台已初始化');
  }

  /**
   * 绑定事件监听器
   */
  bindEvents() {
    // 滑块值更新事件
    const sliders = document.querySelectorAll('.slider');
    sliders.forEach(slider => {
      slider.addEventListener('input', (e) => {
        const value = e.target.value;
        const valueSpan = e.target.nextElementSibling;
        valueSpan.textContent = value + '%';
        this.updateWeightSum();
      });
    });

    // 策略运行按钮
    const runButton = document.getElementById('runStrategy');
    console.log('运行按钮元素:', runButton);
    if (runButton) {
      runButton.addEventListener('click', () => {
        console.log('运行策略按钮被点击');
        this.runStrategy();
      });
      console.log('运行策略事件监听器已绑定');
    } else {
      console.error('找不到运行策略按钮');
    }

    // 保存策略按钮
    const saveButton = document.getElementById('saveStrategy');
    if (saveButton) {
      saveButton.addEventListener('click', () => {
        this.saveStrategy();
      });
    }

    // 加载策略按钮
    const loadButton = document.getElementById('loadStrategy');
    if (loadButton) {
      loadButton.addEventListener('click', () => {
        this.loadStrategy();
      });
    }

    // 搜索股票
    const searchInput = document.getElementById('searchStock');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filterStocks(e.target.value);
      });
    }

    // 排序选择
    const sortSelect = document.getElementById('sortBy');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortStocks(e.target.value);
      });
    }

    // 基准切换
    const toggleButton = document.getElementById('toggleBenchmark');
    if (toggleButton) {
      toggleButton.addEventListener('click', (e) => {
        this.toggleBenchmark(e.target);
      });
    }
  }

  /**
   * 初始化图表
   */
  initCharts() {
    const chartDom = document.getElementById('equityChart');
    this.equityChart = echarts.init(chartDom);
    
    const option = {
      title: {
        text: '策略收益曲线',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      legend: {
        data: ['策略收益', '基准收益'],
        top: 30
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: []
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value}%'
        }
      },
      series: [
        {
          name: '策略收益',
          type: 'line',
          data: [],
          smooth: true,
          lineStyle: {
            color: '#3498db',
            width: 2
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0, color: 'rgba(52, 152, 219, 0.3)'
              }, {
                offset: 1, color: 'rgba(52, 152, 219, 0.1)'
              }]
            }
          }
        },
        {
          name: '基准收益',
          type: 'line',
          data: [],
          smooth: true,
          lineStyle: {
            color: '#e74c3c',
            width: 2
          },
          show: false
        }
      ]
    };

    this.equityChart.setOption(option);
  }

  /**
   * 更新权重总和显示
   */
  updateWeightSum() {
    const sliders = document.querySelectorAll('.slider');
    let total = 0;
    sliders.forEach(slider => {
      total += parseInt(slider.value);
    });
    
    // 如果权重总和不为100%，显示警告
    if (total !== 100) {
      console.warn(`权重总和为 ${total}%，建议调整为 100%`);
    }
  }

  /**
   * 运行策略
   */
  async runStrategy() {
    console.log('runStrategy 方法被调用');
    try {
      console.log('开始运行策略...');
      this.showLoading(true);
      
      // 获取策略参数
      const strategyParams = this.getStrategyParams();
      console.log('策略参数:', strategyParams);
      
      // 模拟API调用（实际项目中替换为真实API）
      const result = await this.callStrategyAPI(strategyParams);
      console.log('API调用结果:', result);
      
      // 更新界面
      this.updateResults(result);
      
      this.showMessage('策略运行成功！', 'success');
      
    } catch (error) {
      console.error('策略运行失败:', error);
      this.showMessage('策略运行失败: ' + error.message, 'error');
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * 获取策略参数
   */
  getStrategyParams() {
    return {
      stockPool: document.getElementById('stockPool').value,
      timeRange: document.getElementById('timeRange').value,
      factors: {
        pe: parseInt(document.getElementById('peWeight').value),
        pb: parseInt(document.getElementById('pbWeight').value),
        roe: parseInt(document.getElementById('roeWeight').value),
        momentum: parseInt(document.getElementById('momentumWeight').value),
        volatility: parseInt(document.getElementById('volatilityWeight').value)
      },
      filters: {
        minMarketCap: parseFloat(document.getElementById('minMarketCap').value),
        maxPe: parseFloat(document.getElementById('maxPe').value),
        minRoe: parseFloat(document.getElementById('minRoe').value)
      }
    };
  }

  /**
   * 调用策略API
   */
  async callStrategyAPI(params) {
    const API_BASE_URL = 'http://localhost:8000';
    
    try {
      const response = await fetch(`${API_BASE_URL}/run_strategy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
      
    } catch (error) {
      console.error('API调用失败:', error);
      // 如果API调用失败，回退到模拟数据
      console.log('回退到模拟数据...');
      return this.generateMockData();
    }
  }

  /**
   * 生成模拟数据（API失败时的备用方案）
   */
  generateMockData() {
    return {
      stocks: this.generateMockStockData(),
      performance: {
        annualReturn: 15.6,
        sharpeRatio: 1.24,
        maxDrawdown: -8.3,
        winRate: 68.5
      },
      equityCurve: this.generateMockEquityCurve(),
      benchmarkCurve: this.generateMockBenchmarkCurve()
    };
  }

  /**
   * 生成模拟股票数据
   */
  generateMockStockData() {
    const stocks = [];
    const stockNames = ['贵州茅台', '五粮液', '招商银行', '中国平安', '宁德时代', '比亚迪', '腾讯控股', '阿里巴巴', '美团', '京东'];
    
    for (let i = 0; i < 20; i++) {
      stocks.push({
        code: `600${String(i).padStart(3, '0')}`,
        name: stockNames[i % stockNames.length],
        score: (Math.random() * 0.4 + 0.6).toFixed(2),
        pe: (Math.random() * 30 + 10).toFixed(1),
        pb: (Math.random() * 3 + 1).toFixed(2),
        roe: (Math.random() * 15 + 5).toFixed(1),
        marketCap: (Math.random() * 500 + 50).toFixed(0)
      });
    }
    
    return stocks.sort((a, b) => b.score - a.score);
  }

  /**
   * 生成模拟收益曲线
   */
  generateMockEquityCurve() {
    const curve = [];
    let value = 100;
    const dates = [];
    
    // 生成过去一年的日期
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    
    for (let i = 0; i < 250; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
      
      // 模拟随机收益
      const dailyReturn = (Math.random() - 0.5) * 0.05;
      value *= (1 + dailyReturn);
      curve.push(value.toFixed(2));
    }
    
    return { dates, values: curve };
  }

  /**
   * 生成模拟基准曲线
   */
  generateMockBenchmarkCurve() {
    const curve = [];
    let value = 100;
    
    for (let i = 0; i < 250; i++) {
      // 基准收益相对稳定
      const dailyReturn = (Math.random() - 0.5) * 0.02;
      value *= (1 + dailyReturn);
      curve.push(value.toFixed(2));
    }
    
    return curve;
  }

  /**
   * 更新结果展示
   */
  updateResults(result) {
    // 更新绩效指标
    this.updateMetrics(result.performance);
    
    // 更新收益曲线
    this.updateEquityChart(result.equityCurve, result.benchmarkCurve);
    
    // 更新股票表格
    this.updateStockTable(result.stocks);
    
    this.stockData = result.stocks;
  }

  /**
   * 更新绩效指标
   */
  updateMetrics(performance) {
    document.getElementById('annualReturn').textContent = performance.annualReturn + '%';
    document.getElementById('sharpeRatio').textContent = performance.sharpeRatio;
    document.getElementById('maxDrawdown').textContent = performance.maxDrawdown + '%';
    document.getElementById('winRate').textContent = performance.winRate + '%';
  }

  /**
   * 更新收益曲线图
   */
  updateEquityChart(equityCurve, benchmarkCurve) {
    const option = this.equityChart.getOption();
    
    option.xAxis[0].data = equityCurve.dates;
    option.series[0].data = equityCurve.values.map(v => parseFloat(v));
    option.series[1].data = benchmarkCurve.map(v => parseFloat(v));
    
    this.equityChart.setOption(option);
  }

  /**
   * 更新股票表格
   */
  updateStockTable(stocks) {
    const tbody = document.getElementById('stockTableBody');
    tbody.innerHTML = '';
    
    stocks.forEach(stock => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${stock.code}</td>
        <td>${stock.name}</td>
        <td class="score-cell">${stock.score}</td>
        <td>${stock.pe}</td>
        <td>${stock.pb}</td>
        <td>${stock.roe}%</td>
        <td>${stock.marketCap}</td>
        <td>
          <button class="btn btn-small" onclick="app.viewStockDetail('${stock.code}')">详情</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  /**
   * 筛选股票
   */
  filterStocks(keyword) {
    if (!keyword) {
      this.updateStockTable(this.stockData);
      return;
    }
    
    const filtered = this.stockData.filter(stock => 
      stock.name.includes(keyword) || stock.code.includes(keyword)
    );
    
    this.updateStockTable(filtered);
  }

  /**
   * 排序股票
   */
  sortStocks(sortBy) {
    let sorted = [...this.stockData];
    
    switch (sortBy) {
      case 'score':
        sorted.sort((a, b) => b.score - a.score);
        break;
      case 'pe':
        sorted.sort((a, b) => a.pe - b.pe);
        break;
      case 'pb':
        sorted.sort((a, b) => a.pb - b.pb);
        break;
      case 'roe':
        sorted.sort((a, b) => b.roe - a.roe);
        break;
    }
    
    this.updateStockTable(sorted);
  }

  /**
   * 切换基准显示
   */
  toggleBenchmark(button) {
    const option = this.equityChart.getOption();
    const isShowing = option.series[1].show;
    
    option.series[1].show = !isShowing;
    this.equityChart.setOption(option);
    
    button.textContent = isShowing ? '显示基准' : '隐藏基准';
  }

  /**
   * 查看股票详情
   */
  viewStockDetail(code) {
    const stock = this.stockData.find(s => s.code === code);
    if (stock) {
      alert(`股票详情:\n代码: ${stock.code}\n名称: ${stock.name}\n评分: ${stock.score}\nPE: ${stock.pe}\nPB: ${stock.pb}\nROE: ${stock.roe}%\n市值: ${stock.marketCap}亿`);
    }
  }

  /**
   * 保存策略
   */
  saveStrategy() {
    const strategy = this.getStrategyParams();
    const strategyJson = JSON.stringify(strategy, null, 2);
    
    const blob = new Blob([strategyJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `strategy_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.showMessage('策略保存成功！', 'success');
  }

  /**
   * 加载策略
   */
  loadStrategy() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const strategy = JSON.parse(e.target.result);
            this.applyStrategy(strategy);
            this.showMessage('策略加载成功！', 'success');
          } catch (error) {
            this.showMessage('策略文件格式错误！', 'error');
          }
        };
        reader.readAsText(file);
      }
    };
    
    input.click();
  }

  /**
   * 应用策略参数
   */
  applyStrategy(strategy) {
    // 应用基础设置
    document.getElementById('stockPool').value = strategy.stockPool;
    document.getElementById('timeRange').value = strategy.timeRange;
    
    // 应用因子权重
    document.getElementById('peWeight').value = strategy.factors.pe;
    document.getElementById('peWeight').nextElementSibling.textContent = strategy.factors.pe + '%';
    
    document.getElementById('pbWeight').value = strategy.factors.pb;
    document.getElementById('pbWeight').nextElementSibling.textContent = strategy.factors.pb + '%';
    
    document.getElementById('roeWeight').value = strategy.factors.roe;
    document.getElementById('roeWeight').nextElementSibling.textContent = strategy.factors.roe + '%';
    
    document.getElementById('momentumWeight').value = strategy.factors.momentum;
    document.getElementById('momentumWeight').nextElementSibling.textContent = strategy.factors.momentum + '%';
    
    document.getElementById('volatilityWeight').value = strategy.factors.volatility;
    document.getElementById('volatilityWeight').nextElementSibling.textContent = strategy.factors.volatility + '%';
    
    // 应用筛选条件
    document.getElementById('minMarketCap').value = strategy.filters.minMarketCap;
    document.getElementById('maxPe').value = strategy.filters.maxPe;
    document.getElementById('minRoe').value = strategy.filters.minRoe;
    
    this.updateWeightSum();
  }

  /**
   * 加载默认策略
   */
  loadDefaultStrategy() {
    const defaultStrategy = {
      stockPool: 'all',
      timeRange: '1y',
      factors: {
        pe: 20,
        pb: 15,
        roe: 25,
        momentum: 20,
        volatility: 20
      },
      filters: {
        minMarketCap: 50,
        maxPe: 50,
        minRoe: 5
      }
    };
    
    this.applyStrategy(defaultStrategy);
  }

  /**
   * 显示/隐藏加载提示
   */
  showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    overlay.style.display = show ? 'flex' : 'none';
  }

  /**
   * 显示消息提示
   */
  showMessage(message, type = 'info') {
    const toast = document.getElementById('messageToast');
    toast.textContent = message;
    toast.className = `message-toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
}

// 初始化应用
const app = new QuantitativeTradingApp();

// 窗口大小变化时重新调整图表
window.addEventListener('resize', () => {
  if (app.equityChart) {
    app.equityChart.resize();
  }
});
