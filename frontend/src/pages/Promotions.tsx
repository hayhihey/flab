import React from 'react';
import { Gift, Tag, Percent, Calendar, ArrowRight, Copy, Check, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Promotions: React.FC = () => {
  const navigate = useNavigate();
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const promotions = [
    {
      id: '1',
      title: '20% Off Your Next Ride',
      description: 'Save big on your next 3 rides with this exclusive offer',
      code: 'SAVE20',
      discount: '20%',
      expiry: 'Expires Feb 5, 2026',
      color: 'from-primary-500 to-secondary-500',
      icon: <Percent className="w-6 h-6" />,
    },
    {
      id: '2',
      title: 'Free Parcel Delivery',
      description: 'Send your first parcel for free - any size, any distance',
      code: 'FREEPARCEL',
      discount: '₦0',
      expiry: 'Expires Feb 10, 2026',
      color: 'from-purple-500 to-pink-500',
      icon: <Gift className="w-6 h-6" />,
    },
    {
      id: '3',
      title: 'Refer & Earn ₦500',
      description: 'Invite friends and earn ₦500 for each successful referral',
      code: 'Your unique referral code',
      discount: '₦500',
      expiry: 'No expiry',
      color: 'from-green-500 to-emerald-500',
      icon: <Tag className="w-6 h-6" />,
    },
    {
      id: '4',
      title: 'Weekend Special',
      description: 'Get 15% off all rides on Saturdays and Sundays',
      code: 'WEEKEND15',
      discount: '15%',
      expiry: 'Every weekend',
      color: 'from-blue-500 to-cyan-500',
      icon: <Calendar className="w-6 h-6" />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Promotions & Offers</h1>
              <p className="text-slate-400 mt-1">Save more on every ride</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Active Promotions */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Available Offers</h2>
          <div className="grid gap-4">
            {promotions.map((promo) => (
              <div
                key={promo.id}
                className="bg-slate-900/50 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 group"
              >
                {/* Gradient Header */}
                <div className={`bg-gradient-to-r ${promo.color} p-6`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white/20 backdrop-blur-xl rounded-xl">
                        {promo.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{promo.title}</h3>
                        <p className="text-white/80 text-sm">{promo.description}</p>
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-xl px-4 py-2 rounded-full">
                      <span className="text-white font-bold">{promo.discount}</span>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>{promo.expiry}</span>
                    </div>
                  </div>

                  {/* Promo Code */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-mono font-bold">{promo.code}</span>
                        <button
                          onClick={() => copyCode(promo.code)}
                          className="flex items-center gap-2 text-primary-500 hover:text-primary-400 transition-colors text-sm font-medium"
                        >
                          {copiedCode === promo.code ? (
                            <>
                              <Check className="w-4 h-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    <button 
                      className="p-3 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 rounded-xl transition-all duration-300 shadow-lg shadow-primary-500/30"
                      aria-label="Apply promotion"
                      title="Apply promotion"
                    >
                      <ArrowRight className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How to Use */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h2 className="text-xl font-bold text-white mb-4">How to Use Promo Codes</h2>
          <ol className="space-y-3">
            {[
              'Copy the promo code from above',
              'Start booking your ride or parcel delivery',
              'At checkout, enter the promo code in the "Promo Code" field',
              'Click "Apply" to see your discount',
              'Complete your booking and enjoy the savings!',
            ].map((step, index) => (
              <li key={index} className="flex items-start gap-3 text-slate-300">
                <div className="w-6 h-6 bg-primary-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary-500 text-sm font-bold">{index + 1}</span>
                </div>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Refer & Earn */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border border-white/10">
          <div className="flex items-start gap-4">
            <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">Earn More with Referrals</h3>
              <p className="text-slate-400 mb-4">
                Share your unique referral code and earn ₦500 for every friend who completes 5 rides!
              </p>
              <button 
                onClick={() => navigate('/profile')}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-green-500/30"
              >
                Get My Referral Code
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
