import React, { useState } from "react";
import { AppState, PaymentMethod, MobileWalletType, AccountType } from "../types";
import { ISO_CURRENCIES } from "../utils";
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
  Image as ImageIcon,
  Loader2,
  Camera,
  Upload,
  Download,
  Users,
  Receipt,
  Smartphone,
  X,
  Save,
  Star
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { exportClientsToCSV, exportProjectsToCSV, exportInvoicesToCSV, exportAllData } from "../lib/csv-export";

/* ---------- shadcn‑style UI helpers ---------- */
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <div
    className={`bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden ${className}`}
  >
    {children}
  </div>
);

const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <div className={`px-8 py-6 border-b border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900 ${className}`}>
    {children}
  </div>
);

const CardTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-xl font-bold text-slate-900 dark:text-white roboto-font">{children}</h3>
);

const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

const Label: React.FC<{
  htmlFor?: string;
  children: React.ReactNode;
}> = ({ htmlFor, children }) => (
  <label
    htmlFor={htmlFor}
    className="block text-[13px] font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest roboto-font"
  >
    {children}
  </label>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (
  props
) => (
  <input
    {...props}
    className={`w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-[14px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed roboto-font ${props.className}`}
  />
);

/* ---------- Settings component ---------- */
const Settings: React.FC<{ state: AppState; setState: any }> = ({
  state,
  setState,
}) => {
  const [search, setSearch] = useState("");
  const [activeSection, setActiveSection] = useState("Personal Profile");
  const [uploading, setUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [tempPaymentDetails, setTempPaymentDetails] = useState(state.settings.paymentDetails);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Temp states for other sections
  const [tempProfile, setTempProfile] = useState(state.settings.profile);
  const [tempBusiness, setTempBusiness] = useState(state.settings.business);
  const [tempCurrency, setTempCurrency] = useState(state.settings.currency);
  const [tempBranding, setTempBranding] = useState(state.settings.branding);

  // Unsaved changes flags for each section
  const [hasProfileChanges, setHasProfileChanges] = useState(false);
  const [hasBusinessChanges, setHasBusinessChanges] = useState(false);
  const [hasCurrencyChanges, setHasCurrencyChanges] = useState(false);
  const [hasBrandingChanges, setHasBrandingChanges] = useState(false);

  // Save states for each section
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingBusiness, setIsSavingBusiness] = useState(false);
  const [isSavingCurrency, setIsSavingCurrency] = useState(false);
  const [isSavingBranding, setIsSavingBranding] = useState(false);

  // Success states for each section
  const [showProfileSuccess, setShowProfileSuccess] = useState(false);
  const [showBusinessSuccess, setShowBusinessSuccess] = useState(false);
  const [showCurrencySuccess, setShowCurrencySuccess] = useState(false);
  const [showBrandingSuccess, setShowBrandingSuccess] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  /* ----- helpers ----- */
  const filteredCurrencies = ISO_CURRENCIES.filter(
    (curr) =>
      curr.name.toLowerCase().includes(search.toLowerCase()) ||
      curr.code.toLowerCase().includes(search.toLowerCase()) ||
      curr.country.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => a.name.localeCompare(b.name));

  const handleCurrencyChange = (curr: typeof ISO_CURRENCIES[0]) => {
    setTempCurrency(curr);
    setHasCurrencyChanges(true);
  };

  const updateTempProfile = (field: string, value: string) => {
    setTempProfile(prev => ({ ...prev, [field]: value }));
    setHasProfileChanges(true);
  };

  const updateTempBusiness = (field: string, value: string) => {
    setTempBusiness(prev => ({ ...prev, [field]: value }));
    setHasBusinessChanges(true);
  };

  const updateTempBranding = (field: string, value: any) => {
    setTempBranding(prev => ({ ...prev, [field]: value }));
    setHasBrandingChanges(true);
  };

  const updateProfile = (field: string, value: string) => {
    setState((prev: AppState) => ({
      ...prev,
      settings: {
        ...prev.settings,
        profile: { ...prev.settings.profile, [field]: value },
      },
    }));
  };

  const updateBusinessInfo = (field: string, value: string) => {
    setState((prev: AppState) => ({
      ...prev,
      settings: {
        ...prev.settings,
        business: { ...prev.settings.business, [field]: value },
      },
    }));
  };

  const updatePaymentDetails = (field: string, value: string) => {
    setState((prev: AppState) => ({
      ...prev,
      settings: {
        ...prev.settings,
        paymentDetails: { ...prev.settings.paymentDetails, [field]: value },
      },
    }));
  };

  const updatePaymentMethod = (method: PaymentMethod) => {
    setTempPaymentDetails(prev => ({ ...prev, method }));
    setHasUnsavedChanges(true);
  };

  const updateTempMobileWallet = (field: string, value: string) => {
    // Validate wallet number - only numbers allowed
    if (field === 'number') {
      const numbersOnly = value.replace(/\D/g, '');
      setTempPaymentDetails(prev => ({
        ...prev,
        mobileWallet: {
          ...prev.mobileWallet,
          [field]: numbersOnly
        }
      }));
    } else {
      setTempPaymentDetails(prev => ({
        ...prev,
        mobileWallet: {
          ...prev.mobileWallet,
          [field]: value
        }
      }));
    }
    setHasUnsavedChanges(true);
  };

  const updateTempBankDetails = (field: string, value: string) => {
    setTempPaymentDetails(prev => ({
      ...prev,
      bank: {
        ...prev.bank,
        [field]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  const handleSavePaymentDetails = () => {
    setIsSaving(true);
    setState((prev: AppState) => ({
      ...prev,
      settings: {
        ...prev.settings,
        paymentDetails: tempPaymentDetails
      }
    }));
    setTimeout(() => {
      setIsSaving(false);
      setShowSaveSuccess(true);
      setHasUnsavedChanges(false);
      setTimeout(() => setShowSaveSuccess(false), 2000);
    }, 500);
  };

  const handleCancelPaymentDetails = () => {
    setTempPaymentDetails(state.settings.paymentDetails);
    setHasUnsavedChanges(false);
  };

  const detectRegion = () => {
    const locale = navigator.language;
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Simple heuristic map for ISO_CURRENCIES
    let detectedCode = 'USD';

    if (timeZone.includes('Dhaka')) detectedCode = 'BDT';
    else if (timeZone.includes('London')) detectedCode = 'GBP';
    else if (timeZone.includes('Europe')) detectedCode = 'EUR';
    else if (timeZone.includes('Australia')) detectedCode = 'AUD';
    else if (timeZone.includes('Canada')) detectedCode = 'CAD';
    else if (timeZone.includes('India') || locale.includes('IN')) detectedCode = 'INR';
    else if (timeZone.includes('Dubai') || timeZone.includes('Abu_Dhabi')) detectedCode = 'AED';
    else if (timeZone.includes('Saudi')) detectedCode = 'SAR';
    else if (timeZone.includes('China') || locale.includes('CN')) detectedCode = 'CNY';
    else if (timeZone.includes('Singapore')) detectedCode = 'SGD';
    else if (timeZone.includes('Tokyo')) detectedCode = 'JPY';
    else if (timeZone.includes('Zurich')) detectedCode = 'CHF';

    const match = ISO_CURRENCIES.find(c => c.code === detectedCode);
    if (match) {
      handleCurrencyChange(match);
    }
  };

  // Profile section functions
  const handleSaveProfile = () => {
    setIsSavingProfile(true);
    setState((prev: AppState) => ({
      ...prev,
      settings: {
        ...prev.settings,
        profile: tempProfile
      }
    }));
    setTimeout(() => {
      setIsSavingProfile(false);
      setShowProfileSuccess(true);
      setHasProfileChanges(false);
      setTimeout(() => setShowProfileSuccess(false), 2000);
    }, 500);
  };

  const handleCancelProfile = () => {
    setTempProfile(state.settings.profile);
    setHasProfileChanges(false);
  };

  // Business section functions
  const handleSaveBusiness = () => {
    setIsSavingBusiness(true);
    setState((prev: AppState) => ({
      ...prev,
      settings: {
        ...prev.settings,
        business: tempBusiness
      }
    }));
    setTimeout(() => {
      setIsSavingBusiness(false);
      setShowBusinessSuccess(true);
      setHasBusinessChanges(false);
      setTimeout(() => setShowBusinessSuccess(false), 2000);
    }, 500);
  };

  const handleCancelBusiness = () => {
    setTempBusiness(state.settings.business);
    setHasBusinessChanges(false);
  };

  // Currency section functions
  const handleSaveCurrency = () => {
    setIsSavingCurrency(true);
    setState((prev: AppState) => ({
      ...prev,
      settings: {
        ...prev.settings,
        currency: tempCurrency
      }
    }));
    setTimeout(() => {
      setIsSavingCurrency(false);
      setShowCurrencySuccess(true);
      setHasCurrencyChanges(false);
      setTimeout(() => setShowCurrencySuccess(false), 2000);
    }, 500);
  };

  const handleCancelCurrency = () => {
    setTempCurrency(state.settings.currency);
    setHasCurrencyChanges(false);
  };

  // Branding section functions
  const handleSaveBranding = () => {
    setIsSavingBranding(true);
    setState((prev: AppState) => ({
      ...prev,
      settings: {
        ...prev.settings,
        branding: tempBranding
      }
    }));
    setTimeout(() => {
      setIsSavingBranding(false);
      setShowBrandingSuccess(true);
      setHasBrandingChanges(false);
      setTimeout(() => setShowBrandingSuccess(false), 2000);
    }, 500);
  };

  const handleCancelBranding = () => {
    setTempBranding(state.settings.branding);
    setHasBrandingChanges(false);
  };

  const toggleWatermark = (show: boolean) => {
    setTempBranding(prev => ({ ...prev, showWatermark: show }));
    setHasBrandingChanges(true);
  };

  const updateWatermarkOpacity = (val: number) => {
    setTempBranding(prev => ({ ...prev, watermarkOpacity: val }));
    setHasBrandingChanges(true);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      if (!supabase) throw new Error("Supabase client not initialized");

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

      if (data) {
        updateProfile('avatarUrl', data.publicUrl);
      }
    } catch (error: any) {
      alert('Error uploading avatar: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const isPro = state.settings.profile.plan === 'pro';

  const navItems = [
    { id: "Personal Profile", label: "Profile", icon: User },
    { id: "Business Details", label: "Business", icon: Building },
    { id: "Payment Instructions", label: "Payments", icon: CreditCard },
    { id: "Regional & Currency", label: "Regional", icon: Globe },
    { id: "Data Export", label: "Export", icon: Download },
  ];

  // Shared content sections rendered into either layout
  const contentBlock = (
    <div className={isPro ? 'space-y-6' : 'flex-1 space-y-8'}>
      {activeSection === "Personal Profile" && (
        <Card>
          <CardHeader><div className="flex items-center gap-3"><User className="text-blue-600" size={20} /><CardTitle>Personal Profile</CardTitle></div></CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 p-5 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-800">
              <div className="relative group">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white dark:border-slate-900 shadow-lg relative bg-white dark:bg-slate-800">
                  {tempProfile?.avatarUrl ? (<img src={tempProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />) : (<div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold roboto-font">{tempProfile?.name?.[0] ?? "U"}</div>)}
                  {uploading && (<div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm"><Loader2 className="animate-spin text-white" size={20} /></div>)}
                </div>
                <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="absolute -bottom-1 -right-1 p-1.5 bg-blue-600 text-white rounded-lg shadow-xl hover:bg-blue-700 transition-all hover:scale-110 disabled:opacity-70" title="Change avatar"><Camera size={14} /></button>
                <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
              </div>
              <div className="text-center sm:text-left flex-1">
                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all disabled:opacity-50">{uploading ? 'Wait...' : 'Edit Photo'}</button>
                  {tempProfile?.avatarUrl && (<button onClick={() => updateTempProfile('avatarUrl', '')} disabled={uploading} className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-rose-500 rounded-lg text-xs font-bold hover:bg-rose-50 transition-all">Remove</button>)}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="col-span-1"><Label htmlFor="fullName">Full Name</Label><Input id="fullName" type="text" value={tempProfile?.name ?? ""} onChange={(e) => updateTempProfile("name", e.target.value)} /></div>
              <div className="col-span-1"><Label htmlFor="website">Personal Website</Label><Input id="website" type="text" value={tempProfile?.website ?? ""} onChange={(e) => updateTempProfile("website", e.target.value)} /></div>
              <div className="col-span-2"><Label htmlFor="bio">Short Bio</Label><textarea id="bio" rows={3} className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-[14px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all resize-none roboto-font shadow-sm" value={tempProfile?.bio ?? ""} onChange={(e) => updateTempProfile("bio", e.target.value)} /></div>
            </div>
            {hasProfileChanges && (<div className="flex gap-4 pt-4 border-t border-slate-200 dark:border-slate-700"><button onClick={handleCancelProfile} className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"><X size={16} />Cancel</button><button onClick={handleSaveProfile} disabled={isSavingProfile} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium transition-all shadow-lg disabled:opacity-50">{isSavingProfile ? (<><Loader2 className="animate-spin" size={16} />Saving...</>) : (<><Save size={16} />Save Changes</>)}</button></div>)}
            {showProfileSuccess && (<div className="flex items-center gap-2 text-emerald-600 text-sm font-medium"><Check size={16} />Profile updated successfully</div>)}
          </CardContent>
        </Card>
      )}
      {activeSection === "Business Details" && (
        <Card>
          <CardHeader><div className="flex items-center gap-3"><Building className="text-blue-600" size={20} /><CardTitle>Business Details</CardTitle></div></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div><Label htmlFor="businessName">Business Name</Label><Input id="businessName" type="text" value={tempBusiness?.name ?? ""} onChange={(e) => updateTempBusiness("name", e.target.value)} /></div>
              <div><Label htmlFor="businessEmail">Email Address</Label><Input id="businessEmail" type="email" value={tempBusiness?.email ?? ""} onChange={(e) => updateTempBusiness("email", e.target.value)} /></div>
              <div><Label htmlFor="businessPhone">Phone Number</Label><Input id="businessPhone" type="text" value={tempBusiness?.phone ?? ""} onChange={(e) => updateTempBusiness("phone", e.target.value)} /></div>
              <div className="col-span-2"><Label htmlFor="businessAddress">Physical Address</Label><textarea id="businessAddress" rows={2} className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-[14px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all resize-none roboto-font shadow-sm" value={tempBusiness?.address ?? ""} onChange={(e) => updateTempBusiness("address", e.target.value)} /></div>
            </div>
            {hasBusinessChanges && (<div className="flex gap-4 pt-4 border-t border-slate-200 dark:border-slate-700"><button onClick={handleCancelBusiness} className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl font-medium transition-all"><X size={16} />Cancel</button><button onClick={handleSaveBusiness} disabled={isSavingBusiness} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium transition-all shadow-lg disabled:opacity-50">{isSavingBusiness ? (<><Loader2 className="animate-spin" size={16} />Saving...</>) : (<><Save size={16} />Save Changes</>)}</button></div>)}
            {showBusinessSuccess && (<div className="flex items-center gap-2 text-emerald-600 text-sm font-medium"><Check size={16} />Business details updated</div>)}
          </CardContent>
        </Card>
      )}
      {activeSection === "Payment Instructions" && (
        <Card>
          <CardHeader><div className="flex items-center gap-3"><CreditCard className="text-blue-600" size={20} /><CardTitle>Payment Instructions</CardTitle></div></CardHeader>
          <CardContent>
            {isSaving && (<div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl"><p className="text-blue-700 text-sm font-medium text-center">Saving...</p></div>)}
            {showSaveSuccess && (<div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl"><p className="text-green-700 text-sm font-medium text-center">Saved</p></div>)}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => updatePaymentMethod('mobile_wallet')} className={`p-4 rounded-xl border-2 transition-all font-bold text-sm ${tempPaymentDetails.method === 'mobile_wallet' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 shadow-lg' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}><Smartphone size={20} className="mx-auto mb-2" />Mobile Wallet</button>
                  <button type="button" onClick={() => updatePaymentMethod('bank')} className={`p-4 rounded-xl border-2 transition-all font-bold text-sm ${tempPaymentDetails.method === 'bank' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 shadow-lg' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}><Building size={20} className="mx-auto mb-2" />Bank Transfer</button>
                </div>
              </div>
              {tempPaymentDetails.method === 'mobile_wallet' && (<div className="space-y-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800"><div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"><div><Label htmlFor="walletType">Wallet Type</Label><select id="walletType" className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[14px] font-medium text-slate-900 dark:text-white outline-none transition-all shadow-sm" value={tempPaymentDetails.mobileWallet?.type || 'bkash'} onChange={(e) => updateTempMobileWallet('type', e.target.value)}><option value="bkash">bKash</option><option value="nagad">Nagad</option></select></div><div><Label htmlFor="walletNumber">Wallet Number</Label><Input id="walletNumber" type="tel" placeholder="Numbers only" value={tempPaymentDetails.mobileWallet?.number || ''} onChange={(e) => updateTempMobileWallet('number', e.target.value)} /></div><div><Label htmlFor="accountType">Account Type</Label><select id="accountType" className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[14px] font-medium text-slate-900 dark:text-white outline-none transition-all shadow-sm" value={tempPaymentDetails.mobileWallet?.accountType || 'personal'} onChange={(e) => updateTempMobileWallet('accountType', e.target.value)}><option value="personal">Personal</option><option value="agent">Agent</option></select></div></div></div>)}
              {tempPaymentDetails.method === 'bank' && (<div className="space-y-4 p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800"><div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"><div><Label htmlFor="bankName">Bank Name *</Label><Input id="bankName" type="text" placeholder="Bank name" value={tempPaymentDetails.bank?.bankName || ''} onChange={(e) => updateTempBankDetails('bankName', e.target.value)} /></div><div><Label htmlFor="bankBranch">Bank Branch</Label><Input id="bankBranch" type="text" placeholder="Branch" value={tempPaymentDetails.bank?.bankBranch || ''} onChange={(e) => updateTempBankDetails('bankBranch', e.target.value)} /></div><div><Label htmlFor="accountHolderName">Account Holder *</Label><Input id="accountHolderName" type="text" placeholder="Holder name" value={tempPaymentDetails.bank?.accountHolderName || ''} onChange={(e) => updateTempBankDetails('accountHolderName', e.target.value)} /></div><div><Label htmlFor="accountNumber">Account Number *</Label><Input id="accountNumber" type="text" placeholder="Account number" value={tempPaymentDetails.bank?.accountNumber || ''} onChange={(e) => updateTempBankDetails('accountNumber', e.target.value)} /></div><div><Label htmlFor="routingNumber">Routing Number</Label><Input id="routingNumber" type="text" placeholder="Optional" value={tempPaymentDetails.bank?.routingNumber || ''} onChange={(e) => updateTempBankDetails('routingNumber', e.target.value)} /></div><div><Label htmlFor="swiftCode">SWIFT Code</Label><Input id="swiftCode" type="text" placeholder="Optional" value={tempPaymentDetails.bank?.swiftCode || ''} onChange={(e) => updateTempBankDetails('swiftCode', e.target.value)} /></div></div></div>)}
              {hasUnsavedChanges && (<div className="flex gap-4 pt-4 border-t border-slate-200 dark:border-slate-700"><button onClick={handleCancelPaymentDetails} className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 rounded-xl font-medium transition-all"><X size={16} />Cancel</button><button onClick={handleSavePaymentDetails} disabled={isSaving} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium transition-all shadow-lg disabled:opacity-50">{isSaving ? (<><Loader2 className="animate-spin" size={16} />Saving...</>) : (<><Save size={16} />Save Changes</>)}</button></div>)}
            </div>
          </CardContent>
        </Card>
      )}
      {activeSection === "App Branding" && (
        <Card>
          <CardHeader><div className="flex items-center gap-3"><Palette className="text-blue-600" size={20} /><CardTitle>App Branding</CardTitle></div></CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tempBranding.showWatermark ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}><ImageIcon size={24} /></div>
                  <div><p className="font-bold text-slate-900 dark:text-white roboto-font">Invoice Watermark</p><p className="text-xs text-slate-500">Show "Powered by FreeFlow" on invoices</p></div>
                </div>
                <button onClick={() => toggleWatermark(!tempBranding.showWatermark)} className={`w-12 h-6 rounded-full transition-all relative ${tempBranding.showWatermark ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${tempBranding.showWatermark ? 'left-7' : 'left-1'}`} /></button>
              </div>
              {tempBranding.showWatermark && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center"><Label>Watermark Opacity</Label><span className="text-xs font-bold text-blue-600">{Math.round(tempBranding.watermarkOpacity * 100)}%</span></div>
                  <input type="range" min="0.1" max="1" step="0.1" value={tempBranding.watermarkOpacity} onChange={(e) => updateWatermarkOpacity(parseFloat(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                </div>
              )}
              {hasBrandingChanges && (<div className="flex gap-4 pt-4 border-t border-slate-200 dark:border-slate-700"><button onClick={handleCancelBranding} className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 rounded-xl font-medium transition-all"><X size={16} />Cancel</button><button onClick={handleSaveBranding} disabled={isSavingBranding} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium transition-all shadow-lg disabled:opacity-50">{isSavingBranding ? (<><Loader2 className="animate-spin" size={16} />Saving...</>) : (<><Save size={16} />Save Changes</>)}</button></div>)}
              {showBrandingSuccess && (<div className="flex items-center gap-2 text-emerald-600 text-sm font-medium"><Check size={16} />Branding updated</div>)}
            </div>
          </CardContent>
        </Card>
      )}
      {activeSection === "Regional & Currency" && (
        <Card>
          <CardHeader><div className="flex items-center justify-between"><div className="flex items-center gap-3"><Globe className="text-blue-600" size={20} /><CardTitle>Regional &amp; Currency</CardTitle></div><button onClick={detectRegion} className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all border border-blue-100 dark:border-blue-800"><Sparkles size={14} />Auto-Detect</button></div></CardHeader>
          <CardContent>
            <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex justify-between items-center text-sm font-medium"><div className="flex items-center gap-2 text-slate-500"><Globe size={16} /><span>Timezone:</span></div><div className="text-slate-900 dark:text-white font-bold roboto-font">{Intl.DateTimeFormat().resolvedOptions().timeZone.replace('_', ' ')}</div></div>
            <div className="relative mb-8"><Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><Input type="text" placeholder="Search currencies…" className="pl-14" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredCurrencies.map((curr) => (<button key={curr.code} onClick={() => handleCurrencyChange(curr)} className={`flex items-center gap-4 w-full p-4 rounded-2xl border transition-all duration-300 group/curr ${tempCurrency?.code === curr.code ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg scale-[1.02]" : "border-slate-100 dark:border-slate-800 hover:border-slate-200 hover:bg-slate-50/50"}`}><div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold transition-colors ${tempCurrency?.code === curr.code ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{curr.symbol}</div><div className="text-left flex-1"><p className="text-[15px] font-bold text-slate-900 dark:text-white roboto-font">{curr.code} – {curr.name}</p><p className="text-[12px] text-slate-500 roboto-font font-medium">{curr.country}</p></div>{tempCurrency?.code === curr.code && (<div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center"><Check className="text-white" size={14} strokeWidth={3} /></div>)}</button>))}
            </div>
            {hasCurrencyChanges && (<div className="flex gap-4 pt-4 border-t border-slate-200 dark:border-slate-700"><button onClick={handleCancelCurrency} className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 rounded-xl font-medium transition-all"><X size={16} />Cancel</button><button onClick={handleSaveCurrency} disabled={isSavingCurrency} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium transition-all shadow-lg disabled:opacity-50">{isSavingCurrency ? (<><Loader2 className="animate-spin" size={16} />Saving...</>) : (<><Save size={16} />Save Changes</>)}</button></div>)}
            {showCurrencySuccess && (<div className="flex items-center gap-2 text-emerald-600 text-sm font-medium"><Check size={16} />Currency updated</div>)}
          </CardContent>
        </Card>
      )}
      {activeSection === "Data Export" && (
        <Card>
          <CardHeader><div className="flex items-center gap-3"><Download className="text-blue-600" size={20} /><CardTitle>Export Your Data</CardTitle></div></CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 mb-6">Download your data as CSV files.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button onClick={() => exportClientsToCSV(state.clients)} className="flex items-center gap-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-all"><div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><Users size={24} className="text-blue-600" /></div><div className="text-left"><p className="font-bold text-slate-900 dark:text-white">Clients</p><p className="text-xs text-slate-500">{state.clients.length} records</p></div></button>
              <button onClick={() => exportProjectsToCSV(state.projects, state.clients)} className="flex items-center gap-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-all"><div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center"><Briefcase size={24} className="text-purple-600" /></div><div className="text-left"><p className="font-bold text-slate-900 dark:text-white">Projects</p><p className="text-xs text-slate-500">{state.projects.length} records</p></div></button>
              <button onClick={() => exportInvoicesToCSV(state.salesDocuments, state.clients)} className="flex items-center gap-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-all"><div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center"><Receipt size={24} className="text-emerald-600" /></div><div className="text-left"><p className="font-bold text-slate-900 dark:text-white">Invoices</p><p className="text-xs text-slate-500">{state.salesDocuments.length} records</p></div></button>
              <button onClick={() => exportAllData(state)} className="flex items-center gap-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-all"><div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center"><Sparkles size={24} className="text-orange-600" /></div><div className="text-left"><p className="font-bold text-slate-900 dark:text-white">Export All</p><p className="text-xs text-slate-500">All data at once</p></div></button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  if (isPro) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100/80 dark:bg-slate-950/90 p-4">
        <div className="w-full max-w-4xl h-[min(850px,90vh)] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-slate-300/30 dark:shadow-black/40 border border-slate-200/60 dark:border-slate-800 overflow-hidden flex flex-col lg:flex-row">
          {/* Sidebar Area */}
          <div className="w-full lg:w-60 shrink-0 bg-slate-50 dark:bg-slate-950 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="p-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Settings</h2>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full">
                <Star size={8} className="text-white" fill="white" />
                <span className="text-[9px] font-bold text-white uppercase tracking-wider">PRO</span>
              </div>
            </div>
            {/* Scrollable Nav List */}
            <nav className="flex-1 overflow-y-auto px-3 pb-5 no-scrollbar">
              <ul className="flex flex-row lg:flex-col gap-1">
                {navItems.map((item) => (
                  <li key={item.id} className="shrink-0 lg:w-full">
                    <button
                      className={`flex items-center gap-3 whitespace-nowrap w-full text-left px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${activeSection === item.id
                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700"
                        : "text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      onClick={() => setActiveSection(item.id)}
                    >
                      <item.icon size={16} strokeWidth={activeSection === item.id ? 2.5 : 2} />
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          {/* Content Area */}
          <div className="flex-1 p-6 lg:p-10 overflow-y-auto bg-white dark:bg-slate-900 custom-scrollbar">
            <div className="max-w-2xl mx-auto">
              {contentBlock}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto px-4 md:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white roboto-font">Settings</h1><p className="text-slate-500 dark:text-[12px] font-medium font-open-sans">Configure your workspace preferences and profiles.</p></div>
      </div>
      <div className="flex flex-col lg:flex-row gap-8">
        <nav className="w-full lg:w-64">
          <ul className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-1.5 pb-4 lg:pb-0 no-scrollbar">
            {navItems.map((item) => (<li key={item.id} className="shrink-0 lg:w-full"><button className={`flex items-center gap-3 whitespace-nowrap w-full text-left px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all roboto-font ${activeSection === item.id ? "bg-black dark:bg-blue-600 text-white shadow-lg shadow-black/10 translate-x-1" : "text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 hover:translate-x-1"}`} onClick={() => setActiveSection(item.id)}><item.icon size={16} strokeWidth={activeSection === item.id ? 2.5 : 2} />{item.label}</button></li>))}
          </ul>
        </nav>
        {contentBlock}
      </div>
    </div>
  );
};

export default Settings;