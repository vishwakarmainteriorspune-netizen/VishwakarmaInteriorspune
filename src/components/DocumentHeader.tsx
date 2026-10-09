import React from 'react';
import { CompanySettings } from '../types/database';
import { VishwakarmaEmblem } from './VishwakarmaLogo';

interface DocumentHeaderProps {
  settings: CompanySettings;
  documentType: 'QUOTATION' | 'TAX INVOICE' | 'PAYMENT RECEIPT';
  documentNumber: string;
  documentDate: string;
  validUntilOrDueDate?: string;
  validUntilOrDueDateLabel?: string;
  showAuspicious?: boolean;
}

export const DocumentHeader: React.FC<DocumentHeaderProps> = ({
  settings,
  documentType,
  documentNumber,
  documentDate,
  validUntilOrDueDate,
  validUntilOrDueDateLabel = 'Valid Until',
  showAuspicious = true,
}) => {
  return (
    <div className="w-full relative overflow-hidden bg-white">
      {/* Top Banner Structure inspired directly by uploaded quotation */}
      <div className="relative flex flex-col md:flex-row items-center justify-between min-h-[120px] bg-gradient-to-r from-amber-50 via-white to-amber-50/40 p-2 sm:p-3 border-b-2 border-amber-600/30">
        
        {/* Left: Authentic Logo / Medallion */}
        <div className="flex items-center gap-3 z-10 shrink-0 mb-3 md:mb-0">
          {settings.useCustomLogo && settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={settings.businessName}
              className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-lg drop-shadow"
            />
          ) : (
            <VishwakarmaEmblem size={88} className="drop-shadow-md" />
          )}
          
          <div className="md:hidden flex flex-col text-left">
            <span className="font-['Cinzel'] font-bold text-lg text-rose-950 tracking-wider">
              {settings.businessName}
            </span>
            <span className="text-[11px] font-semibold text-amber-700">
              {settings.tagline}
            </span>
          </div>
        </div>

        {/* Center & Right: Rich Maroon Ribbon Banner with Curved Golden Trim */}
        <div className="relative flex-1 md:ml-4 w-full">
          <div className="relative bg-gradient-to-r from-rose-950 via-rose-900 to-[#780016] text-white rounded-l-2xl md:rounded-l-3xl rounded-r-xl shadow-lg border border-amber-500/40 p-3 sm:px-6 sm:py-3 overflow-hidden">
            
            {/* Golden Decorative Corner Swirl (Left) */}
            <div className="absolute left-0 top-0 bottom-0 w-12 pointer-events-none opacity-25">
              <svg viewBox="0 0 50 100" className="h-full w-full fill-amber-300" preserveAspectRatio="none">
                <path d="M0 0 Q 30 20, 10 50 Q -10 80, 25 100 L 0 100 Z" />
              </svg>
            </div>

            {/* Top row: Proprietor & Phone numbers */}
            <div className="relative z-10 flex flex-wrap items-center justify-end text-[11px] sm:text-xs font-semibold text-amber-200 tracking-wide gap-2 border-b border-amber-400/20 pb-1 mb-1">
              <span>{settings.proprietorName}:</span>
              <span className="text-white font-bold">{settings.phones}</span>
            </div>

            {/* Main Business Title */}
            <div className="relative z-10 text-center md:text-left py-0.5">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black italic tracking-wide text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] font-sans">
                {settings.businessName}
              </h1>
              <div className="text-[11px] sm:text-xs font-medium text-amber-300/90 tracking-wide mt-0.5">
                {settings.tagline}
              </div>
            </div>

            {/* Bottom Details: Email & Address */}
            <div className="relative z-10 mt-1.5 pt-1 border-t border-amber-400/20 flex flex-col sm:flex-row items-center justify-between text-[10px] sm:text-[11px] text-amber-100 gap-1">
              <div className="truncate max-w-full">
                <span className="font-semibold text-amber-300">E-mail:</span> {settings.email}
              </div>
              <div className="text-right truncate max-w-full">
                <span className="font-semibold text-amber-300">Add:</span> {settings.address}
              </div>
            </div>

            {/* Gold Ribbon Trim Line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600"></div>
          </div>
        </div>
      </div>

      {/* Auspicious Blessing & Document Identifier Row */}
      <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 bg-gradient-to-r from-amber-50/60 via-amber-100/40 to-amber-50/60 border-b border-amber-300/40">
        
        {/* Left: Document Badge */}
        <div className="flex items-center gap-2">
          <span className="inline-block px-2.5 py-0.5 bg-rose-900 text-amber-200 font-bold text-xs uppercase tracking-wider rounded">
            {documentType}
          </span>
          <span className="text-sm font-extrabold text-slate-800">
            {documentNumber}
          </span>
        </div>

        {/* Center: Auspicious "॥ श्री ॥" Header */}
        {showAuspicious && settings.showAuspiciousHeader && (
          <div className="text-center">
            <span className="font-serif font-black text-rose-900 text-base sm:text-lg tracking-widest px-3 py-0.5 rounded-full bg-amber-100/80 border border-amber-400/40 shadow-xs">
              {settings.auspiciousHeader || '॥ श्री ॥'}
            </span>
          </div>
        )}

        {/* Right: Date and Due Date */}
        <div className="text-right text-xs">
          <div className="font-semibold text-slate-700">
            <span className="text-slate-500">Date: </span>
            <span className="font-bold text-slate-900">{documentDate}</span>
          </div>
          {validUntilOrDueDate && (
            <div className="text-[11px] text-slate-500">
              <span>{validUntilOrDueDateLabel}: </span>
              <span className="font-semibold text-rose-900">{validUntilOrDueDate}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const DocumentFooter: React.FC<{ settings: CompanySettings }> = ({ settings }) => {
  return (
    <div className="relative mt-8 pt-4 border-t-2 border-amber-500/30 text-slate-600 text-xs">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
        <div>
          <div className="font-bold text-rose-950 font-['Cinzel'] tracking-wide">
            Thank you for choosing {settings.businessName}!
          </div>
          <div className="text-[11px] text-amber-800 font-medium">
            {settings.tagline}
          </div>
        </div>

        <div className="text-[11px] text-slate-500 text-center md:text-right">
          <div>{settings.address}</div>
          <div className="font-medium text-slate-700">
            Tel: {settings.phones} | {settings.email}
          </div>
        </div>
      </div>

      {/* Decorative Bottom Corner Leaf / Swirl from uploaded quotation */}
      <div className="absolute right-0 bottom-0 pointer-events-none opacity-20 hidden print:block md:block">
        <svg width="110" height="70" viewBox="0 0 110 70" fill="none">
          <path
            d="M10 70 C 40 60, 80 50, 110 0 C 100 35, 80 65, 30 70 Z"
            fill="#D97706"
          />
          <path
            d="M40 70 C 60 50, 90 40, 110 20 C 95 45, 80 60, 50 70 Z"
            fill="#B45309"
          />
          <circle cx="95" cy="15" r="4" fill="#F59E0B" />
          <circle cx="80" cy="30" r="3" fill="#D97706" />
        </svg>
      </div>
    </div>
  );
};
