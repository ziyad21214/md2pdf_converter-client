export class StorageManager {
    constructor(storageKey = 'md2pdf_history') {
        this.STORAGE_KEY = storageKey;
    }

    getHistory() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Failed to parse history from LocalStorage", e);
            return [];
        }
    }

    saveItem(filename, content, wordCount) {
        const history = this.getHistory();
        const newItem = {
            id: Date.now(),
            filename: filename || 'Untitled.md',
            content: content,
            wordCount: wordCount,
            date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        history.unshift(newItem);
        if (history.length > 10) history.pop();

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
        return newItem;
    }

    clearHistory() {
        localStorage.removeItem(this.STORAGE_KEY);
    }
}