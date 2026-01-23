
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

const EmailModal = ({ isOpen, onClose, recipient, docNumber, docType }: any) => {
  const [email, setEmail] = useState(recipient || '');
  const [subject, setSubject] = useState(`${docType} ${docNumber}`);
  const [message, setMessage] = useState(`Dear Client,\n\nPlease find attached ${docType.toLowerCase()} ${docNumber}.\n\nBest regards,\nAlex Studio`);
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSend = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      alert('Email sent successfully!');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-black text-slate-900 uppercase   text-sm">Send via Email</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-500 uppercase">Recipient Email</label>
            <div className="flex">
              <input
                type="text"
                className="flex-1 px-4 py-3 bg-white border border-slate-300 text-slate-900 rounded-l-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-base"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="px-3 py-3 bg-slate-100 border border-l-0 border-slate-300 text-slate-500 font-bold text-sm rounded-r-xl flex items-center">
                @gmail.com
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-500 uppercase">Subject</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-white border border-slate-300 text-slate-900 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-base font-bold"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-500 uppercase">Message</label>
            <textarea
              className="w-full px-4 py-3 bg-white border border-slate-300 text-slate-900 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-base h-32 resize-none"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleSend}
            disabled={isSending}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black text-sm uppercase   flex items-center gap-2 hover:bg-blue-700 disabled:bg-blue-300 transition-all shadow-lg shadow-blue-100"
          >
            {isSending ? 'Sending...' : <><Send size={18} /> Send</>}
          </button>
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

  const doc = state.salesDocuments.find(d => d.id === id);
  const client = state.clients.find(c => c.id === doc?.clientId);
  const currencyCode = state.settings.currency.code;
  const watermarkOpacity = state.settings.branding.watermarkOpacity;
  const showWatermark = state.settings.branding.showWatermark;
  const business = state.settings.business;

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
        alert('Invoice content not found');
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
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-8 no-print pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/billing" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ChevronLeft size={28} className="text-slate-400" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-slate-900">{doc.docNumber}</h1>
              <span className={`text-xs uppercase font-black px-4 py-1.5 rounded-full ${getStatusColor(doc.status)}`}>
                {doc.status}
              </span>
            </div>
            <p className="text-slate-400 text-sm font-bold uppercase   mt-1">Generated {formatDate(doc.createdAt)}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">


          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 flex items-center gap-2 font-black text-xs uppercase   shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 flex items-center gap-2 font-black text-xs uppercase   shadow-sm transition-all"
          >
            <Edit3 size={18} /> Edit
          </Link>
          <button
            onClick={() => setIsEmailModalOpen(true)}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 font-black text-xs uppercase   shadow-xl shadow-blue-100 transition-all"
          >
            <Mail size={18} /> Email
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <div className="invoice-paper bg-white border border-slate-200 relative overflow-hidden" style={{ width: '210mm', height: '297mm', padding: '20mm', boxSizing: 'border-box', margin: '0 auto' }}>
            {/* Watermark Logo */}
            {showWatermark && (
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden"
                style={{ opacity: watermarkOpacity }}
              >
                <div className="flex flex-col items-center opacity-70 scale-[2.5] transform rotate-[-15deg]">
                  <FileText size={400} className="text-slate-300" strokeWidth={0.5} />
                  <span className="text-8xl font-black text-slate-300 tracking-tighter uppercase mt-[-100px]">FreeFlow</span>
                </div>
              </div>
            )}

            <div className="relative z-10">
              <div className="flex justify-between mb-16">
                <div>
                  {doc.logo ? (
                    <img src={doc.logo} alt="Company Logo" className="h-20 w-auto mb-4" />
                  ) : (
                    <h2 className="text-5xl font-black text-blue-600 mb-4 uppercase tracking-tighter">{doc.type}</h2>
                  )}
                  <div className="text-base space-y-1 whitespace-pre-line">
                    {doc.companyInfo || `${business.name}\n${business.address}\n${business.email}\n${business.phone}`}
                  </div>
                </div>
                <div className="text-right">
                  {!doc.logo && (
                    <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-4xl ml-auto mb-6 shadow-xl shadow-blue-100">
                      {business.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="text-base space-y-3">
                    <div>
                      <p className="text-slate-400 font-black uppercase   text-xs">Reference</p>
                      <p className="font-black text-slate-900 text-lg">{doc.docNumber}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-black uppercase   text-xs mt-4">Issue Date</p>
                      <p className="font-black text-slate-900 text-lg">{formatDate(doc.createdAt)}</p>
                    </div>
                    {doc.paymentTerms && (
                      <div>
                        <p className="text-slate-400 font-black uppercase   text-xs mt-4">Payment Terms</p>
                        <p className="font-black text-slate-900 text-lg">{doc.paymentTerms}</p>
                      </div>
                    )}
                    {doc.poNumber && (
                      <div>
                        <p className="text-slate-400 font-black uppercase   text-xs mt-4">PO Number</p>
                        <p className="font-black text-slate-900 text-lg">{doc.poNumber}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-12 mb-5 py-0 border-y border-slate-100">
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase   mb-4">Bill To</h4>
                  <div className="text-base space-y-1 whitespace-pre-line">
                    {doc.billTo || 'No billing information provided'}
                  </div>
                  {doc.shipTo && (
                    <>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase   mt-6 mb-4">Ship To</h4>
                      <div className="text-base space-y-1 whitespace-pre-line">
                        {doc.shipTo}
                      </div>
                    </>
                  )}
                </div>
                <div className="text-right">
                  <h4 className="text-xs font-black text-slate-400 uppercase   mb-4">Project</h4>
                  <div className="text-base space-y-1">
                    <p className="font-black text-slate-900 text-xl">{state.projects.find(p => p.id === doc.projectId)?.title || 'General Professional Services'}</p>
                  </div>
                  {doc.dueDate && (
                    <div className="mt-6">
                      <h4 className="text-xs font-black text-slate-400 uppercase   mb-2">Due Date</h4>
                      <p className="font-black text-slate-900 text-lg">{formatDate(doc.dueDate)}</p>
                    </div>
                  )}
                </div>
              </div>

              <table className="w-full mb-6">
                <thead>
                  <tr className="border-b-2 border-slate-900 text-[15px] font-black uppercase   text-slate-900">
                    <th className="-py-5 text-left w-1/2">Service Description</th>
                    <th className="py-5 text-center ">Qty</th>
                    <th className="py-5 text-center ">Unit Price</th>
                    <th className="py-5 text-right ">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {doc.items.map((item, i) => (
                    <tr key={i} className="text-base">
                      <td className="py-2 font-bold text-slate-900 leading-snug text-[15px]">{item.description}</td>
                      <td className="py-2 text-center text-slate-500 font-bold text-[15px]">{item.quantity}</td>
                      <td className="py-2 text-center text-slate-500 font-bold text-[15px]">{formatCurrency(item.rate, currencyCode)}</td>
                      <td className="py-2 text-right font-black text-slate-900 text-[15px]">{formatCurrency(item.quantity * item.rate, currencyCode)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end">
                <div className="w-96 space-y-2">
                  <div className="flex justify-between text-slate-400 font-black uppercase text-sm  ">
                    <span>Subtotal</span>
                    <span className="text-slate-900 text-lg">{formatCurrency(doc.subtotal, currencyCode)}</span>
                  </div>
                  {doc.tax > 0 && (
                    <div className="flex justify-between text-slate-400 font-black uppercase text-sm  ">
                      <span>Tax ({doc.tax}%)</span>
                      <span className="text-slate-900 text-lg">{formatCurrency((doc.subtotal * doc.tax) / 100, currencyCode)}</span>
                    </div>
                  )}
                  {doc.shipping > 0 && (
                    <div className="flex justify-between text-slate-400 font-black uppercase text-sm  ">
                      <span>Shipping</span>
                      <span className="text-slate-900 text-lg">{formatCurrency(doc.shipping, currencyCode)}</span>
                    </div>
                  )}
                  {doc.discount > 0 && (
                    <div className="flex justify-between text-rose-500 font-black uppercase text-sm  ">
                      <span>Discount</span>
                      <span className="text-lg">-{formatCurrency(doc.discount, currencyCode)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-3 border-t-4 border-slate-900">
                    <span className="text-[18px] font-black text-slate-900 uppercase  ">Total Amount</span>
                    <span className="text-[20px] font-black text-blue-600">{formatCurrency(doc.total, currencyCode)}</span>
                  </div>
                  {doc.amountPaid > 0 && (
                    <div className="flex justify-between text-emerald-600 font-black uppercase text-sm  ">
                      <span>Amount Paid</span>
                      <span className="text-lg">-{formatCurrency(doc.amountPaid, currencyCode)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t-2 border-slate-900">
                    <span className="text-[16px] font-black text-slate-900 uppercase  ">Balance Due</span>
                    <span className="text-[18px] font-black text-rose-600">{formatCurrency(doc.balanceDue, currencyCode)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-12 border-t border-slate-100 space-y-6">
                {doc.notes && (
                  <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase   mb-4">Notes</h4>
                    <p className="text-base text-slate-500 leading-relaxed max-w-2xl whitespace-pre-line">
                      {doc.notes}
                    </p>
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase   mb-4">Terms & Conditions</h4>
                  <p className="text-base text-slate-500 leading-relaxed italic max-w-2xl whitespace-pre-line">
                    {doc.terms || 'Please remit payment to the specified account within the due date. Thank you for your business.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 no-print">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-black text-slate-900 uppercase text-xs   flex items-center gap-2">
              <Sliders size={16} /> Watermark
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-500">Opacity</span>
                <span className="text-sm font-black text-slate-900">{Math.round(watermarkOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.3"
                step="0.01"
                value={watermarkOpacity}
                onChange={(e) => updateWatermarkOpacity(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold text-slate-400">10%</span>
                <span className="text-xs font-bold text-slate-400">30%</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-black text-slate-900 uppercase text-xs  ">Status</h3>
            {doc.status === 'paid' ? (
              <div className="flex flex-col items-center justify-center py-8 text-center bg-emerald-50 rounded-2xl">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
                  <CheckCircle size={40} />
                </div>
                <p className="font-black text-emerald-600 text-xl uppercase   leading-none">Paid</p>
                <p className="text-xs font-bold text-emerald-400 mt-3">{formatDate(new Date().toISOString())}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-5 bg-slate-50 rounded-xl text-slate-500">
                  <Clock size={24} />
                  <span className="text-base font-bold">Awaiting Remittance</span>
                </div>
                <button
                  onClick={() => handleUpdateStatus('paid')}
                  className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black text-sm uppercase   hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
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
        recipient={client?.email?.split('@')[0]}
        docNumber={doc.docNumber}
        docType={doc.type}
      />
    </div>
  );
};

export default SalesDetail;
