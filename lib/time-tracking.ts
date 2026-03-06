import { TimeEntry, TimeTrackingSummary } from '../types';
import { supabase } from './supabase';

/**
 * Time Tracking Utilities
 */

/**
 * Start a new time entry
 */
export async function startTimeEntry(params: {
  projectId?: string;
  clientId?: string;
  description: string;
  hourlyRate?: number;
  isBillable?: boolean;
}): Promise<TimeEntry> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const newEntry: TimeEntry = {
    id: generateId(),
    projectId: params.projectId,
    clientId: params.clientId,
    description: params.description,
    startTime: new Date().toISOString(),
    endTime: undefined,
    duration: undefined,
    isBillable: params.isBillable ?? true,
    hourlyRate: params.hourlyRate,
    createdAt: new Date().toISOString(),
  };

  return newEntry;
}

/**
 * Stop a running time entry
 */
export function stopTimeEntry(entry: TimeEntry): TimeEntry {
  const endTime = new Date();
  const startTime = new Date(entry.startTime);
  const durationMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));

  return {
    ...entry,
    endTime: endTime.toISOString(),
    duration: durationMinutes,
  };
}

/**
 * Calculate time tracking summary
 */
export function calculateTimeSummary(entries: TimeEntry[]): TimeTrackingSummary {
  const totalMinutes = entries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
  const totalHours = totalMinutes / 60;
  
  const billableEntries = entries.filter(e => e.isBillable);
  const billableMinutes = billableEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
  const billableHours = billableMinutes / 60;
  
  const totalBillableAmount = billableEntries.reduce((sum, entry) => {
    if (!entry.hourlyRate || !entry.duration) return sum;
    return sum + ((entry.duration / 60) * entry.hourlyRate);
  }, 0);

  return {
    totalMinutes,
    totalHours,
    billableMinutes,
    billableHours,
    totalBillableAmount,
  };
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(minutes: number): string {
  if (!minutes || minutes === 0) return '0m';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Get active time entry (one without end time)
 */
export function getActiveTimeEntry(entries: TimeEntry[]): TimeEntry | null {
  return entries.find(e => !e.endTime) || null;
}

/**
 * Check if time entry is currently running
 */
export function isTimeEntryRunning(entry: TimeEntry): boolean {
  return !entry.endTime;
}

/**
 * Calculate elapsed time for running entry
 */
export function getElapsedTime(entry: TimeEntry): number {
  if (!isTimeEntryRunning(entry)) return entry.duration || 0;
  
  const startTime = new Date(entry.startTime);
  const now = new Date();
  return Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60));
}

/**
 * Group time entries by date
 */
export function groupByDate(entries: TimeEntry[]): Record<string, TimeEntry[]> {
  const grouped: Record<string, TimeEntry[]> = {};
  
  entries.forEach(entry => {
    const date = new Date(entry.startTime).toISOString().split('T')[0];
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(entry);
  });
  
  return grouped;
}

/**
 * Group time entries by project
 */
export function groupByProject(entries: TimeEntry[]): Record<string, TimeEntry[]> {
  const grouped: Record<string, TimeEntry[]> = {};
  
  entries.forEach(entry => {
    const projectId = entry.projectId || 'uncategorized';
    if (!grouped[projectId]) {
      grouped[projectId] = [];
    }
    grouped[projectId].push(entry);
  });
  
  return grouped;
}

/**
 * Group time entries by client
 */
export function groupByClient(entries: TimeEntry[], clients: any[]): Record<string, TimeEntry[]> {
  const grouped: Record<string, TimeEntry[]> = {};
  
  entries.forEach(entry => {
    const clientId = entry.clientId || 'uncategorized';
    const client = clients.find((c: any) => c.id === clientId);
    const clientName = client?.name || 'Uncategorized';
    
    if (!grouped[clientName]) {
      grouped[clientName] = [];
    }
    grouped[clientName].push(entry);
  });
  
  return grouped;
}

/**
 * Get time entries for a specific date range
 */
export function getEntriesInRange(
  entries: TimeEntry[],
  startDate: Date,
  endDate: Date
): TimeEntry[] {
  return entries.filter(entry => {
    const entryDate = new Date(entry.startTime);
    return entryDate >= startDate && entryDate <= endDate;
  });
}

/**
 * Get time entries for today
 */
export function getTodayEntries(entries: TimeEntry[]): TimeEntry[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return getEntriesInRange(entries, today, tomorrow);
}

/**
 * Get time entries for this week
 */
export function getThisWeekEntries(entries: TimeEntry[]): TimeEntry[] {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  
  return getEntriesInRange(entries, startOfWeek, endOfWeek);
}

/**
 * Get time entries for this month
 */
export function getThisMonthEntries(entries: TimeEntry[]): TimeEntry[] {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return getEntriesInRange(entries, startOfMonth, endOfMonth);
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
