
-- FINAL ALIGNED SCHEMA FOR FREEFLOW FREELANCER OS
-- Matches your Supabase Visualizer exactly.

-- 1. Profiles (Linked to Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{
    "currency": {"code": "USD", "symbol": "$", "name": "US Dollar"},
    "branding": {"watermarkOpacity": 0.15, "showWatermark": true},
    "business": {"name": "New Freelancer", "address": "Add your address", "email": "hello@yourbrand.com", "phone": "+1 555-0123"},
    "paymentDetails": {"bankName": "", "accountNumber": "", "routingNumber": "", "swiftCode": "", "payPal": ""}
  }'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Clients (Using TEXT ID for maximum flexibility)
CREATE TABLE IF NOT EXISTS public.clients (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  notes TEXT,
  status TEXT DEFAULT 'new',
  country TEXT,
  country_code TEXT,
  social_media JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Projects 
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id TEXT REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  category TEXT,
  total_budget NUMERIC DEFAULT 0,
  deadline DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Sales Documents (Invoices & Quotations)
CREATE TABLE IF NOT EXISTS public.sales_documents (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id TEXT REFERENCES public.clients(id) ON DELETE SET NULL,
  project_id TEXT REFERENCES public.projects(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  doc_number TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  tax NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  shipping NUMERIC DEFAULT 0,
  amount_paid NUMERIC DEFAULT 0,
  balance_due NUMERIC DEFAULT 0,
  subtotal NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  terms TEXT,
  ship_to TEXT,
  payment_terms TEXT,
  po_number TEXT,
  logo TEXT,
  company_info TEXT,
  bill_to TEXT
);

-- 5. Additional Tables from Visualizer (For Future Use)
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id TEXT REFERENCES public.sales_documents(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC DEFAULT 1,
  rate NUMERIC NOT NULL,
  amount NUMERIC NOT NULL,
  time_entry_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id TEXT REFERENCES public.sales_documents(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  payment_date DATE NOT NULL,
  method TEXT,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. SECURITY: Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 7. POLICIES
-- Profiles
CREATE POLICY "Users browse own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR ALL USING (auth.uid() = id);

-- Private Data (Owned by user)
CREATE POLICY "Users manage own clients" ON public.clients FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own projects" ON public.projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own docs" ON public.sales_documents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own items" ON public.invoice_items FOR ALL 
  USING (EXISTS (SELECT 1 FROM sales_documents d WHERE d.id = invoice_id AND d.user_id = auth.uid()));

-- Public Data (Allow clients to view their portal)
CREATE POLICY "Public view sales documents" ON public.sales_documents FOR SELECT USING (true);
CREATE POLICY "Public view invoice items" ON public.invoice_items FOR SELECT USING (true);
