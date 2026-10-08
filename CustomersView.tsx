import React, { useState, useMemo } from 'react';
import { Customer, Quotation, Invoice, Payment } from '../types/database';
import { formatINR } from '../utils/numberToWords';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Edit,
  Trash2,
  Eye,
  FilePlus,
  Building,
} from 'lucide-react';
import { CustomerModal } from './CustomerModal';
import { CustomerProfileModal } from './CustomerProfileModal';
import { ConfirmModal } from './ConfirmModal';

interface CustomersViewProps {
  customers: Customer[];
  quotations: Quotation[];
  invoices: Invoice[];
  payments: Payment[];
  onSaveCustomer: (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  onDeleteCustomer: (id: string) => void;
  onCreateQuotationForCustomer: (customerId: string) => void;
  onViewQuotation: (quotationId: string) => void;
  onViewInvoice: (invoiceId: string) => void;
  onViewPayment: (payment: Payment) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  quotations,
  invoices,
  payments,
  onSaveCustomer,
  onDeleteCustomer,
  onCreateQuotationForCustomer,
  onViewQuotation,
  onViewInvoice,
  onViewPayment,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('All');
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(undefined);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  // Available unique cities for filter dropdown
  const cities = useMemo(() => {
    const list = Array.from(new Set(customers.map((c) => c.city).filter(Boolean)));
    return ['All', ...list];
  }, [customers]);

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchSearch =
        searchTerm === '' ||
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.mobile.includes(searchTerm) ||
        (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.address && c.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
        c.customerId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCity = cityFilter === 'All' || c.city === cityFilter;

      return matchSearch && matchCity;
    });
  }, [customers, searchTerm, cityFilter]);

  // Compute metrics per customer
  const getCustomerMetrics = (customerId: string) => {
    const quotes = quotations.filter((q) => q.customerId === customerId);
    const invs = invoices.filter((i) => i.customerId === customerId);
    const totalInvoiced = invs.reduce((acc, i) => acc + i.grandTotal, 0);
    const totalPaid = invs.reduce((acc, i) => acc + (i.amountPaid || 0), 0);
    const balance = Math.max(0, totalInvoiced - totalPaid);
    return { quotesCount: quotes.length, totalInvoiced, balance };
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-amber-200/80 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-rose-900 text-amber-300 rounded-xl">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">Customer Management</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage home-interior clients, track order history, and view ledger balances
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-rose-950 via-rose-900 to-[#780016] hover:from-[#780016] hover:to-rose-950 rounded-xl shadow-md flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          Add Customer
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-amber-200/60 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, phone, email, site address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Filter City:</span>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 bg-white"
          >
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Customers Table (Desktop) & Cards (Mobile) */}
      <div className="bg-white rounded-3xl shadow-sm border border-amber-200/80 overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold">No customers found</p>
            <p className="text-xs text-slate-400">
              {searchTerm ? 'Try adjusting your search criteria' : 'Click "Add Customer" to create one'}
            </p>
          </div>
        ) : (
          <div>
            {/* 1. Mobile Cards View (Visible on phones & small tablets) */}
            <div className="md:hidden divide-y divide-amber-100">
              {filteredCustomers.map((cust) => {
                const { quotesCount, totalInvoiced, balance } = getCustomerMetrics(cust.id);
                return (
                  <div key={cust.id} className="p-4 space-y-3 bg-white hover:bg-amber-50/20">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-900 text-base">{cust.name}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[10px] text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded font-bold">
                            {cust.customerId}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <a
                          href={`tel:${cust.mobile}`}
                          className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center hover:bg-emerald-100"
                          title="Call Customer"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600">
                      <div className="line-clamp-2">{cust.address}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {cust.city}, {cust.state}
                      </div>
                    </div>

                    {/* Metrics Row */}
                    <div className="grid grid-cols-3 gap-2 bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/60 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Quotes</span>
                        <span className="font-bold text-slate-800">{quotesCount}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Invoiced</span>
                        <span className="font-bold text-slate-900">{formatINR(totalInvoiced, false)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Balance</span>
                        <span className={`font-black font-mono ${balance > 0 ? 'text-rose-950' : 'text-emerald-700'}`}>
                          {formatINR(balance, false)}
                        </span>
                      </div>
                    </div>

                    {/* Actions Toolbar */}
                    <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setViewingCustomer(cust)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-rose-950 hover:bg-amber-100 bg-amber-50 border border-amber-200 rounded-lg inline-flex items-center gap-1 min-h-[36px]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Profile</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onCreateQuotationForCustomer(cust.id)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-white bg-rose-900 hover:bg-rose-950 rounded-lg inline-flex items-center gap-1 min-h-[36px]"
                      >
                        <FilePlus className="w-3.5 h-3.5 text-amber-300" />
                        <span>+ Quote</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingCustomer(cust)}
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center border border-slate-200"
                        title="Edit Customer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingCustomer(cust)}
                        className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center border border-rose-200"
                        title="Delete Customer"
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
                    <th className="py-3 px-4 border-r border-rose-800">Customer</th>
                    <th className="py-3 px-4 border-r border-rose-800">Contact</th>
                    <th className="py-3 px-4 border-r border-rose-800">Site Location</th>
                    <th className="py-3 px-3 border-r border-rose-800 text-center">Quotes</th>
                    <th className="py-3 px-3 border-r border-rose-800 text-right">Invoiced</th>
                    <th className="py-3 px-3 border-r border-rose-800 text-right">Outstanding</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {filteredCustomers.map((cust, idx) => {
                    const { quotesCount, totalInvoiced, balance } = getCustomerMetrics(cust.id);
                    return (
                      <tr
                        key={cust.id}
                        className={idx % 2 === 0 ? 'bg-white hover:bg-amber-50/30' : 'bg-amber-50/10 hover:bg-amber-50/40'}
                      >
                        {/* Name & ID */}
                        <td className="py-3 px-4 border-r border-amber-100">
                          <div className="font-bold text-slate-900 text-sm">{cust.name}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-[10px] text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded">
                              {cust.customerId}
                            </span>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="py-3 px-4 border-r border-amber-100 space-y-0.5">
                          <div className="flex items-center gap-1 text-slate-700 font-medium">
                            <Phone className="w-3 h-3 text-amber-700" />
                            <span>{cust.mobile}</span>
                          </div>
                          {cust.email && (
                            <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span className="truncate max-w-[160px]">{cust.email}</span>
                            </div>
                          )}
                        </td>

                        {/* Site Address */}
                        <td className="py-3 px-4 border-r border-amber-100 text-slate-700">
                          <div className="line-clamp-2 max-w-[200px]">{cust.address}</div>
                          <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                            {cust.city}, {cust.state}
                          </div>
                        </td>

                        {/* Quotes */}
                        <td className="py-3 px-3 text-center border-r border-amber-100 font-bold text-slate-800">
                          {quotesCount}
                        </td>

                        {/* Invoiced */}
                        <td className="py-3 px-3 text-right border-r border-amber-100 font-semibold text-slate-800">
                          {formatINR(totalInvoiced, false)}
                        </td>

                        {/* Outstanding */}
                        <td className="py-3 px-3 text-right border-r border-amber-100 font-bold">
                          <span className={balance > 0 ? 'text-rose-900 font-extrabold' : 'text-emerald-700'}>
                            {formatINR(balance, false)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setViewingCustomer(cust)}
                              className="p-1.5 text-slate-600 hover:text-rose-900 hover:bg-amber-100 rounded-lg transition-colors"
                              title="View Customer 360 Profile"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => onCreateQuotationForCustomer(cust.id)}
                              className="p-1.5 text-amber-800 hover:text-amber-950 hover:bg-amber-100 rounded-lg transition-colors"
                              title="Create Quotation"
                            >
                              <FilePlus className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setEditingCustomer(cust)}
                              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Edit Details"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setDeletingCustomer(cust)}
                              className="p-1.5 text-rose-500 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete Customer"
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

      {/* Add / Edit Customer Modal */}
      {(showAddModal || editingCustomer) && (
        <CustomerModal
          customer={editingCustomer}
          onClose={() => {
            setShowAddModal(false);
            setEditingCustomer(undefined);
          }}
          onSave={(data) => {
            onSaveCustomer(data);
            setShowAddModal(false);
            setEditingCustomer(undefined);
          }}
        />
      )}

      {/* Profile Modal */}
      {viewingCustomer && (
        <CustomerProfileModal
          customer={viewingCustomer}
          quotations={quotations}
          invoices={invoices}
          payments={payments}
          onClose={() => setViewingCustomer(null)}
          onCreateQuotation={(cId) => {
            setViewingCustomer(null);
            onCreateQuotationForCustomer(cId);
          }}
          onViewQuotation={onViewQuotation}
          onViewInvoice={onViewInvoice}
          onViewPayment={onViewPayment}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingCustomer}
        title="Delete Customer"
        message={`Are you sure you want to permanently delete customer "${deletingCustomer?.name}"? All associated transaction references will remain archived.`}
        confirmLabel="Yes, Delete"
        onConfirm={() => {
          if (deletingCustomer) {
            onDeleteCustomer(deletingCustomer.id);
            setDeletingCustomer(null);
          }
        }}
        onCancel={() => setDeletingCustomer(null)}
      />
    </div>
  );
};
