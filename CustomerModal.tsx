import React, { useState } from 'react';
import { Customer } from '../types/database';
import { Users, Phone, Mail, MapPin, Building, FileText } from 'lucide-react';

interface CustomerModalProps {
  customer?: Customer;
  onClose: () => void;
  onSave: (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  customer,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(customer?.name || '');
  const [mobile, setMobile] = useState(customer?.mobile || '');
  const [email, setEmail] = useState(customer?.email || '');
  const [address, setAddress] = useState(customer?.address || '');
  const [city, setCity] = useState(customer?.city || 'Pune');
  const [state, setState] = useState(customer?.state || 'Maharashtra');
  const [pincode, setPincode] = useState(customer?.pincode || '411039');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim()) {
      setErrorMsg('Customer Name and Mobile Number are required.');
      return;
    }

    onSave({
      id: customer?.id,
      customerId: customer?.customerId || '',
      name: name.trim(),
      companyName: undefined,
      mobile: mobile.trim(),
      whatsapp: mobile.trim(),
      email: email.trim() || undefined,
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      gstin: customer?.gstin,
      pan: customer?.pan,
      notes: customer?.notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full flex flex-col max-h-[94dvh] shadow-2xl border border-amber-300 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Sticky Header */}
        <div className="p-4 sm:p-5 border-b border-amber-200 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-900 text-amber-300 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {customer ? 'Edit Customer' : 'Add New Customer'}
              </h3>
              <p className="text-xs text-slate-500">Interior design client contact information</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl font-bold w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form id="customerForm" onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Customer Full Name *</label>
            <input
              type="text"
              placeholder="e.g. Mr. Suresh M. Khandare"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none min-h-[42px]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Mobile Number *
              </label>
              <input
                type="tel"
                placeholder="e.g. 8007200020"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none min-h-[42px]"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. suresh.khandare@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none min-h-[42px]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Site / Billing Address *
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Flat No. 5A-901, Badmukhwadi Chorhali, Bhosari"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs text-slate-900 min-h-[42px]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs text-slate-900 min-h-[42px]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pincode</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-sm sm:text-xs text-slate-900 min-h-[42px]"
              />
            </div>
          </div>
        </form>

        {/* Sticky Footer */}
        <div className="p-3.5 sm:p-4 border-t border-amber-200 bg-slate-50 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-slate-700 hover:bg-slate-200 bg-white border border-slate-200 rounded-xl font-semibold flex-1 sm:flex-initial text-xs min-h-[44px]"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="customerForm"
            className="px-6 py-2.5 font-bold text-white bg-gradient-to-r from-rose-950 via-rose-900 to-[#780016] hover:from-[#780016] hover:to-rose-950 rounded-xl shadow-md flex-1 sm:flex-initial text-xs min-h-[44px]"
          >
            Save Customer
          </button>
        </div>
      </div>
    </div>
  );
};
