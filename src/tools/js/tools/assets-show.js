'use strict';

class AssetsShowTool {
  init() {
    if (typeof window.initAssetsShowTool === 'function') {
      window.initAssetsShowTool();
    }
  }

  render() {
    return `
      <div class="assets-show-tool">
        <header class="toolbar">
          <div class="toolbar-left">
            <label class="btn">
              <input id="file-input" type="file" accept=".xlsx,.xls" hidden />
              导入Excel
            </label>
            <label class="btn">
              <input id="json-input" type="file" accept=".json,application/json" hidden />
              导入JSON
            </label>
            <button id="export-json" class="btn">导出JSON</button>
            <button id="export-csv" class="btn">导出CSV</button>
            <button id="export-xlsx" class="btn">导出Excel</button>
            <button id="download-template" class="btn btn-secondary">下载模板</button>
          </div>
          <div class="toolbar-right">
            <select id="filter-type" class="input">
              <option value="">全部类型</option>
              <option value="股票">股票</option>
              <option value="场内基金">场内基金</option>
              <option value="场外基金">场外基金</option>
              <option value="货币基金">货币基金</option>
            </select>
            <input id="filter-min" class="input" type="number" placeholder="最小金额" />
            <input id="filter-max" class="input" type="number" placeholder="最大金额" />
            <input id="filter-keyword" class="input" type="text" placeholder="关键字" />
            <button id="btn-filter" class="btn">筛选</button>
            <button id="btn-reset" class="btn btn-secondary">重置</button>
            <button id="btn-add" class="btn btn-primary">新增资产</button>
          </div>
        </header>

        <details class="format-note">
          <summary>表格/JSON 格式说明（导入）</summary>
          <div class="format-content">
            <p><strong>Excel</strong>：第一行表头支持下列任一列名（中英皆可，大小写不敏感）：</p>
            <ul>
              <li><strong>name / 名称</strong>（必填）</li>
              <li><strong>type / 类型</strong>（选填，默认“其他”）示例：股票、基金、现金</li>
              <li><strong>value / 金额</strong>（必填，数字）</li>
              <li><strong>currency / 币种</strong>（选填，默认 CNY）</li>
              <li><strong>remark / 备注</strong>（可选）</li>
            </ul>
            <p>Excel 示例表头：</p>
            <pre><code>name,type,value,currency,remark
招商中证白酒ETF,基金,20000,CNY,长期持有
贵州茅台,股票,35000,CNY,核心持仓</code></pre>
            <p><strong>JSON</strong>：支持数组或包含 assets 数组的对象。</p>
            <p>校验规则：<strong>name</strong> 必填，<strong>value</strong> 必须为数字；其余字段可选。</p>
          </div>
        </details>

        <details class="format-note">
          <summary>粘贴 JSON 导入</summary>
          <div class="format-content">
            <textarea id="json-textarea" class="input" placeholder='在此粘贴 JSON（数组或 {"assets": []} 对象）'></textarea>
            <div class="json-import-actions">
              <button id="import-json-text" class="btn">导入粘贴的 JSON</button>
              <span class="muted">将覆盖当前列表为以粘贴 JSON 解析后的结果</span>
            </div>
          </div>
        </details>

        <main class="asset-main">
          <section class="list-panel">
            <table class="asset-table">
              <thead>
                <tr>
                  <th>名称</th>
                  <th>类型</th>
                  <th>金额</th>
                  <th>币种</th>
                  <th>备注</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody id="table-body"></tbody>
            </table>
          </section>
          <section class="chart-panel">
            <div class="chart-header">
              <h3>资产分布 Treemap</h3>
              <div id="total-value" class="muted"></div>
            </div>
            <div id="treemap" class="treemap"></div>
            <div id="tooltip" class="tooltip" style="display:none;"></div>
          </section>
        </main>

        <div id="modal-overlay" class="asset-modal-overlay" style="display:none;">
          <div class="asset-modal">
            <h3 id="modal-title">新增资产</h3>
            <form id="asset-form">
              <input type="hidden" id="asset-id" />
              <div class="form-row">
                <label>名称</label>
                <input id="asset-name" class="input" type="text" required />
              </div>
              <div class="form-row">
                <label>类型</label>
                <select id="asset-type" class="input" required>
                  <option value="股票">股票</option>
                  <option value="场内基金">场内基金</option>
                  <option value="场外基金">场外基金</option>
                  <option value="货币基金">货币基金</option>
                </select>
              </div>
              <div class="form-row">
                <label>金额</label>
                <input id="asset-value" class="input" type="number" min="0" step="0.01" required />
              </div>
              <div class="form-row">
                <label>币种</label>
                <input id="asset-currency" class="input" type="text" value="CNY" />
              </div>
              <div class="form-row">
                <label>备注</label>
                <input id="asset-remark" class="input" type="text" />
              </div>
              <div class="modal-actions">
                <button type="submit" class="btn btn-primary">保存</button>
                <button type="button" id="btn-cancel" class="btn btn-secondary">取消</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  }
}

window.AssetsShowTool = AssetsShowTool;

if (typeof window !== 'undefined' && window.ToolRegistry) {
  window.ToolRegistry.register({
    id: 'assets-show',
    name: '资产分布',
    description: '导入、编辑和可视化个人资产分布，支持JSON、CSV与Excel导出',
    category: 'life',
    icon: 'wallet',
    component: AssetsShowTool
  });
}
