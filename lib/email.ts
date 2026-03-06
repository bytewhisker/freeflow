import { supabase } from './supabase';

// Email service using Resend API
const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY || '';
const RESEND_API_URL = 'https://api.resend.com/emails';

export interface EmailAttachment {
  filename: string;
  content: string; // base64 encoded
  type: string;
}

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
  attachments?: EmailAttachment[];
}

/**
 * Send email using Resend API
 */
export async function sendEmail(params: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const fromEmail = params.from || 'noreply@freeflow.app';

    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [params.to],
        subject: params.subject,
        html: params.html,
        attachments: params.attachments,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Email send error:', data);
      return { success: false, error: data.message || 'Failed to send email' };
    }

    // Log email to database for tracking
    await logEmailToDatabase(params.to, params.subject, data.id);

    return { success: true };
  } catch (error: any) {
    console.error('Email send error:', error);
    return { success: false, error: error.message || 'Failed to send email' };
  }
}

/**
 * Send invoice email with PDF attachment
 */
export async function sendInvoiceEmail(params: {
  to: string;
  docNumber: string;
  clientName: string;
  totalAmount: string;
  dueDate: string;
  pdfData: string; // base64 encoded PDF
  businessName: string;
}): Promise<{ success: boolean; error?: string }> {
  const { to, docNumber, clientName, totalAmount, dueDate, pdfData, businessName } = params;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice ${docNumber}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; }
        .content { background: #f8fafc; padding: 40px; border-radius: 0 0 12px 12px; }
        .invoice-details { background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .invoice-details p { margin: 8px 0; }
        .invoice-details strong { color: #1e293b; }
        .cta-button { display: inline-block; background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
        .footer a { color: #2563eb; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📄 Invoice ${docNumber}</h1>
        </div>
        <div class="content">
          <p style="font-size: 18px; margin-bottom: 25px;">Hello ${clientName},</p>
          <p style="margin-bottom: 25px;">Please find attached invoice <strong>${docNumber}</strong> for the amount of <strong>${totalAmount}</strong>.</p>
          
          <div class="invoice-details">
            <p><strong>Invoice Number:</strong> ${docNumber}</p>
            <p><strong>Amount Due:</strong> ${totalAmount}</p>
            <p><strong>Due Date:</strong> ${dueDate}</p>
          </div>
          
          <p style="margin-bottom: 25px;">Please review the attached invoice and arrange payment by the due date. If you have any questions, feel free to contact us.</p>
          
          <div style="text-align: center;">
            <a href="#" class="cta-button">View Invoice Online</a>
          </div>
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p><strong>${businessName}</strong></p>
            <p style="margin-top: 20px;">This email was sent by FreeFlow Freelancer OS</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `Invoice ${docNumber} from ${businessName}`,
    html,
    attachments: [
      {
        filename: `${docNumber}.pdf`,
        content: pdfData,
        type: 'application/pdf',
      },
    ],
  });
}

/**
 * Send payment reminder email
 */
export async function sendPaymentReminder(params: {
  to: string;
  docNumber: string;
  clientName: string;
  totalAmount: string;
  dueDate: string;
  daysOverdue: number;
  businessName: string;
}): Promise<{ success: boolean; error?: string }> {
  const { to, docNumber, clientName, totalAmount, dueDate, daysOverdue, businessName } = params;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Reminder - Invoice ${docNumber}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; }
        .content { background: #f8fafc; padding: 40px; border-radius: 0 0 12px 12px; }
        .alert-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin-bottom: 25px; }
        .invoice-details { background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; }
        .cta-button { display: inline-block; background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Payment Reminder</h1>
        </div>
        <div class="content">
          <p style="font-size: 18px; margin-bottom: 25px;">Hello ${clientName},</p>
          
          <div class="alert-box">
            <p style="margin: 0;"><strong>Invoice ${docNumber}</strong> is <strong>${daysOverdue} days overdue</strong>.</p>
          </div>
          
          <p style="margin-bottom: 25px;">The total amount due is <strong>${totalAmount}</strong>. Please arrange payment as soon as possible.</p>
          
          <div class="invoice-details">
            <p><strong>Invoice Number:</strong> ${docNumber}</p>
            <p><strong>Amount Due:</strong> ${totalAmount}</p>
            <p><strong>Due Date:</strong> ${dueDate}</p>
            <p><strong>Days Overdue:</strong> ${daysOverdue}</p>
          </div>
          
          <div style="text-align: center;">
            <a href="#" class="cta-button">Pay Invoice Now</a>
          </div>
          
          <div class="footer">
            <p>If you have already paid, please disregard this notice.</p>
            <p><strong>${businessName}</strong></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `Payment Reminder: Invoice ${docNumber}`,
    html,
  });
}

/**
 * Send project deadline reminder
 */
export async function sendDeadlineReminder(params: {
  to: string;
  projectName: string;
  deadline: string;
  daysRemaining: number;
  businessName: string;
}): Promise<{ success: boolean; error?: string }> {
  const { to, projectName, deadline, daysRemaining, businessName } = params;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Deadline Reminder - ${projectName}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; }
        .content { background: #f8fafc; padding: 40px; border-radius: 0 0 12px 12px; }
        .alert-box { background: #ede9fe; border-left: 4px solid #8b5cf6; padding: 20px; border-radius: 8px; margin-bottom: 25px; }
        .project-details { background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📅 Deadline Reminder</h1>
        </div>
        <div class="content">
          <p style="font-size: 18px; margin-bottom: 25px;">Hello,</p>
          
          <div class="alert-box">
            <p style="margin: 0;"><strong>${projectName}</strong> is due in <strong>${daysRemaining} days</strong>.</p>
          </div>
          
          <p style="margin-bottom: 25px;">Please ensure you're on track to complete this project by the deadline.</p>
          
          <div class="project-details">
            <p><strong>Project:</strong> ${projectName}</p>
            <p><strong>Deadline:</strong> ${deadline}</p>
            <p><strong>Days Remaining:</strong> ${daysRemaining}</p>
          </div>
          
          <div class="footer">
            <p>Keep up the great work!</p>
            <p><strong>${businessName}</strong></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `Deadline Reminder: ${projectName}`,
    html,
  });
}

/**
 * Log email to database for tracking
 */
async function logEmailToDatabase(to: string, subject: string, emailId?: string): Promise<void> {
  if (!supabase) return;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('email_logs').insert({
      user_id: user.id,
      to,
      subject,
      email_id: emailId,
      sent_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to log email:', error);
  }
}

/**
 * Check if email service is configured
 */
export function isEmailServiceConfigured(): boolean {
  return !!RESEND_API_KEY;
}
