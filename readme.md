# MD2PDF - Minimalist Markdown to PDF Converter
MD2PDF is a modern, lightweight, client-side web application built with **HTML5**, **Bootstrap 5**, and **Vanilla JavaScript (ES6+)**. It allows users to write or upload Markdown files (`.md`, `.markdown`, `.txt`) and export them as formatted PDF documents directly in the browser.
---

## Architecture & Class Structure

The JavaScript codebase follows a **Modular Object-Oriented Architecture** using ES6 Classes:

| Class Name | Responsibility |
| :--- | :--- |
| `ThemeManager` | Controls theme toggling (Dark/Light mode) with `localStorage` persistence. |
| `StorageManager` | Manages conversion history in browser `localStorage` (up to 10 recent items). |
| `MarkdownConverter` | Wraps `marked.js` and `highlight.js` to parse Markdown into HTML with syntax highlighting. |
| `PdfExporter` | Interfaces with `html2pdf.js` for asynchronous client-side PDF compilation. |
| `ConverterApp` | Main application orchestrator binding state, DOM events, and file drop listeners. |

---

## Technology Stack & Libraries

- **UI Framework**: [Bootstrap 5.3.3](https://getbootstrap.com/)
- **Icons**: [Bootstrap Icons 1.11.3](https://icons.getbootstrap.com/)
- **Markdown Parser**: [Marked.js](https://marked.js.org/)
- **Syntax Highlighting**: [Highlight.js](https://highlightjs.org/)
- **PDF Generation**: [html2pdf.js](https://ekoopmans.github.io/html2pdf.js/)

---

## License
MIT License. Free for open-source and personal use.
