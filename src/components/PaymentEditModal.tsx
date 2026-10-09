import React, { useState } from 'react';
import { Payment, Customer, Invoice, PaymentMethod } from '../types/database';
import { formatINR } from '../utils/numberToWords';
import { Edit3, Calendar, Hash, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface PaymentEditModalProps {
  payment: Payment;
  customer?: Customer;
  invoice?: Invoice;
  otherPaymentsTotal: number;
  onClose: () => void;
  onUpdate: (data: {
    amount: number;
    paymentDate: string;
    paymentMethod: PaymentMethod;
    referenceNumber?: string;
    notes?: string;
  }) => void;
}

export const PaymentEditModal: React.FC<PaymentEditModalProps> = ({
  payment,
  customer,
  invoice,
  otherPaymentsTotal,
  onClose,
  onUpdate,
}) => {
  const [amount, setAmount] = useState<number>(payment.amount);
  const [paymentDate, setPaymentDate] = useState<string>(
    payment.paymentDate ? payment.paymentDate.split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(payment.paymentMethod);
  const [referenceNumber, setReferenceNumber] = useState<string>(payment.referenceNumber || '');
  const [notes, setNotes] = useState<string>(payment.notes || '');
  const [error, setError] = useState<string>('');

  const invoiceTotal = invoice?.grandTotal || (payment.amount + payment.remainingBalance);
  const maxAllowedAmount = Math.max(0, invoiceTotal - otherPaymentsTotal);
  const newInvoicePaid = otherPaymentsTotal + (amount || 0);
  const newRemainingBalance = Math.max(0, invoiceTotal - newInvoicePaid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setError('Please enter a valid payment amount greater than ₹0.');
      return;
    }
    if (amount > maxAllowedAmount) {
      setError(`Amount cannot exceed ₹${maxAllowedAmount.toLocaleString('en-IN')} (Invoice limit)`);
      return;
    }

    onUpdate({
      amount,
      paymentDate,
      paymentMethod,
      referenceNumber: referenceNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full flex flex-col max-h-[94dvh] shadow-2xl border border-amber-300 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Sticky Header */}
        <div className="p-4 sm:p-5 border-b border-amber-200 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-900 shrink-0">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Update Payment Details</h3>
              <p className="text-xs text-slate-500">
                Receipt {payment.receiptNumber} • {customer?.name || 'Customer'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl font-bold w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* Invoice & Current Payment Snapshot */}
          <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-700">
              <span>Invoice Reference:</span>
              <strong className="text-rose-950 font-mono">{invoice?.invoiceNumber || '-'}</strong>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>Invoice Grand Total:</span>
              <strong className="text-slate-900 font-mono">{formatINR(invoiceTotal)}</strong>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>Original Amount:</span>
              <span className="font-semibold text-amber-900 font-mono">{formatINR(payment.amount)}</span>
            </div>
          </div>

          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form id="paymentEditForm" onSubmit={handleSubmit} className="space-y-4">
            {/* Amount Field */}
            <div>
              <div className="flex flex-wrap justify-between items-center gap-1 mb-1">
                <label className="font-bold text-slate-700">Updated Amount (₹) *</label>
                <span className="text-[11px] text-slate-500">
                  Max Allowed: <strong className="text-emerald-700">{formatINR(maxAllowedAmount)}</strong>
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-base font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  step="any"
                  min="1"
                  max={maxAllowedAmount}
                  value={amount || ''}
                  onChange={(e) => {
                    setAmount(parseFloat(e.target.value) || 0);
                    setError('');
                  }}
                  className="w-full pl-8 pr-4 py-2.5 border border-slate-300 rounded-xl text-base sm:text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none min-h-[44px]"
                  required
                />
              </div>
            </div>

            {/* Date & Payment Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Payment Date *
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none min-h-[42px] bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none min-h-[42px] bg-white"
                >
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                  <option value="Cash">Cash Payment</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Card">Debit / Credit Card</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Reference / UTR Number */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                Transaction Ref / UTR / Cheque No. (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. UPI/92817462019/HDFC"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs text-slate-800 font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none min-h-[42px]"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Notes / Remarks
              </label>
              <input
                type="text"
                placeholder="e.g. Adjusted milestone advance"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none min-h-[42px]"
              />
            </div>

            {/* Projected Recalculated Balance */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="font-semibold text-slate-600">Updated Remaining Balance:</span>
              <span className="font-extrabold text-slate-900 text-sm font-mono">
                {formatINR(newRemainingBalance)}
              </span>
            </div>
          </form>
        </div>

        {/* Sticky Footer */}
        <div className="p-3.5 sm:p-4 border-t border-amber-200 bg-slate-50 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-slate-700 hover:bg-slate-200 bg-white border border-slate-200 rounded-xl font-semibold flex-1 sm:flex-initial text-xs min-h-[44px]"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="paymentEditForm"
            className="px-6 py-2.5 font-bold text-white bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 rounded-xl shadow-md flex items-center justify-center gap-2 flex-1 sm:flex-initial text-xs min-h-[44px]"
          >
            <CheckCircle2 className="w-4 h-4 text-amber-300" />
            <span>Save Payment Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
