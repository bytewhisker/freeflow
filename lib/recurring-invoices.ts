import { RecurringInvoice, RecurringFrequency, SalesDocument } from '../types';
import { supabase } from './supabase';

/**
 * Recurring Invoice Utilities
 */

/**
 * Calculate next due date based on frequency
 */
export function calculateNextDueDate(
  lastDate: string,
  frequency: RecurringFrequency,
  dayOfMonth?: number,
  dayOfWeek?: number
): string {
  const last = new Date(lastDate);
  let nextDate = new Date(last);

  switch (frequency) {
    case 'weekly':
      // Add 7 days
      nextDate.setDate(last.getDate() + 7);
      break;

    case 'biweekly':
      // Add 14 days
      nextDate.setDate(last.getDate() + 14);
      break;

    case 'monthly':
      // Set to same day next month
      nextDate.setMonth(last.getMonth() + 1);
      if (dayOfMonth) {
        nextDate.setDate(dayOfMonth);
      }
      break;

    case 'quarterly':
      // Add 3 months
      nextDate.setMonth(last.getMonth() + 3);
      break;

    case 'yearly':
      // Add 1 year
      nextDate.setFullYear(last.getFullYear() + 1);
      break;
  }

  return nextDate.toISOString();
}

/**
 * Generate invoice from recurring template
 */
export function generateInvoiceFromRecurring(
  recurring: RecurringInvoice,
  docNumber: string
): Omit<SalesDocument, 'id'> {
  return {
    clientId: recurring.clientId,
    projectId: recurring.projectId,
    type: 'INVOICE',
    docNumber,
    status: 'draft',
    items: recurring.items,
    tax: recurring.tax,
    discount: recurring.discount,
    shipping: recurring.shipping,
    subtotal: recurring.subtotal,
    total: recurring.total,
    amountPaid: 0,
    balanceDue: recurring.total,
    dueDate: recurring.nextDueDate,
    notes: recurring.notes,
    terms: '',
    createdAt: new Date().toISOString(),
  };
}

/**
 * Check if recurring invoice is due to be generated
 */
export function isDueForGeneration(recurring: RecurringInvoice): boolean {
  if (recurring.status !== 'active') return false;
  
  const now = new Date();
  const nextDue = new Date(recurring.nextDueDate);
  
  // Generate 3 days before due date
  const generateDate = new Date(nextDue);
  generateDate.setDate(generateDate.getDate() - 3);
  
  return now >= generateDate;
}

/**
 * Get human-readable frequency label
 */
export function getFrequencyLabel(frequency: RecurringFrequency): string {
  const labels: Record<RecurringFrequency, string> = {
    weekly: 'Weekly',
    biweekly: 'Bi-Weekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    yearly: 'Yearly',
  };
  return labels[frequency] || frequency;
}

/**
 * Get frequency in days
 */
export function getFrequencyInDays(frequency: RecurringFrequency): number {
  const days: Record<RecurringFrequency, number> = {
    weekly: 7,
    biweekly: 14,
    monthly: 30,
    quarterly: 90,
    yearly: 365,
  };
  return days[frequency] || 30;
}

/**
 * Calculate total invoices per year
 */
export function getInvoicesPerYear(frequency: RecurringFrequency): number {
  const perYear: Record<RecurringFrequency, number> = {
    weekly: 52,
    biweekly: 26,
    monthly: 12,
    quarterly: 4,
    yearly: 1,
  };
  return perYear[frequency] || 12;
}

/**
 * Calculate annual revenue from recurring invoice
 */
export function getAnnualRevenue(recurring: RecurringInvoice): number {
  return recurring.total * getInvoicesPerYear(recurring.frequency);
}

/**
 * Validate recurring invoice configuration
 */
export function validateRecurringInvoice(recurring: Partial<RecurringInvoice>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!recurring.name || recurring.name.trim() === '') {
    errors.push('Name is required');
  }

  if (!recurring.frequency) {
    errors.push('Frequency is required');
  }

  if (!recurring.items || recurring.items.length === 0) {
    errors.push('At least one item is required');
  }

  if (recurring.frequency === 'monthly' && !recurring.dayOfMonth) {
    errors.push('Day of month is required for monthly frequency');
  }

  if (recurring.frequency === 'weekly' && recurring.dayOfWeek === undefined) {
    errors.push('Day of week is required for weekly frequency');
  }

  if (recurring.endDate) {
    const endDate = new Date(recurring.endDate);
    if (endDate <= new Date()) {
      errors.push('End date must be in the future');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Create new recurring invoice
 */
export async function createRecurringInvoice(
  recurring: Omit<RecurringInvoice, 'id' | 'createdAt' | 'nextDueDate' | 'lastGeneratedDate'>
): Promise<RecurringInvoice> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Calculate initial next due date
  const nextDueDate = calculateNextDueDate(
    new Date().toISOString(),
    recurring.frequency,
    recurring.dayOfMonth,
    recurring.dayOfWeek
  );

  const newRecurring: RecurringInvoice = {
    ...recurring,
    id: generateId(),
    nextDueDate,
    lastGeneratedDate: undefined,
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  return newRecurring;
}

/**
 * Update recurring invoice next due date after generation
 */
export function updateNextDueDate(recurring: RecurringInvoice): RecurringInvoice {
  const nextDueDate = calculateNextDueDate(
    recurring.nextDueDate,
    recurring.frequency,
    recurring.dayOfMonth,
    recurring.dayOfWeek
  );

  return {
    ...recurring,
    nextDueDate,
    lastGeneratedDate: recurring.nextDueDate,
  };
}

/**
 * Check if recurring invoice should end
 */
export function shouldEndRecurring(recurring: RecurringInvoice): boolean {
  if (!recurring.endDate) return false;
  
  const nextDue = new Date(recurring.nextDueDate);
  const endDate = new Date(recurring.endDate);
  
  return nextDue > endDate;
}

/**
 * Pause recurring invoice
 */
export function pauseRecurringInvoice(recurring: RecurringInvoice): RecurringInvoice {
  return {
    ...recurring,
    status: 'paused',
  };
}

/**
 * Resume recurring invoice
 */
export function resumeRecurringInvoice(recurring: RecurringInvoice): RecurringInvoice {
  return {
    ...recurring,
    status: 'active',
  };
}

/**
 * End recurring invoice
 */
export function endRecurringInvoice(recurring: RecurringInvoice): RecurringInvoice {
  return {
    ...recurring,
    status: 'ended',
  };
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
