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
    terms: '',
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
      setDoc(prev => ({
        ...prev,
        docNumber: prev.docNumber || `INV-${Math.floor(1000 + Math.random() * 9000)}`
      }));

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
    }
  }, [id, isEditing, state.salesDocuments]);

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

    const finalDoc: SalesDocument = {
      ...(doc as SalesDocument),
      id: isEditing ? (id as string) : generateId(),
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

    navigate('/billing?filter=recent');
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-8 animate-in slide-in-from-bottom duration-500">
      <div className="flex items-center gap-4">
        <Link to="/billing" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronLeft size={28} />
        </Link>
        <h1 className="text-3xl font-black text-slate-900">{isEditing ? 'Edit Invoice' : 'Create New Invoice'}</h1>
      </div>

      {/* Header Section */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Logo Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider">Logo</label>
            <div
              className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
              onClick={() => fileInputRef.current?.click()}
            >
              {doc.logo ? (
                <div className="space-y-4">
                  <img src={doc.logo} alt="Logo" className="max-h-20 mx-auto" />
                  <p className="text-sm text-slate-500">Click to change logo</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload size={48} className="mx-auto text-slate-400" />
                  <div>
                    <p className="text-lg font-bold text-slate-600">Upload Logo</p>
                    <p className="text-sm text-slate-400">Click to upload or drag and drop</p>
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
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter">Invoice</h2>
              </div>
              <div className="text-right">
                <div className="mb-6 flex justify-end items-center gap-3">
                  <span className={`text-xs font-black uppercase tracking-wider ${doc.useProTemplate ? 'text-blue-600' : 'text-slate-400'}`}>
                    {doc.useProTemplate ? 'Pro Template Active' : 'Standard Template'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={doc.useProTemplate || false}
                      onChange={(e) => setDoc({ ...doc, useProTemplate: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Invoice #</label>
                <div className="flex items-center">
                  <span className="text-2xl font-black text-slate-600 mr-2">#</span>
                  <input
                    type="text"
                    className="text-2xl font-black text-slate-900 bg-transparent border-b-2 border-slate-200 focus:border-blue-500 outline-none"
                    value={doc.docNumber}
                    onChange={(e) => setDoc({ ...doc, docNumber: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider">Who is this from?</label>
              <textarea
                placeholder="Your business name and address..."
                className="w-full px-4 py-3 bg-white border border-slate-300 text-slate-900 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-base"
                rows={3}
                value={doc.companyInfo}
                onChange={(e) => setDoc({ ...doc, companyInfo: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recipient & Metadata Section */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Address Blocks */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider font-family: Roboto, sans-serif; ">Bill To</label>
              {state.clients.length > 0 ? (
                <div className="space-y-3">
                  {/* Client Selection Dropdown */}
                  <select
                    className="w-full px-4 py-3 bg-white border border-slate-300 text-slate-900 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-base"
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
                    <option value="">Select existing client...</option>
                    {state.clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.company})
                      </option>
                    ))}
                  </select>

                  {/* Custom Text Area */}
                  <div className="relative">
                    <textarea
                      placeholder="Customize billing address or add additional details..."
                      className="w-full px-4 py-3 bg-white border border-slate-300 text-slate-900 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-base"
                      rows={3}
                      value={doc.billTo}
                      onChange={(e) => setDoc({ ...doc, billTo: e.target.value })}
                    />
                    <div className="absolute top-2 right-2 text-xs text-slate-400">
                      {doc.clientId ? 'Additional Info' : 'Custom'}
                    </div>
                  </div>
                </div>
              ) : (
                /* No clients exist - show only text area */
                <textarea
                  placeholder="Who is this invoice to?"
                  className="w-full px-4 py-3 bg-white border border-slate-300 text-slate-900 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-base"
                  rows={4}
                  value={doc.billTo}
                  onChange={(e) => setDoc({ ...doc, billTo: e.target.value })}
                />
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider">Ship To</label>
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
                  className="w-full px-4 py-3 bg-white border border-slate-300 text-slate-900 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-base"
                  rows={4}
                  value={doc.shipTo}
                  onChange={(e) => setDoc({ ...doc, shipTo: e.target.value })}
                />
              )}
            </div>
          </div>

          {/* Metadata Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider">Date</label>
              <input
                type="date"
                className="w-full px-4 py-3 bg-white border border-slate-300 text-slate-900 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-base"
                value={doc.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0]}
                onChange={(e) => setDoc({ ...doc, createdAt: new Date(e.target.value).toISOString() })}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider">Payment Terms</label>
              <input
                type="text"
                placeholder="e.g., Net 30"
                className="w-full px-4 py-3 bg-white border border-slate-300 text-slate-900 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-base"
                value={doc.paymentTerms}
                onChange={(e) => setDoc({ ...doc, paymentTerms: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider">Due Date</label>
              <input
                type="date"
                className="w-full px-4 py-3 bg-white border border-slate-300 text-slate-900 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-base"
                value={doc.dueDate?.split('T')[0] || ''}
                onChange={(e) => setDoc({ ...doc, dueDate: new Date(e.target.value).toISOString() })}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider">PO Number</label>
              <input
                type="text"
                placeholder="Purchase order number"
                className="w-full px-4 py-3 bg-white border border-slate-300 text-slate-900 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-base"
                value={doc.poNumber}
                onChange={(e) => setDoc({ ...doc, poNumber: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Line Item Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="bg-slate-900 text-white px-6 py-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-6 font-black text-sm uppercase tracking-wider">Item</div>
            <div className="col-span-2 text-center font-black text-sm uppercase tracking-wider">Quantity</div>
            <div className="col-span-3 text-center font-black text-sm uppercase tracking-wider">Rate</div>
            <div className="col-span-1"></div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-slate-100">
          {doc.items?.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
              <div className="col-span-6">
                <input
                  type="text"
                  placeholder="Item description"
                  className="w-full px-4 py-3 bg-white border border-slate-200 text-slate-900 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/10 text-base"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 bg-white border border-slate-200 text-slate-900 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/10 text-base text-center"
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="col-span-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">{currencySymbol}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 text-slate-900 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/10 text-base"
                    value={item.rate}
                    onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div className="col-span-1 text-right">
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  disabled={(doc.items?.length || 0) <= 1}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Line Item Button */}
        <div className="px-6 py-4 border-t border-slate-100">
          <button
            onClick={addItem}
            className="flex items-center gap-2 px-6 py-3 border-2 border-green-500 text-green-600 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-green-50 transition-all"
          >
            <Plus size={20} />
            Line Item
          </button>
        </div>
      </div>

      {/* Footer Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Notes and Terms */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider mb-4">Notes</h3>
            <textarea
              placeholder="Additional notes or internal memos..."
              className="w-full px-4 py-3 bg-white border border-slate-300 text-slate-900 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-base"
              rows={4}
              value={doc.notes}
              onChange={(e) => setDoc({ ...doc, notes: e.target.value })}
            />
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider mb-4">Terms</h3>
            <textarea
              placeholder="Terms and conditions, late fees, payment methods..."
              className="w-full px-4 py-3 bg-white border border-slate-300 text-slate-900 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-base"
              rows={4}
              value={doc.terms}
              onChange={(e) => setDoc({ ...doc, terms: e.target.value })}
            />
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider mb-6">Summary</h3>

          <div className="space-y-4">
            {/* Subtotal */}
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="font-bold text-slate-600">Subtotal</span>
              <span className="font-black text-slate-900">{formatCurrency(subtotal, currencyCode)}</span>
            </div>

            {/* Tax */}
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-600">Tax</span>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-16 px-2 py-1 text-sm border border-slate-200 rounded text-center"
                    value={doc.tax}
                    onChange={(e) => setDoc({ ...doc, tax: parseFloat(e.target.value) || 0 })}
                  />
                  <span className="text-slate-500 text-sm ml-1">%</span>
                </div>
              </div>
              <span className="font-black text-slate-900">{formatCurrency(taxAmount, currencyCode)}</span>
            </div>

            {/* Discount */}
            {showDiscount && (
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="font-bold text-slate-600">Discount</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">{currencySymbol}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-20 px-2 py-1 text-sm border border-slate-200 rounded text-center"
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
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="font-bold text-slate-600">Shipping</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">{currencySymbol}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-20 px-2 py-1 text-sm border border-slate-200 rounded text-center"
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
            <div className="flex justify-between items-center py-4 border-t-2 border-slate-900">
              <span className="text-xl font-black text-slate-900 uppercase">Total</span>
              <span className="text-2xl font-black text-blue-600">{formatCurrency(total, currencyCode)}</span>
            </div>

            {/* Amount Paid */}
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="font-bold text-slate-600">Amount Paid</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">{currencySymbol}</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-24 px-2 py-1 text-sm border border-slate-200 rounded text-center"
                  value={doc.amountPaid}
                  onChange={(e) => setDoc({ ...doc, amountPaid: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            {/* Balance Due */}
            <div className="flex justify-between items-center py-4 bg-slate-50 -mx-6 px-6">
              <span className="text-xl font-black text-slate-900 uppercase">Balance Due</span>
              <span className="text-2xl font-black text-rose-600">{formatCurrency(balanceDue, currencyCode)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-6">
        <button
          onClick={() => navigate('/billing')}
          className="px-10 py-4 rounded-xl border border-slate-200 font-black text-slate-500 text-sm uppercase   hover:bg-slate-50 transition-colors"
        >
          Discard
        </button>
        <button
          onClick={handleSave}
          className="px-16 py-4 rounded-xl bg-blue-600 text-white font-black text-sm uppercase   shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <Save size={20} />
          {isEditing ? 'Update Invoice' : 'Create Invoice'}
        </button>
      </div>
    </div>
  );
};

export default SalesForm;
