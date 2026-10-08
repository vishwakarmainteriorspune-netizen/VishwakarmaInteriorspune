import React, { useState, useMemo } from 'react';
import { Quotation, Customer, QuotationStatus, CompanySettings } from '../types/database';
import { formatINR, formatDateIndian } from '../utils/numberToWords';
import { ConfirmModal } from './ConfirmModal';
import {
  FileText,
  Plus,
  Search,
  Eye,
  Edit,
  Copy,
  FileCheck2,
  Trash2,
  Share2,
  Download,
  Mail,
  Printer,
  Calendar,
} from 'lucide-react';

interface QuotationsListViewProps {
  quotations: Quotation[];
  customers: Customer[];
  settings: CompanySettings;
  onNewQuotation: () => void;
  onViewQuotation: (id: string) => void;
  onEditQuotation: (id: string) => void;
  onDuplicateQuotation: (id: string) => void;
  onConvertToInvoice: (id: string) => void;
  onDeleteQuotation: (id: string) => void;
}

export const QuotationsListView: React.FC<QuotationsListViewProps> = ({
  quotations,
  customers,
  settings,
  onNewQuotation,
  onViewQuotation,
  onEditQuotation,
  onDuplicateQuotation,
  onConvertToInvoice,
  onDeleteQuotation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [deletingQuotation, setDeletingQuotation] = useState<Quotation | null>(null);

  const customerMap = useMemo(() => {
    const map = new Map<string, Customer>();
    customers.forEach((c) => map.set(c.id, c));
    return map;
  }, [customers]);

  const handleShareWhatsApp = (q: Quotation) => {
    const cust = customerMap.get(q.customerId);
    const phone = cust?.whatsapp || cust?.mobile || '';
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Dear ${cust?.name || 'Sir/Madam'},\n\nPlease find your quotation from *${settings.businessName}*:\n\n*Quotation No:* ${q.quotationNumber}\n*Project:* ${q.projectName}\n*Subject:* ${q.subject}\n*Amount:* ${formatINR(q.grandTotal)}\n*Valid Until:* ${formatDateIndian(q.validUntil)}\n\nThank you.\n*${settings.businessName}*\n${settings.phones}`
    );
    const url = cleanPhone ? `https://wa.me/91${cleanPhone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  const getStatusBadge = (status: QuotationStatus) => {
    switch (status) {
      case 'Accepted':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Converted':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Sent':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Viewed':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'Rejected':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Expired':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const filteredQuotations = useMemo(() => {
    return quotations.filter((q) => {
      const cust = customerMap.get(q.customerId);
      const matchSearch =
        searchTerm === '' ||
        q.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cust && cust.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cust && cust.mobile.includes(searchTerm));

      const matchStatus = statusFilter === 'All' || q.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [quotations, searchTerm, statusFilter, customerMap]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-amber-200/80 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-rose-900 text-amber-300 rounded-xl">
              <FileText className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">Quotations</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Estimate proposals, furniture specifications, and conversion tracking
          </p>
        </div>

        <button
          onClick={onNewQuotation}
          className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-rose-950 via-rose-900 to-[#780016] hover:from-[#780016] hover:to-rose-950 rounded-xl shadow-md flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          Create New Quotation
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-sm border border-amber-200/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search by quote #, client name, mobile, project..."
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
            <option value="All">All Statuses ({quotations.length})</option>
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Viewed">Viewed</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
            <option value="Expired">Expired</option>
            <option value="Converted">Converted</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-amber-200/80 overflow-hidden">
        {filteredQuotations.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold">No quotations found</p>
            <p className="text-xs text-slate-400">
              {searchTerm ? 'Try changing your search terms' : 'Click "Create New Quotation" to begin!'}
            </p>
          </div>
        ) : (
          <div>
            {/* 1. Mobile Cards View (Visible on phones & small tablets) */}
            <div className="md:hidden divide-y divide-amber-100">
              {filteredQuotations.map((q) => {
                const cust = customerMap.get(q.customerId);
                return (
                  <div key={q.id} className="p-4 space-y-2.5 bg-white hover:bg-amber-50/20">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => onViewQuotation(q.id)}
                        className="font-bold text-rose-950 font-mono text-base hover:underline"
                      >
                        {q.quotationNumber}
                      </button>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                          q.status
                        )}`}
                      >
                        {q.status}
                      </span>
                    </div>

                    <div>
                      <div className="font-bold text-slate-900 text-sm">{cust?.name || 'Customer'}</div>
                      <div className="text-xs text-slate-500">{q.projectName}</div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                        <span>📅 {formatDateIndian(q.date)}</span>
                        {cust?.mobile && <span>📱 {cust.mobile}</span>}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Total Amount</span>
                        <span className="text-base font-black text-rose-950 font-mono">
                          {formatINR(q.grandTotal)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleShareWhatsApp(q)}
                          className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl inline-flex items-center gap-1 shadow-2xs"
                        >
                          <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp</span>
                        </button>
                        <button
                          onClick={() => onViewQuotation(q.id)}
                          className="px-3 py-1.5 text-xs font-bold text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl inline-flex items-center gap-1 shadow-2xs"
                        >
                          <Download className="w-3.5 h-3.5 text-amber-800" />
                          <span>PDF</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => onEditQuotation(q.id)}
                        className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-lg flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => onDuplicateQuotation(q.id)}
                        className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-lg flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" /> Copy
                      </button>
                      {q.status !== 'Converted' && (
                        <button
                          onClick={() => onConvertToInvoice(q.id)}
                          className="px-2.5 py-1 text-xs text-purple-700 hover:bg-purple-50 rounded-lg flex items-center gap-1 font-semibold"
                        >
                          <FileCheck2 className="w-3 h-3" /> Invoice
                        </button>
                      )}
                      <button
                        onClick={() => setDeletingQuotation(q)}
                        className="p-1 text-rose-400 hover:text-rose-700 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
                    <th className="py-3 px-4 border-r border-rose-800">Quotation No.</th>
                    <th className="py-3 px-3 border-r border-rose-800">Date & Validity</th>
                    <th className="py-3 px-4 border-r border-rose-800">Customer & Project</th>
                    <th className="py-3 px-3 border-r border-rose-800 text-center">Items</th>
                    <th className="py-3 px-4 border-r border-rose-800 text-right">Grand Total</th>
                    <th className="py-3 px-3 border-r border-rose-800 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {filteredQuotations.map((q, idx) => {
                    const cust = customerMap.get(q.customerId);
                    return (
                      <tr
                        key={q.id}
                        className={idx % 2 === 0 ? 'bg-white hover:bg-amber-50/30' : 'bg-amber-50/10 hover:bg-amber-50/40'}
                      >
                        {/* Quotation No */}
                        <td className="py-3 px-4 border-r border-amber-100">
                          <button
                            onClick={() => onViewQuotation(q.id)}
                            className="font-bold text-rose-950 hover:underline text-sm font-mono text-left block"
                          >
                            {q.quotationNumber}
                          </button>
                          <span className="text-[10px] text-slate-400 truncate max-w-[150px] block">
                            {q.subject}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="py-3 px-3 border-r border-amber-100 text-slate-700">
                          <div className="font-semibold text-slate-900">{formatDateIndian(q.date)}</div>
                          <div className="text-[10px] text-slate-400">
                            Valid till {formatDateIndian(q.validUntil)}
                          </div>
                        </td>

                        {/* Customer & Project */}
                        <td className="py-3 px-4 border-r border-amber-100">
                          <div className="font-bold text-slate-900">{cust?.name || 'Unknown'}</div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">{q.projectName}</div>
                          {cust?.mobile && (
                            <div className="text-[10px] text-amber-800 font-medium">{cust.mobile}</div>
                          )}
                        </td>

                        {/* Items Count */}
                        <td className="py-3 px-3 text-center border-r border-amber-100 font-bold text-slate-700">
                          {q.items.length}
                        </td>

                        {/* Grand Total */}
                        <td className="py-3 px-4 text-right border-r border-amber-100 font-black text-slate-900 text-sm">
                          {formatINR(q.grandTotal)}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 text-center border-r border-amber-100">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                              q.status
                            )}`}
                          >
                            {q.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            <button
                              onClick={() => handleShareWhatsApp(q)}
                              className="px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg inline-flex items-center gap-1 transition-colors shadow-2xs"
                              title="Send Quotation to Customer on WhatsApp"
                            >
                              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>WhatsApp</span>
                            </button>

                            <button
                              onClick={() => onViewQuotation(q.id)}
                              className="px-2.5 py-1 text-xs font-bold text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg inline-flex items-center gap-1 transition-colors shadow-2xs"
                              title="View Quotation & Download PDF"
                            >
                              <Download className="w-3.5 h-3.5 text-amber-800" />
                              <span>PDF / Print</span>
                            </button>

                            <button
                              onClick={() => onEditQuotation(q.id)}
                              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Edit Quotation"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => onDuplicateQuotation(q.id)}
                              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Duplicate"
                            >
                              <Copy className="w-4 h-4" />
                            </button>

                            {q.status !== 'Converted' ? (
                              <button
                                onClick={() => onConvertToInvoice(q.id)}
                                className="p-1.5 text-purple-700 hover:text-purple-950 hover:bg-purple-50 rounded-lg transition-colors"
                                title="Convert to Invoice"
                              >
                                <FileCheck2 className="w-4 h-4" />
                              </button>
                            ) : null}

                            <button
                              onClick={() => setDeletingQuotation(q)}
                              className="p-1.5 text-rose-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete"
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
        isOpen={!!deletingQuotation}
        title="Delete Quotation"
        message={`Are you sure you want to permanently delete quotation ${deletingQuotation?.quotationNumber}? This action cannot be undone.`}
        confirmLabel="Yes, Delete"
        onConfirm={() => {
          if (deletingQuotation) {
            onDeleteQuotation(deletingQuotation.id);
            setDeletingQuotation(null);
          }
        }}
        onCancel={() => setDeletingQuotation(null)}
      />
    </div>
  );
};
