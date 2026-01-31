import React from 'react';
import { AppState } from '../types';
import { formatDate, formatCurrency, getStatusColor } from '../utils';
import {
  ArrowLeft,
  Briefcase,
  Users,
  Receipt,
  AlertCircle,
  FileText,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const ProjectDetail: React.FC<{ state: AppState }> = ({ state }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const project = state.projects.find(p => p.id === id);
  if (!project) {
    return <div className="p-10 text-center text-slate-400">Project not found.</div>;
  }

  const client = state.clients.find(c => c.id === project.clientId);
  const invoices = state.salesDocuments.filter(d => d.projectId === id);
  const currencyCode = state.settings.currency.code;

  const earned = invoices
    .filter(d => d.type === 'INVOICE' && d.status === 'paid')
    .reduce((sum, d) => sum + d.total, 0);

  const pending = invoices
    .filter(d => d.type === 'INVOICE' && d.status !== 'paid' && d.status !== 'draft')
    .reduce((sum, d) => sum + d.total, 0);

  // Deadline logic
  const deadline = project.deadline ? new Date(project.deadline) : null;
  const now = new Date();
  const daysLeft = deadline
    ? Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const deadlineTone =
    daysLeft !== null && daysLeft <= 1
      ? 'bg-red-50 border-red-200 text-red-700'
      : daysLeft !== null && daysLeft <= 3
        ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
        : 'bg-emerald-50 border-emerald-200 text-emerald-700';

  return (
    <div className="space-y-6 pb-10">

      {/* HEADER */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/projects')}
            className="p-2 rounded-lg hover:bg-slate-100 transition"
          >
            <ArrowLeft />
          </button>

          <div className="flex-1">
            <h1 className="text-3xl font-extrabold text-slate-900">
              {project.title || 'Untitled Project'}
            </h1>
            <p className="text-slate-500 text-sm">
              Project workspace overview
            </p>
          </div>
        </div>

        {/* META STRIP */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border">
            <Users className="mb-2 text-indigo-600" />
            <p className="text-xs uppercase text-slate-500">Client</p>
            <p className="font-bold text-slate-900">
              {client?.name || 'Private Client'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border">
            <Briefcase className="mb-2 text-blue-600" />
            <p className="text-xs uppercase text-slate-500">Status</p>
            <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(project.status)}`}>
              {project.status}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border">
            <DollarSign className="mb-2 text-emerald-600" />
            <p className="text-xs uppercase text-slate-500">Total Budget</p>
            <p className="font-extrabold text-lg">
              {formatCurrency(project.totalBudget, currencyCode)}
            </p>
          </div>

          <div className={`p-4 rounded-xl border ${deadlineTone}`}>
            <AlertCircle className="mb-2" />
            <p className="text-xs uppercase">Deadline</p>
            <p className="font-bold">
              {daysLeft !== null ? `${daysLeft} days left` : 'Not set'}
            </p>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="xl:col-span-2 space-y-6">

          {/* DESCRIPTION */}
          <div className="bg-white rounded-2xl shadow-lg">
            <div className="p-5 border-b flex items-center gap-2 font-bold">
              <FileText size={18} /> Project Description
            </div>
            <div className="p-5 text-slate-600 min-h-[120px]">
              {project.description || (
                <p className="italic text-slate-400 text-center">
                  No description provided.
                </p>
              )}
            </div>
          </div>

          {/* DOCUMENTS */}
          <div className="bg-white rounded-2xl shadow-lg">
            <div className="p-5 border-b flex justify-between items-center">
              <div className="font-bold flex items-center gap-2">
                <Receipt size={18} /> Billing Documents
              </div>
              <Link
                to="/billing/new"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                New Document
              </Link>
            </div>

            <div className="p-4 space-y-3">
              {invoices.length ? invoices.map(doc => (
                <Link
                  key={doc.id}
                  to={`/billing/view/${doc.id}`}
                  className="block p-4 rounded-xl border hover:shadow-md transition"
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{doc.docNumber}</p>
                      <p className="text-xs uppercase text-slate-500">{doc.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {formatCurrency(doc.total, currencyCode)}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(doc.status)}`}>
                        {doc.status}
                      </span>
                    </div>
                  </div>
                </Link>
              )) : (
                <div className="text-center py-10 text-slate-400 italic">
                  No documents yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-6">

          {/* FINANCIAL SUMMARY */}
          <div className="bg-white rounded-2xl shadow-lg">
            <div className="p-5 border-b font-bold flex items-center gap-2">
              <TrendingUp size={18} /> Financial Summary
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs text-slate-500 uppercase">Paid</p>
                <p className="text-2xl font-extrabold text-emerald-600">
                  {formatCurrency(earned, currencyCode)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Pending</p>
                <p className="text-2xl font-extrabold text-red-600">
                  {formatCurrency(pending, currencyCode)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Collection Rate</p>
                <p className="text-xl font-bold">
                  {project.totalBudget
                    ? Math.round((earned / project.totalBudget) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </div>

          {/* ALERT */}
          {daysLeft !== null && daysLeft <= 2 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 font-bold text-red-700">
              ⚠ Deadline is very close. Immediate action required.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
