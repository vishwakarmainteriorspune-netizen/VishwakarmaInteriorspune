import React, { useState, useMemo } from 'react';
import { Quotation, Invoice, Payment, Customer } from '../types/database';
import { formatINR, formatDateIndian } from '../utils/numberToWords';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  FileSpreadsheet,
  TrendingUp,
  Receipt,
  FileCheck2,
  FileText,
} from 'lucide-react';

interface ReportsViewProps {
  quotations: Quotation[];
  invoices: Invoice[];
  payments: Payment[];
  customers: Customer[];
}

type ReportType =
  | 'sales'
  | 'quotations'
  | 'invoices'
  | 'outstanding'
  | 'payments'
  | 'gst';

export const ReportsView: React.FC<ReportsViewProps> = ({
  quotations,
  invoices,
  payments,
  customers,
}) => {
  const [reportType, setReportType] = useState<ReportType>('sales');
  const [dateRange, setDateRange] = useState<string>('this_month');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  const customerMap = useMemo(() => {
    const map = new Map<string, Customer>();
    customers.forEach((c) => map.set(c.id, c));
    return map;
  }, [customers]);

  // Date filtering logic
  const dateBounds = useMemo(() => {
    const now = new Date();
    let start = new Date(0); // beginning of time
    let end = new Date(2100, 0, 1);

    if (dateRange === 'today') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    } else if (dateRange === 'this_week') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      start = new Date(now.setDate(diff));
      start.setHours(0, 0, 0, 0);
      end = new Date();
    } else if (dateRange === 'this_month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    } else if (dateRange === 'this_year') {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    } else if (dateRange === 'custom') {
      if (customStart) start = new Date(customStart);
      if (customEnd) {
        end = new Date(customEnd);
        end.setHours(23, 59, 59);
      }
    }

    return { start, end };
  }, [dateRange, customStart, customEnd]);

  // Filtered dataset
  const filteredQuotations = useMemo(() => {
    return quotations.filter((q) => {
      const d = new Date(q.date);
      return d >= dateBounds.start && d <= dateBounds.end;
    });
  }, [quotations, dateBounds]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((i) => {
      const d = new Date(i.invoiceDate);
      return d >= dateBounds.start && d <= dateBounds.end;
    });
  }, [invoices, dateBounds]);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const d = new Date(p.paymentDate);
      return d >= dateBounds.start && d <= dateBounds.end;
    });
  }, [payments, dateBounds]);

  // Overall financial summary for selected period
  const totalBilled = filteredInvoices.reduce((acc, i) => acc + i.grandTotal, 0);
  const totalPaid = filteredPayments.reduce((acc, p) => acc + p.amount, 0);
  const totalOutstanding = filteredInvoices.reduce((acc, i) => acc + i.balanceDue, 0);

  // GST Summary metrics
  const gstBreakdown = useMemo(() => {
    let taxable = 0;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    let totalTax = 0;

    filteredInvoices.forEach((inv) => {
      taxable += inv.taxableAmount || 0;
      cgst += inv.cgstAmount || 0;
      sgst += inv.sgstAmount || 0;
      igst += inv.igstAmount || 0;
    });
    totalTax = cgst + sgst + igst;

    return { taxable, cgst, sgst, igst, totalTax };
  }, [filteredInvoices]);

  // Export to CSV helper
  const handleExportCSV = () => {
    let rows: string[][] = [];
    let filename = `Report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;

    if (reportType === 'quotations') {
      rows.push(['Quotation No', 'Date', 'Customer', 'Project', 'Amount', 'Status']);
      filteredQuotations.forEach((q) => {
        const cust = customerMap.get(q.customerId);
        rows.push([
          q.quotationNumber,
          q.date,
          `"${cust?.name || ''}"`,
          `"${q.projectName}"`,
          q.grandTotal.toString(),
          q.status,
        ]);
      });
    } else if (reportType === 'invoices') {
      rows.push(['Invoice No', 'Date', 'Due Date', 'Customer', 'Project', 'Total', 'Paid', 'Balance', 'Status']);
      filteredInvoices.forEach((inv) => {
        const cust = customerMap.get(inv.customerId);
        rows.push([
          inv.invoiceNumber,
          inv.invoiceDate,
          inv.dueDate,
          `"${cust?.name || ''}"`,
          `"${inv.projectName}"`,
          inv.grandTotal.toString(),
          inv.amountPaid.toString(),
          inv.balanceDue.toString(),
          inv.status,
        ]);
      });
    } else if (reportType === 'payments') {
      rows.push(['Receipt No', 'Date', 'Customer', 'Invoice', 'Amount', 'Method', 'Reference']);
      filteredPayments.forEach((p) => {
        const cust = customerMap.get(p.customerId);
        rows.push([
          p.receiptNumber,
          p.paymentDate,
          `"${cust?.name || ''}"`,
          p.invoiceId,
          p.amount.toString(),
          p.paymentMethod,
          `"${p.referenceNumber || ''}"`,
        ]);
      });
    } else if (reportType === 'gst') {
      rows.push(['Invoice No', 'Date', 'Customer', 'Taxable Value', 'CGST', 'SGST', 'IGST', 'Total Invoice']);
      filteredInvoices.forEach((inv) => {
        const cust = customerMap.get(inv.customerId);
        rows.push([
          inv.invoiceNumber,
          inv.invoiceDate,
          `"${cust?.name || ''}"`,
          inv.taxableAmount.toString(),
          inv.cgstAmount.toString(),
          inv.sgstAmount.toString(),
          inv.igstAmount.toString(),
          inv.grandTotal.toString(),
        ]);
      });
    } else {
      // Sales Summary
      rows.push(['Period', 'Invoices Generated', 'Total Sales Amount', 'Payments Collected', 'Outstanding Balance']);
      rows.push([
        dateRange,
        filteredInvoices.length.toString(),
        totalBilled.toString(),
        totalPaid.toString(),
        totalOutstanding.toString(),
      ]);
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-amber-200/80 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-800 text-amber-200 rounded-xl">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">Reports & Financial Analytics</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Detailed sales performance, GST summaries, and exportable audit records
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 text-xs font-bold text-slate-900 bg-amber-200 hover:bg-amber-300 border border-amber-400 rounded-xl shadow-xs flex items-center gap-2"
        >
          <FileSpreadsheet className="w-4 h-4 text-rose-950" />
          Export to CSV / Excel
        </button>
      </div>

      {/* Date Filter & Report Category Selection */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-amber-200/60 flex flex-wrap items-center justify-between gap-4 text-xs">
        
        {/* Report Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-amber-50/50 p-1 rounded-xl border border-amber-200/60">
          {(
            [
              { key: 'sales', label: 'Sales Overview' },
              { key: 'quotations', label: 'Quotation Report' },
              { key: 'invoices', label: 'Invoice Report' },
              { key: 'outstanding', label: 'Outstanding Aging' },
              { key: 'payments', label: 'Payments Log' },
              { key: 'gst', label: 'GST Summary' },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setReportType(t.key)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                reportType === t.key
                  ? 'bg-rose-950 text-amber-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Date Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-slate-300 rounded-xl px-2.5 py-1.5 font-semibold text-slate-800 bg-white"
          >
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="this_year">This Year</option>
            <option value="all">All Time</option>
            <option value="custom">Custom Date Range</option>
          </select>

          {dateRange === 'custom' && (
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="border border-slate-300 rounded-lg p-1 text-xs"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="border border-slate-300 rounded-lg p-1 text-xs"
              />
            </div>
          )}
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
        <div className="bg-white p-4 rounded-3xl border border-amber-200 shadow-sm">
          <div className="text-[10px] uppercase font-bold text-slate-500">Period Sales (Invoiced)</div>
          <div className="text-xl font-black text-slate-900 mt-1">{formatINR(totalBilled)}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{filteredInvoices.length} invoices</div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-emerald-200 shadow-sm">
          <div className="text-[10px] uppercase font-bold text-emerald-700">Collections (Paid)</div>
          <div className="text-xl font-black text-emerald-800 mt-1">{formatINR(totalPaid)}</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">{filteredPayments.length} receipts</div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-rose-200 shadow-sm">
          <div className="text-[10px] uppercase font-bold text-rose-800">Total Outstanding</div>
          <div className="text-xl font-black text-rose-950 mt-1">{formatINR(totalOutstanding)}</div>
          <div className="text-[10px] text-rose-600 mt-0.5">Pending collection</div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-purple-200 shadow-sm">
          <div className="text-[10px] uppercase font-bold text-purple-700">Total GST Component</div>
          <div className="text-xl font-black text-purple-950 mt-1">{formatINR(gstBreakdown.totalTax)}</div>
          <div className="text-[10px] text-purple-600 mt-0.5">Tax on sales</div>
        </div>
      </div>

      {/* Report Data Views */}
      <div className="bg-white rounded-3xl shadow-sm border border-amber-200/80 p-5 space-y-4">
        
        {/* 1. GST Summary View */}
        {reportType === 'gst' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">GST Tax Filing Summary Breakdown</h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div className="bg-amber-50/60 p-3 rounded-2xl border border-amber-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Taxable Turnover</span>
                <div className="text-base font-extrabold text-slate-900 mt-1">{formatINR(gstBreakdown.taxable)}</div>
              </div>
              <div className="bg-blue-50/60 p-3 rounded-2xl border border-blue-200">
                <span className="text-[10px] font-bold text-blue-800 uppercase">CGST (Central)</span>
                <div className="text-base font-extrabold text-blue-900 mt-1">{formatINR(gstBreakdown.cgst)}</div>
              </div>
              <div className="bg-indigo-50/60 p-3 rounded-2xl border border-indigo-200">
                <span className="text-[10px] font-bold text-indigo-800 uppercase">SGST (State)</span>
                <div className="text-base font-extrabold text-indigo-900 mt-1">{formatINR(gstBreakdown.sgst)}</div>
              </div>
              <div className="bg-purple-50/60 p-3 rounded-2xl border border-purple-200">
                <span className="text-[10px] font-bold text-purple-800 uppercase">IGST (Inter-state)</span>
                <div className="text-base font-extrabold text-purple-900 mt-1">{formatINR(gstBreakdown.igst)}</div>
              </div>
              <div className="bg-rose-50/60 p-3 rounded-2xl border border-rose-200">
                <span className="text-[10px] font-bold text-rose-800 uppercase">Total Tax Liability</span>
                <div className="text-base font-black text-rose-950 mt-1">{formatINR(gstBreakdown.totalTax)}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b">
                  <tr>
                    <th className="p-2.5">Invoice</th>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Customer</th>
                    <th className="p-2.5 text-right">Taxable</th>
                    <th className="p-2.5 text-right">CGST</th>
                    <th className="p-2.5 text-right">SGST</th>
                    <th className="p-2.5 text-right">IGST</th>
                    <th className="p-2.5 text-right">Invoice Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-amber-50/30">
                      <td className="p-2.5 font-bold font-mono text-rose-950">{inv.invoiceNumber}</td>
                      <td className="p-2.5 text-slate-600">{formatDateIndian(inv.invoiceDate)}</td>
                      <td className="p-2.5 font-medium">{customerMap.get(inv.customerId)?.name || 'Client'}</td>
                      <td className="p-2.5 text-right font-medium">{formatINR(inv.taxableAmount)}</td>
                      <td className="p-2.5 text-right text-slate-600">{formatINR(inv.cgstAmount)}</td>
                      <td className="p-2.5 text-right text-slate-600">{formatINR(inv.sgstAmount)}</td>
                      <td className="p-2.5 text-right text-slate-600">{formatINR(inv.igstAmount)}</td>
                      <td className="p-2.5 text-right font-bold text-slate-900">{formatINR(inv.grandTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. Quotation Report View */}
        {reportType === 'quotations' && (
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Quotations Generated in Selected Period</h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b">
                  <tr>
                    <th className="p-2.5">Quotation No</th>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Customer</th>
                    <th className="p-2.5">Project Scope</th>
                    <th className="p-2.5 text-right">Amount</th>
                    <th className="p-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredQuotations.map((q) => (
                    <tr key={q.id} className="hover:bg-amber-50/30">
                      <td className="p-2.5 font-bold font-mono text-rose-950">{q.quotationNumber}</td>
                      <td className="p-2.5 text-slate-600">{formatDateIndian(q.date)}</td>
                      <td className="p-2.5 font-medium">{customerMap.get(q.customerId)?.name || 'Client'}</td>
                      <td className="p-2.5 text-slate-700">{q.projectName}</td>
                      <td className="p-2.5 text-right font-bold">{formatINR(q.grandTotal)}</td>
                      <td className="p-2.5 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100">
                          {q.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. Invoices / Outstanding Report */}
        {(reportType === 'invoices' || reportType === 'outstanding' || reportType === 'sales') && (
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">
              {reportType === 'outstanding' ? 'Outstanding Balances Pending Recovery' : 'Invoices Ledger'}
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b">
                  <tr>
                    <th className="p-2.5">Invoice No</th>
                    <th className="p-2.5">Invoice Date</th>
                    <th className="p-2.5">Due Date</th>
                    <th className="p-2.5">Customer</th>
                    <th className="p-2.5 text-right">Invoice Amount</th>
                    <th className="p-2.5 text-right">Amount Paid</th>
                    <th className="p-2.5 text-right">Balance Due</th>
                    <th className="p-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(reportType === 'outstanding'
                    ? filteredInvoices.filter((i) => i.balanceDue > 0)
                    : filteredInvoices
                  ).map((inv) => (
                    <tr key={inv.id} className="hover:bg-amber-50/30">
                      <td className="p-2.5 font-bold font-mono text-purple-950">{inv.invoiceNumber}</td>
                      <td className="p-2.5 text-slate-600">{formatDateIndian(inv.invoiceDate)}</td>
                      <td className="p-2.5 text-rose-900 font-semibold">{formatDateIndian(inv.dueDate)}</td>
                      <td className="p-2.5 font-medium">{customerMap.get(inv.customerId)?.name || 'Client'}</td>
                      <td className="p-2.5 text-right font-semibold">{formatINR(inv.grandTotal)}</td>
                      <td className="p-2.5 text-right text-emerald-700 font-medium">
                        {formatINR(inv.amountPaid)}
                      </td>
                      <td className="p-2.5 text-right font-black text-rose-900">
                        {formatINR(inv.balanceDue)}
                      </td>
                      <td className="p-2.5 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100">
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. Payments Log */}
        {reportType === 'payments' && (
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Payments Received History</h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b">
                  <tr>
                    <th className="p-2.5">Receipt No</th>
                    <th className="p-2.5">Payment Date</th>
                    <th className="p-2.5">Customer</th>
                    <th className="p-2.5 text-center">Method</th>
                    <th className="p-2.5">Ref No.</th>
                    <th className="p-2.5 text-right">Amount Received</th>
                    <th className="p-2.5 text-right">Remaining Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-amber-50/30">
                      <td className="p-2.5 font-bold font-mono text-emerald-950">{p.receiptNumber}</td>
                      <td className="p-2.5 text-slate-600">{formatDateIndian(p.paymentDate)}</td>
                      <td className="p-2.5 font-medium">{customerMap.get(p.customerId)?.name || 'Client'}</td>
                      <td className="p-2.5 text-center font-semibold">{p.paymentMethod}</td>
                      <td className="p-2.5 font-mono text-slate-500">{p.referenceNumber || '-'}</td>
                      <td className="p-2.5 text-right font-black text-emerald-800">{formatINR(p.amount)}</td>
                      <td className="p-2.5 text-right font-bold text-slate-700">
                        {formatINR(p.remainingBalance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
