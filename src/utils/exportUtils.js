export const exportToCSV = (data, filename = 'export.csv') => {
    if (!data || data.length === 0) {
        console.error('No data to export');
        return;
    }

    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Add header row
    csvRows.push(headers.join(','));

    // Add data rows
    for (const row of data) {
        const values = headers.map(header => {
            const value = row[header];
            // Handle values that might contain commas or quotes
            const escaped = String(value || '').replace(/"/g, '""');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    downloadFile(csvString, filename, 'text/csv');
};

export const exportToJSON = (data, filename = 'export.json') => {
    if (!data) {
        console.error('No data to export');
        return;
    }

    const jsonString = JSON.stringify(data, null, 2);
    downloadFile(jsonString, filename, 'application/json');
};

export const exportToPDF = (data, filename = 'export.pdf') => {
    // This is a placeholder for PDF export functionality
    // In a real app, you would use a library like jsPDF or pdfmake
    console.log('PDF export would be implemented here');

    // Example using jsPDF (would need to install jspdf)
    /*
    import jsPDF from 'jspdf';
    const doc = new jsPDF();
    doc.text('Timer Sessions Report', 20, 20);
    
    data.forEach((session, index) => {
      doc.text(`${session.name} - ${session.duration}s`, 20, 30 + (index * 10));
    });
    
    doc.save(filename);
    */
};

export const exportSessions = (sessions, format = 'csv') => {
    const formattedSessions = sessions.map(session => ({
        ID: session.id,
        'Session Name': session.name || 'Untitled Session',
        Type: session.type.charAt(0).toUpperCase() + session.type.slice(1),
        Duration: `${Math.floor(session.duration / 60)}m ${session.duration % 60}s`,
        'Total Seconds': session.duration,
        'Start Time': formatDate(session.startTime),
        'End Time': session.endTime ? formatDate(session.endTime) : 'N/A',
        Description: session.description || '',
        Satisfaction: session.satisfaction || 'Not rated',
        Tags: session.tags?.join(', ') || '',
        'Date Created': new Date(session.startTime).toLocaleDateString(),
        'Time Created': new Date(session.startTime).toLocaleTimeString()
    }));

    switch (format) {
        case 'csv':
            exportToCSV(formattedSessions, `sessions_${getCurrentDateString()}.csv`);
            break;
        case 'json':
            exportToJSON(sessions, `sessions_${getCurrentDateString()}.json`);
            break;
        case 'pdf':
            exportToPDF(formattedSessions, `sessions_${getCurrentDateString()}.pdf`);
            break;
        default:
            console.error('Unsupported export format:', format);
    }
};

// Helper functions
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getCurrentDateString() {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
}