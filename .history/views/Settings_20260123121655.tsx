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
    className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${className}`}
  >
    {children}
  </div>
);

const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <div className={`px-6 py-5 border-b border-slate-100 ${className}`}>
    {children}
  </div>
);

const CardTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-lg font-semibold text-slate-900">{children}</h3>
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
    className="block text-sm font-medium text-slate-700 mb-1.5"
  >
    {children}
  </label>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (
  props
) => (
  <input
    {...props}
    className={`w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${props.className}`}
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-roboto-bold text-slate-900 tracking-tight">
            Settings
          </h1>
          <p className="text-slate-500 mt-2 font-medium font-open-sans">
            Manage your personal profile, business details, and preferences.
          </p>
        </div>
      </div>

      {/* Layout: sidebar + content */}
      <div className="flex gap-8">
        {/* ----- Sidebar navigation (placeholder) ----- */}
        <nav className="w-64 hidden lg:block">
          <ul className="space-y-2">
            {[
              "Personal Profile",
              "Business Details",
              "Payment Instructions",
              "Regional & Currency",
              "Brand Watermark",
            ].map((item) => (
              <li key={item}>
                <button className={`w-full text-left px-4 py-2 rounded-lg text-sm ${activeSection === item ? "bg-slate-100 text-slate-900" : "text-slate-700 hover:bg-slate-50"}`} onClick={() => setActiveSection(item)}>
                  {item}
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
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 shadow-sm relative bg-slate-50">
                      {state.settings.profile?.avatarUrl ? (
                        <img
                          src={state.settings.profile.avatarUrl}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-roboto-bold">
                          {state.settings.profile?.name?.[0] ?? "U"}
                        </div>
                      )}

                      {uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                          <Loader2 className="animate-spin text-white" size={24} />
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
                      title="Change avatar"
                    >
                      <Camera size={16} />
                    </button>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">Profile Picture</h3>
                    <p className="text-xs text-slate-500 mb-3 max-w-[250px]">
                      Upload a professional photo to build trust with clients so they know who they're working with.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50"
                      >
                        {uploading ? 'Uploading...' : 'Upload New Photo'}
                      </button>
                      {state.settings.profile?.avatarUrl && (
                        <button
                          onClick={() => updateProfile('avatarUrl', '')}
                          disabled={uploading}
                          className="text-xs font-semibold text-rose-500 hover:text-rose-600 hover:underline disabled:opacity-50 ml-2"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Full Name */}
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative mb-4">

                  <Input
                    id="fullName"
                    type="text"

                    value={state.settings.profile?.name ?? ""}
                    onChange={(e) => updateProfile("name", e.target.value)}
                  />
                </div>

                {/* Professional Title */}
                <Label htmlFor="title">Professional Title</Label>
                <div className="relative mb-4">

                  <Input
                    id="title"
                    type="text"

                    value={state.settings.profile?.title ?? ""}
                    onChange={(e) => updateProfile("title", e.target.value)}
                  />
                </div>

                {/* Personal Website */}
                <Label htmlFor="website">Personal Website</Label>
                <div className="relative mb-4">

                  <Input
                    id="website"
                    type="text"

                    value={state.settings.profile?.website ?? ""}
                    onChange={(e) => updateProfile("website", e.target.value)}
                  />
                </div>

                {/* Avatar URL (Hidden or optional manual override) */}
                {/* <Label htmlFor="avatarUrl">Avatar URL</Label>
                <div className="relative mb-4">
                  <Input
                    id="avatarUrl"
                    type="text"
                    value={state.settings.profile?.avatarUrl ?? ""}
                    onChange={(e) => updateProfile("avatarUrl", e.target.value)}
                    placeholder="https://..."
                  />
                </div> */}

                {/* Short Bio */}
                <Label htmlFor="bio">Short Bio</Label>
                <div className="relative">

                  <textarea
                    id="bio"
                    rows={4}
                    className="w-full pl-11 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"

                    value={state.settings.profile?.bio ?? ""}
                    onChange={(e) => updateProfile("bio", e.target.value)}
                  />
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
                {/* Business Name */}
                <Label htmlFor="businessName">Business Name</Label>
                <div className="relative mb-4">
                  <Building
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                    size={18}
                  />
                  <Input
                    id="businessName"
                    type="text"
                    value={state.settings.business?.name ?? ""}
                    onChange={(e) => updateBusinessInfo("name", e.target.value)}
                  />
                </div>

                {/* Email Address */}
                <Label htmlFor="businessEmail">Email Adsdress</Label>
                <div className="relative mb-4">
                  
                  <Input
                    id="businessEmail"
                    type="email"
                    value={state.settings.business?.email ?? ""}
                    onChange={(e) => updateBusinessInfo("email", e.target.value)}
                  />
                </div>

                {/* Phone Number */}
                <Label htmlFor="businessPhone">Phone Number</Label>
                <div className="relative mb-4">
                  
                  <Input
                    id="businessPhone"
                    type="text"
                    value={state.settings.business?.phone ?? ""}
                    onChange={(e) => updateBusinessInfo("phone", e.target.value)}
                  />
                </div>

                {/* Physical Address */}
                <Label htmlFor="businessAddress">Physical Address</Label>
                <textarea
                  id="businessAddress"
                  rows={3}
                  className="w-full pl-11 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                  value={state.settings.business?.address ?? ""}
                  onChange={(e) => updateBusinessInfo("address", e.target.value)}
                />
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
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                <div className="flex items-center gap-4 mb-4">
                  <Input
                    type="text"
                    placeholder="Search currencies…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Search className="text-slate-400" size={20} />
                </div>

                {/* Currency list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredCurrencies.map((curr) => (
                    <button
                      key={curr.code}
                      onClick={() => handleCurrencyChange(curr)}
                      className={`flex items-center gap-3 w-full p-3 rounded-lg border ${state.settings.currency?.code === curr.code
                        ? "border-blue-600 bg-blue-50"
                        : "border-slate-200 hover:border-slate-300"
                        }`}
                    >
                      <span className="text-xl font-roboto-bold">{curr.symbol}</span>
                      <div className="text-left">
                        <p className="text-sm font-medium text-slate-900">
                          {curr.code} – {curr.name}
                        </p>
                        <p className="text-xs text-slate-500">{curr.country}</p>
                      </div>
                      {state.settings.currency?.code === curr.code && (
                        <Check className="ml-auto text-blue-600" size={16} />
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "Brand Watermark" && (
            /* Brand Watermark */
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Palette className="text-blue-600" size={20} />
                  <CardTitle>Brand Watermark</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Show watermark switch */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showWatermark"
                    checked={state.settings.branding?.showWatermark ?? false}
                    onChange={(e) => toggleWatermark(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <label
                    htmlFor="showWatermark"
                    className="text-sm font-medium text-slate-700"
                  >
                    Show Watermark on invoices
                  </label>
                </div>

                {/* Opacity slider */}
                <Label htmlFor="watermarkOpacity">Opacity Level</Label>
                <input
                  id="watermarkOpacity"
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(
                    (state.settings.branding?.watermarkOpacity ?? 0) * 100
                  )}
                  onChange={(e) =>
                    updateWatermarkOpacity(Number(e.target.value) / 100)
                  }
                  className="w-full"
                />
                <p className="text-sm text-slate-500">
                  Current opacity:{" "}
                  {Math.round(
                    (state.settings.branding?.watermarkOpacity ?? 0) * 100
                  )}
                  %
                </p>

                {/* Preview box */}
                <div
                  className="border border-slate-200 rounded-lg p-4 flex items-center justify-center h-32 bg-white"
                  style={{
                    opacity: state.settings.branding?.watermarkOpacity ?? 0,
                  }}
                >
                  <span className="text-slate-400 text-sm">Watermark preview</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sign Out */}
          <Card className="mt-8">
            <CardContent className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <LogOut className="text-rose-600" size={24} />
                <div>
                  <h3 className="text-lg font-roboto-bold text-rose-950">
                    Sign Out
                  </h3>
                  <p className="text-rose-600/80 text-xs font-medium mt-1">
                    End your current session securely on this device.
                  </p>
                </div>
              </div>
              <button
                onClick={() => supabase?.auth.signOut()}
                className="px-8 py-4 bg-white border border-rose-200 text-rose-600 rounded-2xl font-roboto-bold text-xs hover:bg-rose-600 hover:text-white hover:border-transparent transition-all shadow-sm hover:shadow-lg hover:shadow-rose-600/20 active:scale-95 whitespace-nowrap"
              >
                Sign Out Now
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;