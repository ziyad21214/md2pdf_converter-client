import { MarkdownConverter } from './models/converter.js';
import { StorageManager } from './models/storage.js';
import { PdfExporter } from './models/exporter.js';
import { ThemeManager } from './models/theme.js';

class ConverterApp {
    constructor() {
        this.themeManager = new ThemeManager('themeToggleBtn', 'themeIcon', 'themeText');
        this.storageManager = new StorageManager();
        this.markdownConverter = new MarkdownConverter();

        this.currentFilename = 'document.md';
        this.isExporting = false;

        this.bindUiElements();
        this.registerEvents();
        this.renderHistory();
        this.loadSampleText();
    }

    bindUiElements() {
        this.dropZone = document.getElementById('dropZone');
        this.fileInput = document.getElementById('fileInput');
        this.editor = document.getElementById('markdownEditor');
        this.splitEditor = document.getElementById('splitMarkdownEditor');
        this.preview = document.getElementById('renderedPreview');
        this.splitPreview = document.getElementById('splitRenderedPreview');
        this.previewContainer = document.getElementById('previewContainer');

        this.wordCountBadge = document.getElementById('wordCount');
        this.splitWordCountBadge = document.getElementById('splitWordCount');

        this.convertBtn = document.getElementById('convertBtn');
        this.convertBtnText = document.getElementById('convertBtnText');
        this.convertSpinner = document.getElementById('convertSpinner');
        this.clearBtn = document.getElementById('clearBtn');

        this.pdfPageSize = document.getElementById('pdfPageSize');
        this.pdfOrientation = document.getElementById('pdfOrientation');
        this.pdfMargin = document.getElementById('pdfMargin');

        this.historyList = document.getElementById('historyList');
        this.emptyHistoryMsg = document.getElementById('emptyHistoryMsg');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');

        this.toastEl = document.getElementById('appToast');
        this.toastMsg = document.getElementById('toastMessage');

        if (typeof bootstrap !== 'undefined' && bootstrap.Toast) {
            this.toast = new bootstrap.Toast(this.toastEl);
        } else {
            this.toast = {
                show: () => {
                    this.toastEl.classList.add('show');
                    setTimeout(() => this.toastEl.classList.remove('show'), 3000);
                }
            };
        }
    }

    registerEvents() {
        this.editor.addEventListener('input', (e) => this.handleTextChange(e.target.value, 'primary'));
        this.splitEditor.addEventListener('input', (e) => this.handleTextChange(e.target.value, 'split'));

        ['dragenter', 'dragover'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                this.dropZone.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                this.dropZone.classList.remove('dragover');
            });
        });

        this.dropZone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files.length) this.processFile(files[0]);
        });

        this.fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) this.processFile(e.target.files[0]);
        });

        this.convertBtn.addEventListener('click', () => this.generatePdf());
        this.clearBtn.addEventListener('click', () => this.clearEditor());
        this.clearHistoryBtn.addEventListener('click', () => {
            this.storageManager.clearHistory();
            this.renderHistory();
            this.showToast('History cleared successfully.');
        });

        document.querySelectorAll('button[data-bs-toggle="tab"]').forEach(tabBtn => {
            tabBtn.addEventListener('shown.bs.tab', () => {
                this.syncViews();
            });
        });
    }

    handleTextChange(text, source) {
        if (source === 'primary') {
            this.splitEditor.value = text;
        } else {
            this.editor.value = text;
        }

        const html = this.markdownConverter.renderHtml(text);
        this.preview.innerHTML = html;
        this.splitPreview.innerHTML = html;

        const stats = this.markdownConverter.calculateStats(text);
        const statsText = `${stats.words} words | ${stats.chars} chars`;
        this.wordCountBadge.textContent = statsText;
        this.splitWordCountBadge.textContent = statsText;
    }

    syncViews() {
        const text = this.editor.value;
        this.handleTextChange(text, 'primary');
    }

    processFile(file) {
        if (!file.name.match(/\.(md|markdown|txt)$/i)) {
            this.showToast('Please upload a valid Markdown file (.md, .txt)');
            return;
        }

        this.currentFilename = file.name;
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            this.editor.value = content;
            this.handleTextChange(content, 'primary');
            this.showToast(`Loaded ${file.name}`);
        };
        reader.readAsText(file);
    }

    async generatePdf() {
        const text = this.editor.value.trim();
        if (!text) {
            this.showToast('Editor is empty. Add Markdown before exporting.');
            return;
        }

        this.setLoadingState(true);

        try {
            const pdfOptions = {
                margin: parseInt(this.pdfMargin.value, 10) || 10,
                jsPDF: {
                    format: this.pdfPageSize.value,
                    orientation: this.pdfOrientation.value,
                    unit: 'mm'
                }
            };

            const exportFilename = this.currentFilename.replace(/\.[^/.]+$/, "") + ".pdf";
            await PdfExporter.exportToPdf(this.previewContainer, exportFilename, pdfOptions);

            const stats = this.markdownConverter.calculateStats(text);
            this.storageManager.saveItem(this.currentFilename, text, stats.words);
            this.renderHistory();

            this.showToast('PDF downloaded successfully!');
        } catch (error) {
            console.error("PDF generation failed:", error);
            this.showToast('Failed to generate PDF.');
        } finally {
            this.setLoadingState(false);
        }
    }

    setLoadingState(isLoading) {
        this.isExporting = isLoading;
        if (isLoading) {
            this.convertBtn.disabled = true;
            this.convertSpinner.classList.remove('d-none');
            this.convertBtnText.textContent = 'Generating...';
        } else {
            this.convertBtn.disabled = false;
            this.convertSpinner.classList.add('d-none');
            this.convertBtnText.textContent = 'Download PDF';
        }
    }

    clearEditor() {
        this.editor.value = '';
        this.currentFilename = 'document.md';
        this.handleTextChange('', 'primary');
        this.showToast('Editor cleared.');
    }

    renderHistory() {
        const history = this.storageManager.getHistory();
        this.historyList.innerHTML = '';

        if (history.length === 0) {
            this.emptyHistoryMsg.classList.remove('d-none');
            return;
        }

        this.emptyHistoryMsg.classList.add('d-none');

        history.forEach(item => {
            const col = document.createElement('div');
            col.className = 'col-12 col-md-6 col-lg-4';
            col.innerHTML = `
            <div class="card border-0 shadow-sm h-100 history-card">
              <div class="card-body p-3 d-flex flex-column justify-content-between">
                <div>
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <h6 class="fw-semibold text-truncate mb-0" style="max-width: 180px;">${this.escapeHtml(item.filename)}</h6>
                    <span class="badge bg-primary-subtle text-primary small">${item.wordCount} words</span>
                  </div>
                  <p class="text-muted small mb-3">${item.date}</p>
                </div>
                <div class="d-flex gap-2">
                  <button class="btn btn-sm btn-outline-primary w-100 reload-btn" data-id="${item.id}">
                    <i class="bi bi-arrow-counterclockwise me-1"></i> Reload
                  </button>
                </div>
              </div>
            </div>
          `;

            col.querySelector('.reload-btn').addEventListener('click', () => {
                this.editor.value = item.content;
                this.currentFilename = item.filename;
                this.handleTextChange(item.content, 'primary');
                window.scrollTo({ top: 0, behavior: 'smooth' });
                this.showToast(`Loaded "${item.filename}" from history`);
            });

            this.historyList.appendChild(col);
        });
    }

    loadSampleText() {
        const sampleMarkdown = `# Welcome to MD2PDF Converter

Easily convert your **Markdown** notes into professional PDF documents directly in your browser.

## Features
- **Client-Side Rendering**: Fast & secure (no backend server required)
- **GitHub Pages Ready**: Pure static HTML/JS application
- **Responsive Layout**: Designed for mobile and desktop viewports
- **Dark Mode Support**: Persisted via LocalStorage

### Code Example
\`\`\`javascript
class QuickMath {
  static add(a, b) {
    return a + b;
  }
}
console.log(QuickMath.add(5, 10));
\`\`\`

> *Quote*: "Simplicity is prerequisite for reliability." — Edsger W. Dijkstra
`;
        this.editor.value = sampleMarkdown;
        this.handleTextChange(sampleMarkdown, 'primary');
    }

    showToast(message) {
        this.toastMsg.textContent = message;
        this.toast.show();
    }

    escapeHtml(str) {
        return str.replace(/[&<>"']/g, (m) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        })[m]);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.app = new ConverterApp();
});