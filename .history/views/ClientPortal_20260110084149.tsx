
import React, { useEffect } from 'react';
import { AppState } from '../types';
import { formatCurrency, formatDate, getStatusColor } from '../utils';
import { Download, Printer, CheckCircle, FileText } from 'lucide-react';
import { useParams, useLocation } from 'react-router-dom';

const ClientPortal: React.FC<{ state: AppState }> = ({ state }) => {
  const { docId } = useParams();
  const location = useLocation();
  const isPreview = new URLSearchParams(location.search).get('preview') === 'true';
  const doc = state.salesDocuments.find(d => d.id === docId);
  const client = state.clients.find(c => c.id === doc?.clientId);
  const watermarkOpacity = state.settings.branding.watermarkOpacity;
  const showWatermark = state.settings.branding.showWatermark;
  const business = state.settings.business;

  useEffect(() => {
    if (isPreview) {
      setTimeout(() => window.print(), 800);
    }
  }, [isPreview]);

  if (!doc) return <div className="p-20 text-center">Document link expired or invalid.</div>;

  const balanceDue = doc.total - (doc.amountPaid || 0);

  const a4Styles: React.CSSProperties = isPreview ? {
    width: '210mm',
    height: '297mm',
    padding: '20mm',
    margin: '0 auto',
    boxSizing: 'border-box',
    backgroundColor: 'white',
    position: 'relative',
    overflow: 'hidden'
  } : {};

  return (
    <div className={`min-h-screen ${isPreview ? 'bg-white' : 'bg-slate-50'} py-8 px-4`}>
      <div className={`${isPreview ? '' : 'max-w-4xl'} mx-auto space-y-8`}>
        {!isPreview && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center no-print">
            <div>
              <h2 className="text-xl font-bold">Secure Document Access</h2>
              <p className="text-sm text-slate-500">You are viewing {doc.type} {doc.docNumber}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => window.print()} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                <Printer size={20} className="text-slate-600" />
              </button>
              <button className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                <Download size={20} className="text-white" />
              </button>
            </div>
          </div>
        )}

        <div 
          className={`bg-white rounded-xl border border-slate-200 shadow-xl invoice-paper relative overflow-hidden ${isPreview ? 'shadow-none border-none' : 'p-12 min-h-[900px]'}`}
          style={a4Styles}
        >
           {/* Watermark Logo */}
           {showWatermark && (
              <div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden"
                style={{ opacity: watermarkOpacity }}
              >
                <div className="flex flex-col items-center opacity-70 scale-[2.2] transform rotate-[-15deg]">
                  <FileText size={300} className="text-slate-300" strokeWidth={0.5} />
                  <span className="text-6xl font-black text-slate-300 tracking-tighter uppercase mt-[-70px]">FreeFlow</span>
                </div>
              </div>
            )}

           <div className="relative z-10">
              <div className="flex justify-between mb-8">
                <div>
                  <h2 className="text-4xl font-extrabold text-blue-600 mb-2 uppercase tracking-tight">{doc.type}</h2>
                  <div className="text-sm space-y-0.5">
                    <p className="font-bold text-slate-800 text-base">{business.name}</p>
                    <p className="text-slate-500 max-w-xs leading-tight">{business.address}</p>
                    <p className="text-slate-500">{business.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${getStatusColor(doc.status)}`}>
                    {doc.status}
                  </span>
                  <div className="mt-3 text-sm font-bold text-slate-800">
                    {doc.docNumber}
                  </div>
                  <div className="text-xs text-slate-400">Due {formatDate(doc.dueDate)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8 py-6 border-y border-slate-100">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Bill To</h4>
                  <div className="text-sm space-y-0.5">
                    <p className="font-bold text-slate-800 text-lg">{client?.name}</p>
                    <p className="text-slate-600 font-medium">{client?.company}</p>
                  </div>
                  {doc.shipTo && (
                    <div className="mt-4">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ship To</h4>
                      <p className="text-xs text-slate-500 leading-tight">{doc.shipTo}</p>
                    </div>
                  )}
                </div>
                <div className="text-right space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Details</h4>
                  <div className="text-xs space-y-1">
                    <p><span className="text-slate-400">Date:</span> <span className="font-bold text-slate-800">{formatDate(doc.createdAt)}</span></p>
                    {doc.paymentTerms && <p><span className="text-slate-400">Terms:</span> <span className="font-bold text-slate-800">{doc.paymentTerms}</span></p>}
                    {doc.poNumber && <p><span className="text-slate-400">PO #:</span> <span className="font-bold text-slate-800">{doc.poNumber}</span></p>}
                    <p><span className="text-slate-400">Project:</span> <span className="font-bold text-slate-800">{state.projects.find(p => p.id === doc.projectId)?.title || 'General Services'}</span></p>
                  </div>
                </div>
              </div>

              <table className="w-full mb-8">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-[10px] font-bold uppercase text-slate-400">
                    <th className="py-2 text-left w-3/5">Item</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {doc.items.map((item, i) => (
                    <tr key={i} className="text-sm">
                      <td className="py-3 pr-4">
                        <p className="font-bold text-slate-800 leading-snug">{item.description}</p>
                        <p className="text-[11px] text-slate-400 font-medium">Unit: {formatCurrency(item.rate, state.settings.currency.code)}</p>
                      </td>
                      <td className="py-3 text-center text-slate-600">{item.quantity}</td>
                      <td className="py-3 text-right font-bold text-slate-800">{formatCurrency(item.quantity * item.rate, state.settings.currency.code)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                    <div className="flex justify-between text-xs text-slate-500 uppercase font-bold">
                      <span>Subtotal</span>
                      <span>{formatCurrency(doc.subtotal, state.settings.currency.code)}</span>
                    </div>
                    {doc.tax > 0 && (
                      <div className="flex justify-between text-xs text-slate-500 uppercase font-bold">
                        <span>Tax ({doc.tax}%)</span>
                        <span>{formatCurrency((doc.subtotal * doc.tax) / 100, state.settings.currency.code)}</span>
                      </div>
                    )}
                    {doc.discount > 0 && (
                      <div className="flex justify-between text-xs text-rose-500 uppercase font-bold">
                        <span>Discount</span>
                        <span>-{formatCurrency(doc.discount, state.settings.currency.code)}</span>
                      </div>
                    )}
                    {/* Fixed: shippingCost -> shipping */}
                    {doc.shipping > 0 && (
                      <div className="flex justify-between text-xs text-slate-500 uppercase font-bold">
                        <span>Shipping</span>
                        <span>{formatCurrency(doc.shipping, state.settings.currency.code)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold text-slate-900 border-t border-slate-200 pt-2 mt-2">
                      <span className="uppercase tracking-widest text-xs">Total</span>
                      <span className="text-blue-600">{formatCurrency(doc.total, state.settings.currency.code)}</span>
                    </div>
                    {doc.amountPaid > 0 && (
                      <div className="flex justify-between text-xs text-slate-500 uppercase font-bold">
                        <span>Paid</span>
                        <span>{formatCurrency(doc.amountPaid, state.settings.currency.code)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold text-slate-900 bg-slate-50 px-2 py-1 rounded">
                      <span className="uppercase tracking-widest text-[10px]">Balance Due</span>
                      <span>{formatCurrency(balanceDue, state.settings.currency.code)}</span>
                    </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-8 pt-4 border-t border-slate-100">
                {doc.notes && (
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Notes</h4>
                    <p className="text-xs text-slate-500 italic leading-relaxed">{doc.notes}</p>
                  </div>
                )}
                {doc.terms && (
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Terms</h4>
                    <p className="text-xs text-slate-500 italic leading-relaxed">{doc.terms}</p>
                  </div>
                )}
              </div>
           </div>
        </div>

        {!isPreview && (
          <div className="text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest no-print">
            Powered by FreeFlow Freelancer OS
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientPortal;
