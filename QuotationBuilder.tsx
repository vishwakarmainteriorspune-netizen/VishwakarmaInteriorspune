import React, { useState, useEffect } from 'react';
import {
  Quotation,
  QuotationItem,
  Customer,
  Product,
  CompanySettings,
  TaxMode,
  PricingMode,
  DimensionUnit,
  PaymentScheduleItem,
} from '../types/database';
import { formatINR, numberToIndianWords } from '../utils/numberToWords';
import {
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Calculator,
  Save,
  Eye,
  UserPlus,
  Search,
  Sparkles,
  HelpCircle,
  FileCheck2,
  Home,
  Layers,
  FolderPlus,
} from 'lucide-react';

export const STANDARD_ROOMS = [
  'Living Room / Hall',
  'Master Bedroom',
  'Modular Kitchen',
  'Kids Bedroom',
  'Dining Area',
  'Pooja Room / Mandir',
  'Guest Bedroom',
  'Foyer / Entrance',
  'Balcony / Terrace',
  'Study Room',
  'Passage / Common Area',
  'Bathroom / Vanity',
];

interface QuotationBuilderProps {
  initialQuotation?: Quotation;
  customers: Customer[];
  products: Product[];
  settings: CompanySettings;
  onSave: (quotationData: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  onCancel: () => void;
  onQuickAddCustomer: () => void;
}

export const QuotationBuilder: React.FC<QuotationBuilderProps> = ({
  initialQuotation,
  customers,
  products,
  settings,
  onSave,
  onCancel,
  onQuickAddCustomer,
}) => {
  // Quotation header state
  const [quotationNumber, setQuotationNumber] = useState(
    initialQuotation?.quotationNumber ||
      `${settings.quotationPrefix || 'QT-'}${String(settings.quotationNextNumber || 1).padStart(4, '0')}`
  );
  const [date, setDate] = useState(
    initialQuotation?.date || new Date().toISOString().split('T')[0]
  );
  
  // Set default validity to 30 days
  const defaultValidDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + (settings.defaultValidityDays || 30));
    return d.toISOString().split('T')[0];
  };
  const [validUntil, setValidUntil] = useState(initialQuotation?.validUntil || defaultValidDate());

  // Customer selection
  const [customerId, setCustomerId] = useState(
    initialQuotation?.customerId || customers[0]?.id || ''
  );
  const selectedCustomer = customers.find((c) => c.id === customerId);

  // Project details
  const [projectName, setProjectName] = useState(
    initialQuotation?.projectName ||
      (selectedCustomer ? `${selectedCustomer.name} – Flat Interior` : 'Flat Interior Woodwork')
  );
  const [projectAddress, setProjectAddress] = useState(
    initialQuotation?.projectAddress || selectedCustomer?.address || ''
  );
  const [subject, setSubject] = useState(
    initialQuotation?.subject || 'Quotation for Wooden Furniture Works'
  );
  const [sectionTitle, setSectionTitle] = useState(
    initialQuotation?.sectionTitle || '(A) Hall :'
  );

  // When customer changes, autofill project name & address if empty or default
  const handleCustomerChange = (newCustId: string) => {
    setCustomerId(newCustId);
    const cust = customers.find((c) => c.id === newCustId);
    if (cust) {
      if (!projectName || projectName.includes('Flat Interior')) {
        setProjectName(`${cust.name} – Flat Interior`);
      }
      setProjectAddress(cust.address);
    }
  };

  // Items list with item-wise room support
  const [items, setItems] = useState<QuotationItem[]>(
    initialQuotation?.items && initialQuotation.items.length > 0
      ? initialQuotation.items.map((it) => ({
          ...it,
          room:
            it.room?.trim() ||
            initialQuotation.sectionTitle
              ?.replace(/^\([A-Za-z0-9]+\)\s*/, '')
              .replace(/:+$/, '')
              .trim() ||
            'Living Room / Hall',
        }))
      : [
          {
            id: 'item-' + Date.now(),
            srNo: 1,
            room: 'Living Room / Hall',
            description: 'Mandir / Temple Unit',
            specification: "2' × 7.25'",
            length: 2,
            width: 7.25,
            calculatedArea: 14.5,
            pricingMode: 'fixed',
            qty: 1,
            unit: 'Nos',
            rate: 24600,
            discount: 0,
            gstRate: 18,
            amount: 24600,
          },
        ]
  );

  // Active room names in this quotation
  const existingRooms = React.useMemo(() => {
    const list: string[] = [];
    items.forEach((it) => {
      const r = (it.room || 'Living Room / Hall').trim();
      if (r && !list.includes(r)) {
        list.push(r);
      }
    });
    return list.length > 0 ? list : ['Living Room / Hall'];
  }, [items]);

  // Combined options for datalist
  const allRoomOptions = React.useMemo(() => {
    const set = new Set([...STANDARD_ROOMS, ...existingRooms]);
    return Array.from(set);
  }, [existingRooms]);

  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [customRoomInput, setCustomRoomInput] = useState('');

  const handleAddNewRoom = (roomName: string) => {
    const trimmed = roomName.trim();
    if (!trimmed) return;
    addItem(trimmed);
    setShowAddRoomModal(false);
    setCustomRoomInput('');
  };

  // Active dimension calculator modal state
  const [dimensionItemIndex, setDimensionItemIndex] = useState<number | null>(null);
  const [formError, setFormError] = useState('');

  // Taxes and Discounts (Tax disabled as per user requirement)
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>(
    initialQuotation?.discountType || 'fixed'
  );
  const [discountValue, setDiscountValue] = useState<number>(
    initialQuotation?.discountValue || 0
  );
  const [taxMode] = useState<TaxMode>('none');
  const [isInterState] = useState<boolean>(false);
  const [gstRate] = useState<number>(0);
  const [enableRoundOff, setEnableRoundOff] = useState<boolean>(true);

  // Terms and payment schedule
  const [terms, setTerms] = useState<string[]>(
    initialQuotation?.termsAndConditions || settings.defaultTerms
  );
  const [paymentSchedule, setPaymentSchedule] = useState<PaymentScheduleItem[]>(
    initialQuotation?.paymentSchedule || [
      { id: 'ps-1', milestone: '40% Advance on Work Order', percentage: 40, amount: 0 },
      { id: 'ps-2', milestone: '40% During Woodwork Execution', percentage: 40, amount: 0 },
      { id: 'ps-3', milestone: '20% On Final Installation & Handover', percentage: 20, amount: 0 },
    ]
  );
  const [notes, setNotes] = useState<string>(initialQuotation?.notes || '');

  // Calculated totals
  const [subtotal, setSubtotal] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [taxableAmount, setTaxableAmount] = useState(0);
  const [cgstAmount, setCgstAmount] = useState(0);
  const [sgstAmount, setSgstAmount] = useState(0);
  const [igstAmount, setIgstAmount] = useState(0);
  const [roundOff, setRoundOff] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  // Recalculate financial breakdown without tax
  useEffect(() => {
    const rawSubtotal = items.reduce((acc, it) => acc + (Number(it.amount) || 0), 0);
    setSubtotal(rawSubtotal);

    let calculatedDiscount = 0;
    if (discountType === 'percentage') {
      calculatedDiscount = (rawSubtotal * (Number(discountValue) || 0)) / 100;
    } else {
      calculatedDiscount = Number(discountValue) || 0;
    }
    calculatedDiscount = Math.min(rawSubtotal, calculatedDiscount);
    setDiscountAmount(calculatedDiscount);

    const afterDiscount = Math.max(0, rawSubtotal - calculatedDiscount);
    const finalTotal = afterDiscount;

    setTaxableAmount(0);
    setCgstAmount(0);
    setSgstAmount(0);
    setIgstAmount(0);

    let roundedTotal = Math.round(finalTotal);
    let diff = enableRoundOff ? roundedTotal - finalTotal : 0;
    setRoundOff(Math.round(diff * 100) / 100);
    setGrandTotal(enableRoundOff ? roundedTotal : Math.round(finalTotal * 100) / 100);

    // Update payment schedule amounts
    setPaymentSchedule((prev) =>
      prev.map((ps) => ({
        ...ps,
        amount: Math.round((roundedTotal * ps.percentage) / 100),
      }))
    );
  }, [items, discountType, discountValue, enableRoundOff]);

  // Handle item changes
  const updateItem = (index: number, field: keyof QuotationItem, val: any) => {
    setItems((prev) => {
      const copy = [...prev];
      const item = { ...copy[index], [field]: val };

      // When pricingMode changes, intelligently adapt default unit and quantities
      if (field === 'pricingMode') {
        if (val === 'sqft') {
          item.unit = 'Sq Ft';
          if (item.length && item.width) {
            const area =
              item.dimensionUnit === 'inches'
                ? Math.round(((item.length * item.width) / 144) * 100) / 100
                : Math.round(item.length * item.width * 100) / 100;
            item.calculatedArea = area;
            item.qty = area > 0 ? area : 1;
          }
        } else if (val === 'running_ft') {
          item.unit = 'Rft';
          if (item.length) {
            item.qty = item.length;
          }
        } else if (val === 'unit') {
          if (item.unit === 'Sq Ft' || item.unit === 'Rft') {
            item.unit = 'Nos';
            item.qty = 1;
          }
        } else if (val === 'fixed') {
          if (item.unit === 'Sq Ft' || item.unit === 'Rft') {
            item.unit = 'Nos';
            item.qty = 1;
          }
        }
      }

      // Recalculate amount based on pricing mode if rate or qty or dimensions changed
      if (
        field === 'qty' ||
        field === 'rate' ||
        field === 'pricingMode' ||
        field === 'length' ||
        field === 'width' ||
        field === 'dimensionUnit' ||
        field === 'unit' ||
        field === 'discount'
      ) {
        let calcArea = 0;
        if (item.length && item.width) {
          if (item.dimensionUnit === 'inches') {
            calcArea = Math.round(((item.length * item.width) / 144) * 100) / 100;
          } else {
            calcArea = Math.round(item.length * item.width * 100) / 100;
          }
          item.calculatedArea = calcArea;

          // Auto-sync specification if empty or was previously a dimension string
          if (!item.specification || item.specification.includes("'") || item.specification.includes('"')) {
            const unitSymbol = item.dimensionUnit === 'inches' ? '"' : "'";
            item.specification = `${item.length}${unitSymbol} × ${item.width}${unitSymbol}`;
          }
        }

        let basePrice = 0;

        if (item.pricingMode === 'sqft') {
          // If length or width was edited, and unit is 'Sq Ft', keep qty synced with area
          if (
            (field === 'length' || field === 'width' || field === 'dimensionUnit') &&
            item.unit === 'Sq Ft' &&
            calcArea > 0
          ) {
            item.qty = calcArea;
          }

          if (item.unit === 'Sq Ft') {
            // Billable area is item.qty (defaulted to calcArea)
            const billableArea = item.qty || calcArea || 1;
            basePrice = billableArea * (item.rate || 0);
          } else {
            // e.g. 2 Nos wardrobes of 56 sq ft each
            const areaPerPiece = calcArea > 0 ? calcArea : 1;
            basePrice = (item.qty || 1) * areaPerPiece * (item.rate || 0);
          }
        } else if (item.pricingMode === 'running_ft') {
          if (field === 'length' && item.unit === 'Rft' && item.length) {
            item.qty = item.length;
          }
          const billableLength = item.qty || item.length || 1;
          basePrice = billableLength * (item.rate || 0);
        } else if (item.pricingMode === 'fixed') {
          // Fixed Lump Sum pricing: Rate is the fixed total amount per unit
          basePrice = (item.qty || 1) * (item.rate || 0);
        } else if (item.pricingMode === 'unit') {
          // Per Unit (Nos/Set) pricing: Qty × Rate
          basePrice = (item.qty || 1) * (item.rate || 0);
        } else {
          // Custom
          basePrice = (item.qty || 1) * (item.rate || 0);
        }

        const disc = (basePrice * (item.discount || 0)) / 100;
        item.amount = Math.round(basePrice - disc);
      }

      copy[index] = item;
      return copy;
    });
  };

  const addItem = (roomName?: string) => {
    const lastItemRoom = items.length > 0 ? items[items.length - 1].room : undefined;
    const assignedRoom = (roomName || lastItemRoom || 'Living Room / Hall').trim();

    const newItem: QuotationItem = {
      id: 'item-' + Date.now(),
      srNo: items.length + 1,
      room: assignedRoom,
      description: '',
      specification: '',
      pricingMode: 'fixed',
      qty: 1,
      unit: 'Nos',
      rate: 0,
      discount: 0,
      gstRate: 18,
      amount: 0,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    const filtered = items.filter((_, i) => i !== index);
    const renumbered = filtered.map((it, idx) => ({ ...it, srNo: idx + 1 }));
    setItems(renumbered);
  };

  const duplicateItem = (index: number) => {
    const orig = items[index];
    const dupe: QuotationItem = {
      ...orig,
      id: 'item-' + Date.now(),
      srNo: index + 2,
      room: orig.room || 'Living Room / Hall',
    };
    const nextList = [...items];
    nextList.splice(index + 1, 0, dupe);
    setItems(nextList.map((it, idx) => ({ ...it, srNo: idx + 1 })));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === items.length - 1)
    )
      return;
    const nextList = [...items];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = nextList[index];
    nextList[index] = nextList[targetIdx];
    nextList[targetIdx] = temp;
    setItems(nextList.map((it, idx) => ({ ...it, srNo: idx + 1 })));
  };

  const selectProductForItem = (index: number, product: Product) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        productId: product.id,
        description: product.name,
        unit: product.unit,
        rate: product.defaultRate,
        gstRate: product.gstRate || 18,
        amount: product.defaultRate * (copy[index].qty || 1),
      };
      return copy;
    });
  };

  const handleSaveQuotation = (status: Quotation['status'] = 'Draft') => {
    if (!customerId) {
      setFormError('Please select or create a customer before saving the quotation.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (items.length === 0 || items.some((it) => !it.description.trim())) {
      setFormError('Please provide descriptions for all items in the quotation.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setFormError('');

    // Generate clean sectionTitle representing all rooms (e.g. "(A) Hall / (B) Kitchen")
    const primarySectionTitle =
      existingRooms.length > 0
        ? existingRooms
            .map((r, i) => `(${String.fromCharCode(65 + (i % 26))}) ${r}`)
            .join(' / ')
        : sectionTitle || '(A) Living Room / Hall :';

    const payload: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt'> & { id?: string } = {
      id: initialQuotation?.id,
      quotationNumber,
      date,
      validUntil,
      customerId,
      projectName,
      projectAddress,
      subject,
      sectionTitle: primarySectionTitle,
      items,
      subtotal,
      discountType,
      discountValue,
      discountAmount,
      taxableAmount,
      taxMode,
      isInterState,
      gstRate,
      cgstAmount,
      sgstAmount,
      igstAmount,
      roundOff,
      grandTotal,
      amountInWords: numberToIndianWords(grandTotal),
      status: initialQuotation?.status || status,
      paymentSchedule,
      termsAndConditions: terms,
      notes,
    };

    onSave(payload);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      {/* Top Header / Title */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-xs border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-rose-900 text-amber-300 rounded-xl shrink-0">
              <Calculator className="w-5 h-5" />
            </span>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">
              {initialQuotation ? 'Edit Quotation' : 'Create New Quotation'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Build interior quotation with dimension calculators, GST modes, and authentic branding
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 sm:flex-initial px-3 sm:px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors min-h-[42px] text-center"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => handleSaveQuotation('Draft')}
            className="flex-1 sm:flex-initial px-3 sm:px-4 py-2.5 text-xs font-bold text-slate-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition-colors shadow-2xs flex items-center justify-center gap-1.5 min-h-[42px]"
          >
            <Save className="w-4 h-4 text-amber-800 shrink-0" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={() => handleSaveQuotation('Sent')}
            className="flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-rose-950 via-rose-900 to-[#780016] hover:from-[#780016] hover:to-rose-950 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 min-h-[42px]"
          >
            <FileCheck2 className="w-4 h-4 text-amber-300 shrink-0" />
            <span>Save & Finalize</span>
          </button>
        </div>
      </div>

      {formError && (
        <div className="p-4 bg-rose-50 border border-rose-300 text-rose-900 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
            <span>{formError}</span>
          </div>
          <button
            type="button"
            onClick={() => setFormError('')}
            className="text-rose-600 hover:text-rose-950 font-bold px-2 py-1 rounded-lg hover:bg-rose-100"
          >
            ✕ Dismiss
          </button>
        </div>
      )}

      {/* Main Quotation Header Information */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xs border border-amber-200/80 space-y-4 sm:space-y-5">
        <h2 className="text-sm font-bold text-rose-950 uppercase tracking-wider border-b border-amber-100 pb-2">
          1. Document & Customer Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Quotation No:</label>
            <input
              type="text"
              value={quotationNumber}
              onChange={(e) => setQuotationNumber(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs font-bold text-rose-950 bg-amber-50/30 min-h-[42px]"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Quotation Date:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs font-medium text-slate-800 bg-white min-h-[42px]"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Valid Until:</label>
            <input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs font-medium text-slate-800 bg-white min-h-[42px]"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-slate-700">Customer:</label>
              <button
                type="button"
                onClick={onQuickAddCustomer}
                className="text-[11px] sm:text-[10px] text-rose-900 font-bold hover:underline flex items-center gap-1 py-0.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                + New Customer
              </button>
            </div>
            <select
              value={customerId}
              onChange={(e) => handleCustomerChange(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs font-semibold text-slate-900 bg-white min-h-[42px]"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.mobile ? `(${c.mobile})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Customer Auto-filled Info Preview */}
        {selectedCustomer && (
          <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-slate-500">Address: </span>
              <span className="font-medium text-slate-800">
                {selectedCustomer.address}
                {selectedCustomer.city ? `, ${selectedCustomer.city}` : ''}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <span>
                <strong className="text-slate-500 font-normal">Mobile: </strong>
                <span className="font-semibold text-slate-900">{selectedCustomer.mobile}</span>
              </span>
              {selectedCustomer.email && (
                <span>
                  <strong className="text-slate-500 font-normal">Email: </strong>
                  <span className="text-slate-800">{selectedCustomer.email}</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Project Scope & Subject Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Project Name:</label>
            <input
              type="text"
              placeholder="e.g. Mr. Suresh – Flat Interior"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs text-slate-800 min-h-[42px]"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Project Site Address:</label>
            <input
              type="text"
              placeholder="e.g. Flat No. 5A-901, Badmukhwadi Chorhali, Pune"
              value={projectAddress}
              onChange={(e) => setProjectAddress(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs text-slate-800 min-h-[42px]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Subject:</label>
            <input
              type="text"
              placeholder="e.g. Quotation for Wooden Furniture Works"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs text-slate-800 font-semibold min-h-[42px]"
            />
          </div>
        </div>

        <div className="bg-amber-50/60 p-3 sm:p-4 rounded-xl border border-amber-200/80">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <label className="block font-bold text-rose-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-800" />
              Room-Wise Interior Scope ({existingRooms.length} {existingRooms.length === 1 ? 'Room' : 'Rooms'})
            </label>
            <span className="text-[11px] text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-full font-bold">
              Configured Item-Wise in Section 2 Below
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {existingRooms.map((roomName, idx) => (
              <span
                key={roomName}
                className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-amber-300 text-xs font-semibold text-slate-800 shadow-2xs"
              >
                <strong className="font-serif text-rose-900 font-bold">
                  ({String.fromCharCode(65 + (idx % 26))})
                </strong>
                {roomName}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            💡 Standard room-wise layout: Assign each interior item to its room (Hall, Bedroom, Kitchen, etc.) below in Section 2. The quotation will automatically create clear room sections with (A), (B), (C) headers and room subtotals.
          </p>
        </div>
      </div>

      {/* Item Table & Dimension Calculation */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xs border border-amber-200/80 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-rose-950 uppercase tracking-wider">
              2. Furniture & Interior Items ({items.length})
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Add items and categorize by room (Hall, Bedroom, Kitchen, etc.). Use dimension calculator for length × width pricing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddRoomModal(true)}
              className="px-3.5 py-2.5 text-xs font-bold text-amber-950 bg-amber-100/80 hover:bg-amber-200 border border-amber-300 rounded-xl flex items-center gap-1.5 shadow-2xs min-h-[42px] transition-colors"
            >
              <FolderPlus className="w-4 h-4 text-amber-800 shrink-0" />
              + Add Room Section
            </button>

            <button
              type="button"
              onClick={() => addItem()}
              className="px-4 py-2.5 text-xs font-bold text-white bg-rose-900 hover:bg-rose-950 rounded-xl flex items-center gap-1.5 shadow-xs min-h-[42px] transition-colors"
            >
              <Plus className="w-4 h-4 text-amber-300 shrink-0" />
              Add Item
            </button>
          </div>
        </div>

        {/* Room Sections Bar */}
        <div className="bg-gradient-to-r from-amber-50/70 via-amber-50/40 to-white p-3 sm:p-4 rounded-2xl border border-amber-200/80 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-800" />
              <span className="text-xs font-bold text-rose-950 uppercase tracking-wider">
                Rooms in this Quotation:
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              Click <span className="font-bold text-amber-900">+</span> to add item to that room
            </span>
          </div>

          {/* Active Room Cards */}
          <div className="flex flex-wrap items-center gap-2">
            {existingRooms.map((roomName, idx) => {
              const roomItems = items.filter(
                (it) => (it.room || 'Living Room / Hall') === roomName
              );
              const roomSubtotal = roomItems.reduce((acc, it) => acc + (it.amount || 0), 0);
              return (
                <div
                  key={roomName}
                  className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-amber-300 text-xs shadow-2xs"
                >
                  <span className="font-serif font-black text-rose-900 text-sm">
                    ({String.fromCharCode(65 + (idx % 26))})
                  </span>
                  <span className="font-bold text-slate-800">{roomName}</span>
                  <span className="text-[10px] bg-amber-100 text-amber-950 px-2 py-0.5 rounded-full font-bold">
                    {roomItems.length} {roomItems.length === 1 ? 'item' : 'items'} • {formatINR(roomSubtotal, false)}
                  </span>
                  <button
                    type="button"
                    onClick={() => addItem(roomName)}
                    title={`Add item to ${roomName}`}
                    className="p-1 text-amber-700 hover:text-white hover:bg-rose-900 rounded-md transition-colors flex items-center gap-0.5 font-bold text-[11px]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Add</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Quick Add Preset Room Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-amber-200/60 text-xs">
            <span className="text-[11px] font-semibold text-slate-600 mr-1">
              Quick Add Room:
            </span>
            {[
              'Living Room / Hall',
              'Master Bedroom',
              'Modular Kitchen',
              'Kids Bedroom',
              'Dining Area',
              'Pooja Room',
              'Balcony',
            ].map((preset) => {
              const shortName = preset.split('/')[0].trim();
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => addItem(preset)}
                  className="px-2.5 py-1 text-[11px] bg-white hover:bg-amber-100 text-slate-800 border border-slate-200 hover:border-amber-400 rounded-lg transition-colors flex items-center gap-1 font-medium shadow-2xs"
                >
                  <Plus className="w-3 h-3 text-amber-700" />
                  {shortName}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setShowAddRoomModal(true)}
              className="px-2.5 py-1 text-[11px] bg-amber-200/60 hover:bg-amber-200 text-amber-950 rounded-lg font-bold transition-colors"
            >
              + Other...
            </button>
          </div>
        </div>

        {/* Item Rows */}
        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={item.id || index}
              className="p-3.5 sm:p-4 bg-gradient-to-r from-amber-50/30 to-white rounded-2xl border border-amber-200/80 hover:border-amber-400 transition-all space-y-3"
            >
              <div className="flex items-center justify-between gap-2 border-b border-amber-100 pb-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="w-6 h-6 rounded-full bg-rose-900 text-amber-200 text-xs font-extrabold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    Item #{index + 1}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-[11px] font-bold px-2.5 py-0.5 rounded-lg border border-amber-300">
                    <Layers className="w-3 h-3 text-amber-700" />
                    {item.room || 'Living Room / Hall'}
                  </span>
                </div>

                {/* Reorder and Action Tools with Touch-Friendly Size */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveItem(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 sm:p-1 text-slate-500 hover:text-slate-800 disabled:opacity-30 rounded-lg hover:bg-amber-100/60 min-w-[32px] min-h-[32px] flex items-center justify-center"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(index, 'down')}
                    disabled={index === items.length - 1}
                    className="p-1.5 sm:p-1 text-slate-500 hover:text-slate-800 disabled:opacity-30 rounded-lg hover:bg-amber-100/60 min-w-[32px] min-h-[32px] flex items-center justify-center"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => duplicateItem(index)}
                    className="p-1.5 sm:p-1 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-amber-100/60 min-w-[32px] min-h-[32px] flex items-center justify-center"
                    title="Duplicate Item"
                  >
                    <Copy className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={items.length <= 1}
                    className="p-1.5 sm:p-1 text-rose-500 hover:text-rose-700 disabled:opacity-30 rounded-lg hover:bg-rose-50 min-w-[32px] min-h-[32px] flex items-center justify-center"
                    title="Delete Item"
                  >
                    <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                  </button>
                </div>
              </div>

              {/* Item-wise Room / Group Title selector & quick pills */}
              <div className="bg-amber-50/60 p-2 sm:p-2.5 rounded-xl border border-amber-200/70 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[220px]">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1 shrink-0 uppercase tracking-wider">
                    <Layers className="w-3.5 h-3.5 text-amber-800" />
                    Room / Group Title:
                  </label>
                  <div className="relative flex-1 min-w-[160px] max-w-xs">
                    <input
                      type="text"
                      list={`standard-rooms-${index}`}
                      placeholder="e.g. Hall, Bedroom, Kitchen, Pooja..."
                      value={item.room || ''}
                      onChange={(e) => updateItem(index, 'room', e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-amber-950 bg-white min-h-[34px] focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                    />
                    <datalist id={`standard-rooms-${index}`}>
                      {allRoomOptions.map((r) => (
                        <option key={r} value={r} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Quick Room Preset Buttons */}
                <div className="flex flex-wrap items-center gap-1">
                  {['Hall', 'Master Bedroom', 'Bedroom', 'Kitchen', 'Dining', 'Pooja'].map((quick) => (
                    <button
                      key={quick}
                      type="button"
                      onClick={() => updateItem(index, 'room', quick)}
                      className={`px-2 py-1 text-[10px] rounded-lg font-medium transition-all min-h-[28px] ${
                        (item.room || '').toLowerCase().includes(quick.toLowerCase())
                          ? 'bg-rose-900 text-amber-200 font-bold shadow-2xs'
                          : 'bg-white hover:bg-amber-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {quick}
                    </button>
                  ))}
                </div>
              </div>

              {/* Responsive Input Grid: 12-column with responsive spans */}
              <div className="grid grid-cols-12 gap-2.5 text-xs">
                
                {/* Description & Quick catalog selector */}
                <div className="col-span-12 md:col-span-4 space-y-1">
                  <div className="flex flex-wrap justify-between items-center gap-1">
                    <label className="font-semibold text-slate-700">Description:</label>
                    {products.length > 0 && (
                      <select
                        onChange={(e) => {
                          const p = products.find((prod) => prod.id === e.target.value);
                          if (p) selectProductForItem(index, p);
                        }}
                        defaultValue=""
                        className="text-[11px] sm:text-[10px] text-amber-900 border border-amber-300 rounded px-2 py-0.5 bg-amber-50"
                      >
                        <option value="" disabled>
                          + Pick from Catalog
                        </option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({formatINR(p.defaultRate, false)})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. TV Unit / Mandir / Sofa Set"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs font-medium text-slate-900 min-h-[42px]"
                    required
                  />
                </div>

                {/* Specification / Size */}
                <div className="col-span-12 sm:col-span-6 md:col-span-2 space-y-1">
                  <label className="font-semibold text-slate-700 block">Specification / Size:</label>
                  <input
                    type="text"
                    placeholder="e.g. 9' × 7.25' or 3 + 1"
                    value={item.specification}
                    onChange={(e) => updateItem(index, 'specification', e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs text-slate-800 min-h-[42px]"
                  />
                </div>

                {/* Pricing Mode */}
                <div className="col-span-12 sm:col-span-6 md:col-span-2 space-y-1">
                  <label className="font-semibold text-slate-700 block">Pricing Mode:</label>
                  <select
                    value={item.pricingMode}
                    onChange={(e) => updateItem(index, 'pricingMode', e.target.value as PricingMode)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs font-medium text-slate-800 bg-white min-h-[42px]"
                  >
                    <option value="fixed">Fixed Lump Sum</option>
                    <option value="unit">Per Unit (Nos/Set)</option>
                    <option value="sqft">Per Sq Ft (L × W)</option>
                    <option value="running_ft">Per Running Ft</option>
                    <option value="custom">Custom Calc</option>
                  </select>
                </div>

                {/* Qty */}
                <div className="col-span-4 sm:col-span-3 md:col-span-1 space-y-1">
                  <label className="font-semibold text-slate-700 block">Qty:</label>
                  <input
                    type="number"
                    min="0.1"
                    step="any"
                    value={item.qty}
                    onChange={(e) => updateItem(index, 'qty', parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs text-center font-bold min-h-[42px]"
                  />
                </div>

                {/* Unit */}
                <div className="col-span-4 sm:col-span-3 md:col-span-1 space-y-1">
                  <label className="font-semibold text-slate-700 block">Unit:</label>
                  <select
                    value={item.unit}
                    onChange={(e) => updateItem(index, 'unit', e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs bg-white min-h-[42px]"
                  >
                    <option value="Nos">Nos</option>
                    <option value="Set">Set</option>
                    <option value="Sq Ft">Sq Ft</option>
                    <option value="Rft">Rft</option>
                    <option value="Lot">Lot</option>
                  </select>
                </div>

                {/* Rate */}
                <div className="col-span-4 sm:col-span-3 md:col-span-1 space-y-1">
                  <label className="font-semibold text-slate-700 block">Rate (₹):</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={item.rate || ''}
                    onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs text-right font-medium min-h-[42px]"
                  />
                </div>

                {/* Total Item Amount with Manual Override */}
                <div className="col-span-12 sm:col-span-3 md:col-span-1 space-y-1">
                  <label className="font-bold text-rose-950 block">Amount (₹):</label>
                  <input
                    type="number"
                    min="0"
                    value={item.amount || ''}
                    onChange={(e) => updateItem(index, 'amount', parseFloat(e.target.value) || 0)}
                    className="w-full border border-amber-400 bg-amber-50/50 rounded-xl p-2.5 text-sm sm:text-xs text-right font-bold text-slate-900 min-h-[42px]"
                  />
                </div>
              </div>

              {/* Dimensions Helper Bar */}
              <div className="p-3 bg-gradient-to-r from-amber-50/90 via-amber-50/50 to-white rounded-xl border border-amber-300/80 space-y-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-950 flex items-center gap-1 shrink-0 uppercase tracking-wider text-[11px]">
                      <Calculator className="w-3.5 h-3.5 text-amber-800" />
                      Dimension Calculator:
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Pricing Mode: <strong className="text-amber-900 capitalize">{item.pricingMode === 'sqft' ? 'Per Sq Ft (L × W)' : item.pricingMode === 'running_ft' ? 'Running Feet (Length)' : item.pricingMode === 'fixed' ? 'Fixed Lump Sum' : item.pricingMode === 'unit' ? 'Per Unit (Nos/Set)' : 'Custom'}</strong>
                    </span>
                  </div>

                  {/* Measurement Unit selector (Feet vs Inches) */}
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-slate-500 font-medium">Unit:</span>
                    <select
                      value={item.dimensionUnit === 'inches' ? 'inches' : 'feet'}
                      onChange={(e) => updateItem(index, 'dimensionUnit', e.target.value as DimensionUnit)}
                      className="border border-slate-300 rounded px-1.5 py-0.5 bg-white text-xs font-semibold text-slate-700"
                    >
                      <option value="feet">Feet (ft)</option>
                      <option value="inches">Inches (in)</option>
                    </select>
                  </div>
                </div>

                {/* Dimension Inputs & Formula Display */}
                <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-amber-200/50">
                  {/* Length Input */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-700 font-semibold">
                      {item.pricingMode === 'running_ft' ? 'Running Length:' : 'Length:'}
                    </span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      placeholder={item.dimensionUnit === 'inches' ? 'e.g. 84' : 'e.g. 7'}
                      value={item.length || ''}
                      onChange={(e) => updateItem(index, 'length', parseFloat(e.target.value) || 0)}
                      className="w-20 border border-slate-300 rounded-lg p-1.5 text-center bg-white font-bold text-slate-900"
                    />
                    <span className="text-slate-500 text-[11px]">
                      {item.dimensionUnit === 'inches' ? 'in' : 'ft'}
                    </span>
                  </div>

                  {/* Width / Height Input (shown for non-running_ft modes) */}
                  {item.pricingMode !== 'running_ft' && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-700 font-semibold">Width / Height:</span>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        placeholder={item.dimensionUnit === 'inches' ? 'e.g. 96' : 'e.g. 8'}
                        value={item.width || ''}
                        onChange={(e) => updateItem(index, 'width', parseFloat(e.target.value) || 0)}
                        className="w-20 border border-slate-300 rounded-lg p-1.5 text-center bg-white font-bold text-slate-900"
                      />
                      <span className="text-slate-500 text-[11px]">
                        {item.dimensionUnit === 'inches' ? 'in' : 'ft'}
                      </span>
                    </div>
                  )}

                  {/* Live Formula Banner based on Pricing Mode */}
                  {item.pricingMode === 'sqft' && item.length && item.width ? (
                    <div className="flex-1 min-w-[240px] text-amber-950 font-semibold bg-amber-200/80 px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between gap-2 border border-amber-300">
                      <span>
                        📐 {item.length}' × {item.width}' = <strong>{item.calculatedArea} sq ft</strong>
                        {item.unit === 'Sq Ft'
                          ? ` @ ₹${item.rate}/sq ft = ₹${formatINR(item.amount)}`
                          : ` × ${item.qty} ${item.unit} @ ₹${item.rate}/sq ft = ₹${formatINR(item.amount)}`}
                      </span>
                      {item.discount > 0 && (
                        <span className="text-rose-800 text-[11px] font-bold">
                          ({item.discount}% off)
                        </span>
                      )}
                    </div>
                  ) : item.pricingMode === 'running_ft' && item.length ? (
                    <div className="flex-1 min-w-[200px] text-amber-950 font-semibold bg-amber-200/80 px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between gap-2 border border-amber-300">
                      <span>
                        📏 {item.length} Rft @ ₹{item.rate}/Rft = <strong>₹{formatINR(item.amount)}</strong>
                      </span>
                      {item.discount > 0 && (
                        <span className="text-rose-800 text-[11px] font-bold">
                          ({item.discount}% off)
                        </span>
                      )}
                    </div>
                  ) : item.pricingMode === 'fixed' && item.length && item.width ? (
                    <div className="flex-1 min-w-[240px] text-slate-800 font-medium bg-amber-100/70 px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between gap-2 border border-amber-200">
                      <span>
                        🏷️ Dimensions: {item.length}' × {item.width}' ({item.calculatedArea} sq ft) • <strong>Fixed Lump Sum: ₹{formatINR(item.amount)}</strong>
                        {item.calculatedArea ? ` (~₹${Math.round(item.amount / item.calculatedArea)}/sq ft)` : ''}
                      </span>
                    </div>
                  ) : item.pricingMode === 'unit' && item.length && item.width ? (
                    <div className="flex-1 min-w-[240px] text-slate-800 font-medium bg-amber-100/70 px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between gap-2 border border-amber-200">
                      <span>
                        📦 Dimensions: {item.length}' × {item.width}' ({item.calculatedArea} sq ft) • Unit Pricing: {item.qty} {item.unit} × ₹{formatINR(item.rate)} = <strong>₹{formatINR(item.amount)}</strong>
                      </span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500 italic">
                      {item.pricingMode === 'sqft'
                        ? 'Enter length and width to calculate billable square footage.'
                        : item.pricingMode === 'running_ft'
                        ? 'Enter length to calculate billable running feet.'
                        : 'Enter dimensions for size specification in the quotation.'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tax, Discounts, Terms and Totals */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Payment Milestones & Terms */}
        <div className="md:col-span-7 space-y-5 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xs border border-amber-200/80 text-xs">
          <h2 className="text-sm font-bold text-rose-950 uppercase tracking-wider border-b border-amber-100 pb-2">
            3. Payment Milestones & Terms
          </h2>

          {/* Payment Schedule Milestones */}
          <div>
            <label className="block font-bold text-slate-800 mb-2">
              Payment Schedule Milestones:
            </label>
            <div className="space-y-2.5">
              {paymentSchedule.map((ps, idx) => (
                <div
                  key={ps.id}
                  className="p-2.5 bg-amber-50/40 rounded-xl border border-amber-200/70 space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-2.5"
                >
                  <input
                    type="text"
                    value={ps.milestone}
                    onChange={(e) => {
                      const copy = [...paymentSchedule];
                      copy[idx].milestone = e.target.value;
                      setPaymentSchedule(copy);
                    }}
                    className="w-full sm:flex-1 border border-slate-300 rounded-lg p-2 text-sm sm:text-xs text-slate-800 bg-white"
                  />
                  <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                    <div className="flex items-center gap-1 w-24">
                      <input
                        type="number"
                        value={ps.percentage}
                        onChange={(e) => {
                          const copy = [...paymentSchedule];
                          copy[idx].percentage = parseFloat(e.target.value) || 0;
                          setPaymentSchedule(copy);
                        }}
                        className="w-14 border border-slate-300 rounded-lg p-1.5 text-center font-bold text-sm sm:text-xs bg-white"
                      />
                      <span className="font-semibold text-slate-600">%</span>
                    </div>
                    <span className="text-right font-bold text-rose-950 font-mono text-xs min-w-[80px]">
                      {formatINR((grandTotal * ps.percentage) / 100)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Terms & Conditions preview / edit */}
          <div className="pt-2">
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-slate-800">Terms & Conditions:</label>
              <button
                type="button"
                onClick={() => setTerms(settings.defaultTerms)}
                className="text-[11px] sm:text-[10px] text-amber-900 font-bold hover:underline"
              >
                Reset to Business Defaults
              </button>
            </div>
            <textarea
              rows={4}
              value={terms.join('\n')}
              onChange={(e) => setTerms(e.target.value.split('\n'))}
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-700 font-sans"
            />
          </div>
        </div>

        {/* Right Column: Grand Total Calculations Card */}
        <div className="md:col-span-5 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xs border border-amber-300 space-y-4 text-xs md:sticky md:top-20">
          <h2 className="text-sm font-bold text-rose-950 uppercase tracking-wider border-b border-amber-100 pb-2">
            4. Summary & Grand Total
          </h2>

          <div className="space-y-2.5">
            <div className="flex justify-between text-slate-600">
              <span>Items Subtotal:</span>
              <span className="font-bold text-slate-900">{formatINR(subtotal)}</span>
            </div>

            {/* Discount Inputs */}
            <div className="p-2.5 bg-amber-50/50 rounded-xl border border-amber-200 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-slate-700">Discount:</span>
                <div className="flex gap-2 items-center">
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="border border-slate-300 rounded-lg p-1.5 text-xs bg-white"
                  >
                    <option value="fixed">₹ (Fixed)</option>
                    <option value="percentage">% (Percent)</option>
                  </select>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={discountValue || ''}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-24 border border-slate-300 rounded-lg p-1.5 text-right font-semibold bg-white text-xs"
                  />
                </div>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 text-[11px]">
                  <span>Applied Discount:</span>
                  <span className="font-bold">-{formatINR(discountAmount)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-slate-600 border-t border-slate-100 pt-2">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableRoundOff}
                  onChange={(e) => setEnableRoundOff(e.target.checked)}
                  className="rounded text-amber-600 w-4 h-4"
                />
                <span>Round Off Adjustment:</span>
              </label>
              <span>{formatINR(roundOff)}</span>
            </div>

            {/* Grand Total Box */}
            <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-[#780016] text-white p-4 rounded-2xl shadow-lg space-y-1">
              <div className="text-[11px] uppercase tracking-wider text-amber-200 font-bold">
                Grand Total:
              </div>
              <div className="text-2xl font-black text-amber-300 font-mono tracking-wide">
                {formatINR(grandTotal)}
              </div>
            </div>

            {/* In Words */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-slate-800">
              <span className="text-[10px] uppercase font-bold text-rose-900 block mb-0.5">
                Amount in Words:
              </span>
              <span className="italic font-medium">{numberToIndianWords(grandTotal)}</span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => handleSaveQuotation('Sent')}
                className="w-full py-3.5 px-4 text-xs font-bold text-white bg-gradient-to-r from-rose-950 via-rose-900 to-[#780016] hover:from-[#780016] hover:to-rose-950 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 min-h-[44px]"
              >
                <Save className="w-4 h-4 text-amber-300" />
                Save & View Quotation
              </button>

              <button
                type="button"
                onClick={() => handleSaveQuotation('Draft')}
                className="w-full py-3 px-4 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-colors flex items-center justify-center gap-2 min-h-[44px]"
              >
                Save as Draft
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Quick Save & Total Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-amber-300 p-3 flex items-center justify-between gap-3 z-40 shadow-2xl">
        <div className="min-w-0">
          <span className="text-[10px] text-slate-500 uppercase font-bold block truncate">Grand Total</span>
          <span className="text-base font-black text-rose-950 font-mono truncate">{formatINR(grandTotal)}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleSaveQuotation('Draft')}
            className="px-3 py-2 text-xs font-bold text-slate-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl min-h-[40px]"
          >
            Draft
          </button>
          <button
            type="button"
            onClick={() => handleSaveQuotation('Sent')}
            className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-rose-950 to-rose-900 rounded-xl shadow flex items-center gap-1.5 min-h-[40px]"
          >
            <Save className="w-3.5 h-3.5 text-amber-300" />
            Save & View
          </button>
        </div>
      </div>

      {/* Add Room Modal */}
      {showAddRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-amber-300 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-amber-100 pb-3">
              <h3 className="font-bold text-base text-rose-950 flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-amber-800" />
                Add Room / Interior Section
              </h3>
              <button
                type="button"
                onClick={() => setShowAddRoomModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1 rounded-full hover:bg-slate-100 w-8 h-8 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Type Custom Room Name:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Master Bedroom, Kids Bedroom, Kitchen, Pooja..."
                  value={customRoomInput}
                  onChange={(e) => setCustomRoomInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddNewRoom(customRoomInput);
                    }
                  }}
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm text-slate-900 font-bold focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Or pick standard room type:
                </label>
                <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {STANDARD_ROOMS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleAddNewRoom(preset)}
                      className="p-2 text-left text-xs bg-amber-50/60 hover:bg-amber-100 text-slate-800 rounded-xl border border-amber-200/80 transition-colors font-medium flex items-center justify-between"
                    >
                      <span className="truncate">{preset}</span>
                      <Plus className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddRoomModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl min-h-[38px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleAddNewRoom(customRoomInput)}
                disabled={!customRoomInput.trim()}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-900 hover:bg-rose-950 disabled:opacity-40 rounded-xl shadow-xs min-h-[38px]"
              >
                Add Room & Create Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
