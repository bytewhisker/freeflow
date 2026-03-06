import React, { useState } from 'react';
import { AppState } from '../types';
import { formatCurrency, formatDate, getStatusColor } from '../utils';
import {
  ChevronLeft,
  Printer,
  Mail,
  Download,
  CheckCircle,
  Clock,
  ExternalLink,
  Edit3,
  X,
  Send,
  Eye,
  FileText,
  Sliders
} from 'lucide-react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const EmailModal = ({ isOpen, onClose, recipient, docNumber, docType, businessName, setToast, doc, state, onDownloadPdf }: any) => {
  const [email, setEmail] = useState(recipient || '');
  const [subject, setSubject] = useState(`${docType} ${docNumber}`);
  const [message, setMessage] = useState(`Dear Client,\n\nPlease find attached ${docType.toLowerCase()} ${docNumber}.\n\nBest regards,\n${businessName}`);

  if (!isOpen) return null;

  const handleSend = async () => {
    onClose();

    // Trigger PDF download first
    if (onDownloadPdf) {
      setToast({ message: 'Generating PDF...', type: 'info' });
      await onDownloadPdf();
    }

    const recipientEmail = email || '';
    const subjectText = encodeURIComponent(subject);
    const bodyText = encodeURIComponent(message);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipientEmail}&su=${subjectText}&body=${bodyText}`;

    // Short delay to ensure PDF download has started/completed
    setTimeout(() => {
      window.open(gmailUrl, '_blank');
      setToast({ message: 'PDF Downloaded. Please drag it into the email.', type: 'info' });
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300 font-open-sans font-bold">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-transparent dark:border-slate-800">
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
          <div>
            <h3 className="font-black text-slate-900 dark:text-white uppercase text-xs">Send Document</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-1">E-mailing {docNumber}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-full transition-colors"><X size={20} /></button>
        </div>
        <div className="p-8 space-y-5">
          <div className="space-y-2">
            <label className="block text-[10px] font-black font-open-sans text-slate-900 dark:text-slate-400">Recipient Address</label>
            <div className="relative group">
              <input
                type="email"
                placeholder="client@example.com"
                className="w-full pl-4 pr-12 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-bold transition-all group-hover:border-slate-300 dark:group-hover:border-slate-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                <Mail size={18} />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black font-open-sans text-slate-900 dark:text-slate-400">Subject Line</label>
            <input
              type="text"
              className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-bold transition-all"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black font-open-sans text-slate-900 dark:text-slate-400">Message Body</label>
            <textarea
              className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-bold h-40 resize-none transition-all"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100/50 dark:border-blue-900/30 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-[11px] font-black text-blue-900 dark:text-blue-200 uppercase leading-none mb-1">Attachment</p>
              <p className="text-[12px] font-bold text-blue-600 dark:text-blue-400">{docNumber}.pdf</p>
            </div>
          </div>
        </div>
        <div className="px-8 py-6 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-2xl font-black text-xs uppercase hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            className="px-10 py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-black text-xs uppercase flex items-center gap-3 hover:bg-slate-800 dark:hover:bg-blue-700 transition-all shadow-xl shadow-slate-200 dark:shadow-black/20"
          >
            <Send size={16} /> Send Email
          </button>
        </div>
      </div>
    </div>
  );
};

const ProInvoiceTemplate = ({ doc, state }: { doc: any, state: AppState }) => {
  const currencyCode = state.settings.currency.code;
  const business = state.settings.business;
  const client = state.clients.find(c => c.id === doc.clientId);
  const project = state.projects.find(p => p.id === doc.projectId);

  return (
    <div className="invoice-paper bg-white relative shrink-0" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', fontSize: '13.5px', fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif', color: '#111', lineHeight: '1.5' }}>
      <style>{`
        .pro-container {
          width: 180mm;
          margin: auto;
          padding-top: 15mm;
          padding-bottom: 15mm;
        }
        .pro-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 16px;
          border-bottom: 1px solid #ccc;
        }
        .pro-header h1 {
          font-size: 24px;
          margin: 0;
          letter-spacing: 0.5px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .pro-meta {
          text-align: right;
          font-size: 12.5px;
        }
        .pro-section {
          margin-top: 18px;
        }
        .pro-section-title {
          font-weight: 600;
          margin-bottom: 6px;
          font-size: 13.5px;
          text-transform: uppercase;
        }
        .pro-details {
          font-size: 13px;
        }
        .pro-details p {
          margin: 3px 0;
        }
        .pro-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 18px;
        }
        .pro-table th, .pro-table td {
          padding: 8px 6px;
          border-bottom: 1px solid #ddd;
          font-size: 13px;
        }
        .pro-table th {
          font-weight: 600;
          text-align: left;
          text-transform: uppercase;
          font-size: 11px;
        }
        .pro-amount {
          text-align: right;
        }
        .pro-summary {
          width: 100%;
          margin-top: 10px;
        }
        .pro-summary td {
          padding: 6px 6px;
          font-size: 13px;
        }
        .pro-summary .label {
          text-align: right;
          color: #444;
          font-weight: 500;
        }
        .pro-summary .total {
          font-weight: 700;
          font-size: 14px;
          border-top: 1px solid #111;
        }
        .pro-footer {
          margin-top: 40px;
          font-size: 12px;
          color: #444;
          border-top: 1px solid #eee;
          padding-top: 16px;
        }
        .pro-footer p {
          margin: 4px 0;
        }
      `}</style>

      <div className="pro-container">
        <div className="pro-header">
          <h1>Invoice</h1>
          <div className="pro-meta">
            Invoice #: {doc.docNumber}<br />
            Issue Date: {formatDate(doc.createdAt)}<br />
            {doc.dueDate && <>Due Date: {formatDate(doc.dueDate)}<br /></>}
            Status: <span className="uppercase font-bold">{doc.status}</span>
          </div>
        </div>

        <div className="pro-section pro-details">
          <div className="pro-section-title">From</div>
          <div className="whitespace-pre-line">
            {doc.companyInfo || (
              <>
                <strong>{business.name}</strong><br />
                {business.address && <>{business.address}<br /></>}
                {business.email || ''}
              </>
            )}
          </div>
        </div>

        <div className="pro-section pro-details">
          <div className="pro-section-title">Bill To</div>
          <div className="whitespace-pre-line">
            {doc.billTo ? doc.billTo : (
              <>
                <strong>{client?.name || 'Client'}</strong><br />
                {client?.company && <>{client.company}<br /></>}
                {client?.email || ''}
              </>
            )}
          </div>
        </div>

        <div className="pro-section pro-details">
          <div className="pro-section-title">Project</div>
          <p>
            {project?.title || 'General Services'}
            {/* If we had work period, we'd enable it here. */}
          </p>
        </div>

        <table className="pro-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Description</th>
              <th style={{ textAlign: 'right' }}>Qty</th>
              <th style={{ textAlign: 'right' }}>Rate</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {doc.items.map((item: any, i: number) => (
              <tr key={i}>
                <td style={{ textAlign: 'left' }}>{item.description}</td>
                <td style={{ textAlign: 'right' }}>{item.quantity}</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(item.rate, currencyCode)}</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(item.quantity * item.rate, currencyCode)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <table className="pro-summary">
          <tbody>
            <tr>
              <td className="label">Subtotal</td>
              <td className="pro-amount">{formatCurrency(doc.subtotal, currencyCode)}</td>
            </tr>
            {doc.tax > 0 && (
              <tr>
                <td className="label">Tax ({doc.tax}%)</td>
                <td className="pro-amount">{formatCurrency((doc.subtotal * doc.tax) / 100, currencyCode)}</td>
              </tr>
            )}
            {doc.discount > 0 && (
              <tr>
                <td className="label">Discount</td>
                <td className="pro-amount">-{formatCurrency(doc.discount, currencyCode)}</td>
              </tr>
            )}
            {doc.shipping > 0 && (
              <tr>
                <td className="label">Shipping</td>
                <td className="pro-amount">{formatCurrency(doc.shipping, currencyCode)}</td>
              </tr>
            )}
            <tr>
              <td className="label total">Total Due {currencyCode}</td>
              <td className="pro-amount total">{formatCurrency(doc.total, currencyCode)}</td>
            </tr>
            {doc.amountPaid > 0 && (
              <tr>
                <td className="label text-emerald-600 font-bold">Amount Paid</td>
                <td className="pro-amount text-emerald-600 font-bold">-{formatCurrency(doc.amountPaid, currencyCode)}</td>
              </tr>
            )}
            {doc.amountPaid > 0 && (
              <tr>
                <td className="label font-bold">Balance Due</td>
                <td className="pro-amount font-bold">{formatCurrency(doc.balanceDue, currencyCode)}</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="pro-footer">
          {doc.paymentTerms && <p><strong>Payment Terms:</strong> {doc.paymentTerms}</p>}

          {(state.settings.paymentDetails?.bankName || state.settings.paymentDetails?.payPal) && (
            <p><strong>Payment Method:</strong> {state.settings.paymentDetails?.payPal ? `${state.settings.paymentDetails?.payPal} / ` : ''} {state.settings.paymentDetails?.bankName}</p>
          )}

          {doc.terms && <p><strong>Terms:</strong> {doc.terms}</p>}

          <p className="mt-4"><strong>Authorized by:</strong> {business.name}</p>
        </div>

      </div>
    </div>
  );
};

const SalesDetail: React.FC<{ state: AppState, setState: any }> = ({ state, setState }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

  React.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const doc = state.salesDocuments.find(d => d.id === id);
  const client = state.clients.find(c => c.id === doc?.clientId);
  const currencyCode = state.settings.currency.code;
  const business = state.settings?.business || { name: 'Freelancer', address: '', email: '', phone: '' };
  const branding = state.settings?.branding || { watermarkOpacity: 0.1, showWatermark: false };

  if (!doc) return <div className="p-20 text-center font-bold text-slate-400">Document not found.</div>;

  const handlePrint = () => window.print();

  const handleUpdateStatus = (newStatus: any) => {
    setState((prev: AppState) => ({
      ...prev,
      salesDocuments: prev.salesDocuments.map(d => d.id === id ? { ...d, status: newStatus } : d)
    }));
  };

  const updateWatermarkOpacity = (val: number) => {
    setState((prev: AppState) => ({
      ...prev,
      settings: {
        ...prev.settings,
        branding: {
          ...prev.settings.branding,
          watermarkOpacity: val
        }
      }
    }));
  };

  const handleViewPdf = () => {
    const win = window.open(`#/portal/${doc.id}?preview=true`, '_blank');
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      // Find the invoice content element
      const invoiceElement = document.querySelector('.invoice-paper') as HTMLElement;
      if (!invoiceElement) {
        setToast({ message: 'Invoice content not found', type: 'error' });
        return;
      }

      // Create canvas from the invoice content
      const canvas = await html2canvas(invoiceElement, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

      // Download the PDF
      pdf.save(`${doc.docNumber}.pdf`);
      setToast({ message: 'Invoice downloaded successfully', type: 'success' });
    } catch (error) {
      console.error('Error generating PDF:', error);
      setToast({ message: 'Error generating PDF', type: 'error' });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 space-y-8 no-print pb-20 pt-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/billing" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <ChevronLeft size={28} className="text-slate-400" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">{doc.docNumber}</h1>
              <span className={`text-xs uppercase font-black px-4 py-1.5 rounded-full ${getStatusColor(doc.status)} dark:opacity-80`}>
                {doc.status}
              </span>
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-sm font-bold uppercase mt-1">Generated {formatDate(doc.createdAt)}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">


          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-black dark:text-slate-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 font-black text-xs uppercase shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-400 border-t-transparent" />
            ) : (
              <Download size={18} />
            )}
            {isDownloading ? 'Downloading...' : 'Download'}
          </button>
          <Link
            to={`/billing/edit/${doc.id}`}
            className="px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-black dark:text-slate-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 font-black text-xs uppercase shadow-sm transition-all"
          >
            <Edit3 size={18} /> Edit
          </Link>
          <button
            onClick={() => setIsEmailModalOpen(true)}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 font-black text-xs uppercase shadow-xl shadow-blue-100 dark:shadow-black/20 transition-all"
          >
            <Mail size={18} /> Email
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 overflow-x-auto pb-4 bg-slate-50 dark:bg-slate-800/20 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-inner">
          {doc.useProTemplate ? (
            <ProInvoiceTemplate doc={doc} state={state} />
          ) : (
            <div className="invoice-paper bg-white border border-slate-200 relative overflow-hidden shrink-0" style={{ width: '210mm', minHeight: '297mm', padding: '20mm', boxSizing: 'border-box', margin: '0 auto' }}>
              {/* Watermark Logo */}
              {branding.showWatermark && (
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden"
                  style={{ opacity: branding.watermarkOpacity || 0.15 }}
                >
                  <p className="text-[200px] font-black text-slate-500 dark:text-slate-800 transform -rotate-45 whitespace-nowrap opacity-80">
                    FREEFLOW
                  </p>
                </div>
              )}

              <div className="relative z-10">
                {/* PAID Badge Overlay */}
                {doc.status === 'paid' && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[35deg] pointer-events-none select-none z-[100] opacity-[0.12] scale-110">
                    <div className="border-[12px] border-emerald-600 rounded-[60px] px-24 py-12">
                      <span className="text-[140px] font-black text-emerald-600 uppercase  ">Paid</span>
                    </div>
                  </div>
                )}

                {/* DRAFT Badge Overlay */}
                {doc.status === 'draft' && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[15deg] pointer-events-none select-none z-[100] opacity-[0.05]">
                    <span className="text-[180px] font-black text-slate-900 uppercase tracking-[0.3em]">Draft</span>
                  </div>
                )}

                <div className="flex justify-between mb-12 items-start">
                  <div>
                    {doc.logo ? (
                      <img src={doc.logo} alt="Company Logo" className="h-16 w-auto mb-6 object-contain" />
                    ) : (
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-100">
                          {business.name.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{business.name}</h2>
                      </div>
                    )}
                    <div className="text-[13px] text-slate-500 leading-relaxed font-medium whitespace-pre-line max-w-xs">
                      {doc.companyInfo || `${business.address}\n${business.email}\n${business.phone}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2 uppercase">{doc.type}</h1>
                    <div className="space-y-4 pt-4">
                      <div className="flex flex-col items-end">
                        <p className="text-[10px] font-black font-open-sans  mb-1">Invoice Number</p>
                        <p className="text-xl font-black text-slate-900 leading-none">{doc.docNumber}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <p className="text-[10px] font-black font-open-sans  mb-1">Issue Date</p>
                        <p className="text-base font-black text-slate-900 leading-none">{formatDate(doc.createdAt)}</p>
                      </div>
                      {doc.dueDate && (
                        <div className="flex flex-col items-end">
                          <p className="text-[10px] font-black font-open-sans  mb-1">Due Date</p>
                          <p className="text-base font-black text-blue-600 leading-none">{formatDate(doc.dueDate)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-8 mb-12 py-8 border-y border-slate-100">
                  <div className="col-span-12 md:col-span-5">
                    <h4 className="text-[10px] font-open-sans font-bold uppercase mb-4">Client / Bill To</h4>
                    <div className="text-[13px] text-slate-500 leading-relaxed font-medium whitespace-pre-line">
                      {doc.billTo || (
                        <>
                          <p className="text-lg font-black text-slate-900 leading-tight">
                            {client?.name || 'Private Client'}
                          </p>
                          <p>{client?.email || ''}</p>
                        </>
                      )}
                    </div>
                  </div>
                  {(doc.shipTo || doc.poNumber) && (
                    <div className="col-span-12 md:col-span-4">
                      {doc.shipTo && (
                        <>
                          <h4 className="text-[10px] font-black font-open-sans  mb-4">Shipping Info</h4>
                          <div className="text-[13px] text-slate-500 leading-relaxed font-medium whitespace-pre-line">
                            {doc.shipTo}
                          </div>
                        </>
                      )}
                      {doc.poNumber && (
                        <div className={doc.shipTo ? 'mt-6' : ''}>
                          <h4 className="text-[10px] font-black font-open-sans  mb-1">P.O. Number</h4>
                          <p className="text-[14px] font-black text-slate-900">{doc.poNumber}</p>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="col-span-12 md:col-span-3 text-right ml-auto">


                    {doc.paymentTerms && (
                      <div className="mt-6">
                        <h4 className="text-[10px] font-black font-open-sans  mb-1">Terms</h4>
                        <p className="text-[13px] font-bold text-slate-500">{doc.paymentTerms}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-12">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-slate-900 text-[10px] font-black uppercase   text-slate-900">
                        <th className="pb-4 text-left">Description</th>
                        <th className="pb-4 text-center px-4">Qty</th>
                        <th className="pb-4 text-right px-4">Rate</th>
                        <th className="pb-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-open-sans font-bold ">
                      {doc.items.map((item, i) => (
                        <tr key={i}>
                          <td className="py-5">
                            <p className="text-[14px] ">{item.description}</p>
                          </td>
                          <td className="py-5 text-center px-4">
                            <span className="text-[14px] ">{item.quantity}</span>
                          </td>
                          <td className="py-5 text-right px-4 whitespace-nowrap">
                            <span className="text-[14px] ">{formatCurrency(item.rate, currencyCode)}</span>
                          </td>
                          <td className="py-5 text-right whitespace-nowrap">
                            <span className="text-[14px] ">{formatCurrency(item.quantity * item.rate, currencyCode)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start gap-12">
                  <div className="flex-1 space-y-8">
                    {/* Payment Instructions */}
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 max-w-sm">
                      <h4 className="text-[10px] font-black text-slate-900 uppercase   mb-4">How to Pay</h4>
                      <div className="space-y-4">
                        {state.settings.paymentDetails?.bankName && (
                          <div className="grid grid-cols-1 gap-1">
                            <p className="text-[9px] font-black font-open-sans ">Bank Transfer</p>
                            <p className="text-[12px] font-black text-slate-900 leading-tight">
                              {state.settings.paymentDetails?.bankName}
                              <br />
                              A/C: <span className="font-bold">{state.settings.paymentDetails?.accountNumber}</span>
                              {state.settings.paymentDetails?.swiftCode && (
                                <>
                                  <br />
                                  SWIFT/BIC: <span className="font-bold">{state.settings.paymentDetails?.swiftCode}</span>
                                </>
                              )}
                            </p>
                          </div>
                        )}
                        {state.settings.paymentDetails?.payPal && (
                          <div className="grid grid-cols-1 gap-1">
                            <p className="text-[9px] font-black font-open-sans ">PayPal / Digital</p>
                            <p className="text-[12px] font-black text-blue-600 truncate">{state.settings.paymentDetails?.payPal}</p>
                          </div>
                        )}
                        {!state.settings.paymentDetails?.bankName && !state.settings.paymentDetails?.payPal && (
                          <p className="text-[11px] text-slate-400 italic">Please contact us for payment instructions.</p>
                        )}
                      </div>
                    </div>

                    {doc.notes && (
                      <div>
                        <h4 className="text-[10px] font-black font-open-sans  mb-2">Notes</h4>
                        <p className="text-[13px] text-slate-500 leading-relaxed max-w-sm">{doc.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="w-80 space-y-3 font-open-sans">
                    <div className="flex justify-between items-center text-[10px] font-semibold font-open-sans ">
                      <span>Subtotal</span>
                      <span className="text-slate-900 text-[14px]">{formatCurrency(doc.subtotal, currencyCode)}</span>
                    </div>
                    {doc.tax > 0 && (
                      <div className="flex justify-between items-center text-[10px] font-black font-open-sans ">
                        <span>Tax ({doc.tax}%)</span>
                        <span className="text-slate-900 text-[14px]">{formatCurrency((doc.subtotal * doc.tax) / 100, currencyCode)}</span>
                      </div>
                    )}
                    {doc.discount > 0 && (
                      <div className="flex justify-between items-center text-[10px] font-black text-rose-500 uppercase  ">
                        <span>Discount</span>
                        <span className="text-[14px]">-{formatCurrency(doc.discount, currencyCode)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-4 border-t-2 border-slate-900 mt-4">
                      <span className="text-[12px] font-black text-slate-900 uppercase  ">Total Amount</span>
                      <span className="text-[24px] font-black text-blue-600 leading-none">{formatCurrency(doc.total, currencyCode)}</span>
                    </div>
                    {doc.amountPaid > 0 && (
                      <div className="flex justify-between items-center text-[10px] font-black text-emerald-600 uppercase  ">
                        <span>Amount Paid</span>
                        <span className="text-[14px]">-{formatCurrency(doc.amountPaid, currencyCode)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center p-4 bg-slate-900 rounded-xl mt-4">
                      <span className="text-[10px] font-black text-white uppercase  ">Balance Due</span>
                      <span className="text-[18px] font-black text-white">{formatCurrency(doc.balanceDue, currencyCode)}</span>
                    </div>
                  </div>
                </div>

                {/* Professional Footer */}
                <div className="absolute bottom-[-15mm] left-0 right-0 py-6 border-t border-slate-100 flex justify-between items-center">
                  <div className="text-[9px] font-black font-open-sans  leading-none">
                    Generated via FreeFlow Invoice Builder
                  </div>
                  <div className="text-[9px] font-black font-open-sans  leading-none">
                    Thank you for your business.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6 no-print">


          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="font-black text-slate-900 dark:text-white uppercase text-xs">Status</h3>
            {doc.status === 'paid' ? (
              <div className="flex flex-col items-center justify-center py-8 text-center bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-4 shadow-inner">
                  <CheckCircle size={40} />
                </div>
                <p className="font-black text-emerald-600 dark:text-emerald-400 text-xl uppercase leading-none">Paid</p>
                <p className="text-xs font-bold text-emerald-400 dark:text-emerald-500 mt-3">{formatDate(new Date().toISOString())}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-slate-500 dark:text-slate-400">
                  <Clock size={24} />
                  <span className="text-base font-bold">Awaiting Remittance</span>
                </div>
                <button
                  onClick={() => handleUpdateStatus('paid')}
                  className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black text-sm uppercase hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 dark:shadow-black/20"
                >
                  Confirm Payment
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <EmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        recipient={client?.email}
        docNumber={doc.docNumber}
        docType={doc.type}
        businessName={business.name}
        setToast={setToast}
        doc={doc}
        state={state}
        onDownloadPdf={handleDownloadPdf}
      />

      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] animate-in slide-in-from-bottom-10 fade-in duration-500">
          <div className={`px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${toast.type === 'success' ? 'bg-emerald-900 border-emerald-800 text-emerald-50' :
            toast.type === 'error' ? 'bg-rose-900 border-rose-800 text-rose-50' :
              'bg-slate-900 border-slate-800 text-slate-50'}`}>
            {toast.type === 'success' ? <CheckCircle size={18} /> : <Sliders size={18} />}
            <p className="text-xs font-black uppercase  ">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesDetail;
