export class PdfExporter {
    static async exportToPdf(element, filename = 'document.pdf', options = {}) {
        const defaultOptions = {
            margin: 10,
            filename: filename.endsWith('.pdf') ? filename : `${filename}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        const config = { ...defaultOptions, ...options };
        return html2pdf().set(config).from(element).save();
    }
}