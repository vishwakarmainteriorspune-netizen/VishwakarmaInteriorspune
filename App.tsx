import React, { useState, useEffect, useCallback } from 'react';
import { db } from './services/db';
import {
  Customer,
  Product,
  Quotation,
  Invoice,
  Payment,
  CompanySettings,
  QuotationStatus,
} from './types/database';
import { VishwakarmaEmblem } from './components/VishwakarmaLogo';
import { DashboardView } from './components/DashboardView';
import { QuotationsListView } from './components/QuotationsListView';
import { QuotationBuilder } from './components/QuotationBuilder';
import { QuotationDocument } from './components/QuotationDocument';
import { InvoicesListView } from './components/InvoicesListView';
import { InvoiceDocument } from './components/InvoiceDocument';
import { PaymentRecorderModal } from './components/PaymentRecorderModal';
import { PaymentReceiptModal } from './components/PaymentReceiptModal';
import { CustomersView } from './components/CustomersView';
import { CustomerModal } from './components/CustomerModal';
import { ProductsView } from './components/ProductsView';
import { PaymentsListView } from './components/PaymentsListView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { GlobalSearchModal } from './components/GlobalSearchModal';

import {
  LayoutDashboard,
  FileText,
  FileCheck2,
  Users,
  Package,
  Receipt,
  Settings as SettingsIcon,
  Search,
  Plus,
  Phone,
  MapPin,
  Menu,
  X,
} from 'lucide-react';

export default function App() {
  // Database States
  const [settings, setSettings] = useState<CompanySettings>(() => db.getSettings());
  const [customers, setCustomers] = useState<Customer[]>(() => db.getCustomers());
  const [products, setProducts] = useState<Product[]>(() => db.getProducts());
  const [quotations, setQuotations] = useState<Quotation[]>(() => db.getQuotations());
  const [invoices, setInvoices] = useState<Invoice[]>(() => db.getInvoices());
  const [payments, setPayments] = useState<Payment[]>(() => db.getPayments());

  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Subview / Modal States
  const [viewingQuotationId, setViewingQuotationId] = useState<string | null>(null);
  const [editingQuotationId, setEditingQuotationId] = useState<string | null>(null);
  const [isCreatingQuotation, setIsCreatingQuotation] = useState<boolean>(false);

  const [viewingInvoiceId, setViewingInvoiceId] = useState<string | null>(null);
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [viewingReceiptPayment, setViewingReceiptPayment] = useState<Payment | null>(null);

  const [showQuickAddCustomer, setShowQuickAddCustomer] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);

  // Synchronize state with DB
  const refreshData = useCallback(() => {
    setSettings(db.getSettings());
    setCustomers(db.getCustomers());
    setProducts(db.getProducts());
    setQuotations(db.getQuotations());
    setInvoices(db.getInvoices());
    setPayments(db.getPayments());
  }, []);

  // Quick Action: Start New Quotation
  const handleStartNewQuotation = (prefilledCustomerId?: string) => {
    setViewingQuotationId(null);
    setEditingQuotationId(null);
    setIsCreatingQuotation(true);
    setActiveTab('quotations');
    setMobileMenuOpen(false);
  };

  // Save Quotation Handler
  const handleSaveQuotation = (quotationData: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const saved = db.saveQuotation(quotationData);
    refreshData();
    setIsCreatingQuotation(false);
    setEditingQuotationId(null);
    setViewingQuotationId(saved.id);
  };

  // Convert Quotation to Invoice (AC-17)
  const handleConvertToInvoice = (quotationId: string) => {
    try {
      const invoice = db.convertQuotationToInvoice(quotationId);
      refreshData();
      setViewingQuotationId(null);
      setIsCreatingQuotation(false);
      setActiveTab('invoices');
      setViewingInvoiceId(invoice.id);
    } catch (err: any) {
      alert(err.message || 'Failed to convert quotation to invoice');
    }
  };

  // Record Payment Handler (AC-18, AC-19)
  const handleRecordPaymentSubmit = (data: {
    amount: number;
    paymentDate: string;
    paymentMethod: any;
    referenceNumber?: string;
    notes?: string;
  }) => {
    if (!payingInvoice) return;
    try {
      const result = db.recordPayment(payingInvoice.id, data);
      refreshData();
      setPayingInvoice(null);
      // Open official receipt modal immediately
      setViewingReceiptPayment(result.payment);
    } catch (err: any) {
      alert(err.message || 'Failed to record payment');
    }
  };

  // Keyboard shortcut for Spotlight Search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowGlobalSearch((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Currently viewed records
  const currentViewingQuotation = viewingQuotationId
    ? quotations.find((q) => q.id === viewingQuotationId)
    : null;
  const currentQuotationCustomer = currentViewingQuotation
    ? customers.find((c) => c.id === currentViewingQuotation.customerId)
    : undefined;

  const currentViewingInvoice = viewingInvoiceId
    ? invoices.find((i) => i.id === viewingInvoiceId)
    : null;
  const currentInvoiceCustomer = currentViewingInvoice
    ? customers.find((c) => c.id === currentViewingInvoice.customerId)
    : undefined;
  const currentInvoicePayments = currentViewingInvoice
    ? payments.filter((p) => p.invoiceId === currentViewingInvoice.id)
    : [];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-800 flex flex-col font-sans selection:bg-amber-200 selection:text-rose-950">
      
      {/* Top Professional Navigation Bar (Hidden in Print) */}
      <header className="no-print sticky top-0 z-30 bg-gradient-to-r from-rose-950 via-rose-900 to-[#780016] text-white shadow-md border-b border-amber-500/40">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left Brand Identity (Single Logo + Business Name) */}
          <div
            onClick={() => {
              setActiveTab('dashboard');
              setViewingQuotationId(null);
              setIsCreatingQuotation(false);
              setViewingInvoiceId(null);
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group min-w-0 flex-1 sm:flex-initial"
          >
            {settings.useCustomLogo && settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.businessName}
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded-lg drop-shadow shrink-0"
              />
            ) : (
              <VishwakarmaEmblem size={36} className="drop-shadow shrink-0" />
            )}

            <div className="min-w-0 truncate">
              <div className="font-['Cinzel'] font-black tracking-wide text-xs sm:text-base text-white group-hover:text-amber-300 transition-colors flex items-center gap-1.5 truncate">
                <span className="truncate">{settings.businessName}</span>
                <span className="text-amber-400 font-serif font-bold text-xs hidden md:inline shrink-0">
                  {settings.auspiciousHeader || '॥ श्री ॥'}
                </span>
              </div>
              <div className="text-[10px] text-amber-200/80 font-medium hidden md:block truncate">
                Home Interior • Modular Furniture • Carpentry
              </div>
            </div>
          </div>

          {/* Center Search Spotlight Button (Desktop) */}
          <div className="flex-1 max-w-md mx-2 hidden sm:block">
            <button
              onClick={() => setShowGlobalSearch(true)}
              className="w-full bg-rose-900/60 hover:bg-rose-900 border border-amber-400/30 rounded-xl px-3 py-1.5 text-xs text-amber-100 flex items-center justify-between transition-colors shadow-inner"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-amber-300" />
                <span>Search quotations, invoices, clients...</span>
              </div>
              <kbd className="bg-rose-950/80 px-1.5 py-0.5 rounded text-[10px] font-mono text-amber-300 border border-amber-400/20">
                Ctrl K
              </kbd>
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              onClick={() => setShowGlobalSearch(true)}
              className="p-1.5 text-amber-200 hover:text-white rounded-lg hover:bg-rose-900/60 sm:hidden"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Three-Line Menu Option Button on the Right Side (Mobile) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold shrink-0 transition-all md:hidden ${
                mobileMenuOpen
                  ? 'bg-amber-300 text-rose-950 border-amber-300 shadow-md'
                  : 'bg-rose-950/90 text-amber-200 border-amber-400/50 hover:bg-rose-900 hover:text-white'
              }`}
              title="Toggle Navigation Menu"
              aria-label="Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 text-rose-950" /> : <Menu className="w-4 h-4 text-amber-300" />}
              <span className="text-xs font-bold">Menu</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar - Visible on Desktop/Tablet Only (Hidden on Mobile, all menu options under 3-line menu) */}
        <div className="hidden md:block bg-gradient-to-r from-[#590412] via-[#6a0718] to-[#590412] border-t border-rose-900/60 px-4">
          <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto text-xs py-1.5 scrollbar-none no-scrollbar">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'quotations', label: 'Quotations', icon: FileText, badge: quotations.length },
              { id: 'invoices', label: 'Invoices', icon: FileCheck2, badge: invoices.length },
              { id: 'customers', label: 'Customers', icon: Users, badge: customers.length },
              { id: 'products', label: 'Products & Services', icon: Package },
              { id: 'payments', label: 'Payments', icon: Receipt },
              { id: 'settings', label: 'Settings', icon: SettingsIcon },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setViewingQuotationId(null);
                    setIsCreatingQuotation(false);
                    setViewingInvoiceId(null);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all shrink-0 whitespace-nowrap ${
                    isActive
                      ? 'bg-amber-300 text-rose-950 shadow-sm'
                      : 'text-amber-100/90 hover:text-white hover:bg-rose-900/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive
                          ? 'bg-rose-950 text-amber-200'
                          : 'bg-rose-950/80 text-amber-300/80'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#4d030e] border-t border-amber-400/30 p-3 shadow-2xl space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="text-[10px] uppercase font-bold text-amber-300/80 px-2 pb-1 border-b border-rose-900 flex justify-between items-center">
              <span>All Navigation Options</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-amber-300 hover:text-white text-xs font-bold"
              >
                Close ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'quotations', label: 'Quotations', icon: FileText, badge: quotations.length },
                { id: 'invoices', label: 'Tax Invoices', icon: FileCheck2, badge: invoices.length },
                { id: 'customers', label: 'Customers', icon: Users, badge: customers.length },
                { id: 'products', label: 'Products / Items', icon: Package },
                { id: 'payments', label: 'Payments Log', icon: Receipt },
                { id: 'settings', label: 'Settings', icon: SettingsIcon },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setViewingQuotationId(null);
                      setIsCreatingQuotation(false);
                      setViewingInvoiceId(null);
                      setMobileMenuOpen(false);
                    }}
                    className={`px-3 py-2.5 rounded-xl text-left font-bold text-xs flex items-center justify-between transition-all min-h-[44px] ${
                      isActive
                        ? 'bg-amber-300 text-rose-950 shadow'
                        : 'bg-rose-950/60 text-amber-100 hover:bg-rose-900 border border-rose-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon className="w-4 h-4 shrink-0 text-amber-400 group-hover:text-amber-300" />
                      <span className="truncate">{tab.label}</span>
                    </div>
                    {tab.badge !== undefined && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono shrink-0 ml-1 ${
                          isActive ? 'bg-rose-950 text-amber-200' : 'bg-rose-900 text-amber-300'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-rose-900/80">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowGlobalSearch(true);
                }}
                className="w-full py-2 px-3 bg-rose-900/60 hover:bg-rose-900 rounded-xl text-xs font-bold text-amber-200 flex items-center justify-center gap-1.5 border border-amber-400/20 min-h-[40px]"
              >
                <Search className="w-3.5 h-3.5 text-amber-300" />
                <span>Search Anything (Ctrl K)</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main App Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2.5 sm:p-6 lg:p-8">
        
        {/* VIEW 1: Quotation Document Viewer */}
        {viewingQuotationId && currentViewingQuotation ? (
          <QuotationDocument
            quotation={currentViewingQuotation}
            customer={currentQuotationCustomer}
            settings={settings}
            onBack={() => setViewingQuotationId(null)}
            onEdit={(id) => {
              setViewingQuotationId(null);
              setEditingQuotationId(id);
              setIsCreatingQuotation(true);
            }}
            onDuplicate={(id) => {
              const duplicated = db.duplicateQuotation(id);
              refreshData();
              if (duplicated) setViewingQuotationId(duplicated.id);
            }}
            onConvertToInvoice={handleConvertToInvoice}
            onStatusChange={(id, status) => {
              db.updateQuotationStatus(id, status as QuotationStatus);
              refreshData();
            }}
            onViewInvoice={(invId) => {
              setViewingQuotationId(null);
              setActiveTab('invoices');
              setViewingInvoiceId(invId);
            }}
          />
        ) : viewingInvoiceId && currentViewingInvoice ? (
          /* VIEW 2: Invoice Document Viewer */
          <InvoiceDocument
            invoice={currentViewingInvoice}
            customer={currentInvoiceCustomer}
            settings={settings}
            payments={currentInvoicePayments}
            onBack={() => setViewingInvoiceId(null)}
            onRecordPayment={(inv) => setPayingInvoice(inv)}
            onViewReceipt={(p) => setViewingReceiptPayment(p)}
          />
        ) : isCreatingQuotation ? (
          /* VIEW 3: Quotation Builder */
          <QuotationBuilder
            initialQuotation={
              editingQuotationId
                ? quotations.find((q) => q.id === editingQuotationId)
                : undefined
            }
            customers={customers}
            products={products}
            settings={settings}
            onSave={handleSaveQuotation}
            onCancel={() => {
              setIsCreatingQuotation(false);
              setEditingQuotationId(null);
            }}
            onQuickAddCustomer={() => setShowQuickAddCustomer(true)}
          />
        ) : (
          /* VIEW 4: Primary Tab Switcher */
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                quotations={quotations}
                invoices={invoices}
                payments={payments}
                customers={customers}
                settings={settings}
                onNewQuotation={() => handleStartNewQuotation()}
                onViewQuotation={(id) => setViewingQuotationId(id)}
                onViewInvoice={(id) => setViewingInvoiceId(id)}
                onRecordPayment={(inv) => setPayingInvoice(inv)}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'quotations' && (
              <QuotationsListView
                quotations={quotations}
                customers={customers}
                settings={settings}
                onNewQuotation={() => handleStartNewQuotation()}
                onViewQuotation={(id) => setViewingQuotationId(id)}
                onEditQuotation={(id) => {
                  setEditingQuotationId(id);
                  setIsCreatingQuotation(true);
                }}
                onDuplicateQuotation={(id) => {
                  const duped = db.duplicateQuotation(id);
                  refreshData();
                  if (duped) setViewingQuotationId(duped.id);
                }}
                onConvertToInvoice={handleConvertToInvoice}
                onDeleteQuotation={(id) => {
                  db.deleteQuotation(id);
                  refreshData();
                }}
              />
            )}

            {activeTab === 'invoices' && (
              <InvoicesListView
                invoices={invoices}
                customers={customers}
                settings={settings}
                onViewInvoice={(id) => setViewingInvoiceId(id)}
                onRecordPayment={(inv) => setPayingInvoice(inv)}
                onDeleteInvoice={(id) => {
                  db.deleteInvoice(id);
                  refreshData();
                }}
              />
            )}

            {activeTab === 'customers' && (
              <CustomersView
                customers={customers}
                quotations={quotations}
                invoices={invoices}
                payments={payments}
                onSaveCustomer={(data) => {
                  db.saveCustomer(data);
                  refreshData();
                }}
                onDeleteCustomer={(id) => {
                  db.deleteCustomer(id);
                  refreshData();
                }}
                onCreateQuotationForCustomer={(cId) => handleStartNewQuotation(cId)}
                onViewQuotation={(id) => setViewingQuotationId(id)}
                onViewInvoice={(id) => setViewingInvoiceId(id)}
                onViewPayment={(p) => setViewingReceiptPayment(p)}
              />
            )}

            {activeTab === 'products' && (
              <ProductsView
                products={products}
                onSaveProduct={(data) => {
                  db.saveProduct(data);
                  refreshData();
                }}
                onDeleteProduct={(id) => {
                  db.deleteProduct(id);
                  refreshData();
                }}
              />
            )}

            {activeTab === 'payments' && (
              <PaymentsListView
                payments={payments}
                customers={customers}
                invoices={invoices}
                onViewReceipt={(p) => setViewingReceiptPayment(p)}
                onUpdatePayment={(paymentId, data) => {
                  db.updatePayment(paymentId, data);
                  refreshData();
                }}
                onDeletePayment={(paymentId) => {
                  db.deletePayment(paymentId);
                  refreshData();
                }}
                onSelectInvoiceToPay={(inv) => {
                  setPayingInvoice(inv);
                }}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsView
                quotations={quotations}
                invoices={invoices}
                payments={payments}
                customers={customers}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                settings={settings}
                onUpdateSettings={(updated) => {
                  db.updateSettings(updated);
                  refreshData();
                }}
                onExportDatabase={() => {
                  const jsonStr = db.exportDatabaseJSON();
                  const blob = new Blob([jsonStr], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Vishwakarma_Interiors_Backup_${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                onImportDatabase={(json) => {
                  const ok = db.importDatabaseJSON(json);
                  if (ok) refreshData();
                  return ok;
                }}
                onResetDemo={() => {
                  db.resetToDemo();
                  refreshData();
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Record Payment Modal */}
      {payingInvoice && (
        <PaymentRecorderModal
          invoice={payingInvoice}
          customer={customers.find((c) => c.id === payingInvoice.customerId)}
          onClose={() => setPayingInvoice(null)}
          onSubmit={handleRecordPaymentSubmit}
        />
      )}

      {/* Payment Receipt Modal */}
      {viewingReceiptPayment && (
        <PaymentReceiptModal
          payment={viewingReceiptPayment}
          customer={customers.find((c) => c.id === viewingReceiptPayment.customerId)}
          invoice={invoices.find((i) => i.id === viewingReceiptPayment.invoiceId)}
          settings={settings}
          onClose={() => setViewingReceiptPayment(null)}
        />
      )}

      {/* Quick Add Customer Modal */}
      {showQuickAddCustomer && (
        <CustomerModal
          onClose={() => setShowQuickAddCustomer(false)}
          onSave={(custData) => {
            db.saveCustomer(custData);
            refreshData();
            setShowQuickAddCustomer(false);
          }}
        />
      )}

      {/* Global Spotlight Search Modal */}
      <GlobalSearchModal
        isOpen={showGlobalSearch}
        onClose={() => setShowGlobalSearch(false)}
        quotations={quotations}
        invoices={invoices}
        customers={customers}
        payments={payments}
        onSelectQuotation={(id) => {
          setActiveTab('quotations');
          setViewingQuotationId(id);
        }}
        onSelectInvoice={(id) => {
          setActiveTab('invoices');
          setViewingInvoiceId(id);
        }}
        onSelectCustomer={(id) => {
          setActiveTab('customers');
        }}
        onSelectPayment={(p) => {
          setViewingReceiptPayment(p);
        }}
      />
    </div>
  );
}
