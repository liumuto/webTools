'use strict';

/**
 * 编解码与 JSON 工具
 * 支持 Base64、URL、HTML 实体、Unicode、Hex、JSON 处理、JWT 解析和二维码占位生成。
 */
class EncoderTool {
  constructor() {
    this.currentTab = 'base64';
    this.currentQrCanvas = null;
  }

  render() {
    return `
      <div class="encoder">
        <div class="encoder__tabs" role="tablist" aria-label="编解码工具分类">
          ${this.renderTab('base64', 'Base64')}
          ${this.renderTab('url', 'URL')}
          ${this.renderTab('html', 'HTML实体')}
          ${this.renderTab('unicode', 'Unicode')}
          ${this.renderTab('hex', 'Hex')}
          ${this.renderTab('json', 'JSON')}
          ${this.renderTab('jwt', 'JWT')}
          ${this.renderTab('qr', '二维码')}
        </div>

        <div class="encoder__content">
          ${this.renderBase64Panel()}
          ${this.renderUrlPanel()}
          ${this.renderHtmlPanel()}
          ${this.renderUnicodePanel()}
          ${this.renderHexPanel()}
          ${this.renderJsonPanel()}
          ${this.renderJwtPanel()}
          ${this.renderQrPanel()}
        </div>
      </div>
    `;
  }

  renderTab(tab, label) {
    const active = this.currentTab === tab ? 'encoder__tab--active' : '';
    return `<button class="encoder__tab ${active}" data-tab="${tab}" type="button" role="tab">${label}</button>`;
  }

  renderPanel(tab, content) {
    const active = this.currentTab === tab ? 'encoder__panel--active' : '';
    return `<div class="encoder__panel ${active}" data-panel="${tab}" role="tabpanel">${content}</div>`;
  }

  renderBase64Panel() {
    return this.renderPanel('base64', `
      <div class="encoder__section">
        <h3 class="encoder__title">Base64 编解码</h3>
        ${this.renderTextareaGroup('base64Input', '输入内容：', '输入要编码或解码的文本，支持中文、Emoji 和 Base64URL...')}
        <div class="encoder__actions">
          <button id="base64EncodeBtn" class="encoder__btn encoder__btn--primary" type="button">编码</button>
          <button id="base64UrlEncodeBtn" class="encoder__btn encoder__btn--secondary" type="button">Base64URL</button>
          <button id="base64DecodeBtn" class="encoder__btn encoder__btn--secondary" type="button">解码</button>
          <button id="base64ClearBtn" class="encoder__btn encoder__btn--secondary" type="button">清空</button>
        </div>
        ${this.renderTextareaGroup('base64Output', '结果：', '处理结果将显示在这里...', true)}
        <button id="base64CopyBtn" class="encoder__btn encoder__btn--small" type="button">复制结果</button>
      </div>
    `);
  }

  renderUrlPanel() {
    return this.renderPanel('url', `
      <div class="encoder__section">
        <h3 class="encoder__title">URL 编解码</h3>
        ${this.renderTextareaGroup('urlInput', '输入 URL 或参数：', '输入 URL、查询字符串或需要转义的文本...')}
        <div class="encoder__actions">
          <button id="urlEncodeBtn" class="encoder__btn encoder__btn--primary" type="button">编码</button>
          <button id="urlDecodeBtn" class="encoder__btn encoder__btn--secondary" type="button">解码</button>
          <button id="urlQueryBtn" class="encoder__btn encoder__btn--secondary" type="button">解析参数</button>
          <button id="urlClearBtn" class="encoder__btn encoder__btn--secondary" type="button">清空</button>
        </div>
        ${this.renderTextareaGroup('urlOutput', '结果：', '处理结果将显示在这里...', true)}
        <button id="urlCopyBtn" class="encoder__btn encoder__btn--small" type="button">复制结果</button>
      </div>
    `);
  }

  renderHtmlPanel() {
    return this.renderPanel('html', `
      <div class="encoder__section">
        <h3 class="encoder__title">HTML 实体转换</h3>
        ${this.renderTextareaGroup('htmlInput', '输入内容：', '输入要转义或反转义的 HTML 文本...')}
        <div class="encoder__actions">
          <button id="htmlEncodeBtn" class="encoder__btn encoder__btn--primary" type="button">实体编码</button>
          <button id="htmlDecodeBtn" class="encoder__btn encoder__btn--secondary" type="button">实体解码</button>
          <button id="htmlClearBtn" class="encoder__btn encoder__btn--secondary" type="button">清空</button>
        </div>
        ${this.renderTextareaGroup('htmlOutput', '结果：', '处理结果将显示在这里...', true)}
        <button id="htmlCopyBtn" class="encoder__btn encoder__btn--small" type="button">复制结果</button>
      </div>
    `);
  }

  renderUnicodePanel() {
    return this.renderPanel('unicode', `
      <div class="encoder__section">
        <h3 class="encoder__title">Unicode 转义</h3>
        ${this.renderTextareaGroup('unicodeInput', '输入内容：', '输入文本或 \\u4e2d\\u6587 形式的 Unicode 转义...')}
        <div class="encoder__actions">
          <button id="unicodeEncodeBtn" class="encoder__btn encoder__btn--primary" type="button">转为 \\u</button>
          <button id="unicodeDecodeBtn" class="encoder__btn encoder__btn--secondary" type="button">还原文本</button>
          <button id="unicodeClearBtn" class="encoder__btn encoder__btn--secondary" type="button">清空</button>
        </div>
        ${this.renderTextareaGroup('unicodeOutput', '结果：', '处理结果将显示在这里...', true)}
        <button id="unicodeCopyBtn" class="encoder__btn encoder__btn--small" type="button">复制结果</button>
      </div>
    `);
  }

  renderHexPanel() {
    return this.renderPanel('hex', `
      <div class="encoder__section">
        <h3 class="encoder__title">Hex 十六进制转换</h3>
        ${this.renderTextareaGroup('hexInput', '输入内容：', '输入文本，或输入 48656c6c6f / 48 65 6c 6c 6f 形式的 Hex...')}
        <div class="encoder__actions">
          <button id="hexEncodeBtn" class="encoder__btn encoder__btn--primary" type="button">文本转 Hex</button>
          <button id="hexDecodeBtn" class="encoder__btn encoder__btn--secondary" type="button">Hex 转文本</button>
          <button id="hexClearBtn" class="encoder__btn encoder__btn--secondary" type="button">清空</button>
        </div>
        ${this.renderTextareaGroup('hexOutput', '结果：', '处理结果将显示在这里...', true)}
        <button id="hexCopyBtn" class="encoder__btn encoder__btn--small" type="button">复制结果</button>
      </div>
    `);
  }

  renderJsonPanel() {
    return this.renderPanel('json', `
      <div class="encoder__section">
        <h3 class="encoder__title">JSON 处理</h3>
        ${this.renderTextareaGroup('jsonInput', 'JSON 内容：', '输入 JSON 字符串、对象或需要转义/反转义的内容...')}
        <div class="encoder__options encoder__options--compact">
          <div class="encoder__option">
            <label class="encoder__label" for="jsonIndent">缩进：</label>
            <select id="jsonIndent" class="encoder__select">
              <option value="2" selected>2 空格</option>
              <option value="4">4 空格</option>
              <option value="tab">Tab</option>
            </select>
          </div>
          <div class="encoder__option">
            <label class="encoder__label" for="jsonPathInput">JSON Path：</label>
            <input id="jsonPathInput" class="encoder__input" type="text" placeholder="例如 users[0].name">
          </div>
        </div>
        <div class="encoder__actions encoder__actions--wrap">
          <button id="jsonFormatBtn" class="encoder__btn encoder__btn--primary" type="button">格式化</button>
          <button id="jsonMinifyBtn" class="encoder__btn encoder__btn--secondary" type="button">压缩</button>
          <button id="jsonSortBtn" class="encoder__btn encoder__btn--secondary" type="button">排序键名</button>
          <button id="jsonValidateBtn" class="encoder__btn encoder__btn--secondary" type="button">验证</button>
          <button id="jsonPathBtn" class="encoder__btn encoder__btn--secondary" type="button">提取路径</button>
          <button id="jsonEscapeBtn" class="encoder__btn encoder__btn--secondary" type="button">转义字符串</button>
          <button id="jsonUnescapeBtn" class="encoder__btn encoder__btn--secondary" type="button">反转义</button>
          <button id="jsonClearBtn" class="encoder__btn encoder__btn--secondary" type="button">清空</button>
        </div>
        ${this.renderTextareaGroup('jsonOutput', '结果：', '处理结果将显示在这里...', true)}
        <button id="jsonCopyBtn" class="encoder__btn encoder__btn--small" type="button">复制结果</button>
        <div class="encoder__status" id="jsonStatus" aria-live="polite"></div>
      </div>
    `);
  }

  renderJwtPanel() {
    return this.renderPanel('jwt', `
      <div class="encoder__section">
        <h3 class="encoder__title">JWT 解析</h3>
        ${this.renderTextareaGroup('jwtInput', 'JWT Token：', '粘贴 header.payload.signature 格式的 JWT...')}
        <div class="encoder__actions">
          <button id="jwtParseBtn" class="encoder__btn encoder__btn--primary" type="button">解析</button>
          <button id="jwtClearBtn" class="encoder__btn encoder__btn--secondary" type="button">清空</button>
        </div>
        ${this.renderTextareaGroup('jwtOutput', '结果：', '解析结果将显示在这里，签名不会被验证...', true)}
        <button id="jwtCopyBtn" class="encoder__btn encoder__btn--small" type="button">复制结果</button>
        <div class="encoder__hint">提示：这里仅做本地解码和时间字段展示，不验证签名可信度。</div>
      </div>
    `);
  }

  renderQrPanel() {
    return this.renderPanel('qr', `
      <div class="encoder__section">
        <h3 class="encoder__title">二维码生成</h3>
        ${this.renderTextareaGroup('qrInput', '输入内容：', '输入要生成二维码的内容...')}
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
          <button id="qrGenerateBtn" class="encoder__btn encoder__btn--primary" type="button">生成二维码</button>
          <button id="qrDownloadBtn" class="encoder__btn encoder__btn--secondary" type="button" disabled>下载</button>
          <button id="qrClearBtn" class="encoder__btn encoder__btn--secondary" type="button">清空</button>
        </div>
        <div class="encoder__qr-result">
          <div id="qrCodeDisplay" class="encoder__qr-code">
            <div class="encoder__qr-placeholder">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 3h6v6H3V3zm12 0h6v6h-6V3zM3 15h6v6H3v-6zm12 0h6v6h-6v-6z"/>
              </svg>
              <p>二维码将显示在这里</p>
            </div>
          </div>
        </div>
      </div>
    `);
  }

  renderTextareaGroup(id, label, placeholder, readonly = false) {
    return `
      <div class="encoder__input-group">
        <label class="encoder__label" for="${id}">${label}</label>
        <textarea id="${id}" class="encoder__textarea" ${readonly ? 'readonly' : ''} placeholder="${placeholder}"></textarea>
      </div>
    `;
  }

  init() {
    this.initTabs();
    this.initBase64();
    this.initUrl();
    this.initHtml();
    this.initUnicode();
    this.initHex();
    this.initJson();
    this.initJwt();
    this.initQrCode();
  }

  initTabs() {
    document.querySelectorAll('.encoder__tab').forEach(tab => {
      tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
    });
  }

  switchTab(tabName) {
    document.querySelectorAll('.encoder__tab').forEach(tab => {
      tab.classList.toggle('encoder__tab--active', tab.dataset.tab === tabName);
    });
    document.querySelectorAll('.encoder__panel').forEach(panel => {
      panel.classList.toggle('encoder__panel--active', panel.dataset.panel === tabName);
    });
    this.currentTab = tabName;
  }

  initBase64() {
    this.on('base64EncodeBtn', 'click', () => this.base64Encode(false));
    this.on('base64UrlEncodeBtn', 'click', () => this.base64Encode(true));
    this.on('base64DecodeBtn', 'click', () => this.base64Decode());
    this.on('base64ClearBtn', 'click', () => this.clearFields('base64Input', 'base64Output'));
    this.on('base64CopyBtn', 'click', () => this.copyFrom('base64Output'));
  }

  base64Encode(urlSafe) {
    const input = this.getValue('base64Input').trim();
    if (!input) return this.showMessage('请输入要编码的内容', 'warning');

    try {
      let encoded = this.utf8ToBase64(input);
      if (urlSafe) {
        encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
      }
      this.setValue('base64Output', encoded);
      this.showMessage('编码成功', 'success');
    } catch (error) {
      this.showMessage(`编码失败：${error.message}`, 'error');
    }
  }

  base64Decode() {
    const input = this.getValue('base64Input').trim();
    if (!input) return this.showMessage('请输入要解码的内容', 'warning');

    try {
      this.setValue('base64Output', this.base64ToUtf8(input));
      this.showMessage('解码成功', 'success');
    } catch (error) {
      this.showMessage(`解码失败：${error.message}`, 'error');
    }
  }

  initUrl() {
    this.on('urlEncodeBtn', 'click', () => this.transformText('urlInput', 'urlOutput', encodeURIComponent, '编码成功'));
    this.on('urlDecodeBtn', 'click', () => this.transformText('urlInput', 'urlOutput', decodeURIComponent, '解码成功'));
    this.on('urlQueryBtn', 'click', () => this.parseUrlQuery());
    this.on('urlClearBtn', 'click', () => this.clearFields('urlInput', 'urlOutput'));
    this.on('urlCopyBtn', 'click', () => this.copyFrom('urlOutput'));
  }

  parseUrlQuery() {
    const input = this.getValue('urlInput').trim();
    if (!input) return this.showMessage('请输入 URL 或查询字符串', 'warning');

    try {
      const query = input.includes('?') ? input.split('?')[1].split('#')[0] : input.replace(/^\?/, '');
      const params = new URLSearchParams(query);
      const result = {};

      params.forEach((value, key) => {
        if (Object.prototype.hasOwnProperty.call(result, key)) {
          result[key] = Array.isArray(result[key]) ? [...result[key], value] : [result[key], value];
        } else {
          result[key] = value;
        }
      });

      this.setValue('urlOutput', JSON.stringify(result, null, 2));
      this.showMessage('参数解析成功', 'success');
    } catch (error) {
      this.showMessage(`参数解析失败：${error.message}`, 'error');
    }
  }

  initHtml() {
    this.on('htmlEncodeBtn', 'click', () => this.htmlEncode());
    this.on('htmlDecodeBtn', 'click', () => this.htmlDecode());
    this.on('htmlClearBtn', 'click', () => this.clearFields('htmlInput', 'htmlOutput'));
    this.on('htmlCopyBtn', 'click', () => this.copyFrom('htmlOutput'));
  }

  htmlEncode() {
    const input = this.getValue('htmlInput');
    if (!input.trim()) return this.showMessage('请输入要编码的内容', 'warning');

    const encoded = input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    this.setValue('htmlOutput', encoded);
    this.showMessage('HTML 实体编码成功', 'success');
  }

  htmlDecode() {
    const input = this.getValue('htmlInput');
    if (!input.trim()) return this.showMessage('请输入要解码的内容', 'warning');

    const textarea = document.createElement('textarea');
    textarea.innerHTML = input;
    this.setValue('htmlOutput', textarea.value);
    this.showMessage('HTML 实体解码成功', 'success');
  }

  initUnicode() {
    this.on('unicodeEncodeBtn', 'click', () => this.unicodeEncode());
    this.on('unicodeDecodeBtn', 'click', () => this.unicodeDecode());
    this.on('unicodeClearBtn', 'click', () => this.clearFields('unicodeInput', 'unicodeOutput'));
    this.on('unicodeCopyBtn', 'click', () => this.copyFrom('unicodeOutput'));
  }

  unicodeEncode() {
    const input = this.getValue('unicodeInput');
    if (!input.trim()) return this.showMessage('请输入要转换的内容', 'warning');

    const output = Array.from(input).map(char => {
      const codePoint = char.codePointAt(0);
      if (codePoint <= 0xffff) {
        return `\\u${codePoint.toString(16).padStart(4, '0')}`;
      }
      const high = Math.floor((codePoint - 0x10000) / 0x400) + 0xd800;
      const low = ((codePoint - 0x10000) % 0x400) + 0xdc00;
      return `\\u${high.toString(16)}\\u${low.toString(16)}`;
    }).join('');

    this.setValue('unicodeOutput', output);
    this.showMessage('Unicode 转义成功', 'success');
  }

  unicodeDecode() {
    const input = this.getValue('unicodeInput').trim();
    if (!input) return this.showMessage('请输入要还原的 Unicode 内容', 'warning');

    try {
      const output = input
        .replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
        .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
        .replace(/\\x([0-9a-fA-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

      this.setValue('unicodeOutput', output);
      this.showMessage('Unicode 还原成功', 'success');
    } catch (error) {
      this.showMessage(`Unicode 还原失败：${error.message}`, 'error');
    }
  }

  initHex() {
    this.on('hexEncodeBtn', 'click', () => this.hexEncode());
    this.on('hexDecodeBtn', 'click', () => this.hexDecode());
    this.on('hexClearBtn', 'click', () => this.clearFields('hexInput', 'hexOutput'));
    this.on('hexCopyBtn', 'click', () => this.copyFrom('hexOutput'));
  }

  hexEncode() {
    const input = this.getValue('hexInput');
    if (!input.trim()) return this.showMessage('请输入要转换的文本', 'warning');

    const bytes = new TextEncoder().encode(input);
    const output = Array.from(bytes).map(byte => byte.toString(16).padStart(2, '0')).join(' ');
    this.setValue('hexOutput', output);
    this.showMessage('文本转 Hex 成功', 'success');
  }

  hexDecode() {
    const input = this.getValue('hexInput').trim();
    if (!input) return this.showMessage('请输入 Hex 内容', 'warning');

    try {
      const normalized = input.replace(/0x/gi, '').replace(/[^0-9a-fA-F]/g, '');
      if (normalized.length % 2 !== 0) {
        throw new Error('Hex 字符数量必须为偶数');
      }

      const bytes = new Uint8Array(normalized.match(/.{2}/g).map(hex => parseInt(hex, 16)));
      this.setValue('hexOutput', new TextDecoder().decode(bytes));
      this.showMessage('Hex 转文本成功', 'success');
    } catch (error) {
      this.showMessage(`Hex 转换失败：${error.message}`, 'error');
    }
  }

  initJson() {
    this.on('jsonFormatBtn', 'click', () => this.jsonFormat());
    this.on('jsonMinifyBtn', 'click', () => this.jsonMinify());
    this.on('jsonSortBtn', 'click', () => this.jsonSortKeys());
    this.on('jsonValidateBtn', 'click', () => this.jsonValidate());
    this.on('jsonPathBtn', 'click', () => this.jsonExtractPath());
    this.on('jsonEscapeBtn', 'click', () => this.jsonEscapeString());
    this.on('jsonUnescapeBtn', 'click', () => this.jsonUnescapeString());
    this.on('jsonClearBtn', 'click', () => {
      this.clearFields('jsonInput', 'jsonOutput', 'jsonPathInput');
      this.setStatus('', '');
    });
    this.on('jsonCopyBtn', 'click', () => this.copyFrom('jsonOutput'));
  }

  jsonFormat() {
    const parsed = this.parseJsonInput();
    if (parsed === null) return;

    this.setValue('jsonOutput', JSON.stringify(parsed, null, this.getJsonIndent()));
    this.setStatus('JSON 格式正确，已格式化', 'success');
    this.showMessage('JSON 格式化成功', 'success');
  }

  jsonMinify() {
    const parsed = this.parseJsonInput();
    if (parsed === null) return;

    this.setValue('jsonOutput', JSON.stringify(parsed));
    this.setStatus('JSON 格式正确，已压缩', 'success');
    this.showMessage('JSON 压缩成功', 'success');
  }

  jsonSortKeys() {
    const parsed = this.parseJsonInput();
    if (parsed === null) return;

    this.setValue('jsonOutput', JSON.stringify(this.sortObjectKeys(parsed), null, this.getJsonIndent()));
    this.setStatus('JSON 格式正确，键名已递归排序', 'success');
    this.showMessage('JSON 键名排序成功', 'success');
  }

  jsonValidate() {
    const parsed = this.parseJsonInput();
    if (parsed === null) return;

    const type = Array.isArray(parsed) ? 'array' : typeof parsed;
    const count = Array.isArray(parsed) ? parsed.length : (parsed && typeof parsed === 'object' ? Object.keys(parsed).length : 1);
    this.setStatus(`JSON 格式正确，类型：${type}，一级项数量：${count}`, 'success');
    this.showMessage('JSON 验证通过', 'success');
  }

  jsonExtractPath() {
    const parsed = this.parseJsonInput();
    if (parsed === null) return;

    const path = this.getValue('jsonPathInput').trim();
    if (!path) return this.showMessage('请输入 JSON Path，例如 users[0].name', 'warning');

    try {
      const value = this.resolveJsonPath(parsed, path);
      this.setValue('jsonOutput', typeof value === 'string' ? value : JSON.stringify(value, null, this.getJsonIndent()));
      this.setStatus(`已提取路径：${path}`, 'success');
      this.showMessage('路径提取成功', 'success');
    } catch (error) {
      this.setStatus(`路径提取失败：${error.message}`, 'error');
      this.showMessage(`路径提取失败：${error.message}`, 'error');
    }
  }

  jsonEscapeString() {
    const input = this.getValue('jsonInput');
    if (!input) return this.showMessage('请输入要转义的内容', 'warning');

    this.setValue('jsonOutput', JSON.stringify(input));
    this.setStatus('已转为 JSON 字符串字面量', 'success');
    this.showMessage('字符串转义成功', 'success');
  }

  jsonUnescapeString() {
    const input = this.getValue('jsonInput').trim();
    if (!input) return this.showMessage('请输入要反转义的内容', 'warning');

    try {
      const parsed = JSON.parse(input);
      this.setValue('jsonOutput', typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, this.getJsonIndent()));
      this.setStatus('反转义成功', 'success');
      this.showMessage('反转义成功', 'success');
    } catch (error) {
      try {
        const fallback = JSON.parse(`"${input.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`);
        this.setValue('jsonOutput', fallback);
        this.setStatus('反转义成功', 'success');
        this.showMessage('反转义成功', 'success');
      } catch (fallbackError) {
        this.setStatus(`反转义失败：${error.message}`, 'error');
        this.showMessage(`反转义失败：${error.message}`, 'error');
      }
    }
  }

  initJwt() {
    this.on('jwtParseBtn', 'click', () => this.parseJwt());
    this.on('jwtClearBtn', 'click', () => this.clearFields('jwtInput', 'jwtOutput'));
    this.on('jwtCopyBtn', 'click', () => this.copyFrom('jwtOutput'));
  }

  parseJwt() {
    const input = this.getValue('jwtInput').trim();
    if (!input) return this.showMessage('请输入 JWT Token', 'warning');

    try {
      const parts = input.split('.');
      if (parts.length !== 3) {
        throw new Error('JWT 应包含 header、payload、signature 三段');
      }

      const header = JSON.parse(this.base64ToUtf8(parts[0]));
      const payload = JSON.parse(this.base64ToUtf8(parts[1]));
      const result = {
        header,
        payload,
        time: this.describeJwtTimeClaims(payload),
        signature: parts[2],
        verified: false,
        note: '仅本地解析，未验证签名'
      };

      this.setValue('jwtOutput', JSON.stringify(result, null, 2));
      this.showMessage('JWT 解析成功', 'success');
    } catch (error) {
      this.showMessage(`JWT 解析失败：${error.message}`, 'error');
    }
  }

  initQrCode() {
    this.on('qrGenerateBtn', 'click', () => this.generateQrCode());
    this.on('qrDownloadBtn', 'click', () => this.downloadQrCode());
    this.on('qrClearBtn', 'click', () => {
      this.clearFields('qrInput');
      this.resetQrDisplay();
      const downloadBtn = document.getElementById('qrDownloadBtn');
      if (downloadBtn) downloadBtn.disabled = true;
    });
  }

  generateQrCode() {
    const input = this.getValue('qrInput').trim();
    if (!input) return this.showMessage('请输入要生成二维码的内容', 'warning');

    const size = parseInt(this.getValue('qrSize'), 10) || 200;
    const errorLevel = this.getValue('qrErrorLevel') || 'M';
    this.createQrCodeCanvas(input, size, errorLevel);

    const downloadBtn = document.getElementById('qrDownloadBtn');
    if (downloadBtn) downloadBtn.disabled = false;
    this.showMessage('二维码生成成功', 'success');
  }

  createQrCodeCanvas(text, size, errorLevel) {
    const display = document.getElementById('qrCodeDisplay');
    if (!display) return;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    canvas.style.border = '1px solid #ddd';
    canvas.style.borderRadius = '8px';

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    this.drawSimpleQrCode(ctx, `${errorLevel}:${text}`, size);

    display.innerHTML = '';
    display.appendChild(canvas);
    this.currentQrCanvas = canvas;
  }

  drawSimpleQrCode(ctx, text, size) {
    const cellSize = Math.max(2, Math.floor(size / 29));
    const grid = 25;
    const margin = (size - cellSize * grid) / 2;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#000000';

    this.drawFinderPattern(ctx, margin, margin, cellSize);
    this.drawFinderPattern(ctx, margin + cellSize * 18, margin, cellSize);
    this.drawFinderPattern(ctx, margin, margin + cellSize * 18, cellSize);

    let hash = 2166136261;
    for (let i = 0; i < text.length; i++) {
      hash ^= text.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }

    for (let row = 0; row < grid; row++) {
      for (let col = 0; col < grid; col++) {
        if ((row < 9 && col < 9) || (row < 9 && col >= 16) || (row >= 16 && col < 9)) {
          continue;
        }
        const value = (hash + row * 31 + col * 17 + row * col) & 1;
        if (value) {
          ctx.fillRect(margin + col * cellSize, margin + row * cellSize, cellSize, cellSize);
        }
      }
    }

    ctx.fillStyle = '#666666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('QR Preview', size / 2, size - 6);
  }

  drawFinderPattern(ctx, x, y, cellSize) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(x, y, cellSize * 7, cellSize * 7);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + cellSize, y + cellSize, cellSize * 5, cellSize * 5);
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + cellSize * 2, y + cellSize * 2, cellSize * 3, cellSize * 3);
  }

  downloadQrCode() {
    if (!this.currentQrCanvas) return this.showMessage('请先生成二维码', 'warning');

    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = this.currentQrCanvas.toDataURL('image/png');
    link.click();
    this.showMessage('二维码下载成功', 'success');
  }

  resetQrDisplay() {
    const display = document.getElementById('qrCodeDisplay');
    if (!display) return;
    display.innerHTML = `
      <div class="encoder__qr-placeholder">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 3h6v6H3V3zm12 0h6v6h-6V3zM3 15h6v6H3v-6zm12 0h6v6h-6v-6z"/>
        </svg>
        <p>二维码将显示在这里</p>
      </div>
    `;
    this.currentQrCanvas = null;
  }

  transformText(inputId, outputId, transform, successMessage) {
    const input = this.getValue(inputId).trim();
    if (!input) return this.showMessage('请输入要处理的内容', 'warning');

    try {
      this.setValue(outputId, transform(input));
      this.showMessage(successMessage, 'success');
    } catch (error) {
      this.showMessage(`处理失败：${error.message}`, 'error');
    }
  }

  parseJsonInput() {
    const input = this.getValue('jsonInput').trim();
    if (!input) {
      this.showMessage('请输入 JSON 内容', 'warning');
      return null;
    }

    try {
      return JSON.parse(input);
    } catch (error) {
      this.setStatus(`JSON 格式错误：${error.message}`, 'error');
      this.showMessage(`JSON 格式错误：${error.message}`, 'error');
      return null;
    }
  }

  getJsonIndent() {
    const indent = this.getValue('jsonIndent');
    return indent === 'tab' ? '\t' : Number(indent || 2);
  }

  sortObjectKeys(value) {
    if (Array.isArray(value)) {
      return value.map(item => this.sortObjectKeys(item));
    }
    if (value && typeof value === 'object') {
      return Object.keys(value).sort().reduce((result, key) => {
        result[key] = this.sortObjectKeys(value[key]);
        return result;
      }, {});
    }
    return value;
  }

  resolveJsonPath(value, path) {
    const tokens = [];
    const pattern = /(?:^|\.)([^.[\]]+)|\[(?:(\d+)|["']([^"']+)["'])\]/g;
    let match;

    while ((match = pattern.exec(path)) !== null) {
      tokens.push(match[1] ?? match[2] ?? match[3]);
    }

    if (tokens.length === 0) {
      throw new Error('路径格式不正确');
    }

    return tokens.reduce((current, token) => {
      if (current === null || current === undefined || !(token in current)) {
        throw new Error(`找不到路径片段：${token}`);
      }
      return current[token];
    }, value);
  }

  describeJwtTimeClaims(payload) {
    const claims = {};
    [
      ['iat', 'issuedAt'],
      ['nbf', 'notBefore'],
      ['exp', 'expiresAt']
    ].forEach(([source, target]) => {
      if (typeof payload[source] === 'number') {
        claims[target] = new Date(payload[source] * 1000).toLocaleString();
      }
    });
    return claims;
  }

  utf8ToBase64(text) {
    const bytes = new TextEncoder().encode(text);
    let binary = '';
    bytes.forEach(byte => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary);
  }

  base64ToUtf8(text) {
    const normalized = text.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  on(id, eventName, handler) {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener(eventName, handler);
    }
  }

  getValue(id) {
    const element = document.getElementById(id);
    return element ? element.value : '';
  }

  setValue(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.value = value;
    }
  }

  clearFields(...ids) {
    ids.forEach(id => this.setValue(id, ''));
  }

  setStatus(message, type) {
    const status = document.getElementById('jsonStatus');
    if (!status) return;

    status.textContent = message;
    status.className = type ? `encoder__status encoder__status--${type}` : 'encoder__status';
  }

  copyFrom(id) {
    this.copyToClipboard(this.getValue(id));
  }

  async copyToClipboard(text) {
    if (!text) return this.showMessage('没有内容可复制', 'warning');

    try {
      await navigator.clipboard.writeText(text);
      this.showMessage('复制成功', 'success');
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.showMessage('复制成功', 'success');
    }
  }

  showMessage(message, type = 'info') {
    const container = document.querySelector('.encoder');
    if (!container) return;

    const messageEl = document.createElement('div');
    messageEl.className = `encoder__message encoder__message--${type}`;
    messageEl.textContent = message;
    container.appendChild(messageEl);

    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.parentNode.removeChild(messageEl);
      }
    }, 3000);
  }
}

if (typeof window !== 'undefined') {
  window.EncoderTool = EncoderTool;
}

if (typeof window !== 'undefined' && window.ToolRegistry) {
  window.ToolRegistry.register({
    id: 'encoder',
    name: '编解码与 JSON 工具',
    description: '支持 Base64、URL、HTML 实体、Unicode、Hex、JWT 解析和 JSON 格式化、压缩、排序、路径提取',
    category: 'encode',
    icon: 'code',
    component: EncoderTool
  });
}
