import React, { useState, useEffect, useRef } from 'react';
import { AppState, SalesDocument, SalesItem, PaymentMethod } from '../types';
import { formatCurrency, generateId } from '../utils';
import { Plus, Trash2, Save, ChevronLeft, Upload, ChevronDown, Smartphone, Building, CreditCard, Eye, FileText } from 'lucide-react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';

// Accordion Section component - DEFINED OUTSIDE TO PREVENT REMOUNTING ON STATE CHANGE
const Section = ({
  id: sectionId,
  title,
  children,
  badge,
  isOpen,
  onToggle
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  badge?: string;
  isOpen: boolean;
  onToggle: () => void;
}) => (
  <div className="border-b border-slate-200 dark:border-slate-800">
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between py-4 px-1 text-left group"
    >
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-300">{title}</span>
        {badge && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium">{badge}</span>}
      </div>
      <ChevronDown size={16} className={`text-slate-400 dark:text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-[2000px] pb-5' : 'max-h-0'}`}>
      <div className="px-1 space-y-3">
        {children}
      </div>
    </div>
  </div>
);

const SalesForm: React.FC<{ state: AppState, setState: any }> = ({ state, setState }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = !!id;
  const currencyCode = state.settings.currency.code;
  const currencySymbol = state.settings.currency.symbol;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if user is on free plan
  const isFreePlan = state.settings.profile.plan === 'free';

  const [showShipTo, setShowShipTo] = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);
  const [showShipping, setShowShipping] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('mobile_wallet');

  // Accordion section states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    myDetails: true,
    clientDetails: true,
    invoiceDetails: true,
    paymentDetails: false,
    notes: false,
    terms: false,
  });

  // Mobile tab: 'form' or 'preview'
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const [doc, setDoc] = useState<Partial<SalesDocument>>({
    type: 'INVOICE',
    status: 'draft',
    clientId: '',
    projectId: '',
    items: [{ id: generateId(), description: '', quantity: 1, rate: 0 }],
    tax: 0,
    discount: 0,
    shipping: 0,
    subtotal: 0,
    total: 0,
    amountPaid: 0,
    balanceDue: 0,
    createdAt: new Date().toISOString(),
    notes: '',
    terms: '1. Payment is due within 7 days of the invoice date.\n2. Please include the invoice number in your payment reference.\n3. Late payments may be subject to a 5% monthly interest fee.\n4. All deliverables remain the property of the creator until full payment is received.\n5. Thank you for your business!',
    docNumber: '',
    // New fields
    logo: '',
    companyInfo: '',
    billTo: '',
    shipTo: '',
    paymentTerms: '',
    poNumber: '',
    useProTemplate: false
  });

  useEffect(() => {
    if (isEditing) {
      const existing = state.salesDocuments.find(d => d.id === id);
      if (existing) setDoc(existing);
    } else {
      // Auto-generate sequential invoice number for new invoices
      const invoiceDocs = state.salesDocuments.filter(d => d.type === 'INVOICE' && d.docNumber.startsWith('INV-'));
      let nextNumber = 1001;

      if (invoiceDocs.length > 0) {
        const numbers = invoiceDocs.map(d => {
          const match = d.docNumber.match(/INV-(\d+)/);
          return match ? parseInt(match[1]) : 0;
        });
        nextNumber = Math.max(...numbers) + 1;
      }

      setDoc(prev => ({
        ...prev,
        docNumber: `INV-${nextNumber}`
      }));
    }

    // Pre-fill client if passed in navigation state
    const stateClientId = (location.state as any)?.clientId;
    if (stateClientId) {
      const selectedClient = state.clients.find(c => c.id === stateClientId);
      if (selectedClient) {
        setDoc(prev => ({
          ...prev,
          clientId: stateClientId,
          billTo: `${selectedClient.name}\n${selectedClient.company}\n${selectedClient.email}\n${selectedClient.phone}`
        }));
      }
    }
  }, [id, isEditing, state.salesDocuments, state.clients]);

  // Logo upload handler
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setDoc(prev => ({
          ...prev,
          logo: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const updateItem = (itemId: string, field: keyof SalesItem, value: any) => {
    setDoc(prev => ({
      ...prev,
      items: prev.items?.map(item => item.id === itemId ? { ...item, [field]: value } : item)
    }));
  };

  const addItem = () => {
    setDoc(prev => ({
      ...prev,
      items: [...(prev.items || []), { id: generateId(), description: '', quantity: 1, rate: 0 }]
    }));
  };

  const removeItem = (itemId: string) => {
    if ((doc.items?.length || 0) <= 1) return;
    setDoc(prev => ({
      ...prev,
      items: prev.items?.filter(i => i.id !== itemId)
    }));
  };

  // Real-time calculations
  const calculateTotals = () => {
    const subtotal = (doc.items || []).reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const taxAmount = (subtotal * (doc.tax || 0)) / 100;
    const discountAmount = doc.discount || 0;
    const shippingAmount = doc.shipping || 0;
    const total = subtotal + taxAmount + shippingAmount - discountAmount;
    const amountPaid = doc.amountPaid || 0;
    const balanceDue = total - amountPaid;

    return { subtotal, taxAmount, discountAmount, shippingAmount, total, amountPaid, balanceDue };
  };

  const { subtotal, taxAmount, discountAmount, shippingAmount, total, amountPaid, balanceDue } = calculateTotals();

  // Update totals whenever relevant fields change
  useEffect(() => {
    setDoc(prev => ({
      ...prev,
      subtotal,
      total,
      amountPaid,
      balanceDue
    }));
  }, [subtotal, total, amountPaid, balanceDue]);

  const handleSave = () => {
    // Generate ID only if new, otherwise preserve existing ID
    const docId = isEditing ? (id as string) : (doc.id || generateId());

    const finalDoc: SalesDocument = {
      ...(doc as SalesDocument),
      id: docId,
      subtotal,
      total,
      amountPaid,
      balanceDue,
      createdAt: doc.createdAt || new Date().toISOString(),
      // Add payment method information
      paymentMethod: selectedPaymentMethod,
      paymentDetails: selectedPaymentMethod === 'mobile_wallet'
        ? state.settings.paymentDetails.mobileWallet
        : state.settings.paymentDetails.bank
    };

    setState((prev: AppState) => ({
      ...prev,
      salesDocuments: isEditing
        ? prev.salesDocuments.map(d => d.id === id ? finalDoc : d)
        : [...prev.salesDocuments, finalDoc]
    }));

    navigate(`/billing/view/${docId}`, {
      state: {
        toast: {
          message: isEditing ? 'Financial records updated successfully' : 'Professional invoice issued successfully',
          type: 'success'
        }
      }
    });
  };


  // Shared input style
  const inputClass = "w-full px-5 py-3.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-400 text-slate-900 dark:text-white rounded-[10px] outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold font-open-sans text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 font-normal";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 font-open-sans mb-1";

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* ─── MOBILE TAB NAVIGATION ─── */}
      <div className="lg:hidden sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-2">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('form')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'form'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400'
              }`}
          >
            <FileText size={14} />
            Editor
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'preview'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400'
              }`}
          >
            <Eye size={14} />
            Preview
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8 lg:px-8 py-0 lg:py-8">

        {/* ─── LEFT COLUMN: FORM ENGINE ─── */}
        <div className={`lg:col-span-5 px-4 lg:px-0 pb-10 ${activeTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
          <div className="lg:sticky lg:top-8 max-w-xl mx-auto lg:mx-0">
            {/* Top Header */}
            <div className="flex items-center gap-2 mb-1">
              <Link to="/billing" className="text-blue-600 dark:text-blue-400 text-[20px] font-medium flex items-center gap-0.5 -ml-2 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                <ChevronLeft size={20} />
                Invoices
              </Link>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-0.5">{isEditing ? 'Edit Invoice' : 'Create New Invoice'}</h1>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-1">Fill in invoice details</p>
            <div className="flex items-center gap-1.5 mb-5">
              <div className="w-3.5 h-3.5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="text-[8px] text-blue-600 dark:text-blue-400">ℹ</span>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">You can save unfinished invoice as draft and complete later.</span>
            </div>

            {/* ─── MY DETAILS ─── */}
            <Section
              id="myDetails"
              title="My Details"
              isOpen={openSections['myDetails']}
              onToggle={() => toggleSection('myDetails')}
            >
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div
                  className="w-14 h-14 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {doc.logo ? (
                    <img src={doc.logo} alt="Logo" className="w-full h-full object-contain rounded-lg" />
                  ) : (
                    <Upload size={16} className="text-slate-400 dark:text-slate-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{doc.logo ? 'Logo uploaded' : 'Upload your business logo'}</p>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="text-[11px] text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700">
                    {doc.logo ? 'Change' : 'Browse files'}
                  </button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </div>

              {/* Business Info */}
              <div>
                <label className={labelClass}>Name & Address</label>
                <textarea
                  placeholder="Your company name, address, phone..."
                  className={inputClass + " resize-none"}
                  rows={3}
                  value={doc.companyInfo}
                  onChange={(e) => setDoc({ ...doc, companyInfo: e.target.value })}
                />
              </div>

              {/* Template Toggle */}
              <div className="flex items-center justify-between py-1">
                <span className="text-[12px] font-medium text-slate-600 dark:text-slate-400">Use Pro Template</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={doc.useProTemplate || false}
                    onChange={(e) => {
                      if (isFreePlan) {
                        alert('Pro templates are only available with a Pro plan. Upgrade to Pro to access premium invoice templates.');
                        return;
                      }
                      setDoc({ ...doc, useProTemplate: e.target.checked });
                    }}
                    disabled={isFreePlan}
                  />
                  <div className={`w-9 h-5 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-slate-600 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 ${isFreePlan ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                </label>
                {isFreePlan && (
                  <span className="text-xs text-blue-600 dark:text-blue-400 ml-2">Pro only</span>
                )}
              </div>
            </Section>

            {/* ─── CLIENT DETAILS ─── */}
            <Section
              id="clientDetails"
              title="Client Details"
              isOpen={openSections['clientDetails']}
              onToggle={() => toggleSection('clientDetails')}
            >
              {/* Client selection OR manual entry */}
              {state.clients.length > 0 ? (
                <div className="space-y-3">
                  <div>
                    <label className={labelClass}>Select Client</label>
                    <select
                      className={inputClass}
                      value={doc.clientId || ''}
                      onChange={(e) => {
                        const clientId = e.target.value;
                        if (clientId === 'other') {
                          // Clear existing client info and allow custom entry
                          setDoc({
                            ...doc,
                            clientId: 'other',
                            billTo: '\n\n\n' // Empty lines for custom entry
                          });
                        } else if (clientId) {
                          const selectedClient = state.clients.find(c => c.id === clientId);
                          if (selectedClient) {
                            setDoc({
                              ...doc,
                              clientId,
                              billTo: `${selectedClient.name}\n${selectedClient.company}\n${selectedClient.email}\n${selectedClient.phone}`
                            });
                          }
                        } else {
                          setDoc({ ...doc, clientId: '' });
                        }
                      }}
                    >
                      <option value="" className="dark:bg-slate-900">Select from contacts...</option>
                      {state.clients.map(c => (
                        <option key={c.id} value={c.id} className="dark:bg-slate-900">
                          {c.name} {c.company ? `(${c.company})` : ''}
                        </option>
                      ))}
                      <option value="other" className="dark:bg-slate-900 font-medium">Others</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 py-0.5">
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">or enter manually</span>
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
                  </div>

                  {/* Manual name entry */}
                  <div>
                    <label className={labelClass}>Client Name</label>
                    <input
                      type="text"
                      placeholder={doc.clientId === 'other' ? "Enter custom client name..." : "Type client name..."}
                      className={inputClass}
                      value={doc.billTo?.split('\n')[0] || ''}
                      onChange={(e) => {
                        const lines = (doc.billTo || '').split('\n');
                        lines[0] = e.target.value;
                        setDoc({ ...doc, billTo: lines.join('\n'), clientId: doc.clientId === 'other' ? 'other' : '' });
                      }}
                    />
                    {doc.clientId === 'other' && (
                      <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium mt-1">
                        💡 You selected "Other" - enter the client details manually below
                      </p>
                    )}
                  </div>

                  {/* Additional details */}
                  <div>
                    <label className={labelClass}>Address & Contact Details</label>
                    <textarea
                      placeholder="Company, email, phone, address..."
                      className={inputClass + " resize-none"}
                      rows={2}
                      value={(doc.billTo || '').split('\n').slice(1).join('\n')}
                      onChange={(e) => {
                        const name = (doc.billTo || '').split('\n')[0] || '';
                        setDoc({ ...doc, billTo: name + '\n' + e.target.value });
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className={labelClass}>Client Name *</label>
                    <input
                      type="text"
                      placeholder="Enter client name"
                      className={inputClass}
                      value={doc.billTo?.split('\n')[0] || ''}
                      onChange={(e) => {
                        const lines = (doc.billTo || '').split('\n');
                        lines[0] = e.target.value;
                        setDoc({ ...doc, billTo: lines.join('\n') });
                      }}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Address & Contact Details</label>
                    <textarea
                      placeholder="Company, email, phone, address..."
                      className={inputClass + " resize-none"}
                      rows={2}
                      value={(doc.billTo || '').split('\n').slice(1).join('\n')}
                      onChange={(e) => {
                        const name = (doc.billTo || '').split('\n')[0] || '';
                        setDoc({ ...doc, billTo: name + '\n' + e.target.value });
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Ship To (toggle) */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Ship To (different address)</span>
                <button
                  onClick={() => setShowShipTo(!showShipTo)}
                  className="text-blue-600 dark:text-blue-400 text-[11px] font-medium"
                >
                  {showShipTo ? 'Remove' : '+ Add'}
                </button>
              </div>
              {showShipTo && (
                <textarea
                  placeholder="Shipping address..."
                  className={inputClass + " resize-none"}
                  rows={2}
                  value={doc.shipTo}
                  onChange={(e) => setDoc({ ...doc, shipTo: e.target.value })}
                />
              )}
            </Section>

            {/* ─── INVOICE DETAILS ─── */}
            <Section
              id="invoiceDetails"
              title="Invoice Details"
              badge={doc.docNumber || ''}
              isOpen={openSections['invoiceDetails']}
              onToggle={() => toggleSection('invoiceDetails')}
            >
              {/* Invoice Number */}
              <div>
                <label className={labelClass}>Invoice Number *</label>
                <input
                  type="text"
                  readOnly
                  className={inputClass + " bg-slate-50 dark:bg-slate-800/30 cursor-not-allowed opacity-75"}
                  value={doc.docNumber}
                />
              </div>

              {/* Link to Project */}
              <div>
                <label className={labelClass}>Project Name</label>
                <select
                  className={inputClass}
                  value={doc.projectId || ''}
                  onChange={(e) => setDoc({ ...doc, projectId: e.target.value || '' })}
                >
                  <option value="" className="dark:bg-slate-900">No project linked</option>
                  {(doc.clientId
                    ? state.projects.filter(p => p.clientId === doc.clientId)
                    : state.projects
                  ).map(p => (
                    <option key={p.id} value={p.id} className="dark:bg-slate-900">
                      {p.title || 'Untitled Project'} — {p.status.replace('_', ' ')}
                    </option>
                  ))}
                </select>
                {doc.projectId && (
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">✓ Linked to project</p>
                )}
              </div>

              {/* Dates Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Issued Date</label>
                  <input
                    type="date"
                    className={inputClass}
                    value={doc.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDoc({ ...doc, createdAt: new Date(e.target.value).toISOString() })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Due Date</label>
                  <input
                    type="date"
                    className={inputClass}
                    value={doc.dueDate?.split('T')[0] || ''}
                    onChange={(e) => setDoc({ ...doc, dueDate: new Date(e.target.value).toISOString() })}
                  />
                </div>
              </div>

              {/* Payment Terms + PO */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Payment Terms</label>
                  <input
                    type="text"
                    placeholder="Net 30"
                    className={inputClass}
                    value={doc.paymentTerms}
                    onChange={(e) => setDoc({ ...doc, paymentTerms: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>PO Number</label>
                  <input
                    type="text"
                    placeholder="Optional"
                    className={inputClass}
                    value={doc.poNumber}
                    onChange={(e) => setDoc({ ...doc, poNumber: e.target.value })}
                  />
                </div>
              </div>

              {/* Tax */}
              <div>
                <label className={labelClass}>Tax (%)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    className={inputClass + " w-24"}
                    value={doc.tax}
                    onChange={(e) => setDoc({ ...doc, tax: parseFloat(e.target.value) || 0 })}
                  />
                  <span className="text-xs text-slate-400 dark:text-slate-500">%</span>
                </div>
              </div>

              {/* ── LINE ITEMS ── */}
              <div className="pt-2">
                {doc.items?.map((item, index) => (
                  <div key={item.id} className="mb-4 relative">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Item {index + 1}</span>
                      {(doc.items?.length || 0) > 1 && (
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1 text-slate-400 dark:text-slate-500 hover:text-rose-500 rounded transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Item description"
                      className={inputClass + " mb-2"}
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Units</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className={inputClass}
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Price</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs">{currencySymbol}</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className={inputClass + " pl-7"}
                            value={item.rate}
                            onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add Item */}
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-[12px] font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors mt-1"
                >
                  <Plus size={14} />
                  Add Item
                </button>
              </div>

              {/* Discount + Shipping toggles */}
              <div className="flex gap-3 pt-1">
                {!showDiscount && (
                  <button onClick={() => setShowDiscount(true)} className="text-blue-600 dark:text-blue-400 text-[11px] font-medium">+ Discount</button>
                )}
                {!showShipping && (
                  <button onClick={() => setShowShipping(true)} className="text-blue-600 dark:text-blue-400 text-[11px] font-medium">+ Shipping</button>
                )}
              </div>
              {showDiscount && (
                <div>
                  <label className={labelClass}>Discount ({currencySymbol})</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={inputClass + " w-32"}
                    value={doc.discount}
                    onChange={(e) => setDoc({ ...doc, discount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              )}
              {showShipping && (
                <div>
                  <label className={labelClass}>Shipping ({currencySymbol})</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={inputClass + " w-32"}
                    value={doc.shipping}
                    onChange={(e) => setDoc({ ...doc, shipping: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              )}

              {/* Summary Card */}
              <div className="bg-slate-50 dark:bg-slate-800/40 rounded-lg p-3 mt-2 space-y-1.5">
                <div className="flex justify-between text-[12px]">
                  <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
                  <span className="font-semibold text-slate-800 dark:text-white">{formatCurrency(subtotal, currencyCode)}</span>
                </div>
                {(doc.tax || 0) > 0 && (
                  <div className="flex justify-between text-[12px]">
                    <span className="text-slate-500 dark:text-slate-400">Tax ({doc.tax}%)</span>
                    <span className="font-semibold text-slate-800 dark:text-white">{formatCurrency(taxAmount, currencyCode)}</span>
                  </div>
                )}
                {showDiscount && (doc.discount || 0) > 0 && (
                  <div className="flex justify-between text-[12px]">
                    <span className="text-slate-500 dark:text-slate-400">Discount</span>
                    <span className="font-semibold text-rose-600 dark:text-rose-400">-{formatCurrency(discountAmount, currencyCode)}</span>
                  </div>
                )}
                {showShipping && (doc.shipping || 0) > 0 && (
                  <div className="flex justify-between text-[12px]">
                    <span className="text-slate-500 dark:text-slate-400">Shipping</span>
                    <span className="font-semibold text-slate-800 dark:text-white">{formatCurrency(shippingAmount, currencyCode)}</span>
                  </div>
                )}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-1.5 mt-1.5">
                  <div className="flex justify-between text-[13px]">
                    <span className="font-bold text-slate-900 dark:text-white">Total Amount</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(total, currencyCode)}</span>
                  </div>
                </div>
              </div>

              {/* Amount Paid + Balance */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Amount Paid</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs">{currencySymbol}</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className={inputClass + " pl-7"}
                      value={doc.amountPaid}
                      onChange={(e) => setDoc({ ...doc, amountPaid: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Balance Due</label>
                  <div className="px-3 py-2.5 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg text-[13px] font-bold text-rose-600 dark:text-rose-400">
                    {formatCurrency(balanceDue, currencyCode)}
                  </div>
                </div>
              </div>
            </Section>

            {/* ─── PAYMENT DETAILS ─── */}
            <Section
              id="paymentDetails"
              title="Payment Details"
              isOpen={openSections['paymentDetails']}
              onToggle={() => toggleSection('paymentDetails')}
            >
              <div className="space-y-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('mobile_wallet')}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${selectedPaymentMethod === 'mobile_wallet'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                  >
                    <Smartphone size={14} />
                    Mobile Wallet
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('bank')}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${selectedPaymentMethod === 'bank'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                  >
                    <Building size={14} />
                    Bank Transfer
                  </button>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                  {selectedPaymentMethod === 'mobile_wallet' && state.settings.paymentDetails.mobileWallet && (
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Type</span>
                        <span className="font-medium text-slate-900 dark:text-white capitalize">{state.settings.paymentDetails.mobileWallet.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Number</span>
                        <span className="font-medium text-slate-900 dark:text-white">{state.settings.paymentDetails.mobileWallet.number || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Account</span>
                        <span className="font-medium text-slate-900 dark:text-white capitalize">{state.settings.paymentDetails.mobileWallet.accountType}</span>
                      </div>
                    </div>
                  )}

                  {selectedPaymentMethod === 'bank' && state.settings.paymentDetails.bank && (
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Bank</span>
                        <span className="font-medium text-slate-900 dark:text-white">{state.settings.paymentDetails.bank.bankName || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Branch</span>
                        <span className="font-medium text-slate-900 dark:text-white">{state.settings.paymentDetails.bank.bankBranch || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Holder</span>
                        <span className="font-medium text-slate-900 dark:text-white">{state.settings.paymentDetails.bank.accountHolderName || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Account #</span>
                        <span className="font-medium text-slate-900 dark:text-white">{state.settings.paymentDetails.bank.accountNumber || 'Not set'}</span>
                      </div>
                      {state.settings.paymentDetails.bank.routingNumber && (
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Routing</span>
                          <span className="font-medium text-slate-900 dark:text-white">{state.settings.paymentDetails.bank.routingNumber}</span>
                        </div>
                      )}
                      {state.settings.paymentDetails.bank.swiftCode && (
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">SWIFT</span>
                          <span className="font-medium text-slate-900 dark:text-white">{state.settings.paymentDetails.bank.swiftCode}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {!((selectedPaymentMethod === 'mobile_wallet' && state.settings.paymentDetails.mobileWallet) ||
                    (selectedPaymentMethod === 'bank' && state.settings.paymentDetails.bank)) && (
                      <div className="text-center py-2">
                        <p className="text-amber-600 dark:text-amber-400 text-xs font-medium">
                          ⚠️ Payment details not configured.
                        </p>
                        <Link
                          to="/settings"
                          className="inline-flex items-center gap-1.5 mt-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 transition-all"
                        >
                          <CreditCard size={12} />
                          Configure
                        </Link>
                      </div>
                    )}
                </div>
              </div>
            </Section>

            {/* ─── ADD NOTES ─── */}
            <Section
              id="notes"
              title="Add Notes"
              badge={doc.notes}
              isOpen={openSections['notes']}
              onToggle={() => toggleSection('notes')}
            >
              <textarea
                placeholder="Additional notes for the client..."
                className={inputClass + " resize-none"}
                rows={3}
                value={doc.notes}
                onChange={(e) => setDoc({ ...doc, notes: e.target.value })}
              />
            </Section>

            {/* ─── TERMS & CONDITIONS ─── */}
            <Section
              id="terms"
              title="Terms & Conditions"
              isOpen={openSections['terms']}
              onToggle={() => toggleSection('terms')}
            >
              <textarea
                placeholder="Terms, late fees, payment methods..."
                className={inputClass + " resize-none"}
                rows={4}
                value={doc.terms}
                onChange={(e) => setDoc({ ...doc, terms: e.target.value })}
              />
            </Section>

            {/* ─── SAVE BUTTON ─── */}
            <div className="pt-4 pb-6">
              <button
                onClick={handleSave}
                className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold text-[13px] shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <Save size={16} />
                {isEditing ? 'Update Invoice' : 'Save Invoice'}
              </button>
              <button
                onClick={() => navigate('/billing')}
                className="w-full mt-2 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 font-medium text-slate-500 dark:text-slate-400 text-[12px] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Discard
              </button>
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN: LIVE PREVIEW ─── */}
        <div className={`lg:col-span-7 px-4 lg:px-0 bg-slate-100 dark:bg-slate-900/50 lg:bg-transparent min-h-screen lg:min-h-0 py-8 lg:py-0 ${activeTab === 'form' ? 'hidden lg:block' : 'block'}`}>
          <div className="lg:sticky lg:top-8">
            <div className="flex items-center justify-between mb-4 lg:px-2">
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                Live Invoice Preview
              </h2>

            </div>

            {/* The Actual Invoice Paper */}
            <div className="bg-white dark:bg-slate-800 shadow-2xl rounded-sm mx-auto overflow-hidden min-h-[800px] border border-slate-200 dark:border-slate-700 relative">
              {/* Pro Template Watermark Gradient */}
              {doc.useProTemplate && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full -mr-16 -mt-16"></div>
              )}

              <div className="p-8 sm:p-12">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between gap-8 mb-12">
                  <div className="max-w-[200px]">
                    {doc.logo ? (
                      <img src={doc.logo} alt="Business Logo" className="max-h-16 mb-4 object-contain" />
                    ) : (
                      <div className="h-12 w-12 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-4">
                        <Upload size={20} className="text-slate-300 dark:text-slate-600" />
                      </div>
                    )}
                    <div className="whitespace-pre-wrap text-[12px] leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
                      {doc.companyInfo || <span className="italic opacity-50 dark:text-slate-500">Set business details...</span>}
                    </div>
                  </div>

                  <div className="text-right">
                    <h1 className={`text-4xl font-black mb-1 ${doc.useProTemplate ? 'text-blue-600' : 'text-slate-900 dark:text-white'}`}>
                      INVOICE
                    </h1>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">#{doc.docNumber || '---'}</p>

                    <div className="space-y-1 text-xs">
                      <div className="flex justify-end gap-3 text-slate-500 dark:text-slate-400 font-medium lowercase">
                        <span>issued on</span>
                        <span className="text-slate-900 dark:text-white">{doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : '---'}</span>
                      </div>
                      <div className="flex justify-end gap-3 text-slate-500 dark:text-slate-400 font-medium lowercase">
                        <span>due by</span>
                        <span className="text-rose-600 dark:text-rose-400 font-bold">{doc.dueDate ? new Date(doc.dueDate).toLocaleDateString() : '---'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Billing Info Grid */}
                <div className="grid grid-cols-2 gap-12 mb-12 pb-12 border-b border-slate-100 dark:border-slate-700/50">
                  <div>
                    <h3 className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">Bill To</h3>
                    <div className="whitespace-pre-wrap text-sm text-slate-800 dark:text-white font-semibold leading-relaxed">
                      {doc.billTo || <span className="text-slate-300 dark:text-slate-600 italic font-normal">No client selected</span>}
                    </div>
                  </div>
                  {doc.shipTo && (
                    <div>
                      <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Ship To</h3>
                      <div className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                        {doc.shipTo}
                      </div>
                    </div>
                  )}
                </div>

                {/* Items Table */}
                <div className="mb-12">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-slate-900 dark:border-slate-200">
                        <th className="text-left py-3 text-[11px] font-black uppercase tracking-wider dark:text-white">Description</th>
                        <th className="text-center py-3 text-[11px] font-black uppercase tracking-wider w-20 dark:text-white">Qty</th>
                        <th className="text-right py-3 text-[11px] font-black uppercase tracking-wider w-32 dark:text-white">Rate</th>
                        <th className="text-right py-3 text-[11px] font-black uppercase tracking-wider w-32 dark:text-white">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                      {doc.items?.map((item) => (
                        <tr key={item.id} className="group">
                          <td className="py-4 text-sm font-bold text-slate-800 dark:text-slate-300">{item.description || '---'}</td>
                          <td className="py-4 text-center text-sm font-medium text-slate-600 dark:text-white">{item.quantity}</td>
                          <td className="py-4 text-right text-sm font-medium text-slate-600 dark:text-white">{formatCurrency(item.rate, currencyCode)}</td>
                          <td className="py-4 text-right text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(item.quantity * item.rate, currencyCode)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals & Payment */}
                <div className="flex flex-col md:flex-row justify-between gap-12 pt-8">
                  <div className="flex-1 space-y-6">
                    {/* Payment Info in Preview */}
                    <div>
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Payment Details</h3>
                      {selectedPaymentMethod === 'mobile_wallet' ? (
                        <div className="text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
                          <p className="font-bold text-slate-800 dark:text-slate-300 capitalize">Mobile Wallet ({state.settings.paymentDetails.mobileWallet?.type || '---'})</p>
                          <p>{state.settings.paymentDetails.mobileWallet?.number || '---'}</p>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
                          <p className="font-bold text-slate-800 dark:text-slate-300">{state.settings.paymentDetails.bank?.bankName || '---'}</p>
                          <p>A/C: {state.settings.paymentDetails.bank?.accountNumber || '---'}</p>
                        </div>
                      )}
                    </div>

                    {doc.notes && (
                      <div>
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Notes</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">"{doc.notes}"</p>
                      </div>
                    )}
                  </div>

                  <div className="w-full md:w-64 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Subtotal</span>
                      <span className="font-bold dark:text-white">{formatCurrency(subtotal, currencyCode)}</span>
                    </div>
                    {taxAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Tax ({doc.tax}%)</span>
                        <span className="font-bold dark:text-white">{formatCurrency(taxAmount, currencyCode)}</span>
                      </div>
                    )}
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Discount</span>
                        <span className="font-bold text-rose-600 dark:text-rose-400">-{formatCurrency(discountAmount, currencyCode)}</span>
                      </div>
                    )}
                    {shippingAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Shipping</span>
                        <span className="font-bold dark:text-white">{formatCurrency(shippingAmount, currencyCode)}</span>
                      </div>
                    )}
                    <div className={`flex justify-between items-center p-3 rounded-lg mt-4 ${doc.useProTemplate ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white'}`}>
                      <span className="text-xs font-bold uppercase tracking-widest opacity-80">Total Due</span>
                      <span className="text-xl font-black">{formatCurrency(total, currencyCode)}</span>
                    </div>
                  </div>
                </div>

                {/* Footer terms */}
                <div className="mt-20 pt-8 border-t border-slate-100 dark:border-slate-700">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="text-[10px] text-slate-400 dark:text-slate-300 leading-relaxed max-w-lg">
                      <span className="font-black text-slate-500 dark:text-slate-400 uppercase mr-2 tracking-tighter">Terms:</span>
                      {doc.terms}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesForm;
