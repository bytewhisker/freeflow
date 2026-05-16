import { Notification, NotificationType } from '../types';
import { supabase } from './supabase';

/**
 * Notification System
 */

/**
 * Create a new notification
 */
export async function createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<Notification> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const newNotification: Notification = {
    ...notification,
    id: generateId(),
    createdAt: new Date().toISOString(),
    read: false,
  };

  // Add to local state (handled by caller)
  return newNotification;
}

/**
 * Fetch notifications from Supabase
 */
export async function fetchNotifications(): Promise<Notification[]> {
  if (!supabase) return [];

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(n => ({
      ...n,
      createdAt: n.created_at
    }));
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return [];
  }
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string): Promise<void> {
  if (!supabase) return;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id);
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(): Promise<void> {
  if (!supabase) return;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
  }
}

/**
 * Delete notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  if (!supabase) return;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', user.id);
  } catch (error) {
    console.error('Failed to delete notification:', error);
  }
}

/**
 * Get notification title based on type
 */
export function getNotificationTitle(type: NotificationType): string {
  const titles: Record<NotificationType, string> = {
    invoice_sent: 'Invoice Sent',
    invoice_paid: 'Payment Received',
    invoice_overdue: 'Invoice Overdue',
    project_deadline: 'Project Deadline',
    project_completed: 'Project Completed',
    client_added: 'New Client Added',
    payment_received: 'Payment Received',
  };
  return titles[type] || 'Notification';
}

/**
 * Get notification icon based on type
 */
export function getNotificationIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    invoice_sent: '📄',
    invoice_paid: '💰',
    invoice_overdue: '⚠️',
    project_deadline: '📅',
    project_completed: '✅',
    client_added: '👤',
    payment_received: '💳',
  };
  return icons[type] || '🔔';
}

/**
 * Get notification color based on type
 */
export function getNotificationColor(type: NotificationType): string {
  const colors: Record<NotificationType, string> = {
    invoice_sent: 'bg-blue-50 text-blue-600 border-blue-200',
    invoice_paid: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    invoice_overdue: 'bg-rose-50 text-rose-600 border-rose-200',
    project_deadline: 'bg-amber-50 text-amber-600 border-amber-200',
    project_completed: 'bg-green-50 text-green-600 border-green-200',
    client_added: 'bg-purple-50 text-purple-600 border-purple-200',
    payment_received: 'bg-teal-50 text-teal-600 border-teal-200',
  };
  return colors[type] || 'bg-slate-50 text-black border-slate-200';
}

/**
 * Check for overdue invoices and create notifications
 */
export async function checkOverdueInvoices(salesDocuments: any[]): Promise<Notification[]> {
  // Use a Map to de-duplicate by ID, keeping only the first occurrence
  const uniqueDocs = Array.from(
    new Map(salesDocuments.map(doc => [doc.id, doc])).values()
  );

  const overdueInvoices = uniqueDocs.filter(
    (doc: any) => doc.type === 'INVOICE' && doc.status === 'overdue'
  );

  return overdueInvoices.map((doc: any) => ({
    id: `overdue-${doc.id}`, // Deterministic ID
    type: 'invoice_overdue',
    title: getNotificationTitle('invoice_overdue'),
    message: `Invoice ${doc.docNumber} is overdue`,
    link: `/billing/view/${doc.id}`,
    read: false,
    createdAt: new Date().toISOString(),
    metadata: {
      docId: doc.id,
      amount: doc.total,
    },
  }));
}

/**
 * Check for upcoming project deadlines and create notifications
 */
export async function checkUpcomingDeadlines(projects: any[]): Promise<Notification[]> {
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  // Use a Map to de-duplicate by ID, keeping only the first occurrence
  const uniqueProjects = Array.from(
    new Map(projects.map(p => [p.id, p])).values()
  );

  const upcomingProjects = uniqueProjects.filter((project: any) => {
    if (project.status === 'completed') return false;
    const deadline = new Date(project.deadline);
    return deadline <= threeDaysFromNow && deadline > now;
  });

  // If more than 3 projects have deadlines, create a summary notification
  if (upcomingProjects.length > 3) {
    return [{
      id: `deadline-summary-${Date.now()}`, // Timestamp to make it unique
      type: 'project_deadline',
      title: 'Project Deadlines',
      message: `You have ${upcomingProjects.length} projects due`,
      link: '/projects',
      read: false,
      createdAt: new Date().toISOString(),
      metadata: {
        projectIds: upcomingProjects.map(p => p.id),
        count: upcomingProjects.length,
      },
    }];
  }

  // For 3 or fewer projects, create individual notifications
  return upcomingProjects.map((project: any) => {
    const deadline = new Date(project.deadline);
    const msRemaining = deadline.getTime() - now.getTime();
    let timeText = '';
    const minutesRemaining = Math.max(1, Math.floor(msRemaining / (60 * 1000)));
    const hoursRemaining = Math.floor(minutesRemaining / 60);
    const daysRemaining = Math.floor(hoursRemaining / 24);

    if (daysRemaining > 0) {
      timeText = `due in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`;
    } else if (hoursRemaining > 0) {
      timeText = `due in ${hoursRemaining} hour${hoursRemaining !== 1 ? 's' : ''}`;
    } else {
      timeText = `due in ${minutesRemaining} min${minutesRemaining !== 1 ? 's' : ''}`;
    }

    return {
      id: `deadline-${project.id}`, // Deterministic ID
      type: 'project_deadline',
      title: getNotificationTitle('project_deadline'),
      message: `"${project.title}" is ${timeText}`,
      link: `/projects/${project.id}`,
      read: false,
      createdAt: new Date().toISOString(),
      metadata: {
        projectId: project.id,
      },
    };
  });
}

/**
 * Generate notification for invoice sent
 */
export function createInvoiceSentNotification(doc: any, clientName: string): Notification {
  return {
    id: generateId(),
    type: 'invoice_sent',
    title: getNotificationTitle('invoice_sent'),
    message: `Invoice ${doc.docNumber} sent to ${clientName}`,
    link: `/billing/view/${doc.id}`,
    read: false,
    createdAt: new Date().toISOString(),
    metadata: {
      docId: doc.id,
      amount: doc.total,
    },
  };
}

/**
 * Generate notification for payment received
 */
export function createPaymentReceivedNotification(doc: any, clientName: string): Notification {
  return {
    id: generateId(),
    type: 'payment_received',
    title: getNotificationTitle('payment_received'),
    message: `Payment of ${doc.total} received from ${clientName}`,
    link: `/billing/view/${doc.id}`,
    read: false,
    createdAt: new Date().toISOString(),
    metadata: {
      docId: doc.id,
      amount: doc.amountPaid,
    },
  };
}

/**
 * Generate notification for project completed
 */
export function createProjectCompletedNotification(project: any): Notification {
  return {
    id: generateId(),
    type: 'project_completed',
    title: getNotificationTitle('project_completed'),
    message: `Project "${project.title}" has been completed`,
    link: `/projects/${project.id}`,
    read: false,
    createdAt: new Date().toISOString(),
    metadata: {
      projectId: project.id,
    },
  };
}

/**
 * Generate notification for new client
 */
export function createClientAddedNotification(client: any): Notification {
  return {
    id: generateId(),
    type: 'client_added',
    title: getNotificationTitle('client_added'),
    message: `New client "${client.name}" added`,
    link: `/clients/${client.id}`,
    read: false,
    createdAt: new Date().toISOString(),
    metadata: {
      clientId: client.id,
    },
  };
}

/**
 * Get unread notification count
 */
export function getUnreadCount(notifications: Notification[]): number {
  return notifications.filter(n => !n.read).length;
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
