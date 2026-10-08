import React, { useMemo } from 'react';
import { Quotation, Invoice, Payment, Customer, CompanySettings } from '../types/database';
import { formatINR, formatDateIndian } from '../utils/numberToWords';
import {
  FileText,
  FileCheck2,
  DollarSign,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Clock,
  CheckCircle2,
  Calendar,
  Users,
  Eye,
  CreditCard,
} from 'lucide-react';

interface DashboardViewProps {
  quotations: Quotation[];
  invoices: Invoice[];
  payments: Payment[];
  customers: Customer[];
  settings: CompanySettings;
  onNewQuotation?: () => void;
  onViewQuotation: (id: string) => void;
  onViewInvoice: (id: string) => void;
  onRecordPayment: (invoice: Invoice) => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  quotations,
  invoices,
  payments,
  customers,
  settings,
  onViewQuotation,
  onViewInvoice,
  onRecordPayment,
  onNavigateTab,
}) => {
  // Quotation counts
  const totalQuotes = quotations.length;
  const draftQuotes = quotations.filter((q) => q.status === 'Draft').length;
  const sentQuotes = quotations.filter((q) => q.status === 'Sent' || q.status === 'Viewed').length;
  const acceptedQuotes = quotations.filter(
    (q) => q.status === 'Accepted' || q.status === 'Converted'
  ).length;
  const rejectedQuotes = quotations.filter((q) => q.status === 'Rejected').length;
  const expiredQuotes = quotations.filter((q) => q.status === 'Expired').length;

  const conversionRate = totalQuotes > 0 ? Math.round((acceptedQuotes / totalQuotes) * 100) : 0;

  // Invoice counts
  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter((i) => i.status === 'Paid').length;
  const partialInvoices = invoices.filter((i) => i.status === 'Partially Paid').length;
  const unpaidInvoices = invoices.filter((i) => i.status === 'Unpaid').length;
  const overdueInvoices = invoices.filter((i) => {
    if (i.status === 'Paid' || i.status === 'Cancelled') return false;
    const due = new Date(i.dueDate);
    const today = new Date();
    return due < today;
  }).length;

  // Financial totals
  const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);
  const totalBilled = invoices.reduce((acc, i) => acc + i.grandTotal, 0);
  const totalOutstanding = invoices.reduce((acc, i) => acc + i.balanceDue, 0);

  // Customer map
  const customerMap = useMemo(() => {
    const map = new Map<string, Customer>();
    customers.forEach((c) => map.set(c.id, c));
    return map;
  }, [customers]);

  // Upcoming due dates (invoices with positive balance sorted by due date)
  const upcomingDueInvoices = useMemo(() => {
    return invoices
      .filter((i) => i.balanceDue > 0 && i.status !== 'Cancelled')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 4);
  }, [invoices]);

  // Monthly revenue breakdown (last 6 months)
  const monthlyData = useMemo(() => {
    const months: { label: string; yearMonth: string; billed: number; collected: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('en-US', { month: 'short' });
      months.push({ label, yearMonth: ym, billed: 0, collected: 0 });
    }

    invoices.forEach((inv) => {
      const ym = inv.invoiceDate.slice(0, 7);
      const bucket = months.find((m) => m.yearMonth === ym);
      if (bucket) {
        bucket.billed += inv.grandTotal;
      }
    });

    payments.forEach((p) => {
      const ym = p.paymentDate.slice(0, 7);
      const bucket = months.find((m) => m.yearMonth === ym);
      if (bucket) {
        bucket.collected += p.amount;
      }
    });

    const maxVal = Math.max(
      100000,
      ...months.map((m) => Math.max(m.billed, m.collected))
    );

    return { months, maxVal };
  }, [invoices, payments]);

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-[#780016] text-white p-6 rounded-3xl shadow-lg border border-amber-500/30 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-amber-300 font-serif font-black text-sm">
              {settings.auspiciousHeader || '॥ श्री ॥'}
            </span>
            <span className="text-[11px] font-bold text-amber-200 uppercase tracking-wider">
              {settings.tagline}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black italic tracking-wide">
            {settings.businessName}
          </h1>
          <p className="text-xs text-amber-100/80">
            Proprietor: <strong>{settings.proprietorName}</strong> • {settings.address}
          </p>
        </div>
      </div>

      {/* 3 Top Financial Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Collected Revenue */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-emerald-200/80 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Revenue Collected
            </div>
            <div className="text-2xl font-black text-emerald-800 mt-1 font-mono">
              {formatINR(totalRevenue)}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
              Across {payments.length} verified receipts
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Outstanding Recovery */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-rose-200/80 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Outstanding Balance
            </div>
            <div className="text-2xl font-black text-rose-900 mt-1 font-mono">
              {formatINR(totalOutstanding)}
            </div>
            <div className="text-[11px] text-rose-700 font-medium mt-0.5">
              {unpaidInvoices + partialInvoices} invoices awaiting balance
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-900 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Quotation Conversion Rate */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-amber-200/80 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Quotation Conversion Rate
            </div>
            <div className="text-2xl font-black text-amber-900 mt-1">
              {conversionRate}%
            </div>
            <div className="text-[11px] text-amber-700 font-medium mt-0.5">
              {acceptedQuotes} accepted of {totalQuotes} quotes
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quotation & Invoice Status Breakdown Strips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Quotations Pipeline */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-amber-200/80 space-y-3">
          <div className="flex items-center justify-between border-b border-amber-100 pb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-rose-900" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Quotations Pipeline ({totalQuotes})
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('quotations')}
              className="text-[11px] font-bold text-rose-900 hover:underline flex items-center gap-0.5"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500">Draft</span>
              <div className="font-bold text-slate-800 text-base">{draftQuotes}</div>
            </div>
            <div className="p-2 bg-blue-50 rounded-xl border border-blue-200">
              <span className="text-[10px] text-blue-700">Sent</span>
              <div className="font-bold text-blue-900 text-base">{sentQuotes}</div>
            </div>
            <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-[10px] text-emerald-700 font-bold">Accepted</span>
              <div className="font-extrabold text-emerald-800 text-base">{acceptedQuotes}</div>
            </div>
            <div className="p-2 bg-purple-50 rounded-xl border border-purple-200">
              <span className="text-[10px] text-purple-700">Converted</span>
              <div className="font-bold text-purple-900 text-base">
                {quotations.filter((q) => q.status === 'Converted').length}
              </div>
            </div>
            <div className="p-2 bg-rose-50 rounded-xl border border-rose-200">
              <span className="text-[10px] text-rose-700">Rejected</span>
              <div className="font-bold text-rose-900 text-base">{rejectedQuotes}</div>
            </div>
            <div className="p-2 bg-amber-50 rounded-xl border border-amber-200">
              <span className="text-[10px] text-amber-700">Expired</span>
              <div className="font-bold text-amber-900 text-base">{expiredQuotes}</div>
            </div>
          </div>
        </div>

        {/* Invoices Pipeline */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-amber-200/80 space-y-3">
          <div className="flex items-center justify-between border-b border-amber-100 pb-2">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-purple-900" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Invoices Lifecycle ({totalInvoices})
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('invoices')}
              className="text-[11px] font-bold text-purple-900 hover:underline flex items-center gap-0.5"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500">Unpaid</span>
              <div className="font-bold text-slate-800 text-base">{unpaidInvoices}</div>
            </div>
            <div className="p-2 bg-blue-50 rounded-xl border border-blue-200">
              <span className="text-[10px] text-blue-700">Partially Paid</span>
              <div className="font-bold text-blue-900 text-base">{partialInvoices}</div>
            </div>
            <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-[10px] text-emerald-700 font-bold">Paid</span>
              <div className="font-extrabold text-emerald-800 text-base">{paidInvoices}</div>
            </div>
            <div className="p-2 bg-rose-50 rounded-xl border border-rose-200">
              <span className="text-[10px] text-rose-700 font-bold">Overdue</span>
              <div className="font-extrabold text-rose-900 text-base">{overdueInvoices}</div>
            </div>
            <div className="p-2 bg-amber-50 rounded-xl border border-amber-200">
              <span className="text-[10px] text-amber-800 font-bold">Total Invoiced</span>
              <div className="font-extrabold text-slate-900 text-xs mt-1 font-mono">
                {formatINR(totalBilled, false)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Revenue Chart & Upcoming Due Dates */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Monthly Revenue Bar Chart (7 cols) */}
        <div className="md:col-span-7 bg-white p-5 rounded-3xl shadow-sm border border-amber-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-700" />
                Monthly Billing vs Collections
              </h2>
              <p className="text-[11px] text-slate-500">6-month trend in ₹ INR</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-semibold">
              <span className="flex items-center gap-1 text-slate-700">
                <span className="w-2.5 h-2.5 bg-rose-900 rounded-sm"></span> Billed
              </span>
              <span className="flex items-center gap-1 text-emerald-700">
                <span className="w-2.5 h-2.5 bg-emerald-600 rounded-sm"></span> Collected
              </span>
            </div>
          </div>

          <div className="pt-4 flex items-end justify-between gap-3 h-48 border-b border-slate-200 px-2">
            {monthlyData.months.map((m) => {
              const billedPct = Math.round((m.billed / monthlyData.maxVal) * 100);
              const collectedPct = Math.round((m.collected / monthlyData.maxVal) * 100);
              return (
                <div key={m.yearMonth} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div className="w-full flex items-end justify-center gap-1.5 h-36">
                    {/* Billed Bar */}
                    <div
                      style={{ height: `${Math.max(8, billedPct)}%` }}
                      className="w-4 sm:w-6 bg-gradient-to-t from-rose-950 to-rose-800 rounded-t-md relative group cursor-pointer transition-all hover:opacity-90"
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                        Billed: {formatINR(m.billed, false)}
                      </div>
                    </div>
                    {/* Collected Bar */}
                    <div
                      style={{ height: `${Math.max(8, collectedPct)}%` }}
                      className="w-4 sm:w-6 bg-gradient-to-t from-emerald-700 to-emerald-500 rounded-t-md relative group cursor-pointer transition-all hover:opacity-90"
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                        Paid: {formatINR(m.collected, false)}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-600">{m.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Payment Dues & Recovery (5 cols) */}
        <div className="md:col-span-5 bg-white p-5 rounded-3xl shadow-sm border border-amber-200/80 space-y-3">
          <div className="flex items-center justify-between border-b border-amber-100 pb-2">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-700" />
              Upcoming Payment Dues
            </h2>
            <button
              onClick={() => onNavigateTab('invoices')}
              className="text-[11px] font-bold text-amber-800 hover:underline"
            >
              Invoices
            </button>
          </div>

          {upcomingDueInvoices.length === 0 ? (
            <p className="text-xs text-slate-400 italic p-4 text-center">
              No outstanding dues at this time. All caught up!
            </p>
          ) : (
            <div className="space-y-2.5">
              {upcomingDueInvoices.map((inv) => {
                const cust = customerMap.get(inv.customerId);
                const isOverdue = new Date(inv.dueDate) < new Date();
                return (
                  <div
                    key={inv.id}
                    className="p-3 bg-slate-50 hover:bg-amber-50/40 rounded-2xl border border-slate-200 transition-colors flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{cust?.name || 'Customer'}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {inv.invoiceNumber} • Due: {formatDateIndian(inv.dueDate)}
                      </div>
                      {isOverdue && (
                        <span className="inline-block text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 rounded mt-0.5">
                          Overdue
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="font-black text-rose-900">{formatINR(inv.balanceDue)}</div>
                      <button
                        onClick={() => onRecordPayment(inv)}
                        className="text-[11px] font-bold text-emerald-700 hover:underline mt-0.5 inline-flex items-center gap-0.5"
                      >
                        <CreditCard className="w-3 h-3" /> Record Pay
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Quotations Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-amber-200/80 p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-amber-100 pb-2">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-rose-900" />
            Recent Quotations (Last 5)
          </h2>
          <button
            onClick={() => onNavigateTab('quotations')}
            className="text-[11px] font-bold text-rose-900 hover:underline"
          >
            View all quotations &rarr;
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b">
              <tr>
                <th className="p-2.5">Quotation No.</th>
                <th className="p-2.5">Date</th>
                <th className="p-2.5">Customer & Project</th>
                <th className="p-2.5 text-right">Amount</th>
                <th className="p-2.5 text-center">Status</th>
                <th className="p-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quotations.slice(0, 5).map((q) => {
                const cust = customerMap.get(q.customerId);
                return (
                  <tr key={q.id} className="hover:bg-amber-50/30">
                    <td className="p-2.5 font-bold font-mono text-rose-950">{q.quotationNumber}</td>
                    <td className="p-2.5 text-slate-600">{formatDateIndian(q.date)}</td>
                    <td className="p-2.5">
                      <div className="font-bold text-slate-900">{cust?.name || 'Customer'}</div>
                      <div className="text-[10px] text-slate-500">{q.projectName}</div>
                    </td>
                    <td className="p-2.5 text-right font-black text-slate-900">{formatINR(q.grandTotal)}</td>
                    <td className="p-2.5 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100">
                        {q.status}
                      </span>
                    </td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={() => onViewQuotation(q.id)}
                        className="px-2 py-1 text-xs font-bold text-rose-900 hover:bg-amber-100 rounded-lg inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
