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
  const watermarkOpacity = state.settings.branding.watermarkOpacity || 0.05;
  const showWatermark = state.settings.branding.showWatermark;
  const business = state.settings.business;
  const currencyCode = state.settings.currency.code;

  useEffect(() => {
    if (isPreview) setTimeout(() => window.print(), 500);
  }, [isPreview]);

  if (!doc) return <div className="p-20 text-center">Document link expired or invalid.</div>;

  return (
    <div className={`min-h-screen ${isPreview ? 'bg-white' : 'bg-slate-50'} py-12 px-4`}>
      <div className="max-w-4xl mx-auto space-y-8">
        {!isPreview && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center no-print">
            <div>
              <h2 className="text-lg font-bold">Secure Document Access</h2>
              <p className="text-sm text-slate-500">{doc.type} {doc.docNumber}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => window.print()} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg">
                <Printer size={18} className="text-slate-600" />
              </button>
              <button onClick={() => window.print()} className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg">
                <Download size={18} className="text-white" />
              </button>
            </div>
          </div>
        )}

        {/* Invoice Paper */}
        <div
          className={`bg-white rounded-xl border border-slate-200 shadow-xl relative overflow-hidden ${isPreview ? '' : 'p-8'}`}
          style={isPreview ? { width: '210mm', height: '297mm', padding: '20mm', boxSizing: 'border-box', margin: '0 auto' } : {}}
        >
          {showWatermark && (
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0"
              style={{ opacity: watermarkOpacity }}
            >
              <div className="flex flex-col items-center scale-[2.5] rotate-[-15deg]">
                <FileText size={300} className="text-slate-300" strokeWidth={0.5} />
                <span className="text-6xl font-black text-slate-300 tracking-tighter mt-[-80px]">FreeFlow</span>
              </div>
            </div>
          )}

          <div className="relative z-10">
            {/* Header Section */}
            <div className="flex justify-between mb-10">
              <div>
                {doc.logo ? (
                  <img src={doc.logo} alt="Company Logo" className="h-16 w-auto mb-4" />
                ) : (
                  <h2 className="text-4xl font-black text-blue-600 mb-4 uppercase tracking-tighter">{doc.type}</h2>
                )}
                <div className="text-sm space-y-1 whitespace-pre-line">
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
                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Reference</p>
                    <p className="font-black text-slate-900">{doc.docNumber}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs mt-1">Issue Date</p>
                    <p className="font-black text-slate-900">{formatDate(doc.createdAt)}</p>
                  </div>
                  {doc.paymentTerms && (
                    <div>
                      <p className="text-slate-400 font-black uppercase tracking-widest text-xs mt-1">Payment Terms</p>
                      <p className="font-black text-slate-900">{doc.paymentTerms}</p>
                    </div>
                  )}
                  {doc.poNumber && (
                    <div>
                      <p className="text-slate-400 font-black uppercase tracking-widest text-xs mt-1">PO Number</p>
                      <p className="font-black text-slate-900">{doc.poNumber}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recipient & Project */}
            <div className="grid grid-cols-2 gap-8 mb-10 py-6 border-y border-slate-100">
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Bill To</h4>
                <div className="text-sm space-y-1 whitespace-pre-line">
                  {doc.billTo || 'No billing information provided'}
                </div>
                {doc.shipTo && (
                  <>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mt-4 mb-2">Ship To</h4>
                    <div className="text-sm space-y-1 whitespace-pre-line">
                      {doc.shipTo}
                    </div>
                  </>
                )}
              </div>
              <div className="text-right">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Project</h4>
                <p className="font-black text-slate-900">{state.projects.find(p => p.id === doc.projectId)?.title || 'General Services'}</p>
                {doc.dueDate && (
                  <div className="mt-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Due Date</h4>
                    <p className="font-black text-slate-900">{formatDate(doc.dueDate)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full mb-10 text-sm">
              <thead>
                <tr className="border-b-2 border-slate-900 uppercase font-black text-slate-900">
                  <th className="py-3 text-left w-3/5">Service Description</th>
                  <th className="py-3 text-center">Qty</th>
                  <th className="py-3 text-center">Unit Price</th>
                  <th className="py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {doc.items.map((item, i) => (
                  <tr key={i} className="text-sm">
                    <td className="py-4 font-bold text-slate-900">{item.description}</td>
                    <td className="py-4 text-center text-slate-500 font-bold">{item.quantity}</td>
                    <td className="py-4 text-center text-slate-500 font-bold">{formatCurrency(item.rate, currencyCode)}</td>
                    <td className="py-4 text-right font-black text-slate-900">{formatCurrency(item.quantity * item.rate, currencyCode)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-10">
              <div className="w-80 space-y-2 text-sm">
                <div className="flex justify-between text-slate-400 font-black uppercase">
                  <span>Subtotal</span>
                  <span className="text-slate-900">{formatCurrency(doc.subtotal, currencyCode)}</span>
                </div>
                {doc.tax > 0 && (
                  <div className="flex justify-between text-slate-400 font-black uppercase">
                    <span>Tax ({doc.tax}%)</span>
                    <span className="text-slate-900">{formatCurrency((doc.subtotal * doc.tax) / 100, currencyCode)}</span>
                  </div>
                )}
                {doc.shipping > 0 && (
                  <div className="flex justify-between text-slate-400 font-black uppercase">
                    <span>Shipping</span>
                    <span className="text-slate-900">{formatCurrency(doc.shipping, currencyCode)}</span>
                  </div>
                )}
                {doc.discount > 0 && (
                  <div className="flex justify-between text-rose-500 font-black uppercase">
                    <span>Discount</span>
                    <span>-{formatCurrency(doc.discount, currencyCode)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-4 border-t-2 border-slate-900">
                  <span className="text-lg font-black uppercase">Total Amount</span>
                  <span className="text-2xl font-black text-blue-600">{formatCurrency(doc.total, currencyCode)}</span>
                </div>
                {doc.amountPaid > 0 && (
                  <div className="flex justify-between text-emerald-600 font-black uppercase">
                    <span>Amount Paid</span>
                    <span>-{formatCurrency(doc.amountPaid, currencyCode)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-slate-900">
                  <span className="text-base font-black uppercase">Balance Due</span>
                  <span className="text-lg font-black text-rose-600">{formatCurrency(doc.balanceDue, currencyCode)}</span>
                </div>
              </div>
            </div>

            {/* Terms & Notes */}
            <div className="mt-12 pt-6 border-t border-slate-100 text-sm space-y-4">
              {doc.notes && (
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Notes</h4>
                  <p className="text-slate-500 leading-relaxed whitespace-pre-line">
                    {doc.notes}
                  </p>
                </div>
              )}
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Terms & Conditions</h4>
                <p className="text-slate-500 italic leading-relaxed whitespace-pre-line">
                  {doc.terms || 'Please remit payment within the due date. Thank you for your business.'}
                </p>
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
