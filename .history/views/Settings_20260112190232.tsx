import React, { useState } from 'react';
import { AppState } from '../types';
import { ISO_CURRENCIES } from '../utils';
import { Search, Globe, DollarSign, Check, Sliders, Palette, Building, Mail, MapPin, Phone } from 'lucide-react';

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
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Configure your professional business presence and global preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Business Profile Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <Building className="text-blue-600" size={20} />
            <h2 className="font-bold text-lg text-slate-900">Business Profile (Billed By)</h2>
          </div>
          <div className="p-8 space-y-6">
            <p className="text-sm text-slate-500 italic">This information will appear at the top of all your invoices.</p>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase  ">Business Name</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold"
                    value={state.settings.business.name}
                    onChange={(e) => updateBusinessInfo('name', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase  ">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    type="email"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold"
                    value={state.settings.business.email}
                    onChange={(e) => updateBusinessInfo('email', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase  ">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold"
                    value={state.settings.business.phone}
                    onChange={(e) => updateBusinessInfo('phone', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase  ">Physical Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-slate-300" size={18} />
                  <textarea
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold h-24 resize-none"
                    value={state.settings.business.address}
                    onChange={(e) => updateBusinessInfo('address', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Regional Settings */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
              <Globe className="text-blue-600" size={20} />
              <h2 className="font-bold text-lg text-slate-900">Regional & Currency</h2>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 uppercase  ">Active Currency</label>
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center font-black text-xl">
                    {state.settings.currency.symbol}
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-lg uppercase leading-tight">{state.settings.currency.code}</p>
                    <p className="text-sm text-slate-500 font-medium">{state.settings.currency.name}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-50">
                <label className="text-sm font-bold text-slate-500 uppercase  ">Change Currency</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search currencies..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {filteredCurrencies.map(curr => (
                    <button
                      key={curr.code}
                      onClick={() => handleCurrencyChange(curr)}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all ${state.settings.currency.code === curr.code
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-slate-100 hover:bg-slate-50'
                        }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-xl font-bold w-8 text-center">{curr.symbol}</span>
                        <div className="text-left text-sm font-bold text-slate-900 uppercase">{curr.code} - {curr.name}</div>
                      </div>
                      {state.settings.currency.code === curr.code && <Check className="text-blue-600" size={18} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Branding Settings */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
              <Palette className="text-blue-600" size={20} />
              <h2 className="font-bold text-lg text-slate-900">Brand Watermark</h2>
            </div>
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="font-bold text-slate-900">Document Watermark</p>
                  <p className="text-xs text-slate-500">Show a large brand logo in the background</p>
                </div>
                <button
                  onClick={() => toggleWatermark(!state.settings.branding.showWatermark)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${state.settings.branding.showWatermark ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${state.settings.branding.showWatermark ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <div className={`space-y-6 ${state.settings.branding.showWatermark ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-500 uppercase  ">Global Opacity</label>
                    <span className="text-sm font-black text-blue-600">{Math.round(state.settings.branding.watermarkOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.3"
                    step="0.01"
                    value={state.settings.branding.watermarkOpacity}
                    onChange={(e) => updateWatermarkOpacity(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
