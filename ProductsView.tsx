import React, { useState, useMemo } from 'react';
import { Product } from '../types/database';
import { formatINR } from '../utils/numberToWords';
import { ConfirmModal } from './ConfirmModal';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Tag,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface ProductsViewProps {
  products: Product[];
  onSaveProduct: (productData: Omit<Product, 'id' | 'createdAt'> & { id?: string }) => void;
  onDeleteProduct: (id: string) => void;
}

const DEFAULT_CATEGORIES = [
  'All',
  'Living Room',
  'Bedroom',
  'Kitchen',
  'Dining',
  'TV Unit',
  'Wardrobe',
  'Furniture',
  'Wooden Partition',
  'Sofa',
  'Table',
  'Carpentry',
  'False Ceiling',
  'Electrical',
  'Painting',
  'Other',
];

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  onSaveProduct,
  onDeleteProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Form states for modal
  const [name, setName] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [category, setCategory] = useState('Living Room');
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('Nos');
  const [defaultRate, setDefaultRate] = useState<number>(0);
  const [gstRate, setGstRate] = useState<number>(18);
  const [hsnSac, setHsnSac] = useState('9403');
  const [active, setActive] = useState(true);

  // Unique categories list
  const allCategories = useMemo(() => {
    const fromProducts = products.map((p) => p.category);
    return Array.from(new Set([...DEFAULT_CATEGORIES, ...fromProducts]));
  }, [products]);

  const openAddModal = () => {
    setEditingProduct(undefined);
    setName('');
    setItemCode(`FUR-${Math.floor(100 + Math.random() * 900)}`);
    setCategory('Living Room');
    setCustomCategory('');
    setDescription('');
    setUnit('Nos');
    setDefaultRate(0);
    setGstRate(18);
    setHsnSac('9403');
    setActive(true);
    setShowModal(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setItemCode(p.itemCode);
    setCategory(p.category);
    setCustomCategory('');
    setDescription(p.description || '');
    setUnit(p.unit);
    setDefaultRate(p.defaultRate);
    setGstRate(p.gstRate || 18);
    setHsnSac(p.hsnSac || '9403');
    setActive(p.active);
    setShowModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalCategory = category === 'CUSTOM' ? customCategory.trim() : category;

    onSaveProduct({
      id: editingProduct?.id,
      name: name.trim(),
      itemCode: itemCode.trim() || `ITM-${Date.now().toString().slice(-4)}`,
      category: finalCategory || 'General',
      description: description.trim() || undefined,
      unit,
      defaultRate: Number(defaultRate) || 0,
      gstRate: Number(gstRate) || 18,
      hsnSac: hsnSac.trim() || undefined,
      active,
    });

    setShowModal(false);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        searchTerm === '' ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCategory =
        selectedCategory === 'All' || p.category === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-amber-200/80 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-rose-900 text-amber-300 rounded-xl">
              <Package className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">Products & Services Catalog</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Standard wooden furniture items, custom carpentry rates, and interior work items
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-rose-950 via-rose-900 to-[#780016] hover:from-[#780016] hover:to-rose-950 rounded-xl shadow-md flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          Add Item
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-amber-200/60 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search items by name, code, description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 bg-white"
          >
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table (Desktop) & Cards (Mobile) */}
      <div className="bg-white rounded-3xl shadow-sm border border-amber-200/80 overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Package className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold">No items found</p>
            <p className="text-xs text-slate-400">Add interior furniture items to pick easily during quotation creation.</p>
          </div>
        ) : (
          <div>
            {/* 1. Mobile Cards View (Visible on phones & small tablets) */}
            <div className="md:hidden divide-y divide-amber-100">
              {filteredProducts.map((prod) => (
                <div key={prod.id} className="p-4 space-y-2.5 bg-white hover:bg-amber-50/20">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{prod.name}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[10px] text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded font-bold">
                          {prod.itemCode}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-medium rounded-full text-[10px]">
                          {prod.category}
                        </span>
                      </div>
                    </div>
                    {prod.active ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                        <CheckCircle className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                        <XCircle className="w-3 h-3" /> Inactive
                      </span>
                    )}
                  </div>

                  {prod.description && (
                    <p className="text-xs text-slate-500 line-clamp-2">{prod.description}</p>
                  )}

                  <div className="p-2.5 bg-amber-50/50 rounded-xl border border-amber-200/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Rate / Unit</span>
                      <span className="text-sm font-bold text-slate-900 font-mono">
                        {formatINR(prod.defaultRate, false)}
                      </span>
                      <span className="text-slate-500 text-[11px] ml-1">/ {prod.unit}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">GST / HSN</span>
                      <span className="font-semibold text-slate-800">
                        {prod.gstRate}% {prod.hsnSac ? `(${prod.hsnSac})` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => openEditModal(prod)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg inline-flex items-center gap-1 min-h-[36px]"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Item</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingProduct(prod)}
                      className="px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg inline-flex items-center gap-1 min-h-[36px]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 2. Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-rose-950 via-rose-900 to-[#780016] text-amber-100 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4 border-r border-rose-800">Code & Item Name</th>
                    <th className="py-3 px-3 border-r border-rose-800">Category</th>
                    <th className="py-3 px-3 border-r border-rose-800 text-center">Unit</th>
                    <th className="py-3 px-3 border-r border-rose-800 text-right">Default Rate (₹)</th>
                    <th className="py-3 px-2.5 border-r border-rose-800 text-center">GST %</th>
                    <th className="py-3 px-2.5 border-r border-rose-800 text-center">HSN/SAC</th>
                    <th className="py-3 px-2.5 border-r border-rose-800 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {filteredProducts.map((prod, idx) => (
                    <tr
                      key={prod.id}
                      className={idx % 2 === 0 ? 'bg-white hover:bg-amber-50/30' : 'bg-amber-50/10 hover:bg-amber-50/40'}
                    >
                      <td className="py-3 px-4 border-r border-amber-100">
                        <div className="font-bold text-slate-900 text-sm">{prod.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[10px] text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded font-bold">
                            {prod.itemCode}
                          </span>
                          {prod.description && (
                            <span className="text-[11px] text-slate-500 line-clamp-1">{prod.description}</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 border-r border-amber-100">
                        <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 font-medium rounded-full text-[10px]">
                          {prod.category}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center border-r border-amber-100 font-semibold text-slate-800">
                        {prod.unit}
                      </td>

                      <td className="py-3 px-3 text-right border-r border-amber-100 font-bold text-slate-900">
                        {formatINR(prod.defaultRate, false)}
                      </td>

                      <td className="py-3 px-2.5 text-center border-r border-amber-100 text-slate-600 font-medium">
                        {prod.gstRate}%
                      </td>

                      <td className="py-3 px-2.5 text-center border-r border-amber-100 font-mono text-[10px] text-slate-500">
                        {prod.hsnSac || '-'}
                      </td>

                      <td className="py-3 px-2.5 text-center border-r border-amber-100">
                        {prod.active ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            <CheckCircle className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            <XCircle className="w-3 h-3" /> Inactive
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(prod)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                            title="Edit Item"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingProduct(prod)}
                            className="p-1.5 text-rose-500 hover:text-rose-800 hover:bg-rose-50 rounded-lg"
                            title="Delete Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full flex flex-col max-h-[94dvh] shadow-2xl border border-amber-300 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Sticky Header */}
            <div className="p-4 sm:p-5 border-b border-amber-200 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-900 text-amber-300 flex items-center justify-center shrink-0">
                  <Package className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingProduct ? 'Edit Furniture Item' : 'Add Furniture Item'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl font-bold w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
              >
                &times;
              </button>
            </div>

            {/* Scrollable Form */}
            <form id="productModalForm" onSubmit={handleFormSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Item Code</label>
                  <input
                    type="text"
                    value={itemCode}
                    onChange={(e) => setItemCode(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs font-mono uppercase text-slate-800 min-h-[42px]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs font-medium text-slate-800 bg-white min-h-[42px]"
                  >
                    {DEFAULT_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="CUSTOM">+ Add Custom Category</option>
                  </select>
                </div>
              </div>

              {category === 'CUSTOM' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Custom Category Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Balcony Decking, Crockery Unit"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full border border-amber-400 bg-amber-50/40 rounded-xl p-2.5 text-sm sm:text-xs font-medium min-h-[42px]"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Item Name *</label>
                <input
                  type="text"
                  placeholder="e.g. TV Unit / Mandir / Sliding Wardrobe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs font-bold text-slate-900 min-h-[42px]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Specs</label>
                <textarea
                  rows={2}
                  placeholder="e.g. High gloss acrylic laminate, soft-close hardware"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs bg-white font-medium min-h-[42px]"
                  >
                    <option value="Nos">Nos</option>
                    <option value="Set">Set</option>
                    <option value="Sq Ft">Sq Ft</option>
                    <option value="Rft">Running Ft</option>
                    <option value="Lot">Lot</option>
                    <option value="Meter">Meter</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Default Rate (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={defaultRate || ''}
                    onChange={(e) => setDefaultRate(parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs text-right font-bold text-slate-900 min-h-[42px]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GST Rate</label>
                  <select
                    value={gstRate}
                    onChange={(e) => setGstRate(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs bg-white min-h-[42px]"
                  >
                    <option value={0}>0%</option>
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                    <option value={28}>28%</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-1">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">HSN/SAC Code</label>
                  <input
                    type="text"
                    value={hsnSac}
                    onChange={(e) => setHsnSac(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs font-mono min-h-[42px]"
                  />
                </div>

                <div className="pt-2 sm:pt-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="prodActive"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="rounded text-rose-900 w-4 h-4"
                  />
                  <label htmlFor="prodActive" className="font-semibold text-slate-700 cursor-pointer">
                    Active in catalog
                  </label>
                </div>
              </div>
            </form>

            {/* Sticky Footer */}
            <div className="p-3.5 sm:p-4 border-t border-amber-200 bg-slate-50 flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 text-slate-700 hover:bg-slate-200 bg-white border border-slate-200 rounded-xl font-semibold flex-1 sm:flex-initial text-xs min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="productModalForm"
                className="px-6 py-2.5 font-bold text-white bg-gradient-to-r from-rose-950 via-rose-900 to-[#780016] hover:from-[#780016] hover:to-rose-950 rounded-xl shadow-md flex-1 sm:flex-initial text-xs min-h-[44px]"
              >
                Save Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Item Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingProduct}
        title="Delete Catalog Item"
        message={`Are you sure you want to delete item "${deletingProduct?.name}" from your catalog? Existing quotations using this item will remain unaffected.`}
        confirmLabel="Yes, Delete Item"
        onConfirm={() => {
          if (deletingProduct) {
            onDeleteProduct(deletingProduct.id);
            setDeletingProduct(null);
          }
        }}
        onCancel={() => setDeletingProduct(null)}
      />
    </div>
  );
};
