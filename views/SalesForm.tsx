import React, { useState, useEffect, useRef } from 'react';
import { AppState, SalesDocument, SalesItem } from '../types';
import { formatCurrency, generateId } from '../utils';
import { Plus, Trash2, Save, X, ChevronLeft, Upload, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';

const SalesForm: React.FC<{ state: AppState, setState: any }> = ({ state, setState }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = !!id;
  const currencyCode = state.settings.currency.code;
  const currencySymbol = state.settings.currency.symbol;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showShipTo, setShowShipTo] = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);
  const [showShipping, setShowShipping] = useState(false);

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
      createdAt: doc.createdAt || new Date().toISOString()
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

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-4 space-y-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="flex items-center gap-4">
        <Link to="/billing" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500 dark:text-slate-400">
          <ChevronLeft size={28} />
        </Link>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">{isEditing ? 'Edit Invoice' : 'Create New Invoice'}</h1>
      </div>

      {/* Header Section */}
      <div className="bg-slate-50 dark:bg-slate-900 p-4 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Logo Upload */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-2 font-open-sans">Business Logo</label>
            <div
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
              onClick={() => fileInputRef.current?.click()}
            >
              {doc.logo ? (
                <div className="space-y-4">
                  <img src={doc.logo} alt="Logo" className="max-h-20 mx-auto" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">Click to change logo</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload size={48} className="mx-auto text-slate-400 dark:text-black" />
                  <div>
                    <p className="text-lg font-bold text-black dark:text-slate-400">Upload Logo</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500">Click to upload or drag and drop</p>
                  </div>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>

          {/* Invoice Header */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tighter font-open-sans">Invoice</h2>
              </div>
              <div className="text-left sm:text-right w-full sm:w-auto">
                <div className="mb-6 flex sm:justify-end items-center gap-3">
                  <span className={`text-[11px] font-bold font-open-sans ${doc.useProTemplate ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}>
                    {doc.useProTemplate ? 'Pro Template Active' : 'Standard Template'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={doc.useProTemplate || false}
                      onChange={(e) => setDoc({ ...doc, useProTemplate: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center sm:justify-end">
                  <span className="text-2xl font-bold text-slate-400 dark:text-slate-500 mr-2 font-open-sans">#</span>
                  <input
                    type="text"
                    readOnly
                    className="text-2xl font-bold text-slate-900 dark:text-white bg-transparent border-b-2 border-slate-100 dark:border-slate-800 outline-none font-open-sans cursor-not-allowed opacity-70 w-full sm:w-32"
                    value={doc.docNumber}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-2 font-open-sans">Sender Information</label>
              <textarea
                placeholder="Your business name and address..."
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-base placeholder:text-white font-medium"
                rows={3}
                value={doc.companyInfo}
                onChange={(e) => setDoc({ ...doc, companyInfo: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recipient & Metadata Section */}
      <div className="bg-slate-50 dark:bg-slate-900 p-4 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Address Blocks */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-2 font-open-sans">Bill To</label>
              {state.clients.length > 0 ? (
                <div className="space-y-3">
                  {/* Client Selection Dropdown */}
                  <select
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-base font-medium"
                    value={doc.clientId || ''}
                    onChange={(e) => {
                      const clientId = e.target.value;
                      if (clientId) {
                        const selectedClient = state.clients.find(c => c.id === clientId);
                        if (selectedClient) {
                          setDoc({
                            ...doc,
                            clientId,
                            billTo: doc.billTo ? doc.billTo : `${selectedClient.name}\n${selectedClient.company}\n${selectedClient.email}\n${selectedClient.phone}`
                          });
                        }
                      } else {
                        setDoc({ ...doc, clientId: '' });
                      }
                    }}
                  >
                    <option value="" className="dark:bg-slate-900">Select existing client...</option>
                    {state.clients.map(c => (
                      <option key={c.id} value={c.id} className="dark:bg-slate-900">
                        {c.name} ({c.company})
                      </option>
                    ))}
                  </select>

                  {/* Custom Text Area */}
                  <div className="relative">
                    <textarea
                      placeholder="Customize billing address or add additional details..."
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-base placeholder:text-white font-medium"
                      rows={3}
                      value={doc.billTo}
                      onChange={(e) => setDoc({ ...doc, billTo: e.target.value })}
                    />
                    <div className="absolute top-2 right-2 text-xs text-slate-400 dark:text-slate-500">
                      {doc.clientId ? 'Additional Info' : 'Custom'}
                    </div>
                  </div>
                </div>
              ) : (
                /* No clients exist - show only text area */
                <textarea
                  placeholder="Who is this invoice to?"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-base placeholder:text-white font-medium"
                  rows={4}
                  value={doc.billTo}
                  onChange={(e) => setDoc({ ...doc, billTo: e.target.value })}
                />
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-2 font-open-sans">Ship To</label>
                <button
                  onClick={() => setShowShipTo(!showShipTo)}
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium"
                >
                  {showShipTo ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  {showShipTo ? 'Hide' : 'Show'}
                </button>
              </div>
              {showShipTo && (
                <textarea
                  placeholder="Shipping address (optional)"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-base placeholder:text-white font-medium"
                  rows={4}
                  value={doc.shipTo}
                  onChange={(e) => setDoc({ ...doc, shipTo: e.target.value })}
                />
              )}
            </div>

            {/* Link to Project */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-2 font-open-sans">Link to Project (Optional)</label>
              <select
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-base font-medium"
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
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  ✓ This invoice will appear in the linked project's details
                </p>
              )}
            </div>
          </div>

          {/* Metadata Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-2 font-open-sans">Issue Date</label>
              <input
                type="date"
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-base font-medium"
                value={doc.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0]}
                onChange={(e) => setDoc({ ...doc, createdAt: new Date(e.target.value).toISOString() })}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-2 font-open-sans">Payment Terms</label>
              <input
                type="text"
                placeholder="e.g., Net 30"
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-base font-medium placeholder:text-white"
                value={doc.paymentTerms}
                onChange={(e) => setDoc({ ...doc, paymentTerms: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-2 font-open-sans">Due Date</label>
              <input
                type="date"
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-base font-medium"
                value={doc.dueDate?.split('T')[0] || ''}
                onChange={(e) => setDoc({ ...doc, dueDate: new Date(e.target.value).toISOString() })}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-2 font-open-sans">PO Number</label>
              <input
                type="text"
                placeholder="Purchase order number"
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-base font-medium placeholder:text-white"
                value={doc.poNumber}
                onChange={(e) => setDoc({ ...doc, poNumber: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Line Item Table */}
      <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-black">
        {/* Table Header */}
        <div className="bg-slate-900 dark:bg-slate-800 text-white px-6 py-4 hidden md:block">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-6 font-bold text-[11px] font-open-sans">Service / Product description</div>
            <div className="col-span-2 text-center font-bold text-[11px] font-open-sans">Quantity</div>
            <div className="col-span-3 text-center font-bold text-[11px] font-open-sans">Rate / Price</div>
            <div className="col-span-1"></div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {doc.items?.map((item) => (
            <div key={item.id} className="flex flex-col md:grid md:grid-cols-12 gap-4 px-4 sm:px-6 py-4 items-center">
              <div className="w-full md:col-span-6">
                <label className="block md:hidden text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1 font-open-sans">Description</label>
                <input
                  type="text"
                  placeholder="Item description"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-blue-500/10 text-base font-medium placeholder:text-white"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                />
              </div>
              <div className="w-full md:col-span-2">
                <label className="block md:hidden text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1 font-open-sans">Quantity</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-blue-500/10 text-base text-left md:text-center font-bold"
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="w-full md:col-span-3">
                <label className="block md:hidden text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1 font-open-sans">Rate / Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-medium">{currencySymbol}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-blue-500/10 text-base font-bold"
                    value={item.rate}
                    onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div className="w-full md:col-span-1 text-right">
                <button
                  onClick={() => removeItem(item.id)}
                  className="w-full md:w-auto flex items-center justify-center gap-2 md:block p-3 md:p-2 text-slate-400 dark:text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors border border-slate-100 dark:border-slate-800 md:border-transparent mt-2 md:mt-0"
                  disabled={(doc.items?.length || 0) <= 1}
                >
                  <Trash2 size={18} className="md:mx-auto" />
                  <span className="md:hidden font-bold text-[11px] uppercase">Remove Item</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Line Item Button */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={addItem}
            className="flex items-center gap-2 px-6 py-3 border-2 border-green-500 text-green-600 dark:text-green-500 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-green-50 dark:hover:bg-green-900/20 transition-all font-open-sans"
          >
            Add Line Item
          </button>
        </div>
      </div>

      {/* Footer Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Notes and Terms */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-[13px] font-bold text-slate-900 dark:text-white mb-4 font-open-sans">Notes</h3>
            <textarea
              placeholder="Additional notes or internal memos..."
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-base placeholder:text-white font-medium"
              rows={4}
              value={doc.notes}
              onChange={(e) => setDoc({ ...doc, notes: e.target.value })}
            />
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-[13px] font-bold text-slate-900 dark:text-white mb-4 font-open-sans">Terms & Conditions</h3>
            <textarea
              placeholder="Terms and conditions, late fees, payment methods..."
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-base placeholder:text-white font-medium"
              rows={4}
              value={doc.terms}
              onChange={(e) => setDoc({ ...doc, terms: e.target.value })}
            />
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-[13px] font-bold text-slate-900 dark:text-white mb-6 font-open-sans">Financial Summary</h3>

          <div className="space-y-4">
            {/* Subtotal */}
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-black dark:text-slate-400">Subtotal</span>
              <span className="font-black text-slate-900 dark:text-white">{formatCurrency(subtotal, currencyCode)}</span>
            </div>

            {/* Tax */}
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-bold text-black dark:text-slate-400">Tax</span>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-16 px-2 py-1 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded text-center font-bold"
                    value={doc.tax}
                    onChange={(e) => setDoc({ ...doc, tax: parseFloat(e.target.value) || 0 })}
                  />
                  <span className="text-slate-500 dark:text-slate-400 text-sm ml-1">%</span>
                </div>
              </div>
              <span className="font-black text-slate-900 dark:text-white">{formatCurrency(taxAmount, currencyCode)}</span>
            </div>

            {/* Discount */}
            {showDiscount && (
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-black dark:text-slate-400">Discount</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 dark:text-slate-500">{currencySymbol}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-20 px-2 py-1 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded text-center font-bold"
                    value={doc.discount}
                    onChange={(e) => setDoc({ ...doc, discount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
            )}
            {!showDiscount && (
              <button
                onClick={() => setShowDiscount(true)}
                className="text-green-600 hover:text-green-700 font-medium text-sm"
              >
                + Discount
              </button>
            )}

            {/* Shipping */}
            {showShipping && (
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-black dark:text-slate-400">Shipping</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 dark:text-slate-500">{currencySymbol}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-20 px-2 py-1 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded text-center font-bold"
                    value={doc.shipping}
                    onChange={(e) => setDoc({ ...doc, shipping: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
            )}
            {!showShipping && (
              <button
                onClick={() => setShowShipping(true)}
                className="text-green-600 hover:text-green-700 font-medium text-sm"
              >
                + Shipping
              </button>
            )}

            {/* Total */}
            <div className="flex justify-between items-center py-4 border-t-2 border-slate-900 dark:border-blue-600">
              <span className="text-lg font-bold text-slate-900 dark:text-white font-open-sans">Total Amount</span>
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{formatCurrency(total, currencyCode)}</span>
            </div>

            {/* Amount Paid */}
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-black dark:text-slate-400">Amount Paid</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 dark:text-slate-500">{currencySymbol}</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-24 px-2 py-1 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded text-center font-bold"
                  value={doc.amountPaid}
                  onChange={(e) => setDoc({ ...doc, amountPaid: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            {/* Balance Due */}
            <div className="flex justify-between items-center py-4 bg-slate-50 dark:bg-slate-800/50 -mx-6 px-6">
              <span className="text-lg font-bold text-slate-900 dark:text-white font-open-sans">Balance Due</span>
              <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{formatCurrency(balanceDue, currencyCode)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-4 sm:gap-6">
        <button
          onClick={() => navigate('/billing')}
          className="w-full sm:w-auto px-8 py-4 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-slate-500 dark:text-slate-400 text-[13px] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-open-sans"
        >
          Discard
        </button>
        <button
          onClick={handleSave}
          className="w-full sm:w-auto px-12 py-4 rounded-xl bg-black dark:bg-blue-600 text-white font-bold text-[13px] shadow-xl hover:bg-slate-900 dark:hover:bg-blue-700 transition-all flex items-center justify-center gap-2 font-open-sans"
        >
          <Save size={18} />
          {isEditing ? 'Update Invoice' : 'Issue Invoice'}
        </button>
      </div>
    </div >
  );
};

export default SalesForm;
