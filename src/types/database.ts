export type QuotationStatus = 'Draft' | 'Sent' | 'Viewed' | 'Accepted' | 'Rejected' | 'Expired' | 'Converted';

export type InvoiceStatus = 'Unpaid' | 'Partially Paid' | 'Paid' | 'Overdue' | 'Cancelled';

export type PaymentMethod = 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque' | 'Card' | 'Other';

export type PricingMode = 'fixed' | 'sqft' | 'running_ft' | 'unit' | 'custom';

export type DimensionUnit = 'feet' | 'inches' | 'meter' | 'centimeter' | 'sqft' | 'sqmeter' | 'running_ft' | 'nos' | 'set' | 'lot';

export type TaxMode = 'exclusive' | 'inclusive' | 'none';

export interface Customer {
  id: string;
  customerId: string; // e.g. CUST-001
  name: string;
  companyName?: string;
  mobile: string;
  whatsapp?: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstin?: string;
  pan?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  itemCode: string;
  name: string;
  category: string;
  description?: string;
  unit: string;
  defaultRate: number;
  gstRate: number;
  hsnSac?: string;
  active: boolean;
  createdAt: string;
}

export interface QuotationItem {
  id: string;
  srNo: number;
  room?: string; // e.g. "Hall / Living Room", "Master Bedroom", "Kitchen", etc.
  productId?: string;
  description: string;
  specification: string; // e.g. 2' x 7.25' or 3 + 1
  length?: number;
  width?: number;
  height?: number;
  dimensionUnit?: DimensionUnit;
  pricingMode: PricingMode;
  calculatedArea?: number;
  qty: number;
  unit: string; // Nos, Set, Sq Ft, Rft, Lot
  rate: number;
  discount: number; // percentage or fixed
  gstRate: number; // e.g. 18
  amount: number;
}

export interface PaymentScheduleItem {
  id: string;
  milestone: string; // e.g. "Advance Payment", "During Work", "On Completion"
  percentage: number; // e.g. 40
  amount: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string; // e.g. QT-0001
  date: string;
  validUntil: string;
  customerId: string;
  projectName: string;
  projectAddress: string;
  subject: string;
  sectionTitle?: string; // e.g. "(A) Hall :" from sample
  items: QuotationItem[];
  subtotal: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
  taxableAmount: number;
  taxMode: TaxMode;
  isInterState: boolean; // within state (CGST+SGST) vs outside (IGST)
  gstRate: number; // e.g. 18
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  roundOff: number;
  grandTotal: number;
  amountInWords: string;
  status: QuotationStatus;
  paymentSchedule: PaymentScheduleItem[];
  termsAndConditions: string[];
  notes?: string;
  convertedToInvoiceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  srNo: number;
  description: string;
  specification: string;
  qty: number;
  unit: string;
  rate: number;
  discount: number;
  gstRate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. INV-0001
  invoiceDate: string;
  dueDate: string;
  quotationId?: string;
  quotationNumber?: string;
  customerId: string;
  projectName: string;
  projectAddress: string;
  subject: string;
  items: InvoiceItem[];
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxMode: TaxMode;
  isInterState: boolean;
  gstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  roundOff: number;
  grandTotal: number;
  amountInWords: string;
  amountPaid: number;
  balanceDue: number;
  status: InvoiceStatus;
  termsAndConditions: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  receiptNumber: string; // e.g. REC-0001
  invoiceId: string;
  customerId: string;
  paymentDate: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
  previousBalance: number;
  remainingBalance: number;
  createdAt: string;
}

export interface CompanySettings {
  businessName: string;
  tagline: string;
  proprietorName: string;
  phones: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstin: string;
  pan: string;
  website: string;
  logoUrl: string; // base64 or SVG
  useCustomLogo: boolean;
  auspiciousHeader: string; // "॥ श्री ॥"
  showAuspiciousHeader: boolean;
  bankName: string;
  bankAccountNo: string;
  bankIfsc: string;
  bankBranch: string;
  upiId: string;
  showBankDetails: boolean;
  quotationPrefix: string;
  quotationNextNumber: number;
  defaultValidityDays: number;
  invoicePrefix: string;
  invoiceNextNumber: number;
  receiptPrefix: string;
  receiptNextNumber: number;
  defaultDueDays: number;
  defaultGstRate: number;
  defaultTaxMode: TaxMode;
  defaultTerms: string[];
  defaultPaymentSchedule: { milestone: string; percentage: number }[];
}
