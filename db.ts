
import { AppState, Client, Project, SalesDocument } from './types';
import { supabase } from './lib/supabase';

const INITIAL_STATE: AppState = {
  clients: [],
  projects: [],
  salesDocuments: [],
  settings: {
    currency: { code: 'USD', symbol: '$', name: 'US Dollar' },
    branding: { watermarkOpacity: 0.15, showWatermark: true },
    business: { name: 'New Freelancer', address: 'Add your address', email: 'hello@yourbrand.com', phone: '+1 555-0123' }
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
      const [pRes, cRes, prRes, dRes] = await Promise.all([
        supabase.from('profiles').select('settings').eq('id', userId).maybeSingle(),
        supabase.from('clients').select('*').eq('user_id', userId),
        supabase.from('projects').select('*').eq('user_id', userId),
        supabase.from('sales_documents').select('*').eq('user_id', userId)
      ]);

      if (!pRes.data) {
        await supabase.from('profiles').insert({ id: userId, settings: INITIAL_STATE.settings });
      }

      return {
        clients: (cRes.data || []).map(mapClient),
        projects: (prRes.data || []).map(mapProject),
        salesDocuments: (dRes.data || []).map(mapDoc),
        settings: pRes.data?.settings || INITIAL_STATE.settings
      };
    } catch (err) {
      console.error('Error fetching state:', err);
      return INITIAL_STATE;
    }
  },

  saveState: async (state: AppState, userId: string) => {
    if (!supabase || !userId) return;
    
    try {
      const currentIds = {
        clients: state.clients.map(c => c.id),
        projects: state.projects.map(p => p.id),
        docs: state.salesDocuments.map(d => d.id)
      };

      const promises: Promise<any>[] = [];

      // 1. Settings (Profile)
      promises.push(db.saveSettings(state.settings, userId));

      // 2. Clients Sync (Upsert existing + prune deleted)
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
        promises.push(supabase.from('clients').upsert(payload));
      }
      
      // Delete orphans
      if (currentIds.clients.length > 0) {
        promises.push(supabase.from('clients').delete().eq('user_id', userId).not('id', 'in', `(${currentIds.clients.join(',')})`));
      } else {
        promises.push(supabase.from('clients').delete().eq('user_id', userId));
      }

      // 3. Projects Sync
      if (state.projects.length > 0) {
        const payload = state.projects.map(p => ({
          id: p.id,
          user_id: userId,
          client_id: p.clientId,
          title: p.title,
          description: p.description,
          status: p.status || 'active',
          category: p.category,
          total_budget: p.totalBudget,
          deadline: p.deadline,
          created_at: p.createdAt
        }));
        promises.push(supabase.from('projects').upsert(payload));
      }
      
      if (currentIds.projects.length > 0) {
        promises.push(supabase.from('projects').delete().eq('user_id', userId).not('id', 'in', `(${currentIds.projects.join(',')})`));
      } else {
        promises.push(supabase.from('projects').delete().eq('user_id', userId));
      }

      // 4. Docs Sync
      if (state.salesDocuments.length > 0) {
        const payload = state.salesDocuments.map(d => ({
          id: d.id,
          user_id: userId,
          client_id: d.clientId,
          project_id: d.projectId,
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
        promises.push(supabase.from('sales_documents').upsert(payload));
      }
      
      if (currentIds.docs.length > 0) {
        promises.push(supabase.from('sales_documents').delete().eq('user_id', userId).not('id', 'in', `(${currentIds.docs.join(',')})`));
      } else {
        promises.push(supabase.from('sales_documents').delete().eq('user_id', userId));
      }

      return Promise.all(promises);
    } catch (err) {
      console.error('Critical Sync Error:', err);
    }
  },

  saveSettings: async (settings: any, userId: string) => {
    if (!supabase) return;
    return supabase.from('profiles').upsert({
      id: userId,
      settings,
      updated_at: new Date().toISOString()
    });
  },

  reset: async () => {
    if (supabase) await supabase.auth.signOut();
    window.location.reload();
  }
};
