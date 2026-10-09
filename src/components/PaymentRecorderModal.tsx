import React, { useState } from 'react';
import { Invoice, Customer, PaymentMethod } from '../types/database';
import { formatINR } from '../utils/numberToWords';
import { CreditCard, Calendar, Hash, FileText } from 'lucide-react';

interface PaymentRecorderModalProps {
  invoice: Invoice;
  customer?: Customer;
  onClose: () => void;
  onSubmit: (data: {
    amount: number;
    paymentDate: string;
    paymentMethod: PaymentMethod;
    referenceNumber?: string;
    notes?: string;
  }) => void;
}

export const PaymentRecorderModal: React.FC<PaymentRecorderModalProps> = ({
  invoice,
  customer,
  onClose,
  onSubmit,
}) => {
  const [amount, setAmount] = useState<number>(invoice.balanceDue);
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  const remainingAfterPayment = Math.max(0, invoice.balanceDue - (amount || 0));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setError('Please enter a valid payment amount greater than ₹0');
      return;
    }
    if (amount > invoice.balanceDue) {
      setError(`Amount cannot exceed the current outstanding balance of ${formatINR(invoice.balanceDue)}`);
      return;
    }

    onSubmit({
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
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Record Payment</h3>
              <p className="text-xs text-slate-500">
                Invoice {invoice.invoiceNumber} • {customer?.name || 'Customer'}
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
          {/* Invoice Balance Snapshot */}
          <div className="grid grid-cols-3 gap-2 bg-gradient-to-r from-amber-50 to-orange-50/40 p-3 rounded-2xl border border-amber-200 text-center">
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Total</div>
              <div className="text-xs sm:text-sm font-bold text-slate-800">{formatINR(invoice.grandTotal)}</div>
            </div>
            <div>
              <div className="text-[10px] text-emerald-700 uppercase font-semibold">Paid</div>
              <div className="text-xs sm:text-sm font-bold text-emerald-800">{formatINR(invoice.amountPaid)}</div>
            </div>
            <div>
              <div className="text-[10px] text-rose-700 uppercase font-semibold">Balance Due</div>
              <div className="text-xs sm:text-sm font-black text-rose-900">{formatINR(invoice.balanceDue)}</div>
            </div>
          </div>

          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <form id="paymentRecordForm" onSubmit={handleSubmit} className="space-y-4">
            {/* Amount Field with Quick Buttons */}
            <div>
              <div className="flex flex-wrap justify-between items-center gap-1.5 mb-1.5">
                <label className="font-bold text-slate-700">Payment Amount (₹):</label>
                <div className="flex flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAmount(invoice.balanceDue);
                      setError('');
                    }}
                    className="px-2 py-1 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded-lg hover:bg-emerald-200"
                  >
                    Full ({formatINR(invoice.balanceDue)})
                  </button>
                  {invoice.balanceDue > 1000 && (
                    <button
                      type="button"
                      onClick={() => {
                        setAmount(Math.round(invoice.balanceDue / 2));
                        setError('');
                      }}
                      className="px-2 py-1 text-[10px] font-semibold bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200"
                    >
                      50% ({formatINR(Math.round(invoice.balanceDue / 2))})
                    </button>
                  )}
                </div>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-base font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  step="any"
                  min="1"
                  max={invoice.balanceDue}
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

            {/* Payment Date & Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Payment Date:
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
                <label className="block font-semibold text-slate-700 mb-1">Payment Method:</label>
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

            {/* Reference / Transaction ID */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                Transaction Ref / UTR / Cheque No. (Optional):
              </label>
              <input
                type="text"
                placeholder="e.g. UPI/128372648109 or Chq #482019"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none min-h-[42px]"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Notes / Remarks:
              </label>
              <input
                type="text"
                placeholder="e.g. Advance payment milestone received at site"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none min-h-[42px]"
              />
            </div>

            {/* Projected Balance After Recording */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="font-semibold text-slate-600">Remaining Balance:</span>
              <span className="font-extrabold text-slate-900 text-sm font-mono">
                {formatINR(remainingAfterPayment)}
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
            form="paymentRecordForm"
            className="px-6 py-2.5 font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 rounded-xl shadow-md flex items-center justify-center gap-2 flex-1 sm:flex-initial text-xs min-h-[44px]"
          >
            <CreditCard className="w-4 h-4" />
            <span>Confirm & Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
