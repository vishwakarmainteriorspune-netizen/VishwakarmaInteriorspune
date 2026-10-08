import React, { useState, useMemo } from 'react';
import { Invoice, Customer, InvoiceStatus, CompanySettings } from '../types/database';
import { formatINR, formatDateIndian } from '../utils/numberToWords';
import { ConfirmModal } from './ConfirmModal';
import {
  FileCheck2,
  Search,
  Eye,
  CreditCard,
  Trash2,
  AlertCircle,
  Calendar,
  Share2,
  Download,
} from 'lucide-react';

interface InvoicesListViewProps {
  invoices: Invoice[];
  customers: Customer[];
  settings: CompanySettings;
  onViewInvoice: (id: string) => void;
  onRecordPayment: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
}

export const InvoicesListView: React.FC<InvoicesListViewProps> = ({
  invoices,
  customers,
  settings,
  onViewInvoice,
  onRecordPayment,
  onDeleteInvoice,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null);

  const customerMap = useMemo(() => {
    const map = new Map<string, Customer>();
    customers.forEach((c) => map.set(c.id, c));
    return map;
  }, [customers]);

  const handleShareWhatsApp = (inv: Invoice) => {
    const cust = customerMap.get(inv.customerId);
    const phone = cust?.whatsapp || cust?.mobile || '';
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Dear ${cust?.name || 'Customer'},\n\nPlease find your Tax Invoice from *${settings.businessName}*:\n\n*Invoice No:* ${inv.invoiceNumber}\n*Total Amount:* ${formatINR(inv.grandTotal)}\n*Amount Paid:* ${formatINR(inv.amountPaid)}\n*Balance Due:* ${formatINR(inv.balanceDue)}\n*Due Date:* ${formatDateIndian(inv.dueDate)}\n\nThank you.\n*${settings.businessName}*\n${settings.phones}`
    );
    const url = cleanPhone ? `https://wa.me/91${cleanPhone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Partially Paid':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Overdue':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
      case 'Cancelled':
        return 'bg-slate-100 text-slate-600 border-slate-300';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const cust = customerMap.get(inv.customerId);
      const matchSearch =
        searchTerm === '' ||
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cust && cust.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cust && cust.mobile.includes(searchTerm));

      const matchStatus = statusFilter === 'All' || inv.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [invoices, searchTerm, statusFilter, customerMap]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-amber-200/80 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-purple-900 text-amber-300 rounded-xl">
              <FileCheck2 className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">Tax Invoices</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Billing records, payment milestone tracking, and overdue recovery
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-sm border border-amber-200/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search invoice #, customer name, mobile, project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-base sm:text-xs min-h-[42px] border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium whitespace-nowrap">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-300 rounded-xl px-2.5 py-2 text-base sm:text-xs min-h-[42px] font-semibold text-slate-800 bg-white flex-1 sm:flex-initial"
          >
            <option value="All">All Invoices ({invoices.length})</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Paid">Paid</option>
            <option value="Overdue">Overdue</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-amber-200/80 overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <FileCheck2 className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold">No invoices found</p>
            <p className="text-xs text-slate-400">
              Invoices are automatically created when quotations are converted or billed.
            </p>
          </div>
        ) : (
          <div>
            {/* 1. Mobile Cards View */}
            <div className="md:hidden divide-y divide-amber-100">
              {filteredInvoices.map((inv) => {
                const cust = customerMap.get(inv.customerId);
                return (
                  <div key={inv.id} className="p-4 space-y-2.5 bg-white hover:bg-amber-50/20">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => onViewInvoice(inv.id)}
                        className="font-bold text-rose-950 font-mono text-base hover:underline"
                      >
                        {inv.invoiceNumber}
                      </button>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                          inv.status
                        )}`}
                      >
                        {inv.status}
                      </span>
                    </div>

                    <div>
                      <div className="font-bold text-slate-900 text-sm">{cust?.name || 'Customer'}</div>
                      <div className="text-xs text-slate-500">{inv.projectName}</div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                        <span>📅 Due: {formatDateIndian(inv.dueDate)}</span>
                        {cust?.mobile && <span>📱 {cust.mobile}</span>}
                      </div>
                    </div>

                    <div className="p-2.5 bg-amber-50/50 rounded-xl border border-amber-200/60 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Total / Paid</span>
                        <span className="font-bold text-slate-800">
                          {formatINR(inv.grandTotal)}
                        </span>
                        <span className="text-[10px] text-emerald-700 ml-1">
                          (Paid: {formatINR(inv.amountPaid)})
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-rose-800 font-bold block">Balance Due</span>
                        <span className="text-base font-black text-rose-950 font-mono">
                          {formatINR(inv.balanceDue)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleShareWhatsApp(inv)}
                          className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl inline-flex items-center gap-1 shadow-2xs"
                        >
                          <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp</span>
                        </button>
                        <button
                          onClick={() => onViewInvoice(inv.id)}
                          className="px-3 py-1.5 text-xs font-bold text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl inline-flex items-center gap-1 shadow-2xs"
                        >
                          <Download className="w-3.5 h-3.5 text-amber-800" />
                          <span>PDF</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        {inv.balanceDue > 0 && (
                          <button
                            onClick={() => onRecordPayment(inv)}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl flex items-center gap-1 shadow-2xs"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            Pay
                          </button>
                        )}
                        <button
                          onClick={() => setDeletingInvoice(inv)}
                          className="p-1.5 text-rose-400 hover:text-rose-700 rounded-lg"
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 2. Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-rose-950 via-rose-900 to-[#780016] text-amber-100 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4 border-r border-rose-800">Invoice No.</th>
                    <th className="py-3 px-3 border-r border-rose-800">Date & Due Date</th>
                    <th className="py-3 px-4 border-r border-rose-800">Customer & Project</th>
                    <th className="py-3 px-3 border-r border-rose-800 text-right">Invoice Total</th>
                    <th className="py-3 px-3 border-r border-rose-800 text-right">Paid</th>
                    <th className="py-3 px-3 border-r border-rose-800 text-right">Balance Due</th>
                    <th className="py-3 px-3 border-r border-rose-800 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {filteredInvoices.map((inv, idx) => {
                    const cust = customerMap.get(inv.customerId);
                    return (
                      <tr
                        key={inv.id}
                        className={idx % 2 === 0 ? 'bg-white hover:bg-amber-50/30' : 'bg-amber-50/10 hover:bg-amber-50/40'}
                      >
                        {/* Invoice No */}
                        <td className="py-3 px-4 border-r border-amber-100">
                          <button
                            onClick={() => onViewInvoice(inv.id)}
                            className="font-bold text-rose-950 hover:underline text-sm font-mono text-left block"
                          >
                            {inv.invoiceNumber}
                          </button>
                          {inv.quotationNumber && (
                            <span className="text-[10px] text-slate-400 block font-mono">
                              Ref: {inv.quotationNumber}
                            </span>
                          )}
                        </td>

                        {/* Date & Due Date */}
                        <td className="py-3 px-3 border-r border-amber-100 text-slate-700">
                          <div className="font-semibold text-slate-900">{formatDateIndian(inv.invoiceDate)}</div>
                          <div className="text-[10px] text-slate-400">
                            Due: <span className="font-semibold text-rose-900">{formatDateIndian(inv.dueDate)}</span>
                          </div>
                        </td>

                        {/* Customer & Project */}
                        <td className="py-3 px-4 border-r border-amber-100">
                          <div className="font-bold text-slate-900">{cust?.name || 'Unknown'}</div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">{inv.projectName}</div>
                          {cust?.mobile && (
                            <div className="text-[10px] text-amber-800 font-medium">{cust.mobile}</div>
                          )}
                        </td>

                        {/* Invoice Total */}
                        <td className="py-3 px-3 text-right border-r border-amber-100 font-bold text-slate-900">
                          {formatINR(inv.grandTotal)}
                        </td>

                        {/* Amount Paid */}
                        <td className="py-3 px-3 text-right border-r border-amber-100 font-semibold text-emerald-700">
                          {formatINR(inv.amountPaid)}
                        </td>

                        {/* Balance Due */}
                        <td className="py-3 px-3 text-right border-r border-amber-100 font-black text-rose-900">
                          {formatINR(inv.balanceDue)}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 text-center border-r border-amber-100">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                              inv.status
                            )}`}
                          >
                            {inv.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            <button
                              onClick={() => handleShareWhatsApp(inv)}
                              className="px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg inline-flex items-center gap-1 transition-colors shadow-2xs"
                              title="Share Invoice on WhatsApp"
                            >
                              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>WhatsApp</span>
                            </button>

                            <button
                              onClick={() => onViewInvoice(inv.id)}
                              className="px-2.5 py-1 text-xs font-bold text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg inline-flex items-center gap-1 transition-colors shadow-2xs"
                              title="View Invoice & Download PDF"
                            >
                              <Download className="w-3.5 h-3.5 text-amber-800" />
                              <span>PDF / Print</span>
                            </button>

                            {inv.balanceDue > 0 && (
                              <button
                                onClick={() => onRecordPayment(inv)}
                                className="px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg flex items-center gap-1"
                                title="Record Payment"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                Pay
                              </button>
                            )}

                            <button
                              onClick={() => setDeletingInvoice(inv)}
                              className="p-1.5 text-rose-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete Invoice"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingInvoice}
        title="Delete Tax Invoice"
        message={`Are you sure you want to permanently delete invoice ${deletingInvoice?.invoiceNumber}? Any balance calculations associated with this invoice will be removed.`}
        confirmLabel="Yes, Delete"
        onConfirm={() => {
          if (deletingInvoice) {
            onDeleteInvoice(deletingInvoice.id);
            setDeletingInvoice(null);
          }
        }}
        onCancel={() => setDeletingInvoice(null)}
      />
    </div>
  );
};
