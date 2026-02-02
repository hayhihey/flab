import React, { useState } from 'react';
import { Package, MapPin, Phone, User, DollarSign, Shield, Calendar, ChevronRight, Info } from 'lucide-react';
import { LocationSearch } from '@/components/LocationSearch';

export const ParcelDelivery: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    receiverName: '',
    receiverPhone: '',
    pickup: '',
    dropoff: '',
    pickupCoords: null as any,
    dropoffCoords: null as any,
    size: 'small' as 'small' | 'medium' | 'large',
    weight: '',
    value: '',
    insured: false,
    scheduledFor: '',
  });

  const [fare, setFare] = useState<number | null>(null);

  const packageSizes = [
    { id: 'small', label: 'Small', description: 'Envelope, documents', icon: '📄', price: '1.0x' },
    { id: 'medium', label: 'Medium', description: 'Shoebox, small package', icon: '📦', price: '1.5x' },
    { id: 'large', label: 'Large', description: 'Suitcase, large box', icon: '📦📦', price: '2.5x' },
  ];

  const calculateFare = () => {
    // Simplified fare calculation
    const baseFare = 2000;
    const sizeMultipliers = { small: 1.0, medium: 1.5, large: 2.5 };
    const distance = 10; // Mock distance
    
    let calculatedFare = baseFare * sizeMultipliers[formData.size];
    
    if (formData.insured && formData.value) {
      const insuranceFee = Math.max(parseFloat(formData.value) * 0.02, 200);
      calculatedFare += insuranceFee;
    }
    
    setFare(calculatedFare);
  };

  const handleSubmit = async () => {
    console.log('Submitting parcel delivery:', formData);
    // API call would go here
    alert('Parcel delivery request submitted! We\'ll match you with a driver shortly.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => window.history.back()}
            className="text-slate-400 hover:text-white mb-4 flex items-center gap-2"
          >
            ← Back
          </button>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center">
              <Package className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Send a Package</h1>
              <p className="text-slate-400">Fast, reliable parcel delivery</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= s
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    step > s ? 'bg-gradient-to-r from-amber-500 to-orange-600' : 'bg-slate-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Package Details */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Package Size</h3>
              <div className="grid grid-cols-3 gap-3">
                {packageSizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setFormData({ ...formData, size: size.id as any })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.size === size.id
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-3xl mb-2">{size.icon}</div>
                    <div className="text-sm font-medium text-white">{size.label}</div>
                    <div className="text-xs text-slate-400 mt-1">{size.description}</div>
                    <div className="text-xs text-amber-400 mt-2 font-bold">{size.price}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Package Value (₦)
                </label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="e.g., 50000"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <input
                  type="checkbox"
                  id="insured"
                  checked={formData.insured}
                  onChange={(e) => setFormData({ ...formData, insured: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-600 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="insured" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-amber-400" />
                    <span className="font-medium text-white">Add Insurance Protection</span>
                  </div>
                  <p className="text-sm text-slate-300 mt-1">
                    Covers loss or damage up to declared value (2% of value, min ₦200)
                  </p>
                </label>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
            >
              Continue to Delivery Details
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Step 2: Receiver & Location */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Receiver Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Receiver Name
                </label>
                <input
                  type="text"
                  value={formData.receiverName}
                  onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Receiver Phone
                </label>
                <input
                  type="tel"
                  value={formData.receiverPhone}
                  onChange={(e) => setFormData({ ...formData, receiverPhone: e.target.value })}
                  placeholder="+234 800 000 0000"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Pickup & Delivery</h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Pickup Location
                </label>
                <input
                  type="text"
                  value={formData.pickup}
                  onChange={(e) => setFormData({ ...formData, pickup: e.target.value })}
                  placeholder="Enter pickup address"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Delivery Location
                </label>
                <input
                  type="text"
                  value={formData.dropoff}
                  onChange={(e) => setFormData({ ...formData, dropoff: e.target.value })}
                  placeholder="Enter delivery address"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Schedule Pickup (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduledFor}
                  onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  aria-label="Schedule pickup time"
                />
                <p className="mt-2 text-xs text-slate-400">Leave blank for immediate pickup</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-4 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-all"
              >
                Back
              </button>
              <button
                onClick={() => { calculateFare(); setStep(3); }}
                disabled={!formData.receiverName || !formData.receiverPhone || !formData.pickup || !formData.dropoff}
                className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Review & Confirm
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && fare && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/50 rounded-xl p-6">
              <h3 className="text-2xl font-bold text-white mb-2">Delivery Summary</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">₦{fare.toLocaleString()}</span>
                <span className="text-slate-400">total</span>
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Package Size</span>
                <span className="text-white font-medium capitalize">{formData.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Receiver</span>
                <span className="text-white font-medium">{formData.receiverName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">From</span>
                <span className="text-white font-medium text-right max-w-[200px] truncate">{formData.pickup}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">To</span>
                <span className="text-white font-medium text-right max-w-[200px] truncate">{formData.dropoff}</span>
              </div>
              {formData.insured && (
                <div className="flex justify-between pt-3 border-t border-slate-700">
                  <span className="text-amber-400 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Insurance
                  </span>
                  <span className="text-amber-400 font-medium">Included</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-4 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-all"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium rounded-lg transition-all"
              >
                Confirm & Book Driver
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
