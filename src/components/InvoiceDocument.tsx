import React, { useRef, useState } from 'react';
import { Invoice, Customer, CompanySettings, Payment, InvoiceStatus } from '../types/database';
import { DocumentHeader, DocumentFooter } from './DocumentHeader';
import { formatINR, formatDateIndian } from '../utils/numberToWords';
import { downloadElementAsPDF } from '../utils/pdfExport';
import {
  Printer,
  Download,
  Mail,
  Share2,
  CreditCard,
  Receipt,
  ArrowLeft,
  Building2,
  Calendar,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface InvoiceDocumentProps {
  invoice: Invoice;
  customer?: Customer;
  settings: CompanySettings;
  payments: Payment[];
  onBack: () => void;
  onRecordPayment: (invoice: Invoice) => void;
  onViewReceipt: (payment: Payment) => void;
}

export const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({
  invoice,
  customer,
  settings,
  payments,
  onBack,
  onRecordPayment,
  onViewReceipt,
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState(
    `Invoice ${invoice.invoiceNumber} – ${settings.businessName}`
  );
  const [emailBody, setEmailBody] = useState(
    `Dear ${customer?.name || 'Customer'},\n\nPlease find attached Tax Invoice ${invoice.invoiceNumber} for ${invoice.projectName}.\n\nInvoice Total: ${formatINR(invoice.grandTotal)}\nAmount Paid: ${formatINR(invoice.amountPaid)}\nBalance Outstanding: ${formatINR(invoice.balanceDue)}\nDue Date: ${formatDateIndian(invoice.dueDate)}\n\nKindly process the balance payment using the bank/UPI details on the invoice.\n\nThank you,\n${settings.proprietorName}\n${settings.businessName}`
  );
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Partially Paid':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Overdue':
        return 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse';
      case 'Cancelled':
        return 'bg-slate-100 text-slate-600 border-slate-300';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    setIsExporting(true);
    try {
      const filename = `Invoice_${invoice.invoiceNumber}_Vishwakarma_Interiors.pdf`;
      await downloadElementAsPDF(printRef.current, filename);
    } catch (err) {
      console.error('PDF export error:', err);
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareWhatsApp = () => {
    const phone = customer?.whatsapp || customer?.mobile || '';
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Dear ${customer?.name || 'Customer'},\n\nPlease find your Tax Invoice from *${settings.businessName}*:\n\n*Invoice No:* ${invoice.invoiceNumber}\n*Total Amount:* ${formatINR(invoice.grandTotal)}\n*Amount Paid:* ${formatINR(invoice.amountPaid)}\n*Balance Due:* ${formatINR(invoice.balanceDue)}\n*Due Date:* ${formatDateIndian(invoice.dueDate)}\n\nThank you.\n*${settings.businessName}*\n${settings.phones}`
    );
    const url = cleanPhone ? `https://wa.me/91${cleanPhone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  const handleSendEmailSimulate = () => {
    setEmailSentSuccess(true);
    setTimeout(() => {
      setEmailSentSuccess(false);
      setShowEmailModal(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Action Bar (Hidden in Print) */}
      <div className="no-print bg-white p-4 rounded-2xl shadow-sm border border-amber-200/60 flex flex-wrap items-center justify-between gap-3 sticky top-2 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-rose-900 hover:bg-amber-50 rounded-lg transition-colors border border-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">{invoice.invoiceNumber}</h2>
            <span
              className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getStatusBadge(
                invoice.status
              )}`}
            >
              {invoice.status}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Primary High-Visibility Action Buttons */}
          <button
            onClick={handleShareWhatsApp}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-all shadow-sm"
            title="Share invoice directly with customer on WhatsApp"
          >
            <Share2 className="w-4 h-4 text-white" />
            <span>Send on WhatsApp</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-900 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-600 rounded-xl transition-all shadow-sm disabled:opacity-50"
            title="Generate & Download official A4 PDF invoice"
          >
            <Download className="w-4 h-4 text-slate-900" />
            <span>{isExporting ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>

          {invoice.balanceDue > 0 && (
            <button
              onClick={() => onRecordPayment(invoice)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-purple-800 to-purple-950 hover:from-purple-900 hover:to-purple-950 rounded-xl shadow-sm transition-all"
            >
              <CreditCard className="w-4 h-4 text-amber-300" />
              <span>Record Payment</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print</span>
          </button>

          <button
            onClick={() => setShowEmailModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-xs"
          >
            <Mail className="w-4 h-4 text-rose-800" />
            <span>Email</span>
          </button>
        </div>
      </div>

      {/* Main A4 Document Sheet (Horizontally scrollable on mobile) */}
      <div className="overflow-x-auto pb-4">
        <div className="min-w-[650px] sm:min-w-0 max-w-[850px] mx-auto bg-white rounded-2xl shadow-xl border border-amber-300/40 p-4 sm:p-8 print:p-0 print:border-none print:shadow-none print:max-w-none print:min-w-0 text-slate-900 font-sans">
          <div ref={printRef} className="space-y-4 print:space-y-3 bg-white">
          
          {/* Header */}
          <DocumentHeader
            settings={settings}
            documentType="TAX INVOICE"
            documentNumber={invoice.invoiceNumber}
            documentDate={formatDateIndian(invoice.invoiceDate)}
            validUntilOrDueDate={formatDateIndian(invoice.dueDate)}
            validUntilOrDueDateLabel="Payment Due Date"
            showAuspicious={true}
          />

          {/* Reference Banner */}
          {invoice.quotationNumber && (
            <div className="bg-amber-50/70 border-x border-amber-300 px-4 py-1.5 text-[11px] text-slate-700 flex justify-between items-center">
              <span>
                Referenced Quotation:{' '}
                <strong className="text-rose-950">{invoice.quotationNumber}</strong>
              </span>
              <span>
                GSTIN:{' '}
                <strong className="font-mono text-slate-900">{settings.gstin}</strong>
              </span>
            </div>
          )}

          {/* Client & Project Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-amber-50/40 rounded-xl p-3.5 border border-amber-200/80 text-xs">
            <div className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-rose-900 border-b border-amber-200/60 pb-0.5">
                Billed To (Customer):
              </div>
              <div className="font-extrabold text-sm text-slate-900">{customer?.name}</div>
              {customer?.companyName && (
                <div className="font-semibold text-slate-700">{customer.companyName}</div>
              )}
              <div className="flex items-start gap-1 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  {customer?.address}
                  {customer?.city ? `, ${customer.city}` : ''}
                  {customer?.pincode ? ` - ${customer.pincode}` : ''}
                </span>
              </div>
              <div className="flex items-center gap-3 pt-0.5 text-slate-600">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-amber-700" />
                  {customer?.mobile}
                </span>
                {customer?.email && <span>{customer.email}</span>}
              </div>
              {customer?.gstin && (
                <div className="text-[11px] text-slate-500 font-medium">
                  GSTIN: <span className="font-mono text-slate-700">{customer.gstin}</span>
                </div>
              )}
            </div>

            <div className="space-y-1 md:border-l md:border-amber-200/80 md:pl-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-rose-900 border-b border-amber-200/60 pb-0.5">
                Invoice Details:
              </div>
              <div>
                <span className="text-slate-500 font-medium">Project: </span>
                <span className="font-bold text-slate-900">{invoice.projectName}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Site Address: </span>
                <span className="text-slate-700">{invoice.projectAddress}</span>
              </div>
              <div className="pt-1">
                <span className="font-bold text-rose-950">Subject: </span>
                <span className="font-semibold text-slate-800">{invoice.subject}</span>
              </div>
              <div className="pt-1 flex items-center gap-2">
                <span className="text-slate-500 font-medium">Invoice Status:</span>
                <span className={`px-2 py-0.5 text-[11px] font-bold rounded ${getStatusBadge(invoice.status)}`}>
                  {invoice.status}
                </span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto rounded-lg border border-amber-300/80">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-rose-950 via-rose-900 to-[#780016] text-amber-100 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-2 px-2.5 w-10 text-center border-r border-rose-800">Sr.</th>
                  <th className="py-2 px-3 border-r border-rose-800">Description</th>
                  <th className="py-2 px-2.5 border-r border-rose-800 text-center">Specification</th>
                  <th className="py-2 px-2 border-r border-rose-800 text-center">Qty</th>
                  <th className="py-2 px-2 border-r border-rose-800 text-center">Unit</th>
                  <th className="py-2 px-2.5 border-r border-rose-800 text-right">Rate (₹)</th>
                  <th className="py-2 px-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-200/50">
                {invoice.items.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-amber-50/20'}
                  >
                    <td className="py-2 px-2.5 text-center font-bold text-slate-700 border-r border-amber-200/50">
                      {item.srNo || index + 1}
                    </td>
                    <td className="py-2 px-3 font-semibold text-slate-900 border-r border-amber-200/50">
                      {item.description}
                    </td>
                    <td className="py-2 px-2.5 text-center font-medium text-slate-700 border-r border-amber-200/50">
                      {item.specification || '-'}
                    </td>
                    <td className="py-2 px-2 text-center font-bold text-slate-900 border-r border-amber-200/50">
                      {item.qty}
                    </td>
                    <td className="py-2 px-2 text-center text-slate-600 border-r border-amber-200/50">
                      {item.unit}
                    </td>
                    <td className="py-2 px-2.5 text-right font-medium text-slate-700 border-r border-amber-200/50">
                      {formatINR(item.rate, false)}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">
                      {formatINR(item.amount, false)}/-
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Payment Summary */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start pt-1">
            <div className="md:col-span-7 space-y-3">
              {/* Words */}
              <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-300/80">
                <div className="text-[10px] uppercase font-bold tracking-wider text-rose-900">
                  Total Amount in Words:
                </div>
                <div className="text-xs font-bold text-slate-900 italic mt-0.5">
                  {invoice.amountInWords}
                </div>
              </div>

              {/* Payments History List */}
              {payments.length > 0 && (
                <div className="bg-white p-3 rounded-xl border border-amber-200 text-xs">
                  <div className="font-bold text-rose-950 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-amber-700" />
                      Payments Received ({payments.length}):
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {payments.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between text-[11px] bg-slate-50 p-1.5 rounded border border-slate-200"
                      >
                        <div>
                          <span className="font-bold text-rose-900">{p.receiptNumber}</span>
                          <span className="text-slate-500 ml-2">({formatDateIndian(p.paymentDate)})</span>
                          <span className="ml-2 font-medium text-slate-700">via {p.paymentMethod}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-700">{formatINR(p.amount)}</span>
                          <button
                            onClick={() => onViewReceipt(p)}
                            className="no-print text-[10px] text-amber-900 underline hover:font-bold"
                          >
                            Receipt
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bank Details */}
              {settings.showBankDetails && (
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-700">
                  <div className="font-bold text-slate-900 flex items-center gap-1 mb-1">
                    <Building2 className="w-3 h-3 text-amber-800" />
                    Bank Details for Payment:
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[10px]">
                    <div>Bank: <span className="font-semibold">{settings.bankName}</span></div>
                    <div>A/C No: <span className="font-mono font-semibold">{settings.bankAccountNo}</span></div>
                    <div>IFSC: <span className="font-mono font-semibold">{settings.bankIfsc}</span></div>
                    <div>UPI ID: <span className="font-mono font-semibold text-rose-900">{settings.upiId}</span></div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Calculations */}
            <div className="md:col-span-5 bg-gradient-to-br from-amber-50/60 to-white rounded-xl border border-amber-300 p-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-900">{formatINR(invoice.subtotal)}</span>
              </div>

              {invoice.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount:</span>
                  <span className="font-semibold">-{formatINR(invoice.discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600 border-t border-amber-200/60 pt-1">
                <span>Taxable Amount:</span>
                <span className="font-semibold">{formatINR(invoice.taxableAmount)}</span>
              </div>

              {invoice.taxMode !== 'none' && (
                <>
                  {!invoice.isInterState ? (
                    <>
                      <div className="flex justify-between text-slate-600 text-[11px]">
                        <span>CGST ({invoice.gstRate / 2}%):</span>
                        <span>{formatINR(invoice.cgstAmount)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 text-[11px]">
                        <span>SGST ({invoice.gstRate / 2}%):</span>
                        <span>{formatINR(invoice.sgstAmount)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-slate-600 text-[11px]">
                      <span>IGST ({invoice.gstRate}%):</span>
                      <span>{formatINR(invoice.igstAmount)}</span>
                    </div>
                  )}
                </>
              )}

              {invoice.roundOff !== 0 && (
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Round Off:</span>
                  <span>{formatINR(invoice.roundOff)}</span>
                </div>
              )}

              <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-[#780016] text-white p-2 rounded-lg flex items-center justify-between font-extrabold text-sm shadow-md mt-2">
                <span className="text-amber-200">Invoice Total:</span>
                <span className="text-base text-amber-300 font-mono tracking-wide">
                  {formatINR(invoice.grandTotal)}
                </span>
              </div>

              {/* Payment Status Summary Box */}
              <div className="pt-2 border-t border-amber-300/80 space-y-1 text-xs">
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Amount Paid:</span>
                  <span>{formatINR(invoice.amountPaid)}</span>
                </div>
                <div className="flex justify-between text-rose-900 font-extrabold text-sm pt-1 border-t border-amber-200">
                  <span>Balance Due:</span>
                  <span className="font-mono">{formatINR(invoice.balanceDue)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="pt-2 text-[10px] text-slate-600 border-t border-amber-200/60 space-y-1">
            <div className="font-bold text-rose-950 uppercase tracking-wider">
              Terms & Conditions:
            </div>
            <ol className="list-decimal pl-4 space-y-0.5">
              {invoice.termsAndConditions.slice(0, 6).map((term, i) => (
                <li key={i}>{term}</li>
              ))}
            </ol>
          </div>

          {/* Signatures */}
          <div className="pt-6 flex justify-between items-end text-xs text-slate-800">
            <div className="w-56 text-center">
              <div className="h-10"></div>
              <div className="font-bold text-slate-700 border-t border-slate-300 pt-1">
                Customer Signature / Acknowledgement
              </div>
            </div>

            <div className="w-56 text-center space-y-1">
              <div className="font-['Cinzel'] font-bold text-rose-950 text-[11px]">
                For {settings.businessName}
              </div>
              <div className="h-10"></div>
              <div className="font-bold text-slate-900 border-t border-slate-400 pt-1">
                Authorized Signatory
              </div>
            </div>
          </div>

          {/* Document Footer */}
          <DocumentFooter settings={settings} />
        </div>
      </div>
    </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full flex flex-col max-h-[94dvh] shadow-2xl border border-amber-300">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-amber-100 shrink-0">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-rose-800" />
                <span>Email Invoice {invoice.invoiceNumber}</span>
              </h3>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 min-h-[36px]"
              >
                &times;
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Customer Email:</label>
                <input
                  type="email"
                  defaultValue={customer?.email || 'customer@gmail.com'}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-base sm:text-xs min-h-[42px] text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Subject:</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-base sm:text-xs min-h-[42px] text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Message:</label>
                <textarea
                  rows={5}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-base sm:text-xs text-slate-800 font-sans"
                />
              </div>

              {emailSentSuccess && (
                <div className="p-2.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  Invoice dispatched to client email!
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 p-3 sm:p-4 border-t border-slate-100 shrink-0">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl min-h-[40px]"
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmailSimulate}
                disabled={emailSentSuccess}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-900 hover:bg-rose-950 rounded-xl flex items-center gap-1.5 shadow min-h-[40px]"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
