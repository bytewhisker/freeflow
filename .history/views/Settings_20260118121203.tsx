import React, { useState } from 'react';
import { AppState } from '../types';
import { ISO_CURRENCIES } from '../utils';
import {
  Search,
  Globe,
  Check,
  Palette,
  Building,
  Mail,
  MapPin,
  Phone,
  CreditCard,
  User,
  Briefcase,
  LogOut,
  Sparkles,
  Link as LinkIcon,
  Image as ImageIcon
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const Settings: React.FC<{ state: AppState, setState: any }> = ({ state, setState }) => {
  const [search, setSearch] = useState('');

  const filteredCurrencies = ISO_CURRENCIES.filter(curr =>
    curr.name.toLowerCase().includes(search.toLowerCase()) ||
    curr.code.toLowerCase().includes(search.toLowerCase()) ||
    curr.country.toLowerCase().includes(search.toLowerCase())
  );

  const handleCurrencyChange = (curr: typeof ISO_CURRENCIES[0]) => {
    setState((prev: AppState) => ({
      ...prev,
      settings: {
        ...prev.settings,
        currency: curr
      }
    }));
  };

  const updateProfile = (field: string, value: string) => {
    setState((prev: AppState) => ({
      ...prev,
      settings: {
        ...prev.settings,
        profile: {
          ...prev.settings.profile || { name: '', title: '', bio: '', website: '', avatarUrl: '' },
          [field]: value
        }
      }
    }));
  };

  const updateBusinessInfo = (field: string, value: string) => {
    setState((prev: AppState) => ({
      ...prev,
      settings: {
        ...prev.settings,
        business: {
          ...prev.settings.business,
          [field]: value
        }
      }
    }));
  };

  const updatePaymentDetails = (field: string, value: string) => {
    setState((prev: AppState) => ({
      ...prev,
      settings: {
        ...prev.settings,
        paymentDetails: {
          ...prev.settings.paymentDetails,
          [field]: value
        }
      }
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

  const toggleWatermark = (show: boolean) => {
    setState((prev: AppState) => ({
      ...prev,
      settings: {
        ...prev.settings,
        branding: {
          ...prev.settings.branding,
          showWatermark: show
        }
      }
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-poppins">Settings</h1>
          <p className="text-slate-500 mt-2 font-medium font-open-sans">Manage your personal profile, business details, and preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

        {/* Left Column */}
        <div className="space-y-8">

          {/* User Profile Section */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
              <User className="text-blue-600" size={20} />
              <h2 className="font-black text-lg text-slate-900">Personal Profile</h2>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-6 mb-8">
                {state.settings.profile?.avatarUrl ? (
                  <img
                    src={state.settings.profile.avatarUrl}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-lg shadow-blue-200"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-blue-200">
                    {state.settings.profile?.name?.[0] || 'U'}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-black text-slate-900">{state.settings.profile?.name || 'Your Name'}</h3>
                  <p className="text-slate-500 font-medium">{state.settings.profile?.title || 'Freelancer'}</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs label-work-email ml-1">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                      <input
                        type="text"
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 font-bold transition-all placeholder:font-medium placeholder:text-slate-300"
                        placeholder="e.g. Alex River"
                        value={state.settings.profile?.name || ''}
                        onChange={(e) => updateProfile('name', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black   label-work-email ml-1">Professional Title</label>
                    <div className="relative group">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                      <input
                        type="text"
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 font-bold transition-all placeholder:font-medium placeholder:text-slate-300"
                        placeholder="e.g. Senior Product Designer"
                        value={state.settings.profile?.title || ''}
                        onChange={(e) => updateProfile('title', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-black   label-work-email ml-1">Personal Website</label>
                    <div className="relative group">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                      <input
                        type="text"
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 font-bold transition-all placeholder:font-medium placeholder:text-slate-300"
                        placeholder="e.g. studioalex.com"
                        value={state.settings.profile?.website || ''}
                        onChange={(e) => updateProfile('website', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black   label-work-email ml-1">Avatar URL</label>
                    <div className="relative group">
                      <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                      <input
                        type="text"
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 font-bold transition-all placeholder:font-medium placeholder:text-slate-300"
                        placeholder="Paste image URL here"
                        value={state.settings.profile?.avatarUrl || ''}
                        onChange={(e) => updateProfile('avatarUrl', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black   label-work-email ml-1">Short Bio</label>
                  <div className="relative group">
                    <Sparkles className="absolute left-4 top-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <textarea
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 font-bold transition-all h-32 resize-none placeholder:font-medium placeholder:text-slate-300 leading-relaxed"
                      placeholder="Briefly describe what you do..."
                      value={state.settings.profile?.bio || ''}
                      onChange={(e) => updateProfile('bio', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Business Profile Section */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
              <Building className="text-blue-600" size={20} />
              <h2 className="font-black text-lg text-slate-900">Business Details</h2>
            </div>
            <div className="p-8 space-y-6">
              <p className="text-sm text-slate-500 font-medium">This information will appear on your invoices.</p>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-black   label-work-email ml-1">Business Name</label>
                  <div className="relative group">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input
                      type="text"
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 font-bold transition-all"
                      value={state.settings.business.name}
                      onChange={(e) => updateBusinessInfo('name', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black   label-work-email ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input
                      type="email"
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 font-bold transition-all"
                      value={state.settings.business.email}
                      onChange={(e) => updateBusinessInfo('email', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black   label-work-email ml-1">Phone Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input
                      type="text"
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 font-bold transition-all"
                      value={state.settings.business.phone}
                      onChange={(e) => updateBusinessInfo('phone', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black   label-work-email ml-1">Physical Address</label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <textarea
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 font-bold transition-all h-24 resize-none leading-relaxed"
                      value={state.settings.business.address}
                      onChange={(e) => updateBusinessInfo('address', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">

          {/* Payment Details Section */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
              <CreditCard className="text-blue-600" size={20} />
              <h2 className="font-black text-lg text-slate-900">Payment Instructions</h2>
            </div>
            <div className="p-8 space-y-6">
              <p className="text-sm text-slate-500 font-medium">Displayed on your invoices for client payments.</p>

              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-black   label-work-email ml-1">Bank Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 font-bold transition-all"
                      placeholder="e.g. Chase Bank"
                      value={state.settings.paymentDetails?.bankName || ''}
                      onChange={(e) => updatePaymentDetails('bankName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black   label-work-email ml-1">Account / IBAN</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 font-bold transition-all"
                      placeholder="e.g. US123456789"
                      value={state.settings.paymentDetails?.accountNumber || ''}
                      onChange={(e) => updatePaymentDetails('accountNumber', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-black   label-work-email ml-1">Routing / Sort</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 font-bold transition-all"
                      placeholder="e.g. 12345678"
                      value={state.settings.paymentDetails?.routingNumber || ''}
                      onChange={(e) => updatePaymentDetails('routingNumber', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black   label-work-email ml-1">SWIFT / BIC</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 font-bold transition-all"
                      placeholder="e.g. CHASUS33"
                      value={state.settings.paymentDetails?.swiftCode || ''}
                      onChange={(e) => updatePaymentDetails('swiftCode', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-xs font-black   label-work-email ml-1">PayPal Email / Me Link</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 font-bold transition-all"
                    placeholder="e.g. paypal.me/yourname"
                    value={state.settings.paymentDetails?.payPal || ''}
                    onChange={(e) => updatePaymentDetails('payPal', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Regional Settings */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
              <Globe className="text-blue-600" size={20} />
              <h2 className="font-black text-lg text-slate-900">Regional & Currency</h2>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black   label-work-email ml-1">Active Currency</label>
                <div className="flex items-center gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-200">
                    {state.settings.currency.symbol}
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-lg    leading-none mb-1">{state.settings.currency.code}</p>
                    <p className="text-xs text-slate-500 font-bold">{state.settings.currency.name}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black   label-work-email ml-1">Change Currency</label>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input
                    type="text"
                    placeholder="Search currencies..."
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 font-bold transition-all"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar mt-4">
                  {filteredCurrencies.map(curr => (
                    <button
                      key={curr.code}
                      onClick={() => handleCurrencyChange(curr)}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all ${state.settings.currency.code === curr.code
                        ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600'
                        : 'border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-black w-8 text-center  ">{curr.symbol}</span>
                        <div className="text-left text-xs font-bold text-slate-900   ">{curr.code} - {curr.name}</div>
                      </div>
                      {state.settings.currency.code === curr.code && <Check className="text-blue-600" size={16} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Branding Settings */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
              <Palette className="text-blue-600" size={20} />
              <h2 className="font-black text-lg text-slate-900">Brand Watermark</h2>
            </div>
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="font-bold text-slate-900 text-sm">Document Watermark</p>
                  <p className="text-[10px]    font-bold   tracking-wider mt-1">Show logo on invoices</p>
                </div>
                <button
                  onClick={() => toggleWatermark(!state.settings.branding.showWatermark)}
                  className={`w-14 h-8 rounded-full transition-all relative shadow-inner ${state.settings.branding.showWatermark ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${state.settings.branding.showWatermark ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <div className={`space-y-4 transition-opacity duration-300 ${state.settings.branding.showWatermark ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black   label-work-email">Opacity Level</label>
                  <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">{Math.round(state.settings.branding.watermarkOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.5"
                  step="0.01"
                  value={state.settings.branding.watermarkOpacity}
                  onChange={(e) => updateWatermarkOpacity(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Sign Out Section */}
          <div className="bg-rose-50 rounded-3xl border border-rose-100 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-rose-500 shadow-sm">
                <LogOut size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-rose-950">Sign Out</h3>
                <p className="text-rose-600/80 text-xs font-bold mt-1">End your current session securely on this device.</p>
              </div>
            </div>
            <button
              onClick={() => supabase?.auth.signOut()}
              className="w-full md:w-auto px-8 py-4 bg-white border border-rose-200 text-rose-600 rounded-2xl font-black text-xs label-work-email hover:bg-rose-600 hover:text-white hover:border-transparent transition-all shadow-sm hover:shadow-lg hover:shadow-rose-600/20 active:scale-95 whitespace-nowrap"
            >
              Sign Out Now
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;
