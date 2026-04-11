'use strict';

const MARKDOWN_MAX_FILE_BYTES = 10 * 1024 * 1024;

class MarkdownEditor {
  constructor() {
    this.editorElement = null;
    this.previewElement = null;
    this.fileInput = null;
    this.themeToggle = null;
    this.exportHtmlBtn = null;
    this.isDarkTheme = false;
    this._markedOptionsApplied = false;
    this._mermaidRequestId = 0;
    this.rootElement = null;
    this.editorPanel = null;
    this.previewPanel = null;
    this.toolbar = null;
    this.dropZone = null;
    this.statusBar = null;
    this.splitRange = null;
    this.splitValueLabel = null;
    this.fontSelect = null;
    this.previewModeBtn = null;
    this.isPreviewOnly = false;
    // 撤销历史相关
    this.history = [];
    this.historyIndex = -1;
    this.historyLimit = 50;
    this.isUndoing = false;
  }

  render() {
    return `
      <div class="markdown-editor">
        <div class="markdown-editor__header">
          <div class="markdown-editor__controls">
            <button type="button" class="btn btn--outline" id="mdBackBtn">
              <svg viewBox="0 0 24 24" class="btn__icon" aria-hidden="true">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
              返回
            </button>
            <button type="button" class="btn btn--outline" id="mdNewFile">新建</button>
            <button type="button" class="btn btn--primary" id="uploadMdFile">
              <svg viewBox="0 0 24 24" class="btn__icon" aria-hidden="true">
                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
              </svg>
              上传
            </button>
            <input type="file" id="mdFileInput" class="markdown-editor__file-input"
              accept=".md,.markdown,text/markdown,text/plain">
            <button type="button" class="btn btn--secondary" id="saveMdBtn">
              <svg viewBox="0 0 24 24" class="btn__icon" aria-hidden="true">
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
              </svg>
              保存为 MD
            </button>
            <button type="button" class="btn btn--secondary" id="exportHtml">
              <svg viewBox="0 0 24 24" class="btn__icon" aria-hidden="true">
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
              </svg>
              导出 HTML
            </button>
            <button type="button" class="btn btn--outline" id="previewModeToggle">预览模式</button>
            <button type="button" class="btn btn--outline" id="themeToggle">
              <svg viewBox="0 0 24 24" class="btn__icon" aria-hidden="true">
                <path d="M20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/>
              </svg>
              主题
            </button>
          </div>
          <div class="markdown-editor__toolbar" id="mdToolbar" role="toolbar" aria-label="Markdown 快捷插入">
            <button type="button" class="markdown-editor__toolbar-btn" data-md-action="bold">加粗</button>
            <button type="button" class="markdown-editor__toolbar-btn" data-md-action="italic">斜体</button>
            <button type="button" class="markdown-editor__toolbar-btn" data-md-action="code">行内代码</button>
            <button type="button" class="markdown-editor__toolbar-btn" data-md-action="h2">标题</button>
            <button type="button" class="markdown-editor__toolbar-btn" data-md-action="ul">无序列表</button>
            <button type="button" class="markdown-editor__toolbar-btn" data-md-action="link">链接</button>
          </div>
          <div class="markdown-editor__options">
            <label class="markdown-editor__font-label" for="mdFontSize">字号</label>
            <select id="mdFontSize" class="markdown-editor__font-select">
              <option value="12">12px</option>
              <option value="14" selected>14px</option>
              <option value="16">16px</option>
              <option value="18">18px</option>
            </select>
            <label class="markdown-editor__split-label" for="mdSplitRatio">编辑区宽度</label>
            <input type="range" id="mdSplitRatio" class="markdown-editor__split-range"
              min="30" max="70" value="50" aria-valuemin="30" aria-valuemax="70" aria-valuenow="50">
            <span class="markdown-editor__split-value" id="mdSplitValue">50%</span>
          </div>
        </div>
        <div class="markdown-editor__body">
          <div class="markdown-editor__panel markdown-editor__panel--editor" id="mdDropZone">
            <label class="markdown-editor__font-label" for="markdownEditor">编辑区（可拖拽 .md 文件到此处）</label>
            <textarea class="markdown-editor__textarea" id="markdownEditor" rows="12"
              placeholder="在此输入 Markdown…"></textarea>
          </div>
          <div class="markdown-editor__panel markdown-editor__panel--preview">
            <div class="markdown-editor__preview" id="markdownPreview"></div>
          </div>
        </div>
        <footer class="markdown-editor__status" id="mdStatusBar" aria-live="polite"></footer>
      </div>
    `;
  }

  init() {
    this.editorElement = document.getElementById('markdownEditor');
    this.previewElement = document.getElementById('markdownPreview');
    this.fileInput = document.getElementById('mdFileInput');
    this.uploadBtn = document.getElementById('uploadMdFile');
    this.backBtn = document.getElementById('mdBackBtn');
    this.newFileBtn = document.getElementById('mdNewFile');
    this.saveMdBtn = document.getElementById('saveMdBtn');
    this.exportHtmlBtn = document.getElementById('exportHtml');
    this.previewModeBtn = document.getElementById('previewModeToggle');
    this.themeToggle = document.getElementById('themeToggle');
    this.toolbar = document.getElementById('mdToolbar');
    this.dropZone = document.getElementById('mdDropZone');
    this.statusBar = document.getElementById('mdStatusBar');
    this.splitRange = document.getElementById('mdSplitRatio');
    this.splitValueLabel = document.getElementById('mdSplitValue');
    this.fontSelect = document.getElementById('mdFontSize');
    this.editorPanel = document.querySelector('.markdown-editor__panel--editor');
    this.previewPanel = document.querySelector('.markdown-editor__panel--preview');
    this.rootElement = this.editorElement
      ? this.editorElement.closest('.markdown-editor')
      : document.querySelector('.markdown-editor');

    this.loadDefaultContent();
    this.applySplitRatio(Number(this.splitRange.value));
    this.applyPreviewMode();
    this.updateStatusBar();
  }

  bindEvents() {
    this.editorElement.addEventListener('input', () => {
      if (!this.isUndoing) {
        this.saveHistory();
      }
      this.updatePreview();
    });

    this.backBtn.addEventListener('click', () => {
      this.goBack();
    });

    this.newFileBtn.addEventListener('click', () => {
      this.handleNewDocument();
    });

    this.uploadBtn.addEventListener('click', () => {
      this.fileInput.click();
    });

    this.fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.readFile(file);
      }
      this.fileInput.value = '';
    });

    this.saveMdBtn.addEventListener('click', () => {
      this.exportMarkdown();
    });

    this.exportHtmlBtn.addEventListener('click', () => {
      this.exportHtml();
    });

    this.previewModeBtn.addEventListener('click', () => {
      this.togglePreviewMode();
    });

    this.themeToggle.addEventListener('click', () => {
      this.toggleTheme();
    });

    this.toolbar.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-md-action]');
      if (!btn) {
        return;
      }
      this.applyToolbarAction(btn.getAttribute('data-md-action'));
    });

    this.fontSelect.addEventListener('change', () => {
      const px = this.fontSelect.value;
      this.editorElement.style.fontSize = `${px}px`;
      this.previewElement.style.fontSize = `${px}px`;
    });

    this.splitRange.addEventListener('input', () => {
      const v = Number(this.splitRange.value);
      this.applySplitRatio(v);
      this.splitRange.setAttribute('aria-valuenow', String(v));
    });

    this.bindScrollSync();
    this.bindDropZone();
    this.bindKeyboardShortcuts();
  }

  bindKeyboardShortcuts() {
    this.editorElement.addEventListener('keydown', (e) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) {
        return;
      }
      if (e.key === 'b') {
        e.preventDefault();
        this.wrapSelection('**', '**');
      } else if (e.key === 'i') {
        e.preventDefault();
        this.wrapSelection('*', '*');
      } else if (e.key === 's') {
        e.preventDefault();
        this.exportMarkdown();
      } else if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        this.undo();
      } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
        e.preventDefault();
        this.redo();
      }
    });
  }

  bindDropZone() {
    this.dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      this.dropZone.classList.add('markdown-editor__panel--drag');
    });
    this.dropZone.addEventListener('dragleave', () => {
      this.dropZone.classList.remove('markdown-editor__panel--drag');
    });
    this.dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.dropZone.classList.remove('markdown-editor__panel--drag');
      const file = e.dataTransfer.files[0];
      if (file) {
        this.readFile(file);
      }
    });
  }

  applySplitRatio(percentEditor) {
    if (!this.editorPanel || !this.previewPanel) {
      return;
    }
    const ed = Math.min(70, Math.max(30, percentEditor));
    const pr = 100 - ed;
    this.editorPanel.style.flex = `${ed} 1 0%`;
    this.previewPanel.style.flex = `${pr} 1 0%`;
    if (this.splitValueLabel) {
      this.splitValueLabel.textContent = `${ed}%`;
    }
  }

  applyToolbarAction(action) {
    this.saveHistory();
    switch (action) {
      case 'bold':
        this.wrapSelection('**', '**');
        break;
      case 'italic':
        this.wrapSelection('*', '*');
        break;
      case 'code':
        this.wrapSelection('`', '`');
        break;
      case 'h2':
        this.insertLinePrefix('## ');
        break;
      case 'ul':
        this.insertLinePrefix('- ');
        break;
      case 'link':
        this.wrapSelection('[', '](https://)');
        break;
      default:
        break;
    }
  }

  wrapSelection(before, after) {
    const ta = this.editorElement;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const val = ta.value;
    const selected = val.slice(start, end);
    const next = val.slice(0, start) + before + selected + after + val.slice(end);
    ta.value = next;
    const innerEnd = start + before.length + selected.length;
    ta.focus();
    ta.selectionStart = start + before.length;
    ta.selectionEnd = innerEnd;
    this.updatePreview();
  }

  insertLinePrefix(prefix) {
    const ta = this.editorElement;
    const pos = ta.selectionStart;
    const val = ta.value;
    const lineStart = val.lastIndexOf('\n', pos - 1) + 1;
    const next = val.slice(0, lineStart) + prefix + val.slice(lineStart);
    ta.value = next;
    const newPos = lineStart + prefix.length;
    ta.selectionStart = ta.selectionEnd = newPos;
    ta.focus();
    this.updatePreview();
  }

  handleNewDocument() {
    if (this.editorElement.value.trim() !== '') {
      const ok = window.confirm('当前内容未保存为文件，确定新建空白文档？');
      if (!ok) {
        return;
      }
    }
    this.editorElement.value = '';
    this.updatePreview();
    this.saveHistory();
    this.setStatusMessage('已新建空白文档');
  }

  bindScrollSync() {
    let isScrollingEditor = false;
    let isScrollingPreview = false;

    this.editorPanel.addEventListener('scroll', () => {
      if (!isScrollingPreview) {
        isScrollingEditor = true;
        const ed = this.editorPanel;
        const pr = this.previewPanel;
        const edRange = ed.scrollHeight - ed.clientHeight;
        const prRange = pr.scrollHeight - pr.clientHeight;
        if (edRange > 0 && prRange > 0) {
          const scrollRatio = ed.scrollTop / edRange;
          pr.scrollTop = scrollRatio * prRange;
        }
        window.setTimeout(() => {
          isScrollingEditor = false;
        }, 80);
      }
    });

    this.previewPanel.addEventListener('scroll', () => {
      if (!isScrollingEditor) {
        isScrollingPreview = true;
        const ed = this.editorPanel;
        const pr = this.previewPanel;
        const edRange = ed.scrollHeight - ed.clientHeight;
        const prRange = pr.scrollHeight - pr.clientHeight;
        if (edRange > 0 && prRange > 0) {
          const scrollRatio = pr.scrollTop / prRange;
          ed.scrollTop = scrollRatio * edRange;
        }
        window.setTimeout(() => {
          isScrollingPreview = false;
        }, 80);
      }
    });
  }

  loadDefaultContent() {
    this.editorElement.value = '';
    this.updatePreview();
    this.saveHistory();
    this.setStatusMessage('就绪。支持点击或拖拽上传，最大 10MB。');
  }

  saveHistory() {
    const content = this.editorElement.value;
    const selectionStart = this.editorElement.selectionStart;
    const selectionEnd = this.editorElement.selectionEnd;
    
    // 移除当前索引之后的历史记录
    this.history = this.history.slice(0, this.historyIndex + 1);
    
    // 添加新的历史记录
    this.history.push({ content, selectionStart, selectionEnd, timestamp: Date.now() });
    
    // 限制历史记录数量
    if (this.history.length > this.historyLimit) {
      this.history.shift();
    } else {
      this.historyIndex++;
    }
  }

  setStatusMessage(text) {
    this.updateStatusBar(text);
  }

  applyPreviewMode() {
    if (!this.rootElement) {
      return;
    }
    this.rootElement.classList.toggle('markdown-editor--preview-only', this.isPreviewOnly);
    if (this.previewModeBtn) {
      this.previewModeBtn.textContent = this.isPreviewOnly ? '退出预览' : '预览模式';
      this.previewModeBtn.classList.toggle('btn--secondary', this.isPreviewOnly);
      this.previewModeBtn.classList.toggle('btn--outline', !this.isPreviewOnly);
    }
  }

  togglePreviewMode() {
    this.isPreviewOnly = !this.isPreviewOnly;
    this.applyPreviewMode();
    this.updateStatusBar(this.isPreviewOnly ? '当前为预览模式' : '已退出预览模式');
  }

  updateStatusBar(optionalMessage) {
    if (!this.statusBar) {
      return;
    }
    const text = this.editorElement.value;
    const chars = text.length;
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const lines = text === '' ? 0 : text.split('\n').length;
    const extra = optionalMessage ? ` · ${optionalMessage}` : '';
    this.statusBar.textContent = `字符 ${chars} · 词约 ${words} · 行 ${lines}${extra}`;
  }

  updatePreview() {
    const markdown = this.editorElement.value;
    const requestId = ++this._mermaidRequestId;
    try {
      const rawHtml = this.parseMarkdown(markdown);
      this.previewElement.innerHTML = this.sanitizeHtml(rawHtml);
      this.highlightCode();
      this.renderMermaidDiagrams(requestId);
    } catch (err) {
      console.error('Markdown preview error:', err);
      this.previewElement.innerHTML = this.formatPreviewError(err);
    }
    this.updateStatusBar();
  }

  formatPreviewError(err) {
    const msg = err && err.message ? String(err.message) : '预览失败';
    const safe = msg
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return `<p class="markdown-editor__error">预览出错：${safe}</p>`;
  }

  ensureMarkedOptions() {
    if (this._markedOptionsApplied || typeof marked === 'undefined') {
      return;
    }
    marked.setOptions({
      highlight(code, lang) {
        if (lang === 'mermaid') {
          return code;
        }
        if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(code, { language: lang }).value;
          } catch (e) {
            return code;
          }
        }
        return code;
      },
      breaks: true,
      gfm: true
    });
    this._markedOptionsApplied = true;
  }

  runMarkedParse(markdown) {
    this.ensureMarkedOptions();
    if (typeof marked.parse === 'function') {
      return marked.parse(markdown);
    }
    if (typeof marked === 'function') {
      return marked(markdown);
    }
    throw new Error('marked 未正确加载（缺少 parse 方法）');
  }

  parseMarkdown(markdown) {
    if (typeof marked !== 'undefined') {
      return this.runMarkedParse(markdown);
    }
    return this.parseMarkdownFallback(markdown);
  }

  parseMarkdownFallback(markdown) {
    let html = markdown
      .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        const languageClass = lang ? ` class="language-${lang}"` : '';
        const safeCode = code
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        return `<pre><code${languageClass}>${safeCode}</code></pre>`;
      })
      .replace(/^#{1}(.+$)/gm, '<h1>$1</h1>')
      .replace(/^#{2}(.+$)/gm, '<h2>$1</h2>')
      .replace(/^#{3}(.+$)/gm, '<h3>$1</h3>')
      .replace(/^#{4}(.+$)/gm, '<h4>$1</h4>')
      .replace(/^\s*\-\s+(.+$)/gm, '<li>$1</li>')
      .replace(/^\s*\d+\.\s+(.+$)/gm, '<li>$1</li>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^\)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/^>\s+(.+$)/gm, '<blockquote>$1</blockquote>')
      .replace(/\|(.+?)\|\n\|(.+?)\|\n((?:\|.+?\|\n)+)/g, (match, headers, separators, rows) => {
        const headerCells = headers.split('|').filter((cell) => cell.trim() !== '');
        const rowCells = rows.trim().split('\n').map((row) =>
          row.split('|').filter((cell) => cell.trim() !== '')
        );
        let tableHtml = '<table><thead><tr>';
        headerCells.forEach((cell) => {
          tableHtml += `<th>${cell.trim()}</th>`;
        });
        tableHtml += '</tr></thead><tbody>';
        rowCells.forEach((row) => {
          tableHtml += '<tr>';
          row.forEach((cell) => {
            tableHtml += `<td>${cell.trim()}</td>`;
          });
          tableHtml += '</tr>';
        });
        tableHtml += '</tbody></table>';
        return tableHtml;
      })
      .replace(/\n/g, '<br>');
    html = html.replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>');
    return html;
  }

  sanitizeHtml(html) {
    if (typeof DOMPurify !== 'undefined') {
      return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
    }
    return html;
  }

  highlightCode() {
    const codeBlocks = this.previewElement.querySelectorAll('pre code');
    if (typeof hljs === 'undefined') {
      codeBlocks.forEach((code) => {
        if (!code.classList.contains('language-mermaid')) {
          code.classList.add('hljs');
        }
      });
      return;
    }
    codeBlocks.forEach((code) => {
      if (code.classList.contains('language-mermaid')) {
        return;
      }
      try {
        hljs.highlightElement(code);
      } catch (e) {
        code.classList.add('hljs');
      }
    });
  }

  renderMermaidDiagrams(requestId) {
    if (typeof mermaid === 'undefined') {
      return;
    }
    this.ensureMermaidConfig();
    const blocks = this.previewElement.querySelectorAll('pre code.language-mermaid');
    blocks.forEach((block, index) => {
      const source = block.textContent.trim();
      const pre = block.closest('pre');
      if (!pre || source === '') {
        return;
      }
      const container = document.createElement('div');
      container.className = 'markdown-editor__mermaid';
      pre.replaceWith(container);
      mermaid.render(`markdown-mermaid-${requestId}-${index}`, source)
        .then(({ svg }) => {
          if (requestId === this._mermaidRequestId && container.isConnected) {
            container.innerHTML = svg;
          }
        })
        .catch((error) => {
          console.error('Mermaid渲染失败:', error);
          if (requestId !== this._mermaidRequestId || !container.isConnected) {
            return;
          }
          const message = error && error.message ? error.message : '语法错误';
          const safeMessage = message
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
          container.innerHTML = `<div class="markdown-editor__error markdown-editor__error--mermaid">Mermaid 渲染失败：${safeMessage}</div>`;
        });
    });
  }

  ensureMermaidConfig() {
    if (typeof mermaid === 'undefined') {
      return;
    }
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'loose',
      theme: this.isDarkTheme ? 'dark' : 'default'
    });
  }

  readFile(file) {
    if (file.size > MARKDOWN_MAX_FILE_BYTES) {
      const mb = (file.size / (1024 * 1024)).toFixed(2);
      this.setStatusMessage(`文件超过 10MB 上限（当前约 ${mb}MB）`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      this.editorElement.value = e.target.result;
      this.updatePreview();
      this.saveHistory();
      this.setStatusMessage(`已载入：${file.name}`);
    };
    reader.onerror = () => {
      this.setStatusMessage('文件读取失败，请重试');
    };
    reader.readAsText(file);
  }

  exportMarkdown() {
    const content = this.editorElement.value;
    this.downloadFile(content, 'document.md', 'text/markdown;charset=utf-8');
    this.setStatusMessage('已触发下载 .md 文件');
  }

  exportHtml() {
    const markdown = this.editorElement.value;
    let html;
    try {
      html = this.parseMarkdown(markdown);
    } catch (e) {
      this.setStatusMessage('导出失败：Markdown 解析出错');
      return;
    }
    const body = this.sanitizeHtml(html);
    const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown导出</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6; margin: 20px; }
    h1, h2, h3, h4 { margin-top: 1.5em; margin-bottom: 0.5em; }
    h1 { font-size: 2em; }
    h2 { font-size: 1.5em; }
    h3 { font-size: 1.2em; }
    ul, ol { margin-left: 2em; }
    code { background: #f4f4f4; padding: 0.2em 0.4em; border-radius: 3px; }
    pre { background: #f4f4f4; padding: 1em; border-radius: 5px; overflow-x: auto; }
    blockquote { border-left: 4px solid #ddd; padding-left: 1em; margin-left: 0; color: #666; }
    table { border-collapse: collapse; width: 100%; margin: 1em 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
  </style>
</head>
<body>
  ${body}
</body>
</html>`;
    this.downloadFile(fullHtml, 'document.html', 'text/html;charset=utf-8');
    this.setStatusMessage('已触发下载 HTML 文件');
  }

  downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  undo() {
    if (this.historyIndex > 0) {
      this.isUndoing = true;
      this.historyIndex--;
      const historyItem = this.history[this.historyIndex];
      this.editorElement.value = historyItem.content;
      this.editorElement.selectionStart = historyItem.selectionStart;
      this.editorElement.selectionEnd = historyItem.selectionEnd;
      this.updatePreview();
      this.setStatusMessage('已撤销上一步操作');
      this.isUndoing = false;
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.isUndoing = true;
      this.historyIndex++;
      const historyItem = this.history[this.historyIndex];
      this.editorElement.value = historyItem.content;
      this.editorElement.selectionStart = historyItem.selectionStart;
      this.editorElement.selectionEnd = historyItem.selectionEnd;
      this.updatePreview();
      this.setStatusMessage('已重做操作');
      this.isUndoing = false;
    }
  }

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    const root = this.rootElement || document.querySelector('.markdown-editor');
    if (!root) {
      return;
    }
    if (this.isDarkTheme) {
      root.classList.add('markdown-editor--dark');
    } else {
      root.classList.remove('markdown-editor--dark');
    }
    this.updatePreview();
  }

  goBack() {
    if (window.webToolsApp && typeof window.webToolsApp.closeModal === 'function') {
      window.webToolsApp.closeModal();
      return;
    }

    const modal = document.getElementById('toolModal');
    if (modal) {
      modal.classList.remove('modal--active');
    }
    document.body.style.overflow = '';
  }
}

window.MarkdownEditorTool = MarkdownEditor;

if (typeof window !== 'undefined' && window.ToolRegistry) {
  window.ToolRegistry.register({
    id: 'markdown-editor',
    name: 'Markdown编辑器',
    description: '编辑和预览 Markdown，实时预览、代码高亮、拖拽上传与导出',
    category: 'text',
    icon: 'code',
    component: MarkdownEditor
  });
}
