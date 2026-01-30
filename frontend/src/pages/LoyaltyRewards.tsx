import React, { useState, useEffect } from 'react';
import { Crown, Star, TrendingUp, Gift, Award, Sparkles, ChevronRight, Trophy } from 'lucide-react';
import axios from 'axios';

interface LoyaltyStatus {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalRides: number;
  points: number;
  benefits: {
    cashbackPercent: number;
    prioritySupport: boolean;
    freeCancellations: number;
  };
  nextTier: string | null;
  ridesToNextTier: number;
  cashbackEarned: number;
}

export const LoyaltyRewards: React.FC = () => {
  const [status, setStatus] = useState<LoyaltyStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState('');

  const userId = 'current-user-id'; // Get from auth context

  useEffect(() => {
    loadLoyaltyStatus();
  }, []);

  const loadLoyaltyStatus = async () => {
    try {
      const response = await axios.get(`/api/loyalty/status/${userId}`);
      setStatus(response.data);
    } catch (error) {
      console.error('Failed to load loyalty status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    const points = parseInt(pointsToRedeem);
    
    if (!points || points < 100) {
      alert('Minimum redemption is 100 points');
      return;
    }

    if (status && points > status.points) {
      alert('Insufficient points');
      return;
    }

    setRedeeming(true);

    try {
      const response = await axios.post('/api/loyalty/redeem', {
        userId,
        points,
      });

      alert(`Success! ₦${points} added to your wallet`);
      setPointsToRedeem('');
      loadLoyaltyStatus(); // Refresh
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to redeem points');
    } finally {
      setRedeeming(false);
    }
  };

  const tierColors = {
    bronze: 'from-amber-700 to-amber-900',
    silver: 'from-slate-400 to-slate-600',
    gold: 'from-yellow-400 to-yellow-600',
    platinum: 'from-purple-400 to-purple-600',
  };

  const tierIcons = {
    bronze: '🥉',
    silver: '🥈',
    gold: '🥇',
    platinum: '💎',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!status) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Failed to load loyalty status</p>
          <button
            onClick={loadLoyaltyStatus}
            className="px-6 py-3 bg-primary text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const tierGradient = tierColors[status.tier];
  const progressToNext = status.nextTier
    ? ((status.totalRides - getTierThreshold(status.tier)) / status.ridesToNextTier) * 100
    : 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Loyalty Rewards</h1>
            <p className="text-slate-400">Earn points on every ride, unlock exclusive benefits</p>
          </div>
          <Trophy className="w-12 h-12 text-yellow-400" />
        </div>

        {/* Tier Card */}
        <div className={`bg-gradient-to-br ${tierGradient} rounded-2xl p-8 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="text-6xl">{tierIcons[status.tier]}</div>
              <div>
                <h2 className="text-3xl font-bold text-white capitalize mb-1">{status.tier} Member</h2>
                <p className="text-white/80">{status.totalRides} rides completed</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/20 backdrop-blur rounded-xl p-4">
                <div className="text-white/80 text-sm mb-1">Points Balance</div>
                <div className="text-3xl font-bold text-white flex items-baseline gap-2">
                  {status.points.toLocaleString()}
                  <span className="text-sm font-normal">pts</span>
                </div>
              </div>

              <div className="bg-white/20 backdrop-blur rounded-xl p-4">
                <div className="text-white/80 text-sm mb-1">Cashback Rate</div>
                <div className="text-3xl font-bold text-white flex items-baseline gap-2">
                  {status.benefits.cashbackPercent}%
                  <span className="text-sm font-normal">back</span>
                </div>
              </div>
            </div>

            {status.nextTier && (
              <div>
                <div className="flex justify-between text-white/80 text-sm mb-2">
                  <span>Progress to {status.nextTier}</span>
                  <span>{status.ridesToNextTier} more rides</span>
                </div>
                <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${progressToNext}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-400" />
            Your Benefits
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                ✓
              </div>
              <div className="flex-1">
                <div className="text-white font-medium">{status.benefits.cashbackPercent}% Cashback</div>
                <div className="text-sm text-slate-400">On every ride</div>
              </div>
              <div className="text-green-400 font-bold">₦{status.cashbackEarned.toFixed(2)}</div>
            </div>

            {status.benefits.prioritySupport && (
              <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  ✓
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">Priority Support</div>
                  <div className="text-sm text-slate-400">24/7 dedicated line</div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                ✓
              </div>
              <div className="flex-1">
                <div className="text-white font-medium">
                  {status.benefits.freeCancellations === Infinity
                    ? 'Unlimited'
                    : status.benefits.freeCancellations}{' '}
                  Free Cancellations
                </div>
                <div className="text-sm text-slate-400">Per month</div>
              </div>
            </div>
          </div>
        </div>

        {/* Redeem Points */}
        <div className="bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Gift className="w-6 h-6 text-primary" />
            Redeem Points
          </h3>
          <p className="text-slate-300 mb-4">Convert your points to wallet cash (100 points = ₦100)</p>
          
          <div className="flex gap-3">
            <input
              type="number"
              value={pointsToRedeem}
              onChange={(e) => setPointsToRedeem(e.target.value)}
              placeholder="Enter points (min 100)"
              className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleRedeem}
              disabled={redeeming || !pointsToRedeem || parseInt(pointsToRedeem) < 100}
              className="px-6 py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {redeeming ? 'Redeeming...' : 'Redeem'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 flex gap-2">
            {[100, 500, 1000, 5000].map((amount) => (
              <button
                key={amount}
                onClick={() => setPointsToRedeem(amount.toString())}
                disabled={status.points < amount}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {amount}
              </button>
            ))}
          </div>
        </div>

        {/* All Tiers */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-bold text-white mb-6">All Tiers</h3>
          <div className="space-y-4">
            {[
              { tier: 'bronze', rides: '0-50', cashback: '2%' },
              { tier: 'silver', rides: '51-200', cashback: '5%' },
              { tier: 'gold', rides: '201-500', cashback: '8%' },
              { tier: 'platinum', rides: '501+', cashback: '12%' },
            ].map((item) => (
              <div
                key={item.tier}
                className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                  status.tier === item.tier
                    ? 'border-primary bg-primary/10'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="text-3xl">{tierIcons[item.tier as keyof typeof tierIcons]}</div>
                <div className="flex-1">
                  <div className="text-white font-medium capitalize">{item.tier}</div>
                  <div className="text-sm text-slate-400">{item.rides} rides</div>
                </div>
                <div className="text-primary font-bold">{item.cashback} back</div>
                {status.tier === item.tier && (
                  <div className="px-3 py-1 bg-primary text-white text-xs rounded-full font-medium">
                    Current
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

function getTierThreshold(tier: string): number {
  const thresholds: Record<string, number> = {
    bronze: 0,
    silver: 51,
    gold: 201,
    platinum: 501,
  };
  return thresholds[tier] || 0;
}
