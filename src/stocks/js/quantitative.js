// 量化选股系统JavaScript模块
class QuantitativeStockSystem {
    constructor() {
        this.apiBaseUrl = 'http://localhost:5000/api/stocks';
        this.selectedStocks = [];
        this.stockList = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadStockList();
        this.updateSliderValues();
    }

    bindEvents() {
        // 策略标签切换
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // 滑块值更新
        document.querySelectorAll('.slider').forEach(slider => {
            slider.addEventListener('input', (e) => {
                this.updateSliderValue(e.target);
            });
        });

        // 运行策略按钮
        document.getElementById('runStrategy').addEventListener('click', () => {
            this.runQuantitativeStrategy();
        });

        // 搜索功能
        document.getElementById('searchStock').addEventListener('input', (e) => {
            this.filterStocks(e.target.value);
        });

        // 排序功能
        document.getElementById('sortBy').addEventListener('change', (e) => {
            this.sortStocks(e.target.value);
        });
    }

    switchTab(tabName) {
        // 切换标签
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // 切换内容
        document.querySelectorAll('.strategy-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-strategy`).classList.add('active');
    }

    updateSliderValue(slider) {
        const valueSpan = slider.parentNode.querySelector('.slider-value');
        if (valueSpan) {
            valueSpan.textContent = slider.value;
        }
    }

    updateSliderValues() {
        document.querySelectorAll('.slider').forEach(slider => {
            this.updateSliderValue(slider);
        });
    }

    async loadStockList() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/list`);
            const result = await response.json();
            
            if (result.success) {
                this.stockList = result.data;
                console.log(`加载股票列表成功，共 ${result.total} 只股票`);
            } else {
                this.showMessage('加载股票列表失败: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('加载股票列表失败:', error);
            this.showMessage('加载股票列表失败: ' + error.message, 'error');
        }
    }

    async runQuantitativeStrategy() {
        console.log('🚀 开始运行量化选股策略...');
        this.showLoading(true);
        
        try {
            // 确保股票列表已加载
            if (this.stockList.length === 0) {
                console.log('📋 股票列表为空，正在加载...');
                await this.loadStockList();
            }
            
            // 获取配置参数
            const config = this.getStrategyConfig();
            console.log('📋 策略配置:', config);
            
            // 选择要分析的股票（这里选择前50只作为示例）
            const stockCodes = this.stockList.slice(0, 50).map(stock => stock.code);
            console.log('📊 选择分析的股票数量:', stockCodes.length);
            console.log('📊 股票代码列表:', stockCodes.slice(0, 10), '...');
            
            // 检查股票代码列表是否为空
            if (stockCodes.length === 0) {
                throw new Error('股票代码列表为空，请先加载股票列表');
            }
            
            // 构建请求数据
            const requestData = {
                stock_codes: stockCodes,
                start_date: config.startDate,
                end_date: config.endDate,
                min_score: config.minScore
            };
            
            console.log('📤 发送请求到:', `${this.apiBaseUrl}/select`);
            console.log('📤 请求数据:', JSON.stringify(requestData, null, 2));
            
            // 调用批量选股API
            const response = await fetch(`${this.apiBaseUrl}/select`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            console.log('📥 收到响应:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
                headers: Object.fromEntries(response.headers.entries())
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ HTTP错误响应:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const result = await response.json();
            console.log('📥 响应数据:', JSON.stringify(result, null, 2));
            
            if (result.success) {
                console.log('✅ 选股成功:', {
                    selectedCount: result.data.selected_stocks.length,
                    report: result.data.report
                });
                this.selectedStocks = result.data.selected_stocks;
                this.displayResults(result.data.report);
                this.renderStockTable();
                this.showMessage(`选股完成，共选出 ${result.data.selected_stocks.length} 只股票`, 'success');
            } else {
                console.error('❌ 选股失败:', result.message);
                this.showMessage('选股失败: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('❌ 选股请求异常:', error);
            console.error('❌ 错误堆栈:', error.stack);
            this.showMessage('选股失败: ' + error.message, 'error');
        } finally {
            console.log('🏁 选股流程结束，隐藏加载状态');
            this.showLoading(false);
        }
    }

    getStrategyConfig() {
        const timeRange = document.getElementById('timeRange').value;
        const minScore = parseFloat(document.getElementById('minScore').value);
        
        // 计算日期范围
        const endDate = new Date();
        const startDate = new Date();
        
        switch (timeRange) {
            case '1y':
                startDate.setFullYear(endDate.getFullYear() - 1);
                break;
            case '2y':
                startDate.setFullYear(endDate.getFullYear() - 2);
                break;
            case '3y':
                startDate.setFullYear(endDate.getFullYear() - 3);
                break;
            case '5y':
                startDate.setFullYear(endDate.getFullYear() - 5);
                break;
        }
        
        return {
            startDate: this.formatDate(startDate),
            endDate: this.formatDate(endDate),
            minScore: minScore
        };
    }

    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    }

    displayResults(report) {
        // 更新绩效指标
        document.getElementById('annualReturn').textContent = '--';
        document.getElementById('sharpeRatio').textContent = '--';
        document.getElementById('maxDrawdown').textContent = '--';
        document.getElementById('winRate').textContent = `${report.selection_rate.toFixed(2)}%`;
        
        // 更新统计信息
        console.log('选股报告:', report);
    }

    renderStockTable() {
        const tbody = document.getElementById('stockTableBody');
        tbody.innerHTML = '';

        if (this.selectedStocks.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" class="text-center">暂无符合条件的股票</td></tr>';
            return;
        }

        this.selectedStocks.forEach((stock, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${stock.stock_code}</td>
                <td>${stock.current_price.toFixed(2)}</td>
                <td class="${stock.change_pct >= 0 ? 'positive' : 'negative'}">
                    ${stock.change_pct >= 0 ? '+' : ''}${stock.change_pct.toFixed(2)}%
                </td>
                <td>
                    <span class="score-badge ${this.getScoreClass(stock.scores.combined_score)}">
                        ${stock.scores.combined_score.toFixed(3)}
                    </span>
                </td>
                <td>${stock.scores.pattern_score.toFixed(3)}</td>
                <td>${stock.scores.advanced_pattern_score.toFixed(3)}</td>
                <td>${stock.technical_indicators.kdj.j.toFixed(1)}</td>
                <td>
                    <div class="indicator-tags">
                        ${this.renderTechnicalIndicators(stock.technical_indicators)}
                    </div>
                </td>
                <td>
                    <div class="pattern-tags">
                        ${this.renderPatternSignals(stock.pattern_signals, stock.advanced_patterns)}
                    </div>
                </td>
                <td>
                    <button class="btn btn-small" onclick="quantitativeSystem.analyzeStock('${stock.stock_code}')">
                        详细分析
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    getScoreClass(score) {
        if (score >= 0.8) return 'score-excellent';
        if (score >= 0.6) return 'score-good';
        if (score >= 0.4) return 'score-fair';
        return 'score-poor';
    }

    renderTechnicalIndicators(indicators) {
        const tags = [];
        
        // KDJ信号
        if (indicators.kdj.j < 13) {
            tags.push('<span class="tag tag-success">KDJ超卖</span>');
        }
        
        // RSI信号
        if (indicators.rsi < 30) {
            tags.push('<span class="tag tag-warning">RSI超卖</span>');
        } else if (indicators.rsi > 70) {
            tags.push('<span class="tag tag-danger">RSI超买</span>');
        }
        
        // MACD信号
        if (indicators.macd.macd > indicators.macd.signal) {
            tags.push('<span class="tag tag-success">MACD金叉</span>');
        }
        
        return tags.join('');
    }

    renderPatternSignals(basicPatterns, advancedPatterns) {
        const tags = [];
        
        // 基础图形信号
        if (basicPatterns.n_pattern) tags.push('<span class="tag tag-primary">N型趋势</span>');
        if (basicPatterns.volume_contraction) tags.push('<span class="tag tag-info">缩量回调</span>');
        if (basicPatterns.fake_yin_real_yang) tags.push('<span class="tag tag-warning">假阴真阳</span>');
        if (basicPatterns.green_hat) tags.push('<span class="tag tag-danger">大绿帽</span>');
        if (basicPatterns.zhixing_trend) tags.push('<span class="tag tag-success">知行趋势</span>');
        
        // 高级图形信号
        if (advancedPatterns.cup_handle) tags.push('<span class="tag tag-purple">杯柄形态</span>');
        if (advancedPatterns.double_bottom) tags.push('<span class="tag tag-blue">双底形态</span>');
        if (advancedPatterns.triangle) tags.push('<span class="tag tag-orange">三角形</span>');
        if (advancedPatterns.head_shoulders) tags.push('<span class="tag tag-pink">头肩底</span>');
        if (advancedPatterns.breakout) tags.push('<span class="tag tag-green">突破形态</span>');
        if (advancedPatterns.golden_cross) tags.push('<span class="tag tag-yellow">金叉</span>');
        
        return tags.join('');
    }

    async analyzeStock(stockCode) {
        try {
            this.showLoading(true);
            
            const response = await fetch(`${this.apiBaseUrl}/analyze/${stockCode}`);
            const result = await response.json();
            
            if (result.success) {
                this.showStockAnalysis(result.data);
            } else {
                this.showMessage('分析股票失败: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('分析股票失败:', error);
            this.showMessage('分析股票失败: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    showStockAnalysis(stockData) {
        // 创建分析弹窗
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>股票详细分析 - ${stockData.stock_code}</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="analysis-grid">
                        <div class="analysis-section">
                            <h4>基本信息</h4>
                            <p>当前价格: ${stockData.current_price.toFixed(2)}</p>
                            <p>涨跌幅: ${stockData.change_pct.toFixed(2)}%</p>
                            <p>成交量: ${stockData.volume.toLocaleString()}</p>
                        </div>
                        
                        <div class="analysis-section">
                            <h4>技术指标</h4>
                            <p>KDJ: K=${stockData.technical_indicators.kdj.k.toFixed(2)}, D=${stockData.technical_indicators.kdj.d.toFixed(2)}, J=${stockData.technical_indicators.kdj.j.toFixed(2)}</p>
                            <p>MA: MA5=${stockData.technical_indicators.ma.ma5.toFixed(2)}, MA20=${stockData.technical_indicators.ma.ma20.toFixed(2)}, MA60=${stockData.technical_indicators.ma.ma60.toFixed(2)}</p>
                            <p>RSI: ${stockData.technical_indicators.rsi.toFixed(2)}</p>
                        </div>
                        
                        <div class="analysis-section">
                            <h4>评分系统</h4>
                            <p>综合评分: ${stockData.scores.combined_score.toFixed(3)}</p>
                            <p>基础评分: ${stockData.scores.pattern_score.toFixed(3)}</p>
                            <p>高级评分: ${stockData.scores.advanced_pattern_score.toFixed(3)}</p>
                        </div>
                        
                        <div class="analysis-section">
                            <h4>选股条件</h4>
                            <div class="criteria-list">
                                ${Object.entries(stockData.selection_criteria).map(([key, value]) => 
                                    `<div class="criteria-item ${value ? 'met' : 'not-met'}">
                                        ${this.getCriteriaName(key)}: ${value ? '✓' : '✗'}
                                    </div>`
                                ).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    getCriteriaName(key) {
        const names = {
            'n_pattern': 'N型上涨趋势',
            'trend_up': '趋势向上',
            'kdj_j_less_13': 'KDJ-J<13',
            'volume_contraction': '缩量回调',
            'top_no_volume': '顶部无量',
            'zhixing_trend': '知行趋势线',
            'no_abnormal_limit_up': '无异常涨停',
            'pattern_score_ok': '图形评分>0.5'
        };
        return names[key] || key;
    }

    filterStocks(searchTerm) {
        const rows = document.querySelectorAll('#stockTableBody tr');
        rows.forEach(row => {
            const code = row.cells[0].textContent.toLowerCase();
            const visible = code.includes(searchTerm.toLowerCase());
            row.style.display = visible ? '' : 'none';
        });
    }

    sortStocks(sortBy) {
        // 这里可以实现排序逻辑
        console.log('排序方式:', sortBy);
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        overlay.style.display = show ? 'flex' : 'none';
    }

    showMessage(message, type = 'info') {
        const toast = document.getElementById('messageToast');
        toast.textContent = message;
        toast.className = `message-toast ${type}`;
        toast.style.display = 'block';
        
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }
}

// 初始化系统
const quantitativeSystem = new QuantitativeStockSystem();
