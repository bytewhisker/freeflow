import React, { useEffect } from 'react';
import { AppState } from '../types';
import { formatCurrency, formatDate, getStatusColor } from '../utils';
import { Download, Printer, FileText } from 'lucide-react';
import { useParams, useLocation } from 'react-router-dom';

const ClientPortal: React.FC<{ state: AppState }> = ({ state }) => {
  const { docId } = useParams();
  const location = useLocation();
  const isPreview = new URLSearchParams(location.search).get('preview') === 'true';
  const doc = state.salesDocuments.find(d => d.id === docId);
  const client = state.clients.find(c => c.id === doc?.clientId);
  const watermarkOpacity = state.settings.branding.watermarkOpacity || 0.1;
  const showWatermark = state.settings.branding.showWatermark;
  const business = state.settings.business;
  const currencyCode = state.settings.currency.code;

  useEffect(() => {
    if (isPreview) setTimeout(() => window.print(), 500);
  }, [isPreview]);

  if (!doc) return <div className="p-20 text-center">Document link expired or invalid.</div>;

  return (
    <div className={`min-h-screen min-h-[100dvh] ${isPreview ? 'bg-white' : 'bg-slate-50 dark:bg-slate-950'} py-4 sm:py-12 px-2 sm:px-4 transition-colors duration-300`}>
      <div className="max-w-4xl mx-auto space-y-8">
        {!isPreview && (
          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex justify-between items-center no-print">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Secure Document Access</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{doc.type} {doc.docNumber}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => window.print()} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                <Printer size={18} className="text-black dark:text-slate-400" />
              </button>
              <button onClick={() => window.print()} className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                <Download size={18} className="text-white" />
              </button>
            </div>
          </div>
        )}

        {/* Invoice Paper */}
        <div className="overflow-x-auto pb-4">
          <div
            className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden shrink-0 ${isPreview ? '' : 'p-4 sm:p-8'}`}
            style={isPreview ? { width: '210mm', minHeight: '297mm', padding: '20mm', boxSizing: 'border-box', margin: '0 auto' } : { width: '210mm', minHHeiggt: '297mm', margin: '0 auto' }}
          >


            <div className="relative z-10">
              {/* Header Section */}
              <div className="flex justify-between mb-10">
                <div>
                  {doc.logo ? (
                    <img src={doc.logo} alt="Company Logo" className="h-16 w-auto mb-4" />
                  ) : (
                    <h2 className="text-4xl font-black text-blue-600 mb-4 uppercase tracking-tighter">{doc.type}</h2>
                  )}
                  <div className="text-sm space-y-1 whitespace-pre-line text-black dark:text-slate-300">
                    {doc.companyInfo || `${business.name}\n${business.address}\n${business.email}\n${business.phone}`}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs uppercase font-black px-3 py-1 rounded-full ${getStatusColor(doc.status)} mb-2 block`}>
                    {doc.status}
                  </span>
                  {!doc.logo && (
                    <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-2xl mb-2 shadow">
                      {business.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="text-sm space-y-1">
                    <div>
                      <p className="text-slate-400 font-black uppercase text-xs">Reference</p>
                      <p className="font-black text-slate-900 dark:text-white">{doc.docNumber}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-black uppercase text-xs mt-1">Issue Date</p>
                      <p className="font-black text-slate-900 dark:text-white">{formatDate(doc.createdAt)}</p>
                    </div>
                    {doc.paymentTerms && (
                      <div>
                        <p className="text-slate-400 font-black uppercase text-xs mt-1">Payment Terms</p>
                        <p className="font-black text-slate-900 dark:text-white">{doc.paymentTerms}</p>
                      </div>
                    )}
                    {doc.poNumber && (
                      <div>
                        <p className="text-slate-400 font-black uppercase text-xs mt-1">PO Number</p>
                        <p className="font-black text-slate-900 dark:text-white">{doc.poNumber}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recipient & Project */}
              <div className="grid grid-cols-2 gap-8 mb-10 py-6 border-y border-slate-100">
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase mb-2">Bill To</h4>
                  <div className="text-sm space-y-1 whitespace-pre-line text-black dark:text-slate-300">
                    {doc.billTo || 'No billing information provided'}
                  </div>
                  {doc.shipTo && (
                    <>
                      <h4 className="text-xs font-black text-slate-400 uppercase mt-4 mb-2">Ship To</h4>
                      <div className="text-sm space-y-1 whitespace-pre-line text-black dark:text-slate-300">
                        {doc.shipTo}
                      </div>
                    </>
                  )}
                </div>
                <div className="text-right">
                  <h4 className="text-xs font-black text-slate-400 uppercase mb-2">Project</h4>
                  <p className="font-black text-slate-900 dark:text-white">{state.projects.find(p => p.id === doc.projectId)?.title || 'General Services'}</p>
                  {doc.dueDate && (
                    <div className="mt-4">
                      <h4 className="text-xs font-black text-slate-400 uppercase mb-2">Due Date</h4>
                      <p className="font-black text-slate-900 dark:text-white">{formatDate(doc.dueDate)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full mb-10 text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-900 dark:border-slate-700 uppercase font-black text-slate-900 dark:text-white">
                    <th className="py-3 text-left w-3/5">Service Description</th>
                    <th className="py-3 text-center">Qty</th>
                    <th className="py-3 text-center">Unit Price</th>
                    <th className="py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {doc.items.map((item, i) => (
                    <tr key={i} className="text-sm border-b border-slate-100 dark:border-slate-800">
                      <td className="py-4 font-bold text-slate-900 dark:text-white">{item.description}</td>
                      <td className="py-4 text-center text-slate-500 dark:text-slate-400 font-bold">{item.quantity}</td>
                      <td className="py-4 text-center text-slate-500 dark:text-slate-400 font-bold">{formatCurrency(item.rate, currencyCode)}</td>
                      <td className="py-4 text-right font-black text-slate-900 dark:text-white">{formatCurrency(item.quantity * item.rate, currencyCode)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end mb-10">
                <div className="w-80 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-400 dark:text-slate-500 font-black uppercase">
                    <span>Subtotal</span>
                    <span className="text-slate-900 dark:text-white">{formatCurrency(doc.subtotal, currencyCode)}</span>
                  </div>
                  {doc.tax > 0 && (
                    <div className="flex justify-between text-slate-400 dark:text-slate-500 font-black uppercase">
                      <span>Tax ({doc.tax}%)</span>
                      <span className="text-slate-900 dark:text-white">{formatCurrency((doc.subtotal * doc.tax) / 100, currencyCode)}</span>
                    </div>
                  )}
                  {doc.shipping > 0 && (
                    <div className="flex justify-between text-slate-400 dark:text-slate-500 font-black uppercase">
                      <span>Shipping</span>
                      <span className="text-slate-900 dark:text-white">{formatCurrency(doc.shipping, currencyCode)}</span>
                    </div>
                  )}
                  {doc.discount > 0 && (
                    <div className="flex justify-between text-rose-500 font-black uppercase">
                      <span>Discount</span>
                      <span>-{formatCurrency(doc.discount, currencyCode)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-4 border-t-2 border-slate-900 dark:border-slate-700">
                    <span className="text-lg font-black uppercase text-slate-900 dark:text-white">Total Amount</span>
                    <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{formatCurrency(doc.total, currencyCode)}</span>
                  </div>
                  {doc.amountPaid > 0 && (
                    <div className="flex justify-between text-emerald-600 font-black uppercase">
                      <span>Amount Paid</span>
                      <span>-{formatCurrency(doc.amountPaid, currencyCode)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-900 dark:border-slate-700">
                    <span className="text-base font-black uppercase text-slate-900 dark:text-white">Balance Due</span>
                    <span className="text-lg font-black text-rose-600 dark:text-rose-400">{formatCurrency(doc.balanceDue, currencyCode)}</span>
                  </div>
                </div>
              </div>

              {/* Terms & Notes */}
              <div className="mt-12 pt-6 border-t border-slate-100 text-sm space-y-4">
                {doc.notes && (
                  <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase mb-2">Notes</h4>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                      {doc.notes}
                    </p>
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase mb-2">Terms & Conditions</h4>
                  <p className="text-slate-500 dark:text-slate-400 italic leading-relaxed whitespace-pre-line">
                    {doc.terms || 'Please remit payment within the due date. Thank you for your business.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {!isPreview && (
          <div className="text-center text-slate-400 text-xs no-print">
            Powered by FreeFlow Freelancer OS
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientPortal;
