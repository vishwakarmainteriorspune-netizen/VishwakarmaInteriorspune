import React, { useRef, useState, useMemo } from 'react';
import { Quotation, QuotationItem, Customer, CompanySettings, QuotationStatus } from '../types/database';
import { DocumentHeader, DocumentFooter } from './DocumentHeader';
import { formatINR, formatDateIndian } from '../utils/numberToWords';
import { downloadElementAsPDF } from '../utils/pdfExport';
import {
  Printer,
  Download,
  Mail,
  Share2,
  FileCheck2,
  Edit,
  Copy,
  ArrowLeft,
  CheckCircle,
  Building2,
  Calendar,
  Phone,
  MapPin,
  ExternalLink,
  Layers,
} from 'lucide-react';

interface QuotationDocumentProps {
  quotation: Quotation;
  customer?: Customer;
  settings: CompanySettings;
  onBack: () => void;
  onEdit: (quotationId: string) => void;
  onDuplicate: (quotationId: string) => void;
  onConvertToInvoice: (quotationId: string) => void;
  onStatusChange: (quotationId: string, status: QuotationStatus) => void;
  onViewInvoice?: (invoiceId: string) => void;
}

export const QuotationDocument: React.FC<QuotationDocumentProps> = ({
  quotation,
  customer,
  settings,
  onBack,
  onEdit,
  onDuplicate,
  onConvertToInvoice,
  onStatusChange,
  onViewInvoice,
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState(
    `Quotation ${quotation.quotationNumber} – ${settings.businessName}`
  );
  const [emailBody, setEmailBody] = useState(
    `Dear ${customer?.name || 'Customer'},\n\nPlease find attached our quotation for ${quotation.projectName || 'Wooden Furniture Works'}.\n\nTotal Amount: ${formatINR(quotation.grandTotal)}\nValidity: Until ${formatDateIndian(quotation.validUntil)}\n\nWe look forward to crafting your dream interiors with highest quality craftsmanship.\n\nRegards,\n${settings.proprietorName}\n${settings.businessName}\nTel: ${settings.phones}`
  );
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);

  // Group quotation items by room/area section
  const roomGroups = useMemo(() => {
    const list: { room: string; items: QuotationItem[]; subtotal: number }[] = [];
    const map = new Map<string, { room: string; items: QuotationItem[]; subtotal: number }>();

    quotation.items.forEach((item) => {
      const rawRoom = item.room?.trim() || quotation.sectionTitle?.trim() || 'General Woodwork';
      // Clean leading "(A) " or trailing colons from room name
      const cleanedRoom = rawRoom.replace(/^\([A-Za-z0-9]+\)\s*/, '').replace(/:+$/, '').trim();
      const roomName = cleanedRoom || 'General Woodwork';
      const key = roomName.toLowerCase();

      if (!map.has(key)) {
        const group = { room: roomName, items: [], subtotal: 0 };
        map.set(key, group);
        list.push(group);
      }
      const group = map.get(key)!;
      group.items.push(item);
      group.subtotal += item.amount || 0;
    });

    return list;
  }, [quotation.items, quotation.sectionTitle]);

  const getSectionLetter = (idx: number) => {
    return String.fromCharCode(65 + (idx % 26));
  };

  // Status badge style helper
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

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    setIsExporting(true);
    try {
      const filename = `Quotation_${quotation.quotationNumber}_Vishwakarma_Interiors.pdf`;
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
      `Dear ${customer?.name || 'Sir/Madam'},\n\nPlease find your quotation from *${settings.businessName}*:\n\n*Quotation No:* ${quotation.quotationNumber}\n*Project:* ${quotation.projectName}\n*Subject:* ${quotation.subject}\n*Amount:* ${formatINR(quotation.grandTotal)}\n*Valid Until:* ${formatDateIndian(quotation.validUntil)}\n\nThank you.\n*${settings.businessName}*\n${settings.phones}`
    );
    const url = cleanPhone ? `https://wa.me/91${cleanPhone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  const handleSendEmailSimulate = () => {
    setEmailSentSuccess(true);
    setTimeout(() => {
      setEmailSentSuccess(false);
      setShowEmailModal(false);
      if (quotation.status === 'Draft') {
        onStatusChange(quotation.id, 'Sent');
      }
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Toolbar (Hidden in Print) */}
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
            <h2 className="text-lg font-bold text-slate-900">{quotation.quotationNumber}</h2>
            <span
              className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getStatusBadge(
                quotation.status
              )}`}
            >
              {quotation.status}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Change Selector */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={quotation.status}
              onChange={(e) => onStatusChange(quotation.id, e.target.value as QuotationStatus)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 font-semibold text-slate-800 focus:ring-1 focus:ring-amber-500 focus:outline-none"
            >
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Viewed">Viewed</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
              <option value="Expired">Expired</option>
              <option value="Converted">Converted</option>
            </select>
          </div>

          {/* Primary High-Visibility Action Buttons */}
          <button
            onClick={handleShareWhatsApp}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-all shadow-sm"
            title="Share quotation with customer directly on WhatsApp"
          >
            <Share2 className="w-4 h-4 text-white" />
            <span>Send on WhatsApp</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-900 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-600 rounded-xl transition-all shadow-sm disabled:opacity-50"
            title="Generate & Download official A4 PDF document"
          >
            <Download className="w-4 h-4 text-slate-900" />
            <span>{isExporting ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-xs"
            title="Print Quotation"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print</span>
          </button>

          <button
            onClick={() => setShowEmailModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-xs"
            title="Email Quotation"
          >
            <Mail className="w-4 h-4 text-rose-800" />
            <span>Email</span>
          </button>

          <button
            onClick={() => onDuplicate(quotation.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-xs"
            title="Duplicate Quotation"
          >
            <Copy className="w-4 h-4 text-slate-600" />
            Duplicate
          </button>

          <button
            onClick={() => onEdit(quotation.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-xs"
          >
            <Edit className="w-4 h-4 text-slate-600" />
            Edit
          </button>

          {quotation.status !== 'Converted' ? (
            <button
              onClick={() => onConvertToInvoice(quotation.id)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-rose-900 to-rose-950 hover:from-rose-950 hover:to-rose-900 rounded-lg shadow-sm transition-all"
            >
              <FileCheck2 className="w-4 h-4 text-amber-300" />
              Convert to Invoice
            </button>
          ) : (
            quotation.convertedToInvoiceId && onViewInvoice && (
              <button
                onClick={() => onViewInvoice(quotation.convertedToInvoiceId!)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-purple-900 bg-purple-100 hover:bg-purple-200 border border-purple-300 rounded-lg"
              >
                View Converted Invoice
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )
          )}
        </div>
      </div>

      {/* Main Printable A4 Document Sheet Wrapper (Horizontally scrollable on mobile) */}
      <div className="overflow-x-auto pb-4">
        <div className="min-w-[650px] sm:min-w-0 max-w-[850px] mx-auto bg-white rounded-2xl shadow-xl border border-amber-300/40 p-4 sm:p-8 print:p-0 print:border-none print:shadow-none print:max-w-none print:min-w-0 text-slate-900 font-sans">
          <div ref={printRef} className="space-y-4 print:space-y-3 bg-white">
          
          {/* Authentic Vishwakarma Maroon & Gold Header */}
          <DocumentHeader
            settings={settings}
            documentType="QUOTATION"
            documentNumber={quotation.quotationNumber}
            documentDate={formatDateIndian(quotation.date)}
            validUntilOrDueDate={formatDateIndian(quotation.validUntil)}
            validUntilOrDueDateLabel="Valid Until"
            showAuspicious={true}
          />

          {/* Client & Project Information Box (Formatted exactly like the handwritten memo) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-amber-50/40 rounded-xl p-3.5 border border-amber-200/80 text-xs">
            {/* Left: Customer Info */}
            <div className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-rose-900 border-b border-amber-200/60 pb-0.5">
                Quotation For (Client):
              </div>
              <div className="font-extrabold text-sm text-slate-900">
                {customer?.name || 'Mr. Suresh M. Khandare'}
              </div>
              {customer?.companyName && (
                <div className="font-semibold text-slate-700">{customer.companyName}</div>
              )}
              <div className="flex items-start gap-1 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  {customer?.address || 'Flat No. 5A-901, Badmukhwadi Chorhali, Pune'}
                  {customer?.city ? `, ${customer.city}` : ''}
                  {customer?.pincode ? ` - ${customer.pincode}` : ''}
                </span>
              </div>
              <div className="flex items-center gap-3 pt-0.5 text-slate-600">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-amber-700" />
                  {customer?.mobile || settings.phones.split(',')[0]}
                </span>
                {customer?.email && <span>{customer.email}</span>}
              </div>
              {customer?.gstin && (
                <div className="text-[11px] text-slate-500 font-medium">
                  GSTIN: <span className="font-mono text-slate-700">{customer.gstin}</span>
                </div>
              )}
            </div>

            {/* Right: Project Details & Subject */}
            <div className="space-y-1 md:border-l md:border-amber-200/80 md:pl-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-rose-900 border-b border-amber-200/60 pb-0.5">
                Project & Scope:
              </div>
              <div>
                <span className="text-slate-500 font-medium">Project Name: </span>
                <span className="font-bold text-slate-900">
                  {quotation.projectName || 'Flat Interior Woodwork'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Project Site: </span>
                <span className="text-slate-700">
                  {quotation.projectAddress || customer?.address || 'Bhosari / Pune'}
                </span>
              </div>
              <div className="pt-1">
                <span className="font-bold text-rose-950">Sub: </span>
                <span className="font-semibold text-slate-800 underline decoration-amber-500 decoration-2">
                  {quotation.subject || 'Quotation for Wooden Furniture Works'}
                </span>
              </div>
              {roomGroups.length > 0 && (
                <div className="pt-1 flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="font-bold text-rose-950">Scope / Areas:</span>
                  {roomGroups.map((group, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2 py-0.5 rounded bg-amber-50 text-amber-950 border border-amber-300 font-semibold text-[11px]"
                    >
                      <strong className="font-serif mr-1 text-rose-900 font-bold">
                        ({getSectionLetter(idx)})
                      </strong>
                      {group.room}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quotation Item Table - Styled with Gold & Maroon Accents */}
          <div className="overflow-x-auto rounded-lg border border-amber-300/80">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-rose-950 via-rose-900 to-[#780016] text-amber-100 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-2 px-2.5 w-10 text-center border-r border-rose-800">Sr.</th>
                  <th className="py-2 px-3 border-r border-rose-800">Description</th>
                  <th className="py-2 px-2.5 border-r border-rose-800 text-center">Specification / Size</th>
                  <th className="py-2 px-2 border-r border-rose-800 text-center">Qty</th>
                  <th className="py-2 px-2 border-r border-rose-800 text-center">Unit</th>
                  <th className="py-2 px-2.5 border-r border-rose-800 text-right">Rate (₹)</th>
                  <th className="py-2 px-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-200/50">
                {roomGroups.map((group, groupIdx) => {
                  const sectionLetter = getSectionLetter(groupIdx);
                  const hasMultipleRooms = roomGroups.length > 1;

                  return (
                    <React.Fragment key={group.room || groupIdx}>
                      {/* Room Section Header Banner */}
                      <tr className="bg-gradient-to-r from-amber-100/90 via-amber-50 to-white border-y border-amber-300">
                        <td colSpan={7} className="py-2 px-3 font-extrabold text-rose-950 uppercase text-xs tracking-wider">
                          <span className="text-rose-900 font-serif mr-1.5 font-bold">
                            ({sectionLetter})
                          </span>
                          <span>{group.room || 'General Woodwork & Interior Items'} :</span>
                        </td>
                      </tr>

                      {/* Room Items */}
                      {group.items.map((item, itemIdx) => (
                        <tr
                          key={item.id || itemIdx}
                          className={itemIdx % 2 === 0 ? 'bg-white' : 'bg-amber-50/20'}
                        >
                          <td className="py-2 px-2.5 text-center font-bold text-slate-700 border-r border-amber-200/50">
                            {item.srNo || itemIdx + 1}
                          </td>
                          <td className="py-2 px-3 font-semibold text-slate-900 border-r border-amber-200/50">
                            <div>{item.description}</div>
                            {item.calculatedArea && item.length && item.width ? (
                              <div className="text-[10px] text-amber-800 font-normal">
                                {item.length}
                                {item.dimensionUnit === 'inches' ? '"' : "'"} × {item.width}
                                {item.dimensionUnit === 'inches' ? '"' : "'"} = {item.calculatedArea} sq ft
                              </div>
                            ) : item.pricingMode === 'running_ft' && item.length ? (
                              <div className="text-[10px] text-amber-800 font-normal">
                                {item.length} Running Feet (Rft)
                              </div>
                            ) : null}
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

                      {/* Room Subtotal Row */}
                      <tr className="bg-amber-50/70 text-[11px] font-bold text-slate-900 border-b-2 border-amber-300">
                        <td colSpan={6} className="py-1.5 px-3 text-right text-rose-950 font-semibold italic">
                          Subtotal for ({sectionLetter}) {group.room || 'General Woodwork'}:
                        </td>
                        <td className="py-1.5 px-3 text-right font-black text-rose-950 font-mono">
                          {formatINR(group.subtotal, false)}/-
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals & Calculations Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start pt-1">
            
            {/* Left Column: Ruled lines & Amount in Words */}
            <div className="md:col-span-7 space-y-3">
              {/* Amount in words */}
              <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-300/80">
                <div className="text-[10px] uppercase font-bold tracking-wider text-rose-900">
                  Total Amount in Words:
                </div>
                <div className="text-xs font-bold text-slate-900 italic mt-0.5">
                  {quotation.amountInWords || 'Rupees Zero Only'}
                </div>
              </div>

              {/* Room-Wise Cost Summary Breakdown */}
              {roomGroups.length > 0 && (
                <div className="bg-white p-3 rounded-xl border border-amber-200 text-xs">
                  <div className="font-bold text-rose-950 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-amber-700" />
                      Room-Wise Cost Breakdown:
                    </span>
                    <span className="text-[10px] text-amber-900 font-bold bg-amber-100 px-2 py-0.5 rounded-full">
                      {roomGroups.length} {roomGroups.length === 1 ? 'Room' : 'Rooms'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {roomGroups.map((g, idx) => {
                      const letter = getSectionLetter(idx);
                      const pct = quotation.subtotal > 0 ? Math.round((g.subtotal / quotation.subtotal) * 100) : 0;
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-[11px] text-slate-700 border-b border-amber-100 pb-0.5"
                        >
                          <span className="font-medium">
                            <span className="font-serif font-bold text-rose-900 mr-1">({letter})</span>
                            {g.room || 'General Woodwork'}
                          </span>
                          <span className="font-bold text-slate-900 font-mono">
                            {formatINR(g.subtotal, false)} ({pct}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Payment Schedule */}
              {quotation.paymentSchedule && quotation.paymentSchedule.length > 0 && (
                <div className="bg-white p-3 rounded-xl border border-amber-200 text-xs">
                  <div className="font-bold text-rose-950 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-700" />
                    Agreed Payment Schedule:
                  </div>
                  <div className="space-y-1">
                    {quotation.paymentSchedule.map((ps) => (
                      <div
                        key={ps.id}
                        className="flex items-center justify-between text-[11px] text-slate-700 border-b border-amber-100 pb-0.5"
                      >
                        <span className="font-medium">{ps.milestone}</span>
                        <span className="font-bold text-slate-900">
                          {ps.percentage}% ({formatINR((quotation.grandTotal * ps.percentage) / 100)})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bank Details (if enabled) */}
              {settings.showBankDetails && (
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-700">
                  <div className="font-bold text-slate-900 flex items-center gap-1 mb-1">
                    <Building2 className="w-3 h-3 text-amber-800" />
                    Bank Details for NEFT/RTGS/UPI:
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

            {/* Right Column: Financial Totals Breakdown */}
            <div className="md:col-span-5 bg-gradient-to-br from-amber-50/60 to-white rounded-xl border border-amber-300 p-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-900">{formatINR(quotation.subtotal)}</span>
              </div>

              {quotation.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount:</span>
                  <span className="font-semibold">-{formatINR(quotation.discountAmount)}</span>
                </div>
              )}

              {quotation.taxMode && quotation.taxMode !== 'none' && (quotation.cgstAmount > 0 || quotation.sgstAmount > 0 || quotation.igstAmount > 0) && (
                <>
                  <div className="flex justify-between text-slate-600 border-t border-amber-200/60 pt-1">
                    <span>Taxable Amount:</span>
                    <span className="font-semibold">{formatINR(quotation.taxableAmount)}</span>
                  </div>

                  {!quotation.isInterState ? (
                    <>
                      <div className="flex justify-between text-slate-600 text-[11px]">
                        <span>CGST ({quotation.gstRate / 2}%):</span>
                        <span>{formatINR(quotation.cgstAmount)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 text-[11px]">
                        <span>SGST ({quotation.gstRate / 2}%):</span>
                        <span>{formatINR(quotation.sgstAmount)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-slate-600 text-[11px]">
                      <span>IGST ({quotation.gstRate}%):</span>
                      <span>{formatINR(quotation.igstAmount)}</span>
                    </div>
                  )}
                </>
              )}

              {quotation.roundOff !== 0 && (
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Round Off:</span>
                  <span>{formatINR(quotation.roundOff)}</span>
                </div>
              )}

              {/* Grand Total Highlight Box with Maroon Background */}
              <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-[#780016] text-white p-2.5 rounded-lg flex items-center justify-between font-extrabold text-sm shadow-md mt-2">
                <span className="text-amber-200">Grand Total:</span>
                <span className="text-base text-amber-300 font-mono tracking-wide">
                  {formatINR(quotation.grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Terms and Conditions Section */}
          <div className="pt-2 text-[10px] text-slate-600 border-t border-amber-200/60 space-y-1">
            <div className="font-bold text-rose-950 uppercase tracking-wider text-[10px]">
              Terms & Conditions:
            </div>
            <ol className="list-decimal pl-4 space-y-0.5">
              {quotation.termsAndConditions.slice(0, 8).map((term, i) => (
                <li key={i}>{term}</li>
              ))}
            </ol>
          </div>

          {/* Signatures Row */}
          <div className="pt-6 flex justify-between items-end text-xs text-slate-800">
            {/* Customer Signature Box with 4 Golden Ruled Lines as seen in original image */}
            <div className="w-56 space-y-2">
              <div className="space-y-1.5 opacity-60">
                <div className="h-0.5 bg-amber-400 w-full"></div>
                <div className="h-0.5 bg-amber-400 w-full"></div>
                <div className="h-0.5 bg-amber-400 w-4/5"></div>
              </div>
              <div className="font-bold text-slate-700 text-center border-t border-slate-300 pt-1">
                Customer Signature & Acceptance
              </div>
            </div>

            {/* Vishwakarma Signatory */}
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

          {/* Document Footer with Decorative Acanthus Motif */}
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
                <span>Email Quotation {quotation.quotationNumber}</span>
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
                <label className="block text-slate-600 font-semibold mb-1">To (Customer Email):</label>
                <input
                  type="email"
                  defaultValue={customer?.email || 'suresh.khandare@gmail.com'}
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

              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  Attached: <strong>Quotation_{quotation.quotationNumber}.pdf</strong> ({formatINR(quotation.grandTotal)})
                </span>
              </div>

              {emailSentSuccess && (
                <div className="p-2.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  Email dispatched successfully to client!
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
                <span>Send Email Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
