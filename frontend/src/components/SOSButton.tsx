import React, { useState } from 'react';
import { AlertTriangle, Phone, Shield, Users, MapPin, Camera } from 'lucide-react';
import axios from 'axios';

interface SOSButtonProps {
  rideId?: string;
  userId: string;
  currentLocation?: { lat: number; lng: number };
  onSOSTriggered?: () => void;
}

export const SOSButton: React.FC<SOSButtonProps> = ({
  rideId,
  userId,
  currentLocation,
  onSOSTriggered,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [sosType, setSOSType] = useState<'emergency' | 'unsafe_driving' | 'harassment' | 'accident' | 'other'>('emergency');
  const [description, setDescription] = useState('');
  const [triggering, setTriggering] = useState(false);

  const handleSOSTrigger = async () => {
    if (!rideId) {
      alert('No active ride to trigger SOS');
      return;
    }

    setTriggering(true);

    try {
      const response = await axios.post('/api/safety/sos', {
        rideId,
        userId,
        location: currentLocation,
        type: sosType,
        description,
      });

      console.log('SOS triggered:', response.data);
      
      // Notify user
      alert(`🚨 EMERGENCY SERVICES ALERTED!\n\n${response.data.emergencyResponse.status}\n\nHelp is on the way. Stay safe.`);
      
      setShowModal(false);
      onSOSTriggered?.();
    } catch (error) {
      console.error('SOS trigger error:', error);
      alert('Failed to trigger SOS. Please call emergency services directly: 112');
    } finally {
      setTriggering(false);
    }
  };

  return (
    <>
      {/* SOS Button - Always visible during ride */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-24 right-6 w-16 h-16 bg-red-600 hover:bg-red-700 rounded-full shadow-2xl flex items-center justify-center z-50 animate-pulse"
      >
        <Shield className="w-8 h-8 text-white" />
      </button>

      {/* SOS Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-xl max-w-md w-full p-6 border border-red-500/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Emergency SOS</h2>
                <p className="text-sm text-slate-400">Help will be dispatched immediately</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Emergency Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'emergency', label: 'Emergency', icon: AlertTriangle },
                    { value: 'unsafe_driving', label: 'Unsafe Driving', icon: Phone },
                    { value: 'harassment', label: 'Harassment', icon: Users },
                    { value: 'accident', label: 'Accident', icon: MapPin },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setSOSType(value as any)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        sosType === value
                          ? 'border-red-500 bg-red-500/20'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <Icon className="w-5 h-5 mx-auto mb-1 text-white" />
                      <div className="text-xs text-white">{label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Additional Details (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the situation..."
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  rows={3}
                />
              </div>

              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <h4 className="font-medium text-red-400 mb-2">What happens next:</h4>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>✓ Local police will be alerted with your GPS location</li>
                  <li>✓ Your emergency contacts will receive SMS notification</li>
                  <li>✓ Company control center will monitor your ride</li>
                  <li>✓ Live tracking link will be sent to your contacts</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSOSTrigger}
                disabled={triggering || !rideId}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {triggering ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Alerting...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    TRIGGER SOS
                  </>
                )}
              </button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-slate-400">
                Or call emergency services directly:
                <a href="tel:112" className="text-red-400 font-bold ml-2">112</a>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
