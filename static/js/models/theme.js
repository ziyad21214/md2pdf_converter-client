export class ThemeManager {
    constructor(toggleBtnId, iconId, textId) {
        this.toggleBtn = document.getElementById(toggleBtnId);
        this.icon = document.getElementById(iconId);
        this.text = document.getElementById(textId);
        this.STORAGE_KEY = 'md2pdf_theme';

        this.init();
    }

    init() {
        const savedTheme = localStorage.getItem(this.STORAGE_KEY) ||
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

        this.setTheme(savedTheme);

        this.toggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-bs-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            this.setTheme(newTheme);
        });
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-bs-theme', theme);
        localStorage.setItem(this.STORAGE_KEY, theme);

        if (theme === 'dark') {
            this.icon.className = 'bi bi-sun-fill';
            this.text.textContent = 'Light Mode';
        } else {
            this.icon.className = 'bi bi-moon-stars-fill';
            this.text.textContent = 'Dark Mode';
        }
    }
}