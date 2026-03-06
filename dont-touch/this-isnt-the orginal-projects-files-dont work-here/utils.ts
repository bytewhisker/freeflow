
export const formatCurrency = (amount: number, currencyCode: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
};

export const formatDate = (date: string) => {
  if (!date) return 'N/A';
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatRelativeTime = (date: string) => {
  if (!date) return 'N/A';

  const now = new Date();
  const dateObj = new Date(date);
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  // Future dates
  if (diffMs < 0) {
    const absDiffMinutes = Math.abs(diffMinutes);
    const absDiffHours = Math.abs(diffHours);
    const absDiffDays = Math.abs(diffDays);

    if (absDiffMinutes < 60) {
      return `in ${absDiffMinutes} minute${absDiffMinutes !== 1 ? 's' : ''}`;
    } else if (absDiffHours < 24) {
      return `in ${absDiffHours} hour${absDiffHours !== 1 ? 's' : ''}`;
    } else if (absDiffDays < 7) {
      return `in ${absDiffDays} day${absDiffDays !== 1 ? 's' : ''}`;
    } else {
      return formatDate(date);
    }
  }

  // Past dates
  if (diffSeconds < 60) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else if (diffWeeks < 4) {
    return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
  } else if (diffMonths < 12) {
    return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
  } else {
    return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`;
  }
};

export const formatDateTime = (date: string) => {
  if (!date) return 'N/A';
  const dateObj = new Date(date);
  return dateObj.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export const getTimeUrgency = (deadline: string) => {
  if (!deadline) return { text: 'No deadline', color: 'text-gray-400', urgency: 'none' };

  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffMs = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  // Overdue
  if (diffMs < 0) {
    const overdueDays = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60 * 24));
    const overdueHours = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60));

    if (overdueDays > 0) {
      return {
        text: `Overdue by ${overdueDays} day${overdueDays > 1 ? 's' : ''}`,
        color: 'text-red-600',
        urgency: 'overdue'
      };
    } else if (overdueHours > 0) {
      return {
        text: `Overdue by ${overdueHours} hour${overdueHours > 1 ? 's' : ''}`,
        color: 'text-red-600',
        urgency: 'overdue'
      };
    } else {
      return {
        text: 'Overdue by minutes',
        color: 'text-red-600',
        urgency: 'overdue'
      };
    }
  }

  // Due today
  if (diffDays === 0) {
    if (diffHours > 0) {
      return {
        text: `Due in ${diffHours} hour${diffHours > 1 ? 's' : ''}`,
        color: 'text-orange-600',
        urgency: 'urgent'
      };
    } else if (diffMinutes > 0) {
      return {
        text: `Due in ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`,
        color: 'text-red-600',
        urgency: 'urgent'
      };
    } else {
      return {
        text: 'Due now',
        color: 'text-red-600',
        urgency: 'urgent'
      };
    }
  }

  // Due tomorrow
  if (diffDays === 1) {
    return {
      text: 'Due tomorrow',
      color: 'text-yellow-600',
      urgency: 'soon'
    };
  }

  // Due this week
  if (diffDays <= 7) {
    return {
      text: `${diffDays} days left`,
      color: 'text-yellow-600',
      urgency: 'soon'
    };
  }

  // Due this month
  if (diffDays <= 30) {
    return {
      text: `${diffDays} days left`,
      color: 'text-green-600',
      urgency: 'normal'
    };
  }

  // Far future
  const weeks = Math.floor(diffDays / 7);
  if (weeks <= 4) {
    return {
      text: `${weeks} week${weeks > 1 ? 's' : ''} left`,
      color: 'text-green-600',
      urgency: 'normal'
    };
  } else {
    const months = Math.floor(diffDays / 30);
    return {
      text: `${months} month${months > 1 ? 's' : ''} left`,
      color: 'text-green-600',
      urgency: 'normal'
    };
  }
};

export const generateId = () => Math.random().toString(36).substr(2, 9);

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

// ISO Currencies List
export const ISO_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar', country: 'United States' },
  { code: 'EUR', symbol: '€', name: 'Euro', country: 'European Union' },
  { code: 'GBP', symbol: '£', name: 'British Pound', country: 'United Kingdom' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', country: 'Japan' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', country: 'Canada' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', country: 'Australia' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', country: 'India' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', country: 'United Arab Emirates' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', country: 'Saudi Arabia' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', country: 'China' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', country: 'Singapore' },
  { code: 'CHF', symbol: 'Fr.', name: 'Swiss Franc', country: 'Switzerland' }
];

export const getProjectStats = (project: any) => {
  const totalCost = project.sales?.reduce((sum: number, sale: any) => sum + (sale.amount || 0), 0) || 0;
  const totalCollected = project.sales?.reduce((sum: number, sale: any) => {
    return sum + ((sale.status === 'paid' || sale.status === 'accepted') ? (sale.amount || 0) : 0);
  }, 0) || 0;

  const collectionRate = totalCost > 0 ? (totalCollected / totalCost) * 100 : 0;
  const remainingAmount = totalCost - totalCollected;

  return {
    totalCost,
    totalCollected,
    collectionRate,
    remainingAmount
  };
};
