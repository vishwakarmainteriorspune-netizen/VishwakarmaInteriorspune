import React, { useState, useMemo, useEffect } from 'react';
import { Quotation, Invoice, Customer, Payment } from '../types/database';
import { formatINR, formatDateIndian } from '../utils/numberToWords';
import { Search, FileText, FileCheck2, Users, Receipt, X } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotations: Quotation[];
  invoices: Invoice[];
  customers: Customer[];
  payments: Payment[];
  onSelectQuotation: (id: string) => void;
  onSelectInvoice: (id: string) => void;
  onSelectCustomer: (id: string) => void;
  onSelectPayment: (payment: Payment) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  quotations,
  invoices,
  customers,
  payments,
  onSelectQuotation,
  onSelectInvoice,
  onSelectCustomer,
  onSelectPayment,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        // Toggle or open handled by caller
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const customerMap = useMemo(() => {
    const map = new Map<string, Customer>();
    customers.forEach((c) => map.set(c.id, c));
    return map;
  }, [customers]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { quotes: [], invs: [], custs: [], pays: [] };

    const quotes = quotations.filter((item) => {
      const cust = customerMap.get(item.customerId);
      return (
        item.quotationNumber.toLowerCase().includes(q) ||
        item.projectName.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q) ||
        item.date.includes(q) ||
        (cust && cust.name.toLowerCase().includes(q)) ||
        (cust && cust.mobile.includes(q))
      );
    });

    const invs = invoices.filter((item) => {
      const cust = customerMap.get(item.customerId);
      return (
        item.invoiceNumber.toLowerCase().includes(q) ||
        item.projectName.toLowerCase().includes(q) ||
        item.invoiceDate.includes(q) ||
        (item.quotationNumber && item.quotationNumber.toLowerCase().includes(q)) ||
        (cust && cust.name.toLowerCase().includes(q)) ||
        (cust && cust.mobile.includes(q))
      );
    });

    const custs = customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.mobile.includes(q) ||
        c.customerId.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q))
    );

    const pays = payments.filter((p) => {
      const cust = customerMap.get(p.customerId);
      return (
        p.receiptNumber.toLowerCase().includes(q) ||
        (p.referenceNumber && p.referenceNumber.toLowerCase().includes(q)) ||
        p.paymentDate.includes(q) ||
        (cust && cust.name.toLowerCase().includes(q))
      );
    });

    return { quotes, invs, custs, pays };
  }, [query, quotations, invoices, customers, payments, customerMap]);

  if (!isOpen) return null;

  const totalFound =
    results.quotes.length + results.invs.length + results.custs.length + results.pays.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-xs p-2.5 sm:p-4 pt-10 sm:pt-16 overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full p-4 sm:p-5 shadow-2xl border border-amber-300 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Search bar */}
        <div className="relative flex items-center border-b border-amber-200 pb-3">
          <Search className="w-5 h-5 text-amber-700 absolute left-3" />
          <input
            type="text"
            autoFocus
            placeholder="Type quotation #, invoice #, client name, phone..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-2.5 text-base sm:text-sm font-semibold text-slate-900 border-none outline-none focus:ring-0 placeholder:text-slate-400 min-h-[44px]"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-2 min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-2 text-slate-400 hover:text-slate-700 text-sm font-bold bg-slate-100 px-2.5 py-1.5 rounded-lg min-h-[36px]"
          >
            Esc
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto space-y-4 text-xs">
          {!query ? (
            <div className="text-center py-8 text-slate-400 space-y-1">
              <Search className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-600">Quick Global Search</p>
              <p className="text-[11px]">Search across all quotations, invoices, customers, and payments.</p>
            </div>
          ) : totalFound === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p className="font-semibold text-slate-600">No matching records found for "{query}"</p>
            </div>
          ) : (
            <>
              {/* Quotations */}
              {results.quotes.length > 0 && (
                <div className="space-y-1.5">
                  <div className="font-bold text-rose-950 uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-rose-900" />
                    Quotations ({results.quotes.length})
                  </div>
                  {results.quotes.map((q) => (
                    <div
                      key={q.id}
                      onClick={() => {
                        onClose();
                        onSelectQuotation(q.id);
                      }}
                      className="p-2.5 bg-amber-50/40 hover:bg-amber-100/60 rounded-xl border border-amber-200 cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold font-mono text-rose-950">{q.quotationNumber}</span>
                        <span className="text-slate-500 ml-2">({formatDateIndian(q.date)})</span>
                        <div className="text-slate-800 font-medium">{q.projectName}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900">{formatINR(q.grandTotal)}</div>
                        <span className="text-[10px] text-slate-500 font-semibold">{q.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Invoices */}
              {results.invs.length > 0 && (
                <div className="space-y-1.5">
                  <div className="font-bold text-purple-950 uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <FileCheck2 className="w-3.5 h-3.5 text-purple-900" />
                    Invoices ({results.invs.length})
                  </div>
                  {results.invs.map((inv) => (
                    <div
                      key={inv.id}
                      onClick={() => {
                        onClose();
                        onSelectInvoice(inv.id);
                      }}
                      className="p-2.5 bg-purple-50/30 hover:bg-purple-100/50 rounded-xl border border-purple-200 cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold font-mono text-purple-950">{inv.invoiceNumber}</span>
                        <span className="text-slate-500 ml-2">({formatDateIndian(inv.invoiceDate)})</span>
                        <div className="text-slate-800 font-medium">{inv.projectName}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900">{formatINR(inv.grandTotal)}</div>
                        <span className="text-[10px] text-rose-800 font-bold">
                          Bal: {formatINR(inv.balanceDue)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Customers */}
              {results.custs.length > 0 && (
                <div className="space-y-1.5">
                  <div className="font-bold text-amber-950 uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-amber-900" />
                    Customers ({results.custs.length})
                  </div>
                  {results.custs.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        onClose();
                        onSelectCustomer(c.id);
                      }}
                      className="p-2.5 bg-slate-50 hover:bg-amber-50 rounded-xl border border-slate-200 cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-900">{c.name}</span>
                        <span className="text-slate-500 ml-2">({c.customerId})</span>
                        <div className="text-slate-600 text-[11px]">{c.address}</div>
                      </div>
                      <div className="text-right text-slate-700 font-semibold">{c.mobile}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Payments */}
              {results.pays.length > 0 && (
                <div className="space-y-1.5">
                  <div className="font-bold text-emerald-950 uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <Receipt className="w-3.5 h-3.5 text-emerald-900" />
                    Payments & Receipts ({results.pays.length})
                  </div>
                  {results.pays.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        onClose();
                        onSelectPayment(p);
                      }}
                      className="p-2.5 bg-emerald-50/40 hover:bg-emerald-100/60 rounded-xl border border-emerald-200 cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold font-mono text-emerald-950">{p.receiptNumber}</span>
                        <span className="text-slate-500 ml-2">via {p.paymentMethod}</span>
                        {p.referenceNumber && (
                          <div className="text-slate-500 text-[10px]">Ref: {p.referenceNumber}</div>
                        )}
                      </div>
                      <div className="text-right font-black text-emerald-800 text-sm">
                        {formatINR(p.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
