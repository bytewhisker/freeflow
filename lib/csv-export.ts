/**
 * CSV Export Utilities
 */

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV<T extends Record<string, any>>(
  data: T[],
  headers: { key: keyof T; label: string }[]
): string {
  if (data.length === 0) return '';

  // Create header row
  const headerRow = headers.map(h => `"${h.label}"`).join(',');

  // Create data rows
  const dataRows = data.map(row => {
    return headers.map(h => {
      const value = row[h.key];
      return `"${escapeCSVValue(value)}"`;
    }).join(',');
  });

  // Combine header and data rows
  return [headerRow, ...dataRows].join('\n');
}

/**
 * Escape CSV value to handle commas, quotes, and newlines
 */
function escapeCSVValue(value: any): string {
  if (value === null || value === undefined) return '';
  
  const stringValue = String(value);
  
  // Escape quotes by doubling them
  return stringValue.replace(/"/g, '""');
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Export clients to CSV
 */
export function exportClientsToCSV(clients: any[]): void {
  const headers = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'company', label: 'Company' },
    { key: 'status', label: 'Status' },
    { key: 'country', label: 'Country' },
    { key: 'createdAt', label: 'Created At' },
  ];

  const csv = arrayToCSV(clients, headers);
  const filename = `clients_export_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csv, filename);
}

/**
 * Export projects to CSV
 */
export function exportProjectsToCSV(projects: any[], clients: any[]): void {
  const headers = [
    { key: 'title', label: 'Project Title' },
    { key: 'clientName', label: 'Client' },
    { key: 'status', label: 'Status' },
    { key: 'category', label: 'Category' },
    { key: 'totalBudget', label: 'Budget' },
    { key: 'deadline', label: 'Deadline' },
    { key: 'createdAt', label: 'Created At' },
  ];

  // Add client name to each project
  const projectsWithClients = projects.map(project => ({
    ...project,
    clientName: clients.find((c: any) => c.id === project.clientId)?.name || 'N/A',
  }));

  const csv = arrayToCSV(projectsWithClients, headers);
  const filename = `projects_export_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csv, filename);
}

/**
 * Export invoices to CSV
 */
export function exportInvoicesToCSV(invoices: any[], clients: any[]): void {
  const headers = [
    { key: 'docNumber', label: 'Invoice Number' },
    { key: 'clientName', label: 'Client' },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status' },
    { key: 'subtotal', label: 'Subtotal' },
    { key: 'tax', label: 'Tax' },
    { key: 'discount', label: 'Discount' },
    { key: 'shipping', label: 'Shipping' },
    { key: 'total', label: 'Total' },
    { key: 'amountPaid', label: 'Amount Paid' },
    { key: 'balanceDue', label: 'Balance Due' },
    { key: 'dueDate', label: 'Due Date' },
    { key: 'createdAt', label: 'Created At' },
  ];

  // Add client name to each invoice
  const invoicesWithClients = invoices.map(invoice => ({
    ...invoice,
    clientName: clients.find((c: any) => c.id === invoice.clientId)?.name || 'N/A',
  }));

  const csv = arrayToCSV(invoicesWithClients, headers);
  const filename = `invoices_export_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csv, filename);
}

/**
 * Export time entries to CSV
 */
export function exportTimeEntriesToCSV(timeEntries: any[], projects: any[], clients: any[]): void {
  const headers = [
    { key: 'description', label: 'Description' },
    { key: 'projectName', label: 'Project' },
    { key: 'clientName', label: 'Client' },
    { key: 'startTime', label: 'Start Time' },
    { key: 'endTime', label: 'End Time' },
    { key: 'duration', label: 'Duration (minutes)' },
    { key: 'isBillable', label: 'Billable' },
    { key: 'hourlyRate', label: 'Hourly Rate' },
    { key: 'totalAmount', label: 'Total Amount' },
    { key: 'createdAt', label: 'Created At' },
  ];

  // Add project and client names
  const entriesWithDetails = timeEntries.map(entry => {
    const project = projects.find((p: any) => p.id === entry.projectId);
    const client = clients.find((c: any) => c.id === project?.clientId);
    
    return {
      ...entry,
      projectName: project?.title || 'N/A',
      clientName: client?.name || 'N/A',
      totalAmount: entry.isBillable && entry.hourlyRate 
        ? ((entry.duration || 0) / 60) * entry.hourlyRate 
        : 0,
    };
  });

  const csv = arrayToCSV(entriesWithDetails, headers);
  const filename = `time_entries_export_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csv, filename);
}

/**
 * Export all data to CSV (separate files)
 */
export function exportAllData(state: any): void {
  exportClientsToCSV(state.clients);
  exportProjectsToCSV(state.projects, state.clients);
  exportInvoicesToCSV(state.salesDocuments, state.clients);
  
  if (state.timeEntries && state.timeEntries.length > 0) {
    exportTimeEntriesToCSV(state.timeEntries, state.projects, state.clients);
  }
}

/**
 * Generate financial report CSV
 */
export function exportFinancialReport(invoices: any[], clients: any[]): void {
  // Group by client
  const clientStats: Record<string, any> = {};
  
  invoices.forEach((invoice: any) => {
    const client = clients.find((c: any) => c.id === invoice.clientId);
    const clientName = client?.name || 'Unknown';
    
    if (!clientStats[clientName]) {
      clientStats[clientName] = {
        clientName,
        totalInvoiced: 0,
        totalPaid: 0,
        totalOutstanding: 0,
        invoiceCount: 0,
      };
    }
    
    clientStats[clientName].totalInvoiced += invoice.total;
    clientStats[clientName].totalPaid += invoice.amountPaid || 0;
    clientStats[clientName].totalOutstanding += invoice.balanceDue || 0;
    clientStats[clientName].invoiceCount += 1;
  });

  const headers = [
    { key: 'clientName', label: 'Client' },
    { key: 'totalInvoiced', label: 'Total Invoiced' },
    { key: 'totalPaid', label: 'Total Paid' },
    { key: 'totalOutstanding', label: 'Total Outstanding' },
    { key: 'invoiceCount', label: 'Invoice Count' },
  ];

  const csv = arrayToCSV(Object.values(clientStats), headers);
  const filename = `financial_report_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csv, filename);
}
