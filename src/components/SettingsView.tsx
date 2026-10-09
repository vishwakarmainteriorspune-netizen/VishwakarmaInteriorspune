import React, { useState } from 'react';
import { CompanySettings } from '../types/database';
import { VishwakarmaEmblem } from './VishwakarmaLogo';
import { ConfirmModal } from './ConfirmModal';
import {
  Settings as SettingsIcon,
  Upload,
  Building,
  Phone,
  Mail,
  FileText,
  CreditCard,
  Save,
  CheckCircle2,
  RefreshCw,
  Download,
  AlertTriangle,
} from 'lucide-react';

interface SettingsViewProps {
  settings: CompanySettings;
  onUpdateSettings: (settings: Partial<CompanySettings>) => void;
  onExportDatabase: () => void;
  onImportDatabase: (jsonStr: string) => boolean;
  onResetDemo: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onExportDatabase,
  onImportDatabase,
  onResetDemo,
}) => {
  const [formData, setFormData] = useState<CompanySettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [termsText, setTermsText] = useState(settings.defaultTerms.join('\n'));
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const handleInputChange = (field: keyof CompanySettings, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleInputChange('logoUrl', reader.result);
        handleInputChange('useCustomLogo', true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedTerms = termsText
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

    onUpdateSettings({
      ...formData,
      defaultTerms: updatedTerms,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const success = onImportDatabase(reader.result);
        if (success) {
          setImportStatus({ type: 'success', msg: 'Database restored successfully! Reloading...' });
          setTimeout(() => window.location.reload(), 1000);
        } else {
          setImportStatus({ type: 'error', msg: 'Failed to parse database JSON file. Please ensure it is a valid export file.' });
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-amber-200/80 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-rose-900 text-amber-300 rounded-xl">
              <SettingsIcon className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">Business & System Settings</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Branding, contact info, bank details, prefixes, and default terms
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            Settings saved successfully!
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        
        {/* 1. Business Profile & Logo */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-amber-200/80 space-y-4">
          <h2 className="text-sm font-bold text-rose-950 uppercase tracking-wider border-b border-amber-100 pb-2">
            1. Business Branding & Logo
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-4 bg-amber-50/40 rounded-2xl border border-amber-200">
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="w-24 h-24 bg-white rounded-2xl border-2 border-amber-400 p-1 flex items-center justify-center shadow-md">
                {formData.useCustomLogo && formData.logoUrl ? (
                  <img
                    src={formData.logoUrl}
                    alt="Logo"
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : (
                  <VishwakarmaEmblem size={80} />
                )}
              </div>
              <span className="text-[10px] text-slate-500 font-semibold">
                {formData.useCustomLogo ? 'Custom Logo' : 'Vishwakarma Medallion'}
              </span>
            </div>

            <div className="space-y-2 flex-1 w-full text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <label className="cursor-pointer px-4 py-2.5 bg-rose-900 hover:bg-rose-950 text-white font-bold rounded-xl shadow-xs inline-flex items-center gap-2 min-h-[42px]">
                  <Upload className="w-4 h-4 text-amber-300" />
                  Upload Custom Logo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>

                {formData.useCustomLogo && (
                  <button
                    type="button"
                    onClick={() => {
                      handleInputChange('useCustomLogo', false);
                      handleInputChange('logoUrl', '');
                    }}
                    className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl min-h-[42px]"
                  >
                    Reset to Medallion
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Supports PNG, JPG, or SVG. This logo will appear on the top-left of all Quotation & Invoice PDFs.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Business Name:</label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs font-bold text-slate-900 min-h-[42px]"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tagline / Business Type:</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => handleInputChange('tagline', e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs font-medium text-slate-800 min-h-[42px]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Proprietor Name:</label>
              <input
                type="text"
                value={formData.proprietorName}
                onChange={(e) => handleInputChange('proprietorName', e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs text-slate-800 min-h-[42px]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Numbers (Phones):</label>
              <input
                type="text"
                value={formData.phones}
                onChange={(e) => handleInputChange('phones', e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs text-slate-800 font-medium min-h-[42px]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address:</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs text-slate-800 min-h-[42px]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Website URL:</label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs text-slate-800 min-h-[42px]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Business Address (Shown on Header):</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs text-slate-800 min-h-[42px]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">GSTIN:</label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => handleInputChange('gstin', e.target.value.toUpperCase())}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs font-mono uppercase min-h-[42px]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">PAN:</label>
              <input
                type="text"
                value={formData.pan}
                onChange={(e) => handleInputChange('pan', e.target.value.toUpperCase())}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs font-mono uppercase min-h-[42px]"
              />
            </div>
          </div>
        </div>

        {/* 2. Auspicious & Bank Details */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-amber-200/80 space-y-4">
          <h2 className="text-sm font-bold text-rose-950 uppercase tracking-wider border-b border-amber-100 pb-2">
            2. Auspicious Header & Bank Accounts
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showAusp"
                  checked={formData.showAuspiciousHeader}
                  onChange={(e) => handleInputChange('showAuspiciousHeader', e.target.checked)}
                  className="rounded text-rose-900 w-4 h-4"
                />
                <label htmlFor="showAusp" className="font-bold text-slate-800 cursor-pointer">
                  Show Auspicious Symbol in Header (॥ श्री ॥)
                </label>
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Auspicious Text:</label>
                <input
                  type="text"
                  value={formData.auspiciousHeader}
                  onChange={(e) => handleInputChange('auspiciousHeader', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs font-serif font-bold text-rose-900 bg-white min-h-[42px]"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showBank"
                  checked={formData.showBankDetails}
                  onChange={(e) => handleInputChange('showBankDetails', e.target.checked)}
                  className="rounded text-rose-900 w-4 h-4"
                />
                <label htmlFor="showBank" className="font-bold text-slate-800 cursor-pointer">
                  Display Bank Details on Documents
                </label>
              </div>
              <p className="text-[11px] text-slate-500">
                Helps clients make instant RTGS/NEFT/UPI deposits directly from quotation & invoice.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bank Name:</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => handleInputChange('bankName', e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs text-slate-800 min-h-[42px]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Account Number:</label>
              <input
                type="text"
                value={formData.bankAccountNo}
                onChange={(e) => handleInputChange('bankAccountNo', e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs font-mono text-slate-800 min-h-[42px]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">IFSC Code:</label>
              <input
                type="text"
                value={formData.bankIfsc}
                onChange={(e) => handleInputChange('bankIfsc', e.target.value.toUpperCase())}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs font-mono uppercase text-slate-800 min-h-[42px]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">UPI ID / Handle:</label>
              <input
                type="text"
                value={formData.upiId}
                onChange={(e) => handleInputChange('upiId', e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs font-mono text-rose-900 font-semibold min-h-[42px]"
              />
            </div>
          </div>
        </div>

        {/* 3. Document Numbering & Terms */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-amber-200/80 space-y-4">
          <h2 className="text-sm font-bold text-rose-950 uppercase tracking-wider border-b border-amber-100 pb-2">
            3. Document Numbering & Terms & Conditions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Quotation Prefix:</label>
              <input
                type="text"
                value={formData.quotationPrefix}
                onChange={(e) => handleInputChange('quotationPrefix', e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs font-mono min-h-[42px]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Invoice Prefix:</label>
              <input
                type="text"
                value={formData.invoicePrefix}
                onChange={(e) => handleInputChange('invoicePrefix', e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs font-mono min-h-[42px]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Receipt Prefix:</label>
              <input
                type="text"
                value={formData.receiptPrefix}
                onChange={(e) => handleInputChange('receiptPrefix', e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs font-mono min-h-[42px]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Standard Default Terms & Conditions (One per line):
            </label>
            <textarea
              rows={6}
              value={termsText}
              onChange={(e) => setTermsText(e.target.value)}
              className="w-full border border-slate-300 rounded-2xl p-3 font-sans leading-relaxed text-slate-800 text-xs"
            />
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end gap-3">
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 font-bold text-white bg-gradient-to-r from-rose-950 via-rose-900 to-[#780016] hover:from-[#780016] hover:to-rose-950 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 min-h-[44px]"
          >
            <Save className="w-4 h-4 text-amber-300" />
            <span>Save All Settings</span>
          </button>
        </div>

        {/* 4. Database Maintenance / Backup / Reset */}
        <div className="bg-amber-50/50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-amber-300 space-y-3">
          <h3 className="font-bold text-rose-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <RefreshCw className="w-4 h-4 text-amber-800" />
            Database Maintenance & Backups
          </h3>
          <p className="text-[11px] text-slate-600">
            Export all customers, quotations, invoices, and payments to a backup JSON file, or restore.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={onExportDatabase}
              className="px-4 py-2.5 font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl flex items-center justify-center gap-2 shadow-xs min-h-[42px]"
            >
              <Download className="w-4 h-4 text-amber-700" />
              <span>Backup Database (JSON)</span>
            </button>

            <label className="cursor-pointer px-4 py-2.5 font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl flex items-center justify-center gap-2 shadow-xs min-h-[42px]">
              <Upload className="w-4 h-4 text-rose-800" />
              <span>Restore Database</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="px-4 py-2.5 font-bold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl sm:ml-auto flex items-center justify-center gap-2 min-h-[42px]"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Reset to Demo Data</span>
            </button>
          </div>

          {importStatus && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold ${
                importStatus.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {importStatus.msg}
            </div>
          )}
        </div>
      </form>

      {/* Reset Demo Data Confirmation Modal */}
      <ConfirmModal
        isOpen={showResetConfirm}
        title="Reset to Demo Data"
        message="Are you sure you want to reset all data back to the default Vishwakarma Interiors initial state? Any custom quotations, invoices, and clients created will be replaced with sample demo records."
        confirmLabel="Yes, Reset Data"
        onConfirm={() => {
          setShowResetConfirm(false);
          onResetDemo();
          window.location.reload();
        }}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
};
