import React, { useRef } from 'react';
import { Payment, Customer, Invoice, CompanySettings } from '../types/database';
import { DocumentHeader } from './DocumentHeader';
import { formatINR, formatDateIndian, numberToIndianWords } from '../utils/numberToWords';
import { downloadElementAsPDF } from '../utils/pdfExport';
import { Printer, Download, Share2, CheckCircle2 } from 'lucide-react';

interface PaymentReceiptModalProps {
  payment: Payment;
  customer?: Customer;
  invoice?: Invoice;
  settings: CompanySettings;
  onClose: () => void;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  payment,
  customer,
  invoice,
  settings,
  onClose,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    try {
      window.print();
    } catch {
      // Ignored if sandboxed
    }
  };

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    const filename = `Receipt_${payment.receiptNumber}_Vishwakarma_Interiors.pdf`;
    await downloadElementAsPDF(receiptRef.current, filename);
  };

  const handleShareWhatsApp = () => {
    const phone = customer?.whatsapp || customer?.mobile || '';
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Dear ${customer?.name || 'Customer'},\n\nWe acknowledge with thanks the receipt of payment:\n\n*Receipt No:* ${payment.receiptNumber}\n*Amount Received:* ${formatINR(payment.amount)}\n*Date:* ${formatDateIndian(payment.paymentDate)}\n*Payment Method:* ${payment.paymentMethod}\n*Invoice Ref:* ${invoice?.invoiceNumber || '-'}\n*Remaining Balance:* ${formatINR(payment.remainingBalance)}\n\nThank you for choosing *${settings.businessName}*!\n${settings.phones}`
    );
    const url = cleanPhone ? `https://wa.me/91${cleanPhone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-amber-300 space-y-4 my-8">
        
        {/* Actions toolbar */}
        <div className="no-print flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">Official Payment Receipt</h3>
              <p className="text-xs text-slate-500">{payment.receiptNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-2.5 py-1 text-xs font-semibold text-amber-950 bg-amber-100 hover:bg-amber-200 rounded-lg flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center gap-1"
            >
              <Share2 className="w-3.5 h-3.5" />
              WhatsApp
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-xl font-bold ml-2"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Printable Receipt Layout */}
        <div ref={receiptRef} className="p-6 bg-white rounded-2xl border border-amber-200 space-y-4 text-xs font-sans">
          
          <DocumentHeader
            settings={settings}
            documentType="PAYMENT RECEIPT"
            documentNumber={payment.receiptNumber}
            documentDate={formatDateIndian(payment.paymentDate)}
            showAuspicious={true}
          />

          {/* Receipt Body */}
          <div className="bg-gradient-to-r from-amber-50/60 to-emerald-50/40 p-4 rounded-xl border border-amber-200 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Received With Thanks From:</span>
                <div className="text-base font-extrabold text-slate-900 mt-0.5">{customer?.name}</div>
                <div className="text-slate-600">{customer?.address}</div>
                <div className="text-slate-600">Tel: {customer?.mobile}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500">Invoice Reference:</span>
                <div className="text-sm font-bold text-rose-950 mt-0.5">{invoice?.invoiceNumber || '-'}</div>
                <div className="text-slate-600">{invoice?.projectName || 'Interior Woodwork'}</div>
              </div>
            </div>

            {/* Prominent Payment Amount Card */}
            <div className="bg-white p-3 rounded-lg border border-emerald-300 flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-700">Amount Received:</span>
                <div className="text-xl font-black text-emerald-800 font-mono">
                  {formatINR(payment.amount)}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase text-slate-500">Payment Mode:</span>
                <div className="font-bold text-slate-800">{payment.paymentMethod}</div>
                {payment.referenceNumber && (
                  <div className="text-[10px] text-slate-500 font-mono">Ref: {payment.referenceNumber}</div>
                )}
              </div>
            </div>

            {/* In Words */}
            <div className="text-slate-700 italic">
              <strong>In Words: </strong>
              {numberToIndianWords(payment.amount)}
            </div>

            {/* Account Ledger Balance Snapshot */}
            <div className="grid grid-cols-3 gap-2 bg-white/80 p-2.5 rounded-lg border border-amber-200 text-center">
              <div>
                <span className="text-[10px] text-slate-500">Previous Balance</span>
                <div className="font-bold text-slate-800">{formatINR(payment.previousBalance)}</div>
              </div>
              <div>
                <span className="text-[10px] text-emerald-700">Payment Credited</span>
                <div className="font-bold text-emerald-700">-{formatINR(payment.amount)}</div>
              </div>
              <div>
                <span className="text-[10px] text-rose-700">Remaining Balance</span>
                <div className="font-extrabold text-rose-950">{formatINR(payment.remainingBalance)}</div>
              </div>
            </div>

            {payment.notes && (
              <div className="text-[11px] text-slate-600 bg-white/60 p-2 rounded border border-amber-100">
                <strong>Remarks: </strong> {payment.notes}
              </div>
            )}
          </div>

          {/* Signatures */}
          <div className="pt-6 flex justify-between items-end text-xs">
            <div className="text-slate-500">
              * This is a computer generated official payment receipt.
            </div>
            <div className="w-52 text-center space-y-1">
              <div className="font-['Cinzel'] font-bold text-rose-950 text-[11px]">
                For {settings.businessName}
              </div>
              <div className="h-8"></div>
              <div className="font-bold text-slate-900 border-t border-slate-400 pt-1">
                Authorized Signatory
              </div>
            </div>
          </div>
        </div>

        <div className="no-print flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
