
import { AppState, Client, Project, SalesDocument } from './types';
import { supabase } from './lib/supabase';

const INITIAL_STATE: AppState = {
  clients: [],
  projects: [],
  salesDocuments: [],
  notifications: [],
  timeEntries: [],
  recurringInvoices: [],
  settings: {
    currency: { code: 'USD', symbol: '$', name: 'US Dollar' },
    branding: { watermarkOpacity: 0.5, showWatermark: true },
    business: { name: 'New Freelancer', address: 'Add your address', email: 'hello@yourbrand.com', phone: '+1 555-0123' },
    paymentDetails: { bankName: '', accountNumber: '', routingNumber: '', swiftCode: '', payPal: '' },
    profile: { name: '', title: 'Freelancer', bio: '', website: '', avatarUrl: '' }
  }
};

const mapClient = (c: any): Client => ({
  ...c,
  createdAt: c.created_at,
  countryCode: c.country_code,
  socialMedia: c.social_media || {}
});

const mapProject = (p: any): Project => ({
  ...p,
  clientId: p.client_id,
  totalBudget: Number(p.total_budget || 0),
  createdAt: p.created_at
});

const mapDoc = (d: any): SalesDocument => ({
  ...d,
  clientId: d.client_id,
  projectId: d.project_id,
  docNumber: d.doc_number,
  items: d.items || [],
  shipping: Number(d.shipping || 0),
  amountPaid: Number(d.amount_paid || 0),
  balanceDue: Number(d.balance_due || 0),
  subtotal: Number(d.subtotal || 0),
  total: Number(d.total || 0),
  tax: Number(d.tax || 0),
  discount: Number(d.discount || 0),
  dueDate: d.due_date,
  createdAt: d.created_at,
  paymentTerms: d.payment_terms,
  poNumber: d.po_number,
  shipTo: d.ship_to,
  companyInfo: d.company_info,
  billTo: d.bill_to
});

export const db = {
  getState: async (userId: string): Promise<AppState> => {
    if (!supabase) return INITIAL_STATE;

    try {
      const results = await Promise.all([
        supabase.from('profiles').select('settings').eq('id', userId).maybeSingle(),
        supabase.from('clients').select('*').eq('user_id', userId),
        supabase.from('projects').select('*').eq('user_id', userId),
        supabase.from('sales_documents').select('*').eq('user_id', userId)
      ]);

      const [pRes, cRes, prRes, dRes] = results;

      if (!pRes.data) {
        await supabase.from('profiles').insert({ id: userId, settings: INITIAL_STATE.settings });
      }

      const remoteSettings = pRes.data?.settings || {};

      return {
        clients: (cRes.data || []).map(mapClient),
        projects: (prRes.data || []).map(mapProject),
        salesDocuments: (dRes.data || []).map(mapDoc),
        notifications: [],
        timeEntries: [],
        recurringInvoices: [],
        settings: {
          ...INITIAL_STATE.settings,
          ...remoteSettings,
          business: {
            ...INITIAL_STATE.settings.business,
            ...(remoteSettings.business || {})
          },
          branding: {
            ...INITIAL_STATE.settings.branding,
            ...(remoteSettings.branding || {})
          },
          paymentDetails: {
            ...INITIAL_STATE.settings.paymentDetails,
            ...(remoteSettings.paymentDetails || {})
          },
          profile: {
            ...INITIAL_STATE.settings.profile,
            ...(remoteSettings.profile || {})
          }
        }
      };
    } catch (err) {
      console.error('Error fetching state:', err);
      return INITIAL_STATE;
    }
  },

  saveState: async (state: AppState, userId: string): Promise<void> => {
    if (!supabase || !userId) return;

    try {
      const clientIds = state.clients.map(c => c.id);
      const projectIds = state.projects.map(p => p.id);
      const docIds = state.salesDocuments.map(d => d.id);

      // 1. Sync Settings
      await db.saveSettings(state.settings, userId);

      // 2. Sync Clients
      if (state.clients.length > 0) {
        const payload = state.clients.map(c => ({
          id: c.id,
          user_id: userId,
          name: c.name,
          email: c.email,
          phone: c.phone,
          company: c.company,
          notes: c.notes,
          status: c.status || 'new',
          country: c.country,
          country_code: c.countryCode,
          social_media: c.socialMedia || {},
          created_at: c.createdAt
        }));
        const { error } = await supabase.from('clients').upsert(payload);
        if (error) console.error('[Sync Error] Clients:', error.message);
      }

      const { error: cDelErr } = clientIds.length > 0
        ? await supabase.from('clients').delete().eq('user_id', userId).not('id', 'in', `(${clientIds.join(',')})`)
        : await supabase.from('clients').delete().eq('user_id', userId);
      if (cDelErr) console.error('[Sync Error] Clients Deletion:', cDelErr.message);

      // 3. Sync Projects
      if (state.projects.length > 0) {
        const payload = state.projects.map(p => ({
          id: p.id,
          user_id: userId,
          client_id: p.clientId || null,
          title: p.title,
          description: p.description,
          status: p.status || 'active',
          category: p.category,
          total_budget: p.totalBudget,
          deadline: p.deadline,
          created_at: p.createdAt
        }));
        const { error } = await supabase.from('projects').upsert(payload);
        if (error) console.error('[Sync Error] Projects:', error.message);
      }

      const { error: pDelErr } = projectIds.length > 0
        ? await supabase.from('projects').delete().eq('user_id', userId).not('id', 'in', `(${projectIds.join(',')})`)
        : await supabase.from('projects').delete().eq('user_id', userId);
      if (pDelErr) console.error('[Sync Error] Projects Deletion:', pDelErr.message);

      // 4. Sync Documents
      if (state.salesDocuments.length > 0) {
        const payload = state.salesDocuments.map(d => ({
          id: d.id,
          user_id: userId,
          client_id: d.clientId || null,
          project_id: d.projectId || null,
          type: d.type,
          doc_number: d.docNumber,
          status: d.status || 'draft',
          items: d.items,
          tax: d.tax,
          discount: d.discount,
          shipping: d.shipping,
          amount_paid: d.amountPaid,
          balance_due: d.balanceDue,
          subtotal: d.subtotal,
          total: d.total,
          due_date: d.dueDate,
          created_at: d.createdAt,
          notes: d.notes,
          terms: d.terms,
          ship_to: d.shipTo,
          payment_terms: d.paymentTerms,
          po_number: d.poNumber,
          logo: d.logo,
          company_info: d.companyInfo,
          bill_to: d.billTo
        }));
        const { error } = await supabase.from('sales_documents').upsert(payload);
        if (error) console.error('[Sync Error] Documents:', error.message);
      }

      const { error: dDelErr } = docIds.length > 0
        ? await supabase.from('sales_documents').delete().eq('user_id', userId).not('id', 'in', `(${docIds.join(',')})`)
        : await supabase.from('sales_documents').delete().eq('user_id', userId);
      if (dDelErr) console.error('[Sync Error] Documents Deletion:', dDelErr.message);

    } catch (err: any) {
      console.error('Critical database synchronization failure:', err.message || err);
    }
  },

  saveSettings: async (settings: any, userId: string): Promise<void> => {
    if (!supabase) return;
    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      settings,
      updated_at: new Date().toISOString()
    });
    if (error) console.error('[Sync Error] Settings:', error.message);
  },

  reset: async (): Promise<void> => {
    if (supabase) await supabase.auth.signOut();
    window.location.reload();
  }
};
