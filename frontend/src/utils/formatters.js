export const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'CA$',
  AUD: 'AU$'
};

export const formatCurrency = (amount, currency = 'INR') => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    amount = 0;
  }
  const symbol = CURRENCY_SYMBOLS[currency] || '₹';
  const num = Math.abs(Number(amount));

  // Formatter for Indian format or standard Intl format
  const formattedNumber = new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(num);

  const sign = Number(amount) < 0 ? '-' : '';
  return `${sign}${symbol} ${formattedNumber}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Business',
  'Investment',
  'Other'
];

export const EXPENSE_CATEGORIES = [
  'Food',
  'Shopping',
  'Travel',
  'Bills',
  'Entertainment',
  'Healthcare',
  'Education',
  'Rent',
  'Transportation',
  'Other'
];

export const CATEGORY_COLORS = {
  // Income
  Salary: '#10B981',
  Freelance: '#06B6D4',
  Business: '#3B82F6',
  Investment: '#8B5CF6',
  // Expense
  Food: '#F59E0B',
  Shopping: '#EC4899',
  Travel: '#0EA5E9',
  Bills: '#EF4444',
  Entertainment: '#8B5CF6',
  Healthcare: '#10B981',
  Education: '#6366F1',
  Rent: '#F97316',
  Transportation: '#14B8A6',
  Other: '#64748B'
};
