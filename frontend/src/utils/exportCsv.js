export const exportTransactionsToCSV = (transactions, filename = 'expensewise_transactions.csv') => {
  if (!transactions || !transactions.length) {
    alert('No transactions available to export.');
    return;
  }

  const headers = ['Date', 'Title', 'Type', 'Category', 'Amount', 'Description'];

  const rows = transactions.map((t) => [
    new Date(t.date).toISOString().split('T')[0],
    `"${(t.title || '').replace(/"/g, '""')}"`,
    t.type ? t.type.toUpperCase() : '',
    `"${(t.category || '').replace(/"/g, '""')}"`,
    t.amount,
    `"${(t.description || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(','))
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
