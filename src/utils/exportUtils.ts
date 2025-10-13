import { exportToCSV } from './helpers';

export const exportTableToCSV = (data: any[], filename: string, columns?: string[]): void => {
  if (columns) {
    const filteredData = data.map(row => {
      const filteredRow: any = {};
      columns.forEach(col => {
        filteredRow[col] = row[col];
      });
      return filteredRow;
    });
    exportToCSV(filteredData, filename);
  } else {
    exportToCSV(data, filename);
  }
};

export const exportToPDF = async (element: HTMLElement, filename: string): Promise<void> => {
  // This would typically use a library like jsPDF or html2pdf
  console.log('PDF export functionality would be implemented here');
};

export const printElement = (element: HTMLElement): void => {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Print</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
          </style>
        </head>
        <body>
          ${element.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }
};