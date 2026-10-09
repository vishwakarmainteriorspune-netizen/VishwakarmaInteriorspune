import React, { useState, useMemo } from 'react';
import { Payment, Customer, Invoice, PaymentMethod } from '../types/database';
import { formatINR, formatDateIndian } from '../utils/numberToWords';
import {
  Receipt,
  Search,
  Eye,
  Plus,
  Edit2,
  Trash2,
  ArrowRight,
  FileCheck2,
  Calendar,
  CreditCard,
  Building,
} from 'lucide-react';
import { PaymentEditModal } from './PaymentEditModal';
import { ConfirmModal } from './ConfirmModal';

interface PaymentsListViewProps {
  payments: Payment[];
  customers: Customer[];
  invoices: Invoice[];
  onViewReceipt: (payment: Payment) => void;
  onUpdatePayment: (
    paymentId: string,
    data: {
      amount: number;
      paymentDate: string;
      paymentMethod: PaymentMethod;
      referenceNumber?: string;
      notes?: string;
    }
  ) => void;
  onDeletePayment: (paymentId: string) => void;
  onSelectInvoiceToPay: (invoice: Invoice) => void;
}

export const PaymentsListView: React.FC<PaymentsListViewProps> = ({
  payments,
  customers,
  invoices,
  onViewReceipt,
  onUpdatePayment,
  onDeletePayment,
  onSelectInvoiceToPay,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('All');
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [showInvoicePicker, setShowInvoicePicker] = useState(false);
  const [deletingPayment, setDeletingPayment] = useState<Payment | null>(null);

  const customerMap = useMemo(() => {
    const map = new Map<string, Customer>();
    customers.forEach((c) => map.set(c.id, c));
    return map;
  }, [customers]);

  const invoiceMap = useMemo(() => {
    const map = new Map<string, Invoice>();
    invoices.forEach((i) => map.set(i.id, i));
    return map;
  }, [invoices]);

  const totalCollected = useMemo(() => {
    return payments.reduce((acc, p) => acc + p.amount, 0);
  }, [payments]);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const cust = customerMap.get(p.customerId);
      const inv = invoiceMap.get(p.invoiceId);

      const matchSearch =
        searchTerm === '' ||
        p.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cust && cust.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (inv && inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.referenceNumber && p.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchMethod = methodFilter === 'All' || p.paymentMethod === methodFilter;

      return matchSearch && matchMethod;
    });
  }, [payments, searchTerm, methodFilter, customerMap, invoiceMap]);

  // Invoices eligible for receiving payments (unpaid or partially paid)
  const pendingInvoices = useMemo(() => {
    return invoices.filter((i) => i.balanceDue > 0 && i.status !== 'Cancelled');
  }, [invoices]);

  // Calculate other payments total when editing a specific payment
  const getOtherPaymentsTotal = (payment: Payment) => {
    return payments
      .filter((p) => p.invoiceId === payment.invoiceId && p.id !== payment.id)
      .reduce((sum, p) => sum + p.amount, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-800 text-amber-300 rounded-xl">
              <Receipt className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">Payments & Receipts</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit logs of advance milestones, bank deposits, and client receipts. You can add, update or delete payments anytime.
          </p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          <div className="bg-emerald-50 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl border border-emerald-200 text-left sm:text-right">
            <div className="text-[10px] text-emerald-800 font-bold uppercase">Total Collections</div>
            <div className="text-base sm:text-lg font-black text-emerald-950 font-mono">
              {formatINR(totalCollected)}
            </div>
          </div>

          <button
            onClick={() => setShowInvoicePicker(true)}
            className="px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-700 to-emerald-900 hover:from-emerald-800 hover:to-emerald-950 rounded-2xl shadow-md transition-all flex items-center gap-2 min-h-[42px]"
          >
            <Plus className="w-4 h-4 text-emerald-200" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-sm border border-amber-200/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search receipt #, customer name, transaction ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-base sm:text-xs min-h-[42px] border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium whitespace-nowrap">Method:</span>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="border border-slate-300 rounded-xl px-2.5 py-2 text-base sm:text-xs min-h-[42px] font-semibold text-slate-800 bg-white flex-1 sm:flex-initial"
          >
            <option value="All">All Methods</option>
            <option value="UPI">UPI / QR</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cash">Cash</option>
            <option value="Cheque">Cheque</option>
            <option value="Card">Card</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-amber-200/80 overflow-hidden">
        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Receipt className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold">No payments recorded</p>
            <p className="text-xs text-slate-400">
              Click "+ Record Payment" to log an advance or milestone payment against any invoice.
            </p>
          </div>
        ) : (
          <div>
            {/* 1. Mobile Cards View */}
            <div className="md:hidden divide-y divide-amber-100">
              {filteredPayments.map((p) => {
                const cust = customerMap.get(p.customerId);
                const inv = invoiceMap.get(p.invoiceId);
                return (
                  <div key={p.id} className="p-4 space-y-2.5 bg-white hover:bg-amber-50/20">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => onViewReceipt(p)}
                        className="font-bold text-rose-950 font-mono text-base hover:underline"
                      >
                        {p.receiptNumber}
                      </button>
                      <span className="font-semibold text-slate-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 text-[11px]">
                        {p.paymentMethod}
                      </span>
                    </div>

                    <div>
                      <div className="font-bold text-slate-900 text-sm">{cust?.name || 'Customer'}</div>
                      <div className="text-xs text-purple-900 font-mono">
                        Against {inv?.invoiceNumber || 'Invoice'}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                        <span>📅 {formatDateIndian(p.paymentDate)}</span>
                        {p.referenceNumber && (
                          <span className="font-mono text-slate-500 line-clamp-1">Ref: {p.referenceNumber}</span>
                        )}
                      </div>
                    </div>

                    <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-200/80 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-emerald-800 font-bold block uppercase">Received</span>
                        <span className="text-base font-black text-emerald-950 font-mono">
                          {formatINR(p.amount)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 font-semibold block">Balance Left</span>
                        <span className="text-sm font-bold text-slate-800 font-mono">
                          {formatINR(p.remainingBalance)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                      <button
                        onClick={() => onViewReceipt(p)}
                        className="px-3 py-1.5 text-xs font-bold text-rose-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl inline-flex items-center gap-1 shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </button>

                      <button
                        onClick={() => setEditingPayment(p)}
                        className="px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl inline-flex items-center gap-1 shadow-2xs"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Update</span>
                      </button>

                      <button
                        onClick={() => setDeletingPayment(p)}
                        className="p-1.5 text-rose-400 hover:text-rose-700 rounded-lg ml-auto"
                        title="Delete Receipt"
                      >
                        <Trash2 className="w-4 h-4" />
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
                    <th className="py-3 px-4 border-r border-rose-800">Receipt No.</th>
                    <th className="py-3 px-3 border-r border-rose-800">Payment Date</th>
                    <th className="py-3 px-4 border-r border-rose-800">Customer & Invoice</th>
                    <th className="py-3 px-3 border-r border-rose-800 text-center">Method & Ref</th>
                    <th className="py-3 px-3 border-r border-rose-800 text-right">Amount Received</th>
                    <th className="py-3 px-3 border-r border-rose-800 text-right">Remaining Balance</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {filteredPayments.map((p, idx) => {
                    const cust = customerMap.get(p.customerId);
                    const inv = invoiceMap.get(p.invoiceId);
                    return (
                      <tr
                        key={p.id}
                        className={idx % 2 === 0 ? 'bg-white hover:bg-amber-50/30' : 'bg-amber-50/10 hover:bg-amber-50/40'}
                      >
                        <td className="py-3 px-4 border-r border-amber-100">
                          <button
                            onClick={() => onViewReceipt(p)}
                            className="font-bold text-rose-950 hover:underline text-sm font-mono"
                          >
                            {p.receiptNumber}
                          </button>
                        </td>

                        <td className="py-3 px-3 border-r border-amber-100 text-slate-700 font-medium">
                          {formatDateIndian(p.paymentDate)}
                        </td>

                        <td className="py-3 px-4 border-r border-amber-100">
                          <div className="font-bold text-slate-900">{cust?.name || 'Customer'}</div>
                          <div className="text-[10px] text-purple-900 font-mono">
                            Against {inv?.invoiceNumber || 'Invoice'}
                          </div>
                        </td>

                        <td className="py-3 px-3 text-center border-r border-amber-100">
                          <span className="font-semibold text-slate-800">{p.paymentMethod}</span>
                          {p.referenceNumber && (
                            <div className="text-[10px] text-slate-400 font-mono line-clamp-1">
                              {p.referenceNumber}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right border-r border-amber-100 font-black text-emerald-800 text-sm font-mono">
                          {formatINR(p.amount)}
                        </td>

                        <td className="py-3 px-3 text-right border-r border-amber-100 font-bold text-slate-700 font-mono">
                          {formatINR(p.remainingBalance)}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onViewReceipt(p)}
                              className="px-2 py-1 text-xs font-bold text-rose-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg inline-flex items-center gap-1"
                              title="View Official Receipt"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Receipt
                            </button>

                            <button
                              onClick={() => setEditingPayment(p)}
                              className="p-1.5 text-amber-800 hover:text-amber-950 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200"
                              title="Update Payment Details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setDeletingPayment(p)}
                              className="p-1.5 text-rose-500 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete Payment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

      {/* Modal 1: Edit / Update Payment Modal */}
      {editingPayment && (
        <PaymentEditModal
          payment={editingPayment}
          customer={customerMap.get(editingPayment.customerId)}
          invoice={invoiceMap.get(editingPayment.invoiceId)}
          otherPaymentsTotal={getOtherPaymentsTotal(editingPayment)}
          onClose={() => setEditingPayment(null)}
          onUpdate={(data) => {
            onUpdatePayment(editingPayment.id, data);
            setEditingPayment(null);
          }}
        />
      )}

      {/* Modal 2: Select Invoice to Record Payment */}
      {showInvoicePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full flex flex-col max-h-[94dvh] shadow-2xl border border-amber-300 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-amber-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Record New Payment</h3>
                  <p className="text-xs text-slate-500">Select which invoice this payment is for</p>
                </div>
              </div>
              <button
                onClick={() => setShowInvoicePicker(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 min-h-[36px]"
              >
                &times;
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
              {pendingInvoices.length === 0 ? (
                <div className="p-8 text-center text-slate-500 space-y-2">
                  <FileCheck2 className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">All Invoices are Fully Settled!</p>
                  <p className="text-xs text-slate-400">
                    There are no pending balances right now. Create a new invoice from an accepted quotation to log incoming payments.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <p className="text-xs font-semibold text-slate-600 mb-1">
                    Choose an invoice with outstanding balance ({pendingInvoices.length} available):
                  </p>
                  {pendingInvoices.map((inv) => {
                    const cust = customerMap.get(inv.customerId);
                    return (
                      <div
                        key={inv.id}
                        onClick={() => {
                          setShowInvoicePicker(false);
                          onSelectInvoiceToPay(inv);
                        }}
                        className="p-3.5 bg-slate-50 hover:bg-emerald-50/50 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 group"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-purple-950 font-bold">{inv.invoiceNumber}</span>
                            <span className="text-slate-400 font-normal">•</span>
                            <span className="truncate">{cust?.name || 'Customer'}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 truncate">{inv.projectName}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Total: {formatINR(inv.grandTotal)} | Paid: {formatINR(inv.amountPaid)}
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:flex-col sm:items-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                          <div className="text-left sm:text-right">
                            <span className="text-[10px] uppercase font-bold text-rose-800 block">Balance Due</span>
                            <span className="text-base font-black text-rose-950 font-mono">
                              {formatINR(inv.balanceDue)}
                            </span>
                          </div>
                          <div className="text-xs text-emerald-700 font-bold group-hover:underline flex items-center gap-1 mt-0.5 bg-emerald-100 sm:bg-transparent px-2.5 py-1 sm:p-0 rounded-lg">
                            <span>Select & Pay</span>
                            <ArrowRight className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end p-3 sm:p-4 border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => setShowInvoicePicker(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl min-h-[40px]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Payment Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingPayment}
        title="Delete Payment Receipt"
        message={`Are you sure you want to delete payment receipt ${deletingPayment?.receiptNumber} of ${deletingPayment ? formatINR(deletingPayment.amount) : ''}? The balance on the invoice will be restored.`}
        confirmLabel="Yes, Delete Receipt"
        onConfirm={() => {
          if (deletingPayment) {
            onDeletePayment(deletingPayment.id);
            setDeletingPayment(null);
          }
        }}
        onCancel={() => setDeletingPayment(null)}
      />
    </div>
  );
};
