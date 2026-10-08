import React from 'react';
import { Customer, Quotation, Invoice, Payment } from '../types/database';
import { formatINR, formatDateIndian } from '../utils/numberToWords';
import {
  Users,
  MapPin,
  Phone,
  Mail,
  FileText,
  FileCheck2,
  Receipt,
  Plus,
  ExternalLink,
} from 'lucide-react';

interface CustomerProfileModalProps {
  customer: Customer;
  quotations: Quotation[];
  invoices: Invoice[];
  payments: Payment[];
  onClose: () => void;
  onCreateQuotation: (customerId: string) => void;
  onViewQuotation: (quotationId: string) => void;
  onViewInvoice: (invoiceId: string) => void;
  onViewPayment: (payment: Payment) => void;
}

export const CustomerProfileModal: React.FC<CustomerProfileModalProps> = ({
  customer,
  quotations,
  invoices,
  payments,
  onClose,
  onCreateQuotation,
  onViewQuotation,
  onViewInvoice,
  onViewPayment,
}) => {
  const customerQuotes = quotations.filter((q) => q.customerId === customer.id);
  const customerInvoices = invoices.filter((i) => i.customerId === customer.id);
  const customerPayments = payments.filter((p) => p.customerId === customer.id);

  const totalQuoted = customerQuotes.reduce((acc, q) => acc + q.grandTotal, 0);
  const acceptedQuotes = customerQuotes.filter(
    (q) => q.status === 'Accepted' || q.status === 'Converted'
  ).length;

  const totalInvoiced = customerInvoices.reduce((acc, inv) => acc + inv.grandTotal, 0);
  const totalPaid = customerInvoices.reduce((acc, inv) => acc + (inv.amountPaid || 0), 0);
  const totalOutstanding = Math.max(0, totalInvoiced - totalPaid);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-amber-300 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between border-b pb-4 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-950 to-rose-900 text-amber-300 flex items-center justify-center font-bold text-lg shadow-md">
              {customer.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{customer.name}</h3>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-mono text-[10px] font-bold">
                  {customer.customerId}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Member since {formatDateIndian(customer.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onCreateQuotation(customer.id)}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-900 hover:bg-rose-950 rounded-xl flex items-center gap-1.5 shadow"
            >
              <Plus className="w-3.5 h-3.5 text-amber-300" />
              New Quotation
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-xl font-bold w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Contact Info & Details Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200 text-xs">
          <div className="space-y-1">
            <div className="text-slate-500 font-semibold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-700" /> Site Address:
            </div>
            <div className="text-slate-800 font-medium">
              {customer.address}
              {customer.city ? `, ${customer.city}` : ''}
              {customer.pincode ? ` - ${customer.pincode}` : ''}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-slate-500 font-semibold flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-amber-700" /> Contact Number:
            </div>
            <div className="text-slate-800 font-medium">
              Mobile: <strong>{customer.mobile}</strong>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-slate-500 font-semibold flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-amber-700" /> Email:
            </div>
            <div className="text-slate-800 font-medium">
              {customer.email || 'None'}
            </div>
          </div>
        </div>

        {/* 5 KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="bg-white p-3 rounded-2xl border border-slate-200">
            <div className="text-[10px] uppercase font-bold text-slate-500">Total Quotes</div>
            <div className="text-base font-extrabold text-slate-900 mt-1">{customerQuotes.length}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{formatINR(totalQuoted, false)}</div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200">
            <div className="text-[10px] uppercase font-bold text-emerald-700">Accepted Quotes</div>
            <div className="text-base font-extrabold text-emerald-800 mt-1">{acceptedQuotes}</div>
            <div className="text-[10px] text-emerald-600 mt-0.5">
              {customerQuotes.length ? Math.round((acceptedQuotes / customerQuotes.length) * 100) : 0}% win rate
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200">
            <div className="text-[10px] uppercase font-bold text-purple-700">Total Invoiced</div>
            <div className="text-base font-extrabold text-purple-900 mt-1">{formatINR(totalInvoiced, false)}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{customerInvoices.length} invoices</div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200">
            <div className="text-[10px] uppercase font-bold text-emerald-700">Total Paid</div>
            <div className="text-base font-extrabold text-emerald-800 mt-1">{formatINR(totalPaid, false)}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{customerPayments.length} receipts</div>
          </div>

          <div className="bg-rose-50 p-3 rounded-2xl border border-rose-200">
            <div className="text-[10px] uppercase font-bold text-rose-800">Outstanding Balance</div>
            <div className="text-base font-black text-rose-950 mt-1">{formatINR(totalOutstanding, false)}</div>
            <div className="text-[10px] text-rose-700 mt-0.5">
              {totalOutstanding > 0 ? 'Due for collection' : 'All clear'}
            </div>
          </div>
        </div>

        {/* History Tabs / Lists */}
        <div className="space-y-4">
          
          {/* Quotations History */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-rose-900" />
              Quotations History ({customerQuotes.length})
            </h4>

            {customerQuotes.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No quotations created yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                    <tr>
                      <th className="p-2.5">Quotation No</th>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Project</th>
                      <th className="p-2.5 text-right">Amount</th>
                      <th className="p-2.5 text-center">Status</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customerQuotes.map((q) => (
                      <tr key={q.id} className="hover:bg-amber-50/30">
                        <td className="p-2.5 font-bold text-rose-950">{q.quotationNumber}</td>
                        <td className="p-2.5 text-slate-600">{formatDateIndian(q.date)}</td>
                        <td className="p-2.5 text-slate-800">{q.projectName}</td>
                        <td className="p-2.5 text-right font-bold">{formatINR(q.grandTotal)}</td>
                        <td className="p-2.5 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800">
                            {q.status}
                          </span>
                        </td>
                        <td className="p-2.5 text-right">
                          <button
                            onClick={() => {
                              onClose();
                              onViewQuotation(q.id);
                            }}
                            className="text-amber-900 hover:text-rose-900 font-bold inline-flex items-center gap-1"
                          >
                            View
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Invoices History */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-purple-900" />
              Tax Invoices ({customerInvoices.length})
            </h4>

            {customerInvoices.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No invoices created for this client yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                    <tr>
                      <th className="p-2.5">Invoice No</th>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5 text-right">Total</th>
                      <th className="p-2.5 text-right">Paid</th>
                      <th className="p-2.5 text-right">Balance</th>
                      <th className="p-2.5 text-center">Status</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customerInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-amber-50/30">
                        <td className="p-2.5 font-bold text-purple-950">{inv.invoiceNumber}</td>
                        <td className="p-2.5 text-slate-600">{formatDateIndian(inv.invoiceDate)}</td>
                        <td className="p-2.5 text-right font-semibold">{formatINR(inv.grandTotal)}</td>
                        <td className="p-2.5 text-right text-emerald-700 font-semibold">
                          {formatINR(inv.amountPaid)}
                        </td>
                        <td className="p-2.5 text-right text-rose-900 font-bold">
                          {formatINR(inv.balanceDue)}
                        </td>
                        <td className="p-2.5 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800">
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-2.5 text-right">
                          <button
                            onClick={() => {
                              onClose();
                              onViewInvoice(inv.id);
                            }}
                            className="text-purple-900 hover:text-rose-900 font-bold inline-flex items-center gap-1"
                          >
                            View
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
