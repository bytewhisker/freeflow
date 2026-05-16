

export const formatCurrency = (amount: number, currencyCode: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
};

export const formatDate = (date: string) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatDateTime = (date: string) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Added formatRelativeTime to support ClientDetail activity view
export const formatRelativeTime = (date: string) => {
  if (!date) return 'N/A';
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;

  return formatDate(date);
};

export const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'accepted':
    case 'paid':
    case 'ongoing':
      return 'bg-emerald-100 text-emerald-700';
    case 'completed':
    case 'sent':
      return 'bg-blue-100 text-blue-700';
    case 'on_hold':
    case 'on hold':
    case 'draft':
      return 'bg-slate-100 text-black';
    case 'overdue':
    case 'rejected':
      return 'bg-rose-100 text-rose-700';
    default:
      return 'bg-slate-100 text-black';
  }
};

export const getRemainingTime = (deadline: string) => {
  if (!deadline) return { text: 'Open', urgency: 'relaxed' as const };
  
  const now = new Date();
  const target = new Date(deadline);
  
  // Basic validation
  if (isNaN(target.getTime())) return { text: 'Open', urgency: 'relaxed' as const };
  
  const diff = target.getTime() - now.getTime();

  // "Overdue" only when the current time is strictly past the deadline
  if (diff < 0) return { text: 'Overdue', urgency: 'overdue' as const };

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return { 
      text: `${days} ${days === 1 ? 'day' : 'days'} left`, 
      urgency: (days <= 2 ? 'urgent' : days <= 7 ? 'soon' : 'relaxed') as 'urgent' | 'soon' | 'relaxed'
    };
  }

  if (hours > 0) {
    return { 
      text: `${hours} ${hours === 1 ? 'hour' : 'hours'} left`, 
      urgency: 'urgent' as const
    };
  }

  return { 
    text: `${Math.max(1, minutes)} ${minutes === 1 ? 'min' : 'mins'} left`, 
    urgency: 'urgent' as const
  };
};

export const getTimeUrgency = (deadline: string) => {
  const remaining = getRemainingTime(deadline);
  return {
    text: remaining.text === 'Overdue' ? 'Overdue' : 
          remaining.urgency === 'urgent' ? 'Due Soon' : 
          remaining.urgency === 'soon' ? 'Next Week' : 'Upcoming',
    color: remaining.urgency === 'overdue' ? 'text-red-600' : 
           remaining.urgency === 'urgent' ? 'text-orange-600' : 
           remaining.urgency === 'soon' ? 'text-blue-600' : 'text-slate-400',
    urgency: remaining.urgency
  };
};

// Simplified ISO Currencies List
export const ISO_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar', country: 'United States' },
  { code: 'EUR', symbol: '€', name: 'Euro', country: 'European Union' },
  { code: 'GBP', symbol: '£', name: 'British Pound', country: 'United Kingdom' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', country: 'Japan' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', country: 'Canada' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', country: 'Australia' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', country: 'India' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', country: 'Bangladesh' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', country: 'United Arab Emirates' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', country: 'Saudi Arabia' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', country: 'China' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', country: 'Singapore' },
  { code: 'CHF', symbol: 'Fr.', name: 'Swiss Franc', country: 'Switzerland' }
];