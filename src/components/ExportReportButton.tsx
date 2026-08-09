import React from 'react';

interface ExportReportButtonProps {
  data: Record<string, any>[];
  filename?: string;
  title?: string;
}

export const ExportReportButton: React.FC<ExportReportButtonProps> = ({
  data,
  filename = 'report.csv',
  title = 'Export Data',
}) => {
  const downloadCSV = () => {
    if (!data || !data.length) {
      alert('No data available to export.');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','), // Header row
      ...data.map((row) =>
        headers
          .map((header) => {
            const escapeValue = ('' + (row[header] ?? '')).replace(/"/g, '""');
            return `"${escapeValue}"`;
          })
          .join(',')
      ),
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button
        onClick={downloadCSV}
        style={{
          background: '#0284c7',
          color: '#fff',
          border: 'none',
          padding: '6px 12px',
          borderRadius: '4px',
          fontSize: '0.8rem',
          fontWeight: 'bold',
          cursor: 'pointer',
        }}
      >
        📥 Export CSV
      </button>
      <button
        onClick={printReport}
        style={{
          background: '#334155',
          color: '#f8fafc',
          border: '1px solid #475569',
          padding: '6px 12px',
          borderRadius: '4px',
          fontSize: '0.8rem',
          fontWeight: 'bold',
          cursor: 'pointer',
        }}
      >
        🖨️ Print Summary
      </button>
    </div>
  );
};