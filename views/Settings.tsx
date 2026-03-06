import React, { useState } from "react";
import { AppState } from "../types";
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
  Upload
} from "lucide-react";
import { supabase } from "../lib/supabase";

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
    className={`w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-[14px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-black outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed roboto-font ${props.className}`}
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
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  /* ----- helpers ----- */
  const filteredCurrencies = ISO_CURRENCIES.filter(
    (curr) =>
      curr.name.toLowerCase().includes(search.toLowerCase()) ||
      curr.code.toLowerCase().includes(search.toLowerCase()) ||
      curr.country.toLowerCase().includes(search.toLowerCase())
  );

  const handleCurrencyChange = (curr: typeof ISO_CURRENCIES[0]) => {
    setState((prev: AppState) => ({
      ...prev,
      settings: { ...prev.settings, currency: curr },
    }));
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

  const toggleWatermark = (show: boolean) => {
    setState((prev: AppState) => ({
      ...prev,
      settings: {
        ...prev.settings,
        branding: { ...prev.settings.branding, showWatermark: show },
      },
    }));
  };

  const updateWatermarkOpacity = (val: number) => {
    setState((prev: AppState) => ({
      ...prev,
      settings: {
        ...prev.settings,
        branding: { ...prev.settings.branding, watermarkOpacity: val },
      },
    }));
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

  return (
    <div className="max-w-full mx-auto px-4 md:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white roboto-font">Settings</h1>
          <p className="text-slate-500 dark:text-[12px] font-medium font-open-sans">Configure your workspace preferences and profiles.</p>
        </div>
      </div>

      {/* Layout: sidebar + content */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* ----- Sidebar navigation (placeholder) ----- */}
        <nav className="w-full lg:w-64">
          <ul className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-1.5 pb-4 lg:pb-0 no-scrollbar">
            {[
              { id: "Personal Profile", label: "Profile", icon: User },
              { id: "Business Details", label: "Business", icon: Building },
              { id: "Payment Instructions", label: "Payments", icon: CreditCard },
              { id: "Regional & Currency", label: "Regional", icon: Globe },
            ].map((item) => (
              <li key={item.id} className="shrink-0 lg:w-full">
                <button
                  className={`flex items-center gap-3 whitespace-nowrap w-full text-left px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all roboto-font ${activeSection === item.id
                    ? "bg-black dark:bg-blue-600 text-white shadow-lg shadow-black/10 translate-x-1"
                    : "text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white hover:translate-x-1"
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

        {/* ----- Main content ----- */}
        <div className="flex-1 space-y-8">
          {activeSection === "Personal Profile" && (
            /* Personal Profile */
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <User className="text-blue-600" size={20} />
                  <CardTitle>Personal Profile</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {/* Avatar upload section */}
                <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 p-5 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                  <div className="relative group">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white dark:border-slate-900 shadow-lg relative bg-white dark:bg-slate-800">
                      {state.settings.profile?.avatarUrl ? (
                        <img
                          src={state.settings.profile.avatarUrl}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold roboto-font">
                          {state.settings.profile?.name?.[0] ?? "U"}
                        </div>
                      )}

                      {uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                          <Loader2 className="animate-spin text-white" size={20} />
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="absolute -bottom-1 -right-1 p-1.5 bg-blue-600 text-white rounded-lg shadow-xl hover:bg-blue-700 transition-all hover:scale-110 disabled:opacity-70 disabled:cursor-not-allowed"
                      title="Change avatar"
                    >
                      <Camera size={14} />
                    </button>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                  <div className="text-center sm:text-left flex-1">


                    <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
                      >
                        {uploading ? 'Wait...' : 'Edit Photo'}
                      </button>
                      {state.settings.profile?.avatarUrl && (
                        <button
                          onClick={() => updateProfile('avatarUrl', '')}
                          disabled={uploading}
                          className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-rose-500 rounded-lg text-xs font-bold hover:bg-rose-50 transition-all"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="col-span-1">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={state.settings.profile?.name ?? ""}
                      onChange={(e) => updateProfile("name", e.target.value)}
                    />
                  </div>

                  <div className="col-span-1">
                    <Label htmlFor="website">Personal Website</Label>
                    <Input
                      id="website"
                      type="text"
                      value={state.settings.profile?.website ?? ""}
                      onChange={(e) => updateProfile("website", e.target.value)}
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="bio">Short Bio</Label>
                    <textarea
                      id="bio"
                      rows={3}
                      className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-[14px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-black outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all resize-none roboto-font"
                      value={state.settings.profile?.bio ?? ""}
                      onChange={(e) => updateProfile("bio", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "Business Details" && (
            /* Business Details */
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Building className="text-blue-600" size={20} />
                  <CardTitle>Business Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="col-span-1">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      type="text"
                      value={state.settings.business?.name ?? ""}
                      onChange={(e) => updateBusinessInfo("name", e.target.value)}
                    />
                  </div>

                  <div className="col-span-1">
                    <Label htmlFor="businessEmail">Email Address</Label>
                    <Input
                      id="businessEmail"
                      type="email"
                      value={state.settings.business?.email ?? ""}
                      onChange={(e) => updateBusinessInfo("email", e.target.value)}
                    />
                  </div>

                  <div className="col-span-1">
                    <Label htmlFor="businessPhone">Phone Number</Label>
                    <Input
                      id="businessPhone"
                      type="text"
                      value={state.settings.business?.phone ?? ""}
                      onChange={(e) => updateBusinessInfo("phone", e.target.value)}
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="businessAddress">Physical Address</Label>
                    <textarea
                      id="businessAddress"
                      rows={2}
                      className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-[14px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-black outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all resize-none roboto-font"
                      value={state.settings.business?.address ?? ""}
                      onChange={(e) => updateBusinessInfo("address", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "Payment Instructions" && (
            /* Payment Instructions */
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CreditCard className="text-blue-600" size={20} />
                  <CardTitle>Payment Instructions</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {/* Bank Name */}
                <div>
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    type="text"
                    value={state.settings.paymentDetails?.bankName ?? ""}
                    onChange={(e) =>
                      updatePaymentDetails("bankName", e.target.value)
                    }
                  />
                </div>

                {/* Account / IBAN */}
                <div>
                  <Label htmlFor="accountNumber">Account / IBAN</Label>
                  <Input
                    id="accountNumber"
                    type="text"
                    value={state.settings.paymentDetails?.accountNumber ?? ""}
                    onChange={(e) =>
                      updatePaymentDetails("accountNumber", e.target.value)
                    }
                  />
                </div>

                {/* Routing / Sort */}
                <div>
                  <Label htmlFor="routingNumber">Routing / Sort</Label>
                  <Input
                    id="routingNumber"
                    type="text"
                    value={state.settings.paymentDetails?.routingNumber ?? ""}
                    onChange={(e) =>
                      updatePaymentDetails("routingNumber", e.target.value)
                    }
                  />
                </div>

                {/* SWIFT / BIC */}
                <div>
                  <Label htmlFor="swiftCode">SWIFT / BIC</Label>
                  <Input
                    id="swiftCode"
                    type="text"
                    value={state.settings.paymentDetails?.swiftCode ?? ""}
                    onChange={(e) =>
                      updatePaymentDetails("swiftCode", e.target.value)
                    }
                  />
                </div>

                {/* PayPal / Me link */}
                <div className="md:col-span-2">
                  <Label htmlFor="payPal">PayPal Email / Me Link</Label>
                  <Input
                    id="payPal"
                    type="text"
                    value={state.settings.paymentDetails?.payPal ?? ""}
                    onChange={(e) =>
                      updatePaymentDetails("payPal", e.target.value)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "Regional & Currency" && (
            /* Regional & Currency */
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Globe className="text-blue-600" size={20} />
                  <CardTitle>Regional &amp; Currency</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search input */}
                <div className="relative mb-8">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                  <Input
                    type="text"
                    placeholder="Search global currencies by name or code…"
                    className="pl-14"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                {/* Currency list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredCurrencies.map((curr) => (
                    <button
                      key={curr.code}
                      onClick={() => handleCurrencyChange(curr)}
                      className={`flex items-center gap-4 w-full p-4 rounded-2xl border transition-all duration-300 group/curr ${state.settings.currency?.code === curr.code
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/10 scale-[1.02]"
                        : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                        }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold transition-colors ${state.settings.currency?.code === curr.code ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover/curr:bg-white dark:group-hover/curr:bg-slate-700'}`}>
                        {curr.symbol}
                      </div>
                      <div className="text-left flex-1">
                        <p className="text-[15px] font-bold text-slate-900 dark:text-white roboto-font">
                          {curr.code} – {curr.name}
                        </p>
                        <p className="text-[12px] text-slate-500 dark:text-slate-400 roboto-font font-medium">{curr.country}</p>
                      </div>
                      {state.settings.currency?.code === curr.code && (
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                          <Check className="text-white" size={14} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}



        </div>
      </div>
    </div>
  );
};

export default Settings;