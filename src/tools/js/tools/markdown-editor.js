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
    this.tocElement = null;
    this.tocHeadings = [];
    this.activeHeadingId = '';
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
            <button type="button" class="btn btn--secondary" id="exportPdf">
              <svg viewBox="0 0 24 24" class="btn__icon" aria-hidden="true">
                <path d="M20 2H8c-1.1 0-2 .9-2 2v4H4c-1.1 0-2 .9-2 2v8h4v4h12c1.1 0 2-.9 2-2v-4h2v-8c0-1.1-.9-2-2-2h-2V4c0-1.1-.9-2-2-2zm-3 18H9v-5h8v5zm3-7H4v-3h16v3zm-2-5H8V4h10v4z"/>
              </svg>
              导出 PDF
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
            <div class="markdown-editor__preview-shell">
              <aside class="markdown-editor__toc" id="markdownToc" aria-label="文档目录"></aside>
              <div class="markdown-editor__preview-wrap">
                <div class="markdown-editor__preview-label">预览区</div>
                <div class="markdown-editor__preview" id="markdownPreview"></div>
              </div>
            </div>
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
    this.exportPdfBtn = document.getElementById('exportPdf');
    this.previewModeBtn = document.getElementById('previewModeToggle');
    this.tocElement = document.getElementById('markdownToc');
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

    this.exportPdfBtn.addEventListener('click', () => {
      this.exportPdf();
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
    this.bindPreviewHeadingTracking();
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
    if (this.backBtn) {
      this.backBtn.hidden = this.isPreviewOnly;
      this.backBtn.setAttribute('aria-hidden', String(this.isPreviewOnly));
      this.backBtn.tabIndex = this.isPreviewOnly ? -1 : 0;
    }
    if (this.previewModeBtn) {
      this.previewModeBtn.textContent = this.isPreviewOnly ? '退出预览' : '预览模式';
      this.previewModeBtn.setAttribute('aria-pressed', String(this.isPreviewOnly));
      this.previewModeBtn.classList.toggle('btn--primary', this.isPreviewOnly);
      this.previewModeBtn.classList.toggle('btn--secondary', !this.isPreviewOnly);
      this.previewModeBtn.classList.toggle('btn--outline', !this.isPreviewOnly);
      this.previewModeBtn.classList.toggle('markdown-editor__preview-toggle--active', this.isPreviewOnly);
    }
  }

  togglePreviewMode() {
    this.isPreviewOnly = !this.isPreviewOnly;
    this.applyPreviewMode();
    this.updateActiveHeading();
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
      this.applyHeadingAnchors();
      this.renderTableOfContents();
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

  applyHeadingAnchors() {
    if (!this.previewElement) {
      return;
    }

    const headings = Array.from(this.previewElement.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    const slugMap = new Map();

    this.tocHeadings = headings.map((heading, index) => {
      const text = heading.textContent.trim();
      const level = Number(heading.tagName.slice(1));
      const baseSlug = this.slugifyHeading(text) || `section-${index + 1}`;
      const count = slugMap.get(baseSlug) || 0;
      slugMap.set(baseSlug, count + 1);
      const id = count === 0 ? baseSlug : `${baseSlug}-${count + 1}`;

      heading.id = id;
      heading.classList.add('markdown-editor__heading');

      return {
        id,
        text: text || `未命名标题 ${index + 1}`,
        level
      };
    });
  }

  slugifyHeading(text) {
    return String(text)
      .toLowerCase()
      .trim()
      .replace(/<[^>]*>/g, '')
      .replace(/[\u0000-\u001f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^\w\-\u4e00-\u9fa5]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  renderTableOfContents() {
    if (!this.tocElement) {
      return;
    }

    if (!this.tocHeadings || this.tocHeadings.length === 0) {
      this.activeHeadingId = '';
      this.tocElement.innerHTML = `
        <div class="markdown-editor__toc-title">文档目录</div>
        <div class="markdown-editor__toc-empty">当前文档暂无标题</div>
      `;
      return;
    }

    const currentActiveId = this.activeHeadingId;
    const items = this.tocHeadings.map((item) => {
      const activeClass = item.id === currentActiveId ? ' markdown-editor__toc-link--active' : '';
      return `
      <li class="markdown-editor__toc-item markdown-editor__toc-item--level-${item.level}">
        <a class="markdown-editor__toc-link${activeClass}" href="#${item.id}" data-heading-id="${item.id}">
          ${this.escapeHtml(item.text)}
        </a>
      </li>
    `;
    }).join('');

    this.tocElement.innerHTML = `
      <div class="markdown-editor__toc-title">文档目录</div>
      <ol class="markdown-editor__toc-list">${items}
      </ol>
    `;

    const links = this.tocElement.querySelectorAll('.markdown-editor__toc-link');
    links.forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const headingId = link.getAttribute('data-heading-id');
        this.setActiveTocLink(headingId);
        this.scrollToHeading(headingId);
      });
    });

    this.updateActiveHeading();
  }

  bindPreviewHeadingTracking() {
    const updateHeading = () => {
      this.updateActiveHeading();
    };

    if (this.previewPanel) {
      this.previewPanel.addEventListener('scroll', updateHeading, { passive: true });
    }

    if (this.rootElement) {
      this.rootElement.addEventListener('scroll', updateHeading, { passive: true });
    }

    window.addEventListener('resize', updateHeading);
  }

  updateActiveHeading() {
    if (!this.previewElement || !this.tocHeadings || this.tocHeadings.length === 0) {
      this.setActiveTocLink('');
      return;
    }

    const scrollContainer = this.getPreviewScrollContainer();
    if (!scrollContainer) {
      this.setActiveTocLink(this.tocHeadings[0].id);
      return;
    }

    const containerRect = scrollContainer.getBoundingClientRect();
    const thresholdTop = containerRect.top + 28;
    let nextActiveId = this.tocHeadings[0].id;

    for (let i = 0; i < this.tocHeadings.length; i += 1) {
      const item = this.tocHeadings[i];
      const heading = document.getElementById(item.id);
      if (!heading || !this.previewElement.contains(heading)) {
        continue;
      }

      const headingRect = heading.getBoundingClientRect();
      if (headingRect.top - thresholdTop <= 0) {
        nextActiveId = item.id;
      } else {
        break;
      }
    }

    this.setActiveTocLink(nextActiveId);
  }

  setActiveTocLink(headingId) {
    this.activeHeadingId = headingId || '';
    if (!this.tocElement) {
      return;
    }

    const links = this.tocElement.querySelectorAll('.markdown-editor__toc-link');
    links.forEach((link) => {
      const isActive = link.getAttribute('data-heading-id') === this.activeHeadingId;
      link.classList.toggle('markdown-editor__toc-link--active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'location');
        this.keepActiveTocLinkInView(link);
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  keepActiveTocLinkInView(link) {
    if (!link || !this.tocElement) {
      return;
    }

    const linkTop = link.offsetTop;
    const linkBottom = linkTop + link.offsetHeight;
    const viewTop = this.tocElement.scrollTop;
    const viewBottom = viewTop + this.tocElement.clientHeight;
    const offset = 12;

    if (linkTop < viewTop + offset) {
      this.tocElement.scrollTo({
        top: Math.max(0, linkTop - offset),
        behavior: 'smooth'
      });
    } else if (linkBottom > viewBottom - offset) {
      this.tocElement.scrollTo({
        top: linkBottom - this.tocElement.clientHeight + offset,
        behavior: 'smooth'
      });
    }
  }

  scrollToHeading(headingId) {
    if (!headingId || !this.previewElement) {
      return;
    }

    const heading = document.getElementById(headingId);
    if (!heading || !this.previewElement.contains(heading)) {
      return;
    }

    const scrollContainer = this.getPreviewScrollContainer();
    if (!scrollContainer) {
      heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    const containerRect = scrollContainer.getBoundingClientRect();
    const headingRect = heading.getBoundingClientRect();
    const targetTop = scrollContainer.scrollTop + headingRect.top - containerRect.top - 12;

    scrollContainer.scrollTo({
      top: Math.max(0, targetTop),
      behavior: 'smooth'
    });
  }

  getPreviewScrollContainer() {
    if (this.previewPanel) {
      return this.previewPanel;
    }
    if (this.isPreviewOnly && this.rootElement) {
      return this.rootElement;
    }
    return null;
  }

  escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
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

  async exportPdf() {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      this.setStatusMessage('PDF 依赖加载失败');
      return;
    }
    if (typeof html2canvas === 'undefined') {
      this.setStatusMessage('截图依赖加载失败');
      return;
    }

    const previousPreviewMode = this.isPreviewOnly;

    if (!this.isPreviewOnly) {
      this.isPreviewOnly = true;
      this.applyPreviewMode();
      this.updatePreview();
    }

    await new Promise((resolve) => {
      window.setTimeout(resolve, 180);
    });

    const exportHost = document.createElement('div');
    const exportPreview = document.createElement('div');
    const previewRect = this.previewElement.getBoundingClientRect();
    const exportWidth = Math.max(720, Math.ceil(previewRect.width || this.previewElement.scrollWidth || 800));

    exportHost.style.position = 'fixed';
    exportHost.style.left = '-100000px';
    exportHost.style.top = '0';
    exportHost.style.width = `${exportWidth}px`;
    exportHost.style.padding = '0';
    exportHost.style.margin = '0';
    exportHost.style.background = this.isDarkTheme ? '#0f172a' : '#ffffff';
    exportHost.style.zIndex = '-1';

    exportPreview.className = this.previewElement.className;
    exportPreview.style.width = `${exportWidth}px`;
    exportPreview.style.maxWidth = 'none';
    exportPreview.style.margin = '0';
    exportPreview.style.padding = '0';
    exportPreview.style.background = this.isDarkTheme ? '#0f172a' : '#ffffff';
    exportPreview.innerHTML = this.previewElement.innerHTML;
    exportHost.appendChild(exportPreview);
    document.body.appendChild(exportHost);

    try {
      const canvas = await html2canvas(exportPreview, {
        backgroundColor: this.isDarkTheme ? '#0f172a' : '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: exportWidth,
        windowHeight: exportPreview.scrollHeight
      });

      const jsPDF = window.jspdf.jsPDF;
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 24;
      const usableWidth = pageWidth - margin * 2;
      const usableHeight = pageHeight - margin * 2;
      const pageHeightCss = usableHeight * exportWidth / usableWidth;
      const scaleRatio = canvas.width / exportWidth;
      const blockNodes = Array.from(exportPreview.children);
      const pageBreaks = [];
      let startCss = 0;
      const totalHeightCss = exportPreview.scrollHeight;

      while (startCss < totalHeightCss - 1) {
        const desiredEndCss = Math.min(startCss + pageHeightCss, totalHeightCss);
        let breakCss = desiredEndCss;

        for (let i = 0; i < blockNodes.length; i += 1) {
          const node = blockNodes[i];
          const nodeTop = node.offsetTop;
          const nodeBottom = nodeTop + node.offsetHeight;
          if (nodeBottom <= desiredEndCss && nodeBottom > startCss + 40) {
            breakCss = nodeBottom;
          }
          if (nodeTop >= desiredEndCss) {
            break;
          }
        }

        if (breakCss <= startCss + 20) {
          breakCss = desiredEndCss;
        }

        pageBreaks.push({
          start: startCss,
          end: breakCss
        });
        startCss = breakCss;
      }

      pageBreaks.forEach((section, index) => {
        if (index > 0) {
          pdf.addPage();
        }

        const sliceStartPx = Math.floor(section.start * scaleRatio);
        const sliceHeightPx = Math.max(1, Math.ceil((section.end - section.start) * scaleRatio));
        const pageCanvas = document.createElement('canvas');
        const pageContext = pageCanvas.getContext('2d');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sliceHeightPx;

        pageContext.fillStyle = this.isDarkTheme ? '#0f172a' : '#ffffff';
        pageContext.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        pageContext.drawImage(
          canvas,
          0,
          sliceStartPx,
          canvas.width,
          sliceHeightPx,
          0,
          0,
          canvas.width,
          sliceHeightPx
        );

        const pageImageHeight = sliceHeightPx * usableWidth / canvas.width;
        const pageImage = pageCanvas.toDataURL('image/png');
        pdf.addImage(pageImage, 'PNG', margin, margin, usableWidth, pageImageHeight, undefined, 'FAST');
      });

      pdf.save('document.pdf');
      this.setStatusMessage('已导出预览区 PDF');
    } catch (error) {
      console.error(error);
      this.setStatusMessage('PDF 导出失败');
    } finally {
      if (exportHost.isConnected) {
        document.body.removeChild(exportHost);
      }
      if (!previousPreviewMode) {
        this.isPreviewOnly = false;
        this.applyPreviewMode();
        this.updatePreview();
      }
    }
  }

  decorateExportPreview(container) {
    container.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((node) => {
      node.setAttribute('data-pdf-block', 'heading');
    });
    container.querySelectorAll('pre').forEach((node) => {
      node.setAttribute('data-pdf-block', 'code');
    });
    container.querySelectorAll('table').forEach((node) => {
      node.setAttribute('data-pdf-block', 'table');
    });
    container.querySelectorAll('.markdown-editor__mermaid').forEach((node) => {
      node.setAttribute('data-pdf-block', 'mermaid');
    });
  }

  computePdfBreakpoints(container, pageHeightCss) {
    const totalHeight = container.scrollHeight;
    const sections = [];
    const children = Array.from(container.children);
    let start = 0;

    while (start < totalHeight - 1) {
      const idealEnd = Math.min(start + pageHeightCss, totalHeight);
      let breakpoint = this.findPdfBreakpoint(children, start, idealEnd, pageHeightCss, totalHeight);

      if (breakpoint <= start + 24) {
        breakpoint = Math.min(totalHeight, start + pageHeightCss);
      }

      sections.push({ start, end: breakpoint });
      start = breakpoint;
    }

    return sections;
  }

  findPdfBreakpoint(children, start, idealEnd, pageHeightCss, totalHeight) {
    let best = idealEnd;
    const minBreak = start + Math.min(160, pageHeightCss * 0.35);
    const lateBreakLimit = Math.min(totalHeight, start + pageHeightCss * 1.15);

    for (let i = 0; i < children.length; i += 1) {
      const node = children[i];
      const top = node.offsetTop;
      const bottom = top + node.offsetHeight;
      if (bottom <= start + 24) {
        continue;
      }
      if (top >= lateBreakLimit) {
        break;
      }

      const type = node.getAttribute('data-pdf-block') || '';
      const next = children[i + 1];
      const nextType = next ? (next.getAttribute('data-pdf-block') || '') : '';

      if (type === 'heading') {
        const protectedBottom = next ? next.offsetTop + next.offsetHeight : bottom;
        if (top < idealEnd && protectedBottom > idealEnd && top > minBreak) {
          return top;
        }
      }

      if ((type === 'code' || type === 'table' || type === 'mermaid')
        && top < idealEnd && bottom > idealEnd) {
        if (node.offsetHeight <= pageHeightCss * 0.92 && top > minBreak) {
          return top;
        }
        best = Math.max(best, Math.min(bottom, lateBreakLimit));
      }

      if ((nextType === 'heading') && bottom > minBreak && bottom <= idealEnd) {
        best = bottom;
      }

      if (bottom > minBreak && bottom <= idealEnd) {
        best = bottom;
      }
    }

    return Math.min(best, totalHeight);
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
