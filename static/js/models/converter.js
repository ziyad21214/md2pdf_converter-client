export class MarkdownConverter {
    constructor() {
        this.configureMarked();
    }

    configureMarked() {
        marked.setOptions({
            gfm: true,
            breaks: true,
            highlight: function (code, lang) {
                const language = hljs.getLanguage(lang) ? lang : 'plaintext';
                return hljs.highlight(code, { language }).value;
            }
        });
    }

    renderHtml(markdownText) {
        if (!markdownText || markdownText.trim() === '') {
            return '<p class="text-muted italic">Nothing to preview yet...</p>';
        }
        return marked.parse(markdownText);
    }

    calculateStats(text) {
        if (!text) return { words: 0, chars: 0 };
        const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
        const chars = text.length;
        return { words, chars };
    }
}