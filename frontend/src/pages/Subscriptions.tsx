import React, { useState, useEffect } from 'react';
import { Check, X, Crown, Sparkles, TrendingUp, Package, Calendar, ChevronRight } from 'lucide-react';
import axios from 'axios';

interface SubscriptionPlan {
  plan: string;
  price: number;
  ridesIncluded: number;
  deliveriesIncluded: number;
  description: string;
  features: string[];
  monthlySavings: number;
}

export const Subscriptions: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [activePlan, setActivePlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const userId = 'current-user-id'; // Get from auth context

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [plansRes, activeRes] = await Promise.all([
        axios.get('/api/subscriptions/plans'),
        axios.get(`/api/subscriptions/user/${userId}`).catch(() => ({ data: { subscription: null } })),
      ]);

      setPlans(plansRes.data.plans);
      setActivePlan(activeRes.data.subscription);
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan: string) => {
    setSubscribing(true);
    setSelectedPlan(plan);

    try {
      const response = await axios.post('/api/subscriptions/subscribe', {
        userId,
        plan,
        autoRenew: true,
        paymentMethod: 'card', // In real app, show payment method selector
      });

      alert(`Success! You're now subscribed to ${plan}`);
      loadData(); // Refresh
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to subscribe');
    } finally {
      setSubscribing(false);
      setSelectedPlan(null);
    }
  };

  const planIcons: Record<string, any> = {
    commuter: Calendar,
    family: TrendingUp,
    business: Crown,
    delivery_plus: Package,
  };

  const planColors: Record<string, string> = {
    commuter: 'from-blue-500 to-blue-600',
    family: 'from-purple-500 to-purple-600',
    business: 'from-amber-500 to-amber-600',
    delivery_plus: 'from-green-500 to-green-600',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Subscription Plans</h1>
          <p className="text-slate-400 text-lg">Save money with unlimited rides & deliveries</p>
        </div>

        {/* Active Subscription */}
        {activePlan && (
          <div className="bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/50 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-xl mb-1 capitalize">
                  {activePlan.plan.replace('_', ' ')} Plan
                </h3>
                <p className="text-slate-300">
                  {activePlan.ridesRemaining !== undefined && (
                    <span>{activePlan.ridesRemaining} rides remaining • </span>
                  )}
                  Expires in {activePlan.daysRemaining} days
                </p>
              </div>
              <Check className="w-8 h-8 text-primary" />
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const Icon = planIcons[plan.plan] || Sparkles;
            const gradient = planColors[plan.plan] || 'from-primary to-primary/80';
            const isActive = activePlan?.plan === plan.plan;

            return (
              <div
                key={plan.plan}
                className={`bg-slate-800 rounded-2xl border-2 transition-all hover:scale-105 ${
                  isActive
                    ? 'border-primary shadow-2xl shadow-primary/20'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className={`bg-gradient-to-br ${gradient} p-6 rounded-t-xl`}>
                  <Icon className="w-10 h-10 text-white mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2 capitalize">
                    {plan.plan.replace('_', ' ')}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">₦{(plan.price / 1000).toFixed(0)}K</span>
                    <span className="text-white/80">/month</span>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-slate-400 text-sm mb-6">{plan.description}</p>

                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {plan.monthlySavings > 0 && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4">
                      <p className="text-green-400 text-sm font-medium text-center">
                        Save ₦{plan.monthlySavings.toLocaleString()}/month
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => handleSubscribe(plan.plan)}
                    disabled={isActive || (subscribing && selectedPlan === plan.plan)}
                    className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                      isActive
                        ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                        : 'bg-gradient-to-r ' + gradient + ' hover:opacity-90 text-white'
                    }`}
                  >
                    {isActive && (
                      <>
                        <Check className="w-5 h-5" />
                        Active Plan
                      </>
                    )}
                    {!isActive && subscribing && selectedPlan === plan.plan && 'Subscribing...'}
                    {!isActive && (!subscribing || selectedPlan !== plan.plan) && (
                      <>
                        Subscribe Now
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 bg-slate-800 rounded-xl p-8 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-white font-medium mb-2">Can I cancel anytime?</h3>
              <p className="text-slate-400 text-sm">
                Yes! You can cancel your subscription at any time. You'll keep access until the end of your billing period.
              </p>
            </div>
            <div>
              <h3 className="text-white font-medium mb-2">What happens if I exceed my ride limit?</h3>
              <p className="text-slate-400 text-sm">
                Don't worry! You'll just pay the regular fare for rides beyond your subscription limit.
              </p>
            </div>
            <div>
              <h3 className="text-white font-medium mb-2">Can I upgrade or downgrade my plan?</h3>
              <p className="text-slate-400 text-sm">
                Yes, you can change your plan at any time. The new rate will apply from your next billing cycle.
              </p>
            </div>
            <div>
              <h3 className="text-white font-medium mb-2">Do unused rides roll over?</h3>
              <p className="text-slate-400 text-sm">
                Unused rides do not roll over to the next month. However, Business plan offers unlimited rides!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
