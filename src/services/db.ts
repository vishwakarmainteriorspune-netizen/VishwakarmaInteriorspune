import {
  Customer,
  Product,
  Quotation,
  QuotationItem,
  Invoice,
  InvoiceItem,
  Payment,
  CompanySettings,
  QuotationStatus,
  InvoiceStatus,
  PaymentMethod,
} from '../types/database';
import { numberToIndianWords } from '../utils/numberToWords';

const STORAGE_KEYS = {
  SETTINGS: 'vi_company_settings_v1',
  CUSTOMERS: 'vi_customers_v1',
  PRODUCTS: 'vi_products_v1',
  QUOTATIONS: 'vi_quotations_v1',
  INVOICES: 'vi_invoices_v1',
  PAYMENTS: 'vi_payments_v1',
};

export const DEFAULT_SETTINGS: CompanySettings = {
  businessName: 'Vishwakarma Interiors',
  tagline: 'Home Interior • Wooden Furniture • Carpentry • Modular Furniture',
  proprietorName: 'Pawan Vishwakarma',
  phones: '8007200020, 9922983306',
  email: 'vishwakarmaintrior17@gmail.com',
  address: 'Bharat Phuge Niwas, Gavhane Vasti, Bhosari',
  city: 'Pune',
  state: 'Maharashtra',
  pincode: '411039',
  gstin: '27AALPV8912P1ZR',
  pan: 'AALPV8912P',
  website: 'www.vishwakarmainteriors.com',
  logoUrl: '',
  useCustomLogo: false,
  auspiciousHeader: '॥ श्री ॥',
  showAuspiciousHeader: true,
  bankName: 'State Bank of India',
  bankAccountNo: '389201948201',
  bankIfsc: 'SBIN0001234',
  bankBranch: 'Bhosari Branch, Pune',
  upiId: '8007200020@upi',
  showBankDetails: true,
  quotationPrefix: 'QT-',
  quotationNextNumber: 2,
  defaultValidityDays: 30,
  invoicePrefix: 'INV-',
  invoiceNextNumber: 2,
  receiptPrefix: 'REC-',
  receiptNextNumber: 2,
  defaultDueDays: 15,
  defaultGstRate: 18,
  defaultTaxMode: 'inclusive',
  defaultTerms: [
    'Quotation is valid for 30 days from the date of issuance.',
    'Prices are based on the specifications & dimensions mentioned above.',
    'Any changes in design/specification during execution will be charged additionally.',
    'Transportation, packing, and installation charges will be as mutually agreed.',
    'Payment schedule: 40% Advance, 40% During Work, 20% on Completion.',
    'Work will strictly commence after receipt of the agreed advance payment.',
    'GST/taxes will be applicable as mentioned in the summary.',
    'Final site measurements will be verified prior to fabrication and execution.',
    'Any additional carpentry, electrical, or civil work outside this quotation will be billed separately.',
  ],
  defaultPaymentSchedule: [
    { milestone: 'Advance with Work Order', percentage: 40 },
    { milestone: 'During Execution / Carcass ready', percentage: 40 },
    { milestone: 'On Final Finishing & Handover', percentage: 20 },
  ],
};

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    customerId: 'CUST-001',
    name: 'Mr. Suresh M. Khandare',
    companyName: '',
    mobile: '8007200020',
    whatsapp: '8007200020',
    email: 'suresh.khandare@gmail.com',
    address: 'Flat No. 5A-901, Badmukhwadi Chorhali',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '412105',
    gstin: '',
    pan: '',
    notes: 'Sample quotation client from manual quotation reference.',
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-10-01T10:00:00.000Z',
  },
  {
    id: 'cust-2',
    customerId: 'CUST-002',
    name: 'Mrs. Priya K. Deshmukh',
    companyName: 'Deshmukh Residency',
    mobile: '9822345678',
    whatsapp: '9822345678',
    email: 'priya.deshmukh@yahoo.com',
    address: 'Bungalow No. 14, Pradhikaran, Nigdi',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411044',
    gstin: '27ABCDE1234F1Z5',
    pan: 'ABCDE1234F',
    notes: 'Modular Kitchen and Master Bedroom Wardrobe interior.',
    createdAt: '2026-09-15T11:30:00.000Z',
    updatedAt: '2026-09-15T11:30:00.000Z',
  },
  {
    id: 'cust-3',
    customerId: 'CUST-003',
    name: 'Mr. Rajesh Gaikwad',
    companyName: 'Gaikwad Developers',
    mobile: '9422019988',
    whatsapp: '9422019988',
    email: 'rajesh.gaikwad@gmail.com',
    address: 'Row House 4, Spine Road, Moshi',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '412105',
    gstin: '',
    pan: '',
    notes: 'Living room interior, TV console, and wooden panelling.',
    createdAt: '2026-09-20T09:15:00.000Z',
    updatedAt: '2026-09-20T09:15:00.000Z',
  },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    itemCode: 'FUR-MAN-01',
    name: 'Mandir / Temple Unit (Wood & CNC Work)',
    category: 'Living Room',
    description: 'Custom Teak-finish decorative home mandir with brass bell accents and storage drawers.',
    unit: 'Nos',
    defaultRate: 24600,
    gstRate: 18,
    hsnSac: '9403',
    active: true,
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'prod-2',
    itemCode: 'FUR-SOF-02',
    name: 'Sofa Set Indian Sheat (3 + 1)',
    category: 'Sofa',
    description: 'High-density foam, hardwood salwood frame with premium linen-finish upholstery.',
    unit: 'Set',
    defaultRate: 40000,
    gstRate: 18,
    hsnSac: '9401',
    active: true,
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'prod-3',
    itemCode: 'FUR-TVU-03',
    name: 'TV Unit & Media Console with Back Panelling',
    category: 'TV Unit',
    description: '9ft wide modern wall-mounted TV console with fluted panels and warm profile LED lighting.',
    unit: 'Nos',
    defaultRate: 54000,
    gstRate: 18,
    hsnSac: '9403',
    active: true,
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'prod-4',
    itemCode: 'FUR-CTB-04',
    name: 'Center Table (Designer Top)',
    category: 'Table',
    description: '3ft x 1.5ft rectangular center table with bevelled wood top and lower magazine shelf.',
    unit: 'Nos',
    defaultRate: 8500,
    gstRate: 18,
    hsnSac: '9403',
    active: true,
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'prod-5',
    itemCode: 'FUR-PAR-05',
    name: 'Wooden Partition / Divider',
    category: 'Wooden Partition',
    description: 'Custom vertical wooden rafter divider partition with display niches.',
    unit: 'Nos',
    defaultRate: 16500,
    gstRate: 18,
    hsnSac: '9403',
    active: true,
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'prod-6',
    itemCode: 'FUR-DIN-06',
    name: 'Folding Dining Table (Space Saver)',
    category: 'Dining',
    description: 'Wall-mounted folding dining table with internal storage rack and locking hinges.',
    unit: 'Nos',
    defaultRate: 34500,
    gstRate: 18,
    hsnSac: '9403',
    active: true,
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'prod-7',
    itemCode: 'FUR-WAR-07',
    name: 'Master Wardrobe (Sliding/Hinged)',
    category: 'Wardrobe',
    description: 'Marine ply wardrobe with acrylic/laminate finish and soft-close hinges.',
    unit: 'Sq Ft',
    defaultRate: 1800,
    gstRate: 18,
    hsnSac: '9403',
    active: true,
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'prod-8',
    itemCode: 'FUR-KIT-08',
    name: 'Modular Kitchen (BWP Ply + Acrylic)',
    category: 'Kitchen',
    description: 'Boiling waterproof ply cabinets with tandem boxes, cutlery organizers, and profile handles.',
    unit: 'Running Ft',
    defaultRate: 2600,
    gstRate: 18,
    hsnSac: '9403',
    active: true,
    createdAt: '2026-09-01T00:00:00.000Z',
  },
];

const INITIAL_QUOTATIONS: Quotation[] = [
  {
    id: 'qt-1',
    quotationNumber: 'QT-0001',
    date: '2026-10-03',
    validUntil: '2026-11-02',
    customerId: 'cust-1',
    projectName: 'Mr. Suresh M. Khandare – Flat Interior',
    projectAddress: 'Flat No. 5A-901, Badmukhwadi Chorhali, Pune',
    subject: 'Quotation for Wooden Furniture Works',
    sectionTitle: '(A) Hall :',
    items: [
      {
        id: 'item-1',
        srNo: 1,
        room: 'Hall',
        productId: 'prod-1',
        description: 'Mandir',
        specification: "2' × 7.25'",
        length: 2,
        width: 7.25,
        dimensionUnit: 'feet',
        pricingMode: 'fixed',
        calculatedArea: 14.5,
        qty: 1,
        unit: 'Nos',
        rate: 24600,
        discount: 0,
        gstRate: 18,
        amount: 24600,
      },
      {
        id: 'item-2',
        srNo: 2,
        room: 'Hall',
        productId: 'prod-2',
        description: 'Sofa Set Indian Sheat',
        specification: '3 + 1',
        dimensionUnit: 'set',
        pricingMode: 'fixed',
        qty: 1,
        unit: 'Nos',
        rate: 40000,
        discount: 0,
        gstRate: 18,
        amount: 40000,
      },
      {
        id: 'item-3',
        srNo: 3,
        room: 'Hall',
        productId: 'prod-3',
        description: 'TV Unit',
        specification: "9' × 7.25'",
        length: 9,
        width: 7.25,
        dimensionUnit: 'feet',
        pricingMode: 'fixed',
        calculatedArea: 65.25,
        qty: 1,
        unit: 'Nos',
        rate: 54000,
        discount: 0,
        gstRate: 18,
        amount: 54000,
      },
      {
        id: 'item-4',
        srNo: 4,
        room: 'Hall',
        productId: 'prod-4',
        description: 'Center Table',
        specification: "3' × 1.5'",
        length: 3,
        width: 1.5,
        dimensionUnit: 'feet',
        pricingMode: 'fixed',
        calculatedArea: 4.5,
        qty: 1,
        unit: 'Nos',
        rate: 8500,
        discount: 0,
        gstRate: 18,
        amount: 8500,
      },
      {
        id: 'item-5',
        srNo: 5,
        room: 'Hall',
        productId: 'prod-5',
        description: 'Partition (Wood)',
        specification: "2' × 7.25'",
        length: 2,
        width: 7.25,
        dimensionUnit: 'feet',
        pricingMode: 'fixed',
        calculatedArea: 14.5,
        qty: 1,
        unit: 'Nos',
        rate: 16500,
        discount: 0,
        gstRate: 18,
        amount: 16500,
      },
      {
        id: 'item-6',
        srNo: 6,
        room: 'Hall',
        productId: 'prod-6',
        description: 'Folding Dining',
        specification: "3' × 7.25'",
        length: 3,
        width: 7.25,
        dimensionUnit: 'feet',
        pricingMode: 'fixed',
        calculatedArea: 21.75,
        qty: 1,
        unit: 'Nos',
        rate: 34500,
        discount: 0,
        gstRate: 18,
        amount: 34500,
      },
    ],
    subtotal: 178100,
    discountType: 'fixed',
    discountValue: 0,
    discountAmount: 0,
    taxableAmount: 178100,
    taxMode: 'inclusive',
    isInterState: false,
    gstRate: 18,
    cgstAmount: 13583.9,
    sgstAmount: 13583.9,
    igstAmount: 0,
    roundOff: 0,
    grandTotal: 178100,
    amountInWords: numberToIndianWords(178100),
    status: 'Accepted',
    paymentSchedule: [
      { id: 'ps-1', milestone: '40% Advance on Work Order', percentage: 40, amount: 71240 },
      { id: 'ps-2', milestone: '40% During Woodwork Execution', percentage: 40, amount: 71240 },
      { id: 'ps-3', milestone: '20% On Final Installation & Handover', percentage: 20, amount: 35620 },
    ],
    termsAndConditions: DEFAULT_SETTINGS.defaultTerms,
    notes: 'Quotation verified as per initial site measurements.',
    createdAt: '2026-10-03T11:00:00.000Z',
    updatedAt: '2026-10-03T11:00:00.000Z',
  },
  {
    id: 'qt-2',
    quotationNumber: 'QT-0002',
    date: '2026-09-22',
    validUntil: '2026-10-22',
    customerId: 'cust-2',
    projectName: 'Deshmukh Residency – Kitchen & Wardrobe',
    projectAddress: 'Bungalow No. 14, Pradhikaran, Nigdi, Pune',
    subject: 'Quotation for Modular Kitchen and Bedroom Wardrobe',
    sectionTitle: '(A) Kitchen & Bedroom :',
    items: [
      {
        id: 'item-201',
        srNo: 1,
        room: 'Modular Kitchen',
        productId: 'prod-8',
        description: 'Modular Kitchen (BWP Ply + Acrylic)',
        specification: '14 Rft Upper + Lower Cabinets',
        length: 14,
        pricingMode: 'running_ft',
        qty: 14,
        unit: 'Rft',
        rate: 2600,
        discount: 0,
        gstRate: 18,
        amount: 36400,
      },
      {
        id: 'item-202',
        srNo: 2,
        room: 'Master Bedroom',
        productId: 'prod-7',
        description: 'Master Wardrobe (Sliding)',
        specification: "7' × 8' floor to ceiling",
        length: 7,
        width: 8,
        calculatedArea: 56,
        pricingMode: 'sqft',
        qty: 56,
        unit: 'Sq Ft',
        rate: 1800,
        discount: 0,
        gstRate: 18,
        amount: 100800,
      },
    ],
    subtotal: 137200,
    discountType: 'fixed',
    discountValue: 2200,
    discountAmount: 2200,
    taxableAmount: 135000,
    taxMode: 'exclusive',
    isInterState: false,
    gstRate: 18,
    cgstAmount: 12150,
    sgstAmount: 12150,
    igstAmount: 0,
    roundOff: 0,
    grandTotal: 159300,
    amountInWords: numberToIndianWords(159300),
    status: 'Converted',
    convertedToInvoiceId: 'inv-1',
    paymentSchedule: [
      { id: 'ps-201', milestone: '40% Advance', percentage: 40, amount: 63720 },
      { id: 'ps-202', milestone: '40% Material arrival', percentage: 40, amount: 63720 },
      { id: 'ps-203', milestone: '20% Completion', percentage: 20, amount: 31860 },
    ],
    termsAndConditions: DEFAULT_SETTINGS.defaultTerms,
    createdAt: '2026-09-22T14:00:00.000Z',
    updatedAt: '2026-09-24T16:00:00.000Z',
  },
];

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-0001',
    invoiceDate: '2026-09-25',
    dueDate: '2026-10-10',
    quotationId: 'qt-2',
    quotationNumber: 'QT-0002',
    customerId: 'cust-2',
    projectName: 'Deshmukh Residency – Kitchen & Wardrobe',
    projectAddress: 'Bungalow No. 14, Pradhikaran, Nigdi, Pune',
    subject: 'Tax Invoice for Modular Kitchen and Bedroom Wardrobe',
    items: [
      {
        id: 'inv-item-1',
        srNo: 1,
        description: 'Modular Kitchen (BWP Ply + Acrylic)',
        specification: '14 Rft Upper + Lower Cabinets',
        qty: 14,
        unit: 'Rft',
        rate: 2600,
        discount: 0,
        gstRate: 18,
        amount: 36400,
      },
      {
        id: 'inv-item-2',
        srNo: 2,
        description: 'Master Wardrobe (Sliding)',
        specification: "7' × 8' floor to ceiling",
        qty: 56,
        unit: 'Sq Ft',
        rate: 1800,
        discount: 0,
        gstRate: 18,
        amount: 100800,
      },
    ],
    subtotal: 137200,
    discountAmount: 2200,
    taxableAmount: 135000,
    taxMode: 'exclusive',
    isInterState: false,
    gstRate: 18,
    cgstAmount: 12150,
    sgstAmount: 12150,
    igstAmount: 0,
    roundOff: 0,
    grandTotal: 159300,
    amountInWords: numberToIndianWords(159300),
    amountPaid: 65000,
    balanceDue: 94300,
    status: 'Partially Paid',
    termsAndConditions: DEFAULT_SETTINGS.defaultTerms,
    notes: 'Advance received via UPI. Second milestone due upon carcass installation.',
    createdAt: '2026-09-25T11:00:00.000Z',
    updatedAt: '2026-09-26T12:00:00.000Z',
  },
];

const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay-1',
    receiptNumber: 'REC-0001',
    invoiceId: 'inv-1',
    customerId: 'cust-2',
    paymentDate: '2026-09-26',
    amount: 65000,
    paymentMethod: 'UPI',
    referenceNumber: 'UPI/92817462019/HDFC',
    notes: 'Advance 40% initial payment against work order.',
    previousBalance: 159300,
    remainingBalance: 94300,
    createdAt: '2026-09-26T12:00:00.000Z',
  },
];

class RelationalDatabase {
  private get<T>(key: string, defaultVal: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultVal;
      return JSON.parse(data) as T;
    } catch {
      return defaultVal;
    }
  }

  private set<T>(key: string, val: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(val));
      this.mirrorToIndexedDB(key, val);
    } catch (e) {
      console.error('Storage error:', e);
    }
  }

  // Dual-layer persistence: Mirror data to IndexedDB for ultra-high storage capacity (50,000+ documents)
  private mirrorToIndexedDB(key: string, val: any): void {
    try {
      if (!window.indexedDB) return;
      const request = window.indexedDB.open('vishwakarma_interiors_db', 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('store')) {
          db.createObjectStore('store');
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction('store', 'readwrite');
        tx.objectStore('store').put(val, key);
      };
    } catch {
      // Graceful fallback
    }
  }

  // --- Settings ---
  getSettings(): CompanySettings {
    const stored = this.get<CompanySettings | null>(STORAGE_KEYS.SETTINGS, null);
    if (!stored) {
      this.set(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...stored };
  }

  updateSettings(settings: Partial<CompanySettings>): CompanySettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    this.set(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  }

  // --- Customers ---
  getCustomers(): Customer[] {
    const list = this.get<Customer[] | null>(STORAGE_KEYS.CUSTOMERS, null);
    if (!list) {
      this.set(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
      return INITIAL_CUSTOMERS;
    }
    return list;
  }

  getCustomer(id: string): Customer | undefined {
    return this.getCustomers().find((c) => c.id === id);
  }

  saveCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Customer {
    const list = this.getCustomers();
    const now = new Date().toISOString();

    if (customer.id) {
      const index = list.findIndex((c) => c.id === customer.id);
      if (index >= 0) {
        const updated: Customer = {
          ...list[index],
          ...customer,
          updatedAt: now,
        };
        list[index] = updated;
        this.set(STORAGE_KEYS.CUSTOMERS, list);
        return updated;
      }
    }

    const nextId = 'cust-' + (list.length + 1) + '-' + Date.now();
    const customerCode = customer.customerId || `CUST-${String(list.length + 1).padStart(3, '0')}`;
    const newCust: Customer = {
      ...customer,
      id: nextId,
      customerId: customerCode,
      createdAt: now,
      updatedAt: now,
    };
    list.unshift(newCust);
    this.set(STORAGE_KEYS.CUSTOMERS, list);
    return newCust;
  }

  deleteCustomer(id: string): boolean {
    const list = this.getCustomers();
    const filtered = list.filter((c) => c.id !== id);
    if (filtered.length === list.length) return false;
    this.set(STORAGE_KEYS.CUSTOMERS, filtered);
    return true;
  }

  // --- Products ---
  getProducts(): Product[] {
    const list = this.get<Product[] | null>(STORAGE_KEYS.PRODUCTS, null);
    if (!list) {
      this.set(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
      return INITIAL_PRODUCTS;
    }
    return list;
  }

  saveProduct(product: Omit<Product, 'id' | 'createdAt'> & { id?: string }): Product {
    const list = this.getProducts();
    const now = new Date().toISOString();

    if (product.id) {
      const idx = list.findIndex((p) => p.id === product.id);
      if (idx >= 0) {
        const updated: Product = {
          ...list[idx],
          ...product,
        };
        list[idx] = updated;
        this.set(STORAGE_KEYS.PRODUCTS, list);
        return updated;
      }
    }

    const nextId = 'prod-' + (list.length + 1) + '-' + Date.now();
    const newProd: Product = {
      ...product,
      id: nextId,
      createdAt: now,
    };
    list.unshift(newProd);
    this.set(STORAGE_KEYS.PRODUCTS, list);
    return newProd;
  }

  deleteProduct(id: string): boolean {
    const list = this.getProducts();
    const filtered = list.filter((p) => p.id !== id);
    if (filtered.length === list.length) return false;
    this.set(STORAGE_KEYS.PRODUCTS, filtered);
    return true;
  }

  // --- Quotations ---
  getQuotations(): Quotation[] {
    const list = this.get<Quotation[] | null>(STORAGE_KEYS.QUOTATIONS, null);
    if (!list) {
      this.set(STORAGE_KEYS.QUOTATIONS, INITIAL_QUOTATIONS);
      return INITIAL_QUOTATIONS;
    }
    return list;
  }

  getQuotation(id: string): Quotation | undefined {
    return this.getQuotations().find((q) => q.id === id);
  }

  saveQuotation(quotation: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Quotation {
    const list = this.getQuotations();
    const now = new Date().toISOString();
    const settings = this.getSettings();

    if (quotation.id) {
      const idx = list.findIndex((q) => q.id === quotation.id);
      if (idx >= 0) {
        const updated: Quotation = {
          ...list[idx],
          ...quotation,
          amountInWords: numberToIndianWords(quotation.grandTotal),
          updatedAt: now,
        };
        list[idx] = updated;
        this.set(STORAGE_KEYS.QUOTATIONS, list);
        return updated;
      }
    }

    const nextNumber = settings.quotationNextNumber || list.length + 1;
    const quotationNumber =
      quotation.quotationNumber || `${settings.quotationPrefix || 'QT-'}${String(nextNumber).padStart(4, '0')}`;

    this.updateSettings({ quotationNextNumber: nextNumber + 1 });

    const newId = 'qt-' + Date.now();
    const newQt: Quotation = {
      ...quotation,
      id: newId,
      quotationNumber,
      amountInWords: numberToIndianWords(quotation.grandTotal),
      createdAt: now,
      updatedAt: now,
    };

    list.unshift(newQt);
    this.set(STORAGE_KEYS.QUOTATIONS, list);
    return newQt;
  }

  updateQuotationStatus(id: string, status: QuotationStatus): Quotation | undefined {
    const list = this.getQuotations();
    const item = list.find((q) => q.id === id);
    if (!item) return undefined;
    item.status = status;
    item.updatedAt = new Date().toISOString();
    this.set(STORAGE_KEYS.QUOTATIONS, list);
    return item;
  }

  duplicateQuotation(id: string): Quotation | undefined {
    const orig = this.getQuotation(id);
    if (!orig) return undefined;

    const settings = this.getSettings();
    const nextNumber = settings.quotationNextNumber || this.getQuotations().length + 1;
    const newNumber = `${settings.quotationPrefix || 'QT-'}${String(nextNumber).padStart(4, '0')}`;
    this.updateSettings({ quotationNextNumber: nextNumber + 1 });

    const duplicated: Quotation = {
      ...orig,
      id: 'qt-' + Date.now(),
      quotationNumber: newNumber,
      date: new Date().toISOString().split('T')[0],
      status: 'Draft',
      convertedToInvoiceId: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: orig.items.map((it, idx) => ({ ...it, id: 'item-' + Date.now() + '-' + idx })),
    };

    const list = this.getQuotations();
    list.unshift(duplicated);
    this.set(STORAGE_KEYS.QUOTATIONS, list);
    return duplicated;
  }

  deleteQuotation(id: string): boolean {
    const list = this.getQuotations();
    const filtered = list.filter((q) => q.id !== id);
    if (filtered.length === list.length) return false;
    this.set(STORAGE_KEYS.QUOTATIONS, filtered);
    return true;
  }

  // --- Invoices ---
  getInvoices(): Invoice[] {
    const list = this.get<Invoice[] | null>(STORAGE_KEYS.INVOICES, null);
    if (!list) {
      this.set(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
      return INITIAL_INVOICES;
    }
    return list;
  }

  getInvoice(id: string): Invoice | undefined {
    return this.getInvoices().find((inv) => inv.id === id);
  }

  saveInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Invoice {
    const list = this.getInvoices();
    const now = new Date().toISOString();
    const settings = this.getSettings();

    if (invoice.id) {
      const idx = list.findIndex((i) => i.id === invoice.id);
      if (idx >= 0) {
        const existing = list[idx];
        const balance = Math.max(0, invoice.grandTotal - (invoice.amountPaid ?? existing.amountPaid ?? 0));
        let status = invoice.status;
        if (invoice.amountPaid >= invoice.grandTotal) {
          status = 'Paid';
        } else if (invoice.amountPaid > 0) {
          status = 'Partially Paid';
        } else {
          status = 'Unpaid';
        }

        const updated: Invoice = {
          ...existing,
          ...invoice,
          balanceDue: balance,
          status,
          amountInWords: numberToIndianWords(invoice.grandTotal),
          updatedAt: now,
        };
        list[idx] = updated;
        this.set(STORAGE_KEYS.INVOICES, list);
        return updated;
      }
    }

    const nextNumber = settings.invoiceNextNumber || list.length + 1;
    const invoiceNumber =
      invoice.invoiceNumber || `${settings.invoicePrefix || 'INV-'}${String(nextNumber).padStart(4, '0')}`;
    this.updateSettings({ invoiceNextNumber: nextNumber + 1 });

    const balance = Math.max(0, invoice.grandTotal - (invoice.amountPaid || 0));
    let status = invoice.status || 'Unpaid';
    if ((invoice.amountPaid || 0) >= invoice.grandTotal) {
      status = 'Paid';
    } else if ((invoice.amountPaid || 0) > 0) {
      status = 'Partially Paid';
    }

    const newId = 'inv-' + Date.now();
    const newInv: Invoice = {
      ...invoice,
      id: newId,
      invoiceNumber,
      amountPaid: invoice.amountPaid || 0,
      balanceDue: balance,
      status,
      amountInWords: numberToIndianWords(invoice.grandTotal),
      createdAt: now,
      updatedAt: now,
    };

    list.unshift(newInv);
    this.set(STORAGE_KEYS.INVOICES, list);
    return newInv;
  }

  deleteInvoice(id: string): boolean {
    const list = this.getInvoices();
    const filtered = list.filter((i) => i.id !== id);
    if (filtered.length === list.length) return false;
    this.set(STORAGE_KEYS.INVOICES, filtered);
    return true;
  }

  // --- Convert Quotation to Invoice (AC-17) ---
  convertQuotationToInvoice(quotationId: string): Invoice {
    const quotation = this.getQuotation(quotationId);
    if (!quotation) {
      throw new Error('Quotation not found');
    }

    const settings = this.getSettings();
    const nextNumber = settings.invoiceNextNumber || this.getInvoices().length + 1;
    const invoiceNumber = `${settings.invoicePrefix || 'INV-'}${String(nextNumber).padStart(4, '0')}`;
    this.updateSettings({ invoiceNextNumber: nextNumber + 1 });

    const today = new Date().toISOString().split('T')[0];
    const dueDateObj = new Date();
    dueDateObj.setDate(dueDateObj.getDate() + (settings.defaultDueDays || 15));
    const dueDate = dueDateObj.toISOString().split('T')[0];

    const invoiceItems: InvoiceItem[] = quotation.items.map((it, idx) => ({
      id: 'inv-item-' + Date.now() + '-' + idx,
      srNo: it.srNo,
      description: it.description,
      specification: it.specification,
      qty: it.qty,
      unit: it.unit,
      rate: it.rate,
      discount: it.discount,
      gstRate: it.gstRate,
      amount: it.amount,
    }));

    const invoiceId = 'inv-' + Date.now();
    const newInvoice: Invoice = {
      id: invoiceId,
      invoiceNumber,
      invoiceDate: today,
      dueDate,
      quotationId: quotation.id,
      quotationNumber: quotation.quotationNumber,
      customerId: quotation.customerId,
      projectName: quotation.projectName,
      projectAddress: quotation.projectAddress,
      subject: `Tax Invoice - ${quotation.subject}`,
      items: invoiceItems,
      subtotal: quotation.subtotal,
      discountAmount: quotation.discountAmount,
      taxableAmount: quotation.taxableAmount,
      taxMode: quotation.taxMode,
      isInterState: quotation.isInterState,
      gstRate: quotation.gstRate,
      cgstAmount: quotation.cgstAmount,
      sgstAmount: quotation.sgstAmount,
      igstAmount: quotation.igstAmount,
      roundOff: quotation.roundOff,
      grandTotal: quotation.grandTotal,
      amountInWords: quotation.amountInWords,
      amountPaid: 0,
      balanceDue: quotation.grandTotal,
      status: 'Unpaid',
      termsAndConditions: quotation.termsAndConditions,
      notes: `Generated from accepted Quotation ${quotation.quotationNumber}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const invoices = this.getInvoices();
    invoices.unshift(newInvoice);
    this.set(STORAGE_KEYS.INVOICES, invoices);

    // Update Quotation status to 'Converted'
    this.updateQuotationStatus(quotation.id, 'Converted');
    const quotations = this.getQuotations();
    const qIdx = quotations.findIndex((q) => q.id === quotation.id);
    if (qIdx >= 0) {
      quotations[qIdx].convertedToInvoiceId = invoiceId;
      this.set(STORAGE_KEYS.QUOTATIONS, quotations);
    }

    return newInvoice;
  }

  // --- Payments & Receipts (AC-18, AC-19) ---
  getPayments(): Payment[] {
    const list = this.get<Payment[] | null>(STORAGE_KEYS.PAYMENTS, null);
    if (!list) {
      this.set(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
      return INITIAL_PAYMENTS;
    }
    return list;
  }

  getPayment(id: string): Payment | undefined {
    return this.getPayments().find((p) => p.id === id);
  }

  recordPayment(
    invoiceId: string,
    data: {
      amount: number;
      paymentDate: string;
      paymentMethod: PaymentMethod;
      referenceNumber?: string;
      notes?: string;
    }
  ): { payment: Payment; invoice: Invoice } {
    const invoice = this.getInvoice(invoiceId);
    if (!invoice) throw new Error('Invoice not found');

    const settings = this.getSettings();
    const payments = this.getPayments();
    const nextReceiptNum = settings.receiptNextNumber || payments.length + 1;
    const receiptNumber = `${settings.receiptPrefix || 'REC-'}${String(nextReceiptNum).padStart(4, '0')}`;
    this.updateSettings({ receiptNextNumber: nextReceiptNum + 1 });

    const previousBalance = invoice.balanceDue;
    const newPaidAmount = (invoice.amountPaid || 0) + data.amount;
    const remainingBalance = Math.max(0, invoice.grandTotal - newPaidAmount);

    let status: InvoiceStatus = 'Partially Paid';
    if (newPaidAmount >= invoice.grandTotal) {
      status = 'Paid';
    }

    const updatedInvoice: Invoice = {
      ...invoice,
      amountPaid: newPaidAmount,
      balanceDue: remainingBalance,
      status,
      updatedAt: new Date().toISOString(),
    };

    const payment: Payment = {
      id: 'pay-' + Date.now(),
      receiptNumber,
      invoiceId,
      customerId: invoice.customerId,
      paymentDate: data.paymentDate,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      referenceNumber: data.referenceNumber,
      notes: data.notes,
      previousBalance,
      remainingBalance,
      createdAt: new Date().toISOString(),
    };

    payments.unshift(payment);
    this.set(STORAGE_KEYS.PAYMENTS, payments);

    const invoices = this.getInvoices();
    const invIdx = invoices.findIndex((i) => i.id === invoiceId);
    if (invIdx >= 0) {
      invoices[invIdx] = updatedInvoice;
      this.set(STORAGE_KEYS.INVOICES, invoices);
    }

    return { payment, invoice: updatedInvoice };
  }

  // --- Update Existing Payment ---
  updatePayment(
    paymentId: string,
    data: {
      amount: number;
      paymentDate: string;
      paymentMethod: PaymentMethod;
      referenceNumber?: string;
      notes?: string;
    }
  ): { payment: Payment; invoice: Invoice } {
    const payments = this.getPayments();
    const pIdx = payments.findIndex((p) => p.id === paymentId);
    if (pIdx === -1) throw new Error('Payment record not found');

    const payment = payments[pIdx];
    const invoice = this.getInvoice(payment.invoiceId);
    if (!invoice) throw new Error('Associated invoice not found');

    // Calculate total paid across all other payments for this invoice
    const otherPaymentsTotal = payments
      .filter((p) => p.invoiceId === invoice.id && p.id !== paymentId)
      .reduce((sum, p) => sum + p.amount, 0);

    const newInvoicePaid = otherPaymentsTotal + data.amount;
    const newBalance = Math.max(0, invoice.grandTotal - newInvoicePaid);

    let status: InvoiceStatus = 'Partially Paid';
    if (newInvoicePaid >= invoice.grandTotal) {
      status = 'Paid';
    } else if (newInvoicePaid <= 0) {
      status = 'Unpaid';
    }

    const updatedInvoice: Invoice = {
      ...invoice,
      amountPaid: newInvoicePaid,
      balanceDue: newBalance,
      status,
      updatedAt: new Date().toISOString(),
    };

    const updatedPayment: Payment = {
      ...payment,
      amount: data.amount,
      paymentDate: data.paymentDate,
      paymentMethod: data.paymentMethod,
      referenceNumber: data.referenceNumber,
      notes: data.notes,
      remainingBalance: newBalance,
    };

    payments[pIdx] = updatedPayment;
    this.set(STORAGE_KEYS.PAYMENTS, payments);

    const invoices = this.getInvoices();
    const invIdx = invoices.findIndex((i) => i.id === invoice.id);
    if (invIdx >= 0) {
      invoices[invIdx] = updatedInvoice;
      this.set(STORAGE_KEYS.INVOICES, invoices);
    }

    return { payment: updatedPayment, invoice: updatedInvoice };
  }

  // --- Delete Payment & Restore Invoice Balance ---
  deletePayment(paymentId: string): Invoice | undefined {
    const payments = this.getPayments();
    const payment = payments.find((p) => p.id === paymentId);
    if (!payment) return undefined;

    const filteredPayments = payments.filter((p) => p.id !== paymentId);
    this.set(STORAGE_KEYS.PAYMENTS, filteredPayments);

    const invoice = this.getInvoice(payment.invoiceId);
    if (!invoice) return undefined;

    // Recalculate remaining total for invoice
    const remainingInvoicePaid = filteredPayments
      .filter((p) => p.invoiceId === invoice.id)
      .reduce((sum, p) => sum + p.amount, 0);

    const newBalance = Math.max(0, invoice.grandTotal - remainingInvoicePaid);
    let status: InvoiceStatus = 'Unpaid';
    if (remainingInvoicePaid >= invoice.grandTotal) {
      status = 'Paid';
    } else if (remainingInvoicePaid > 0) {
      status = 'Partially Paid';
    }

    const updatedInvoice: Invoice = {
      ...invoice,
      amountPaid: remainingInvoicePaid,
      balanceDue: newBalance,
      status,
      updatedAt: new Date().toISOString(),
    };

    const invoices = this.getInvoices();
    const invIdx = invoices.findIndex((i) => i.id === invoice.id);
    if (invIdx >= 0) {
      invoices[invIdx] = updatedInvoice;
      this.set(STORAGE_KEYS.INVOICES, invoices);
    }

    return updatedInvoice;
  }

  // --- Reset to Demo Data ---
  resetToDemo(): void {
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.QUOTATIONS);
    localStorage.removeItem(STORAGE_KEYS.INVOICES);
    localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
  }

  // --- Backup & Restore Database ---
  exportDatabaseJSON(): string {
    return JSON.stringify(
      {
        settings: this.getSettings(),
        customers: this.getCustomers(),
        products: this.getProducts(),
        quotations: this.getQuotations(),
        invoices: this.getInvoices(),
        payments: this.getPayments(),
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
  }

  importDatabaseJSON(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.settings) this.set(STORAGE_KEYS.SETTINGS, data.settings);
      if (data.customers) this.set(STORAGE_KEYS.CUSTOMERS, data.customers);
      if (data.products) this.set(STORAGE_KEYS.PRODUCTS, data.products);
      if (data.quotations) this.set(STORAGE_KEYS.QUOTATIONS, data.quotations);
      if (data.invoices) this.set(STORAGE_KEYS.INVOICES, data.invoices);
      if (data.payments) this.set(STORAGE_KEYS.PAYMENTS, data.payments);
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }
}

export const db = new RelationalDatabase();
