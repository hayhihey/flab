import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/context/store';
import { ridesAPI } from '@/services/api';
import {
  ChevronRight, CreditCard, Plus, Send, Eye, EyeOff,
  TrendingUp, Clock, CheckCircle, AlertCircle, Download
} from 'lucide-react';
import { Card, Badge } from '@/components/ui';

interface WalletData {
  balance: number;
  totalSpent: number;
  totalEarned: number;
  currency: string;
}

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export const Wallet: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showBalance, setShowBalance] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');

  useEffect(() => {
    if (user?.id) {
      loadWalletData();
    }
  }, [user?.id]);

  const loadWalletData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const [walletRes, statsRes] = await Promise.all([
        ridesAPI.getWallet?.(user.id).catch(() => ({ data: { wallet: { balance: 0, totalSpent: 0, totalEarned: 0, currency: 'NGN' } } })),
        ridesAPI.getStats?.(user.id).catch(() => ({ data: { stats: {} } }))
      ]);

      const walletData = walletRes?.data?.wallet || { balance: 0, totalSpent: 0, totalEarned: 0, currency: 'NGN' };
      setWallet(walletData);

      // Mock transactions for now
      setTransactions([
        {
          id: '1',
          type: 'debit',
          amount: 2500,
          description: 'Ride to Victoria Island',
          date: new Date(Date.now() - 3600000).toISOString(),
          status: 'completed'
        },
        {
          id: '2',
          type: 'debit',
          amount: 1800,
          description: 'Ride to Lekki Phase 1',
          date: new Date(Date.now() - 86400000).toISOString(),
          status: 'completed'
        },
        {
          id: '3',
          type: 'credit',
          amount: 5000,
          description: 'Promo credit',
          date: new Date(Date.now() - 259200000).toISOString(),
          status: 'completed'
        },
      ]);
    } catch (error) {
      console.error('Failed to load wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-NG', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-emerald-400 bg-emerald-500/10';
      case 'pending':
        return 'text-amber-400 bg-amber-500/10';
      case 'failed':
        return 'text-red-400 bg-red-500/10';
      default:
        return 'text-slate-400 bg-slate-500/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 pt-6">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-slate-800/50 rounded-2xl" />
            <div className="h-96 bg-slate-800/50 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-800 rounded-xl transition"
              title="Go back"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <h1 className="text-lg font-bold">Wallet</h1>
            <button
              onClick={() => loadWalletData()}
              className="p-2 hover:bg-slate-800 rounded-xl transition"
              title="Refresh"
            >
              <TrendingUp className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        {/* Main Balance Card */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-3xl p-6 border border-slate-700/50 mb-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400">Available Balance</span>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition"
            >
              {showBalance ? (
                <Eye className="w-5 h-5 text-slate-400" />
              ) : (
                <EyeOff className="w-5 h-5 text-slate-400" />
              )}
            </button>
          </div>
          <div className="mb-6">
            <div className="text-4xl font-black bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
              {showBalance ? formatCurrency(wallet?.balance || 0) : '****'}
            </div>
            <span className="text-xs text-slate-500 mt-1">{wallet?.currency}</span>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-primary-500/10 border border-primary-500/30 rounded-xl hover:bg-primary-500/20 transition text-primary-400 font-medium">
              <Plus className="w-4 h-4" />
              Add Money
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-secondary-500/10 border border-secondary-500/30 rounded-xl hover:bg-secondary-500/20 transition text-secondary-400 font-medium">
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-sm text-slate-400">Total Earned</span>
            </div>
            <div className="text-xl font-bold text-emerald-400">
              {formatCurrency(wallet?.totalEarned || 0)}
            </div>
            <span className="text-xs text-slate-500">From rides</span>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-red-400" />
              </div>
              <span className="text-sm text-slate-400">Total Spent</span>
            </div>
            <div className="text-xl font-bold text-red-400">
              {formatCurrency(wallet?.totalSpent || 0)}
            </div>
            <span className="text-xs text-slate-500">On rides</span>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-slate-800/30 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              activeTab === 'overview'
                ? 'bg-primary-500/20 text-primary-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              activeTab === 'history'
                ? 'bg-primary-500/20 text-primary-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            History
          </button>
        </div>

        {/* Content */}
        {activeTab === 'overview' ? (
          <div className="space-y-4">
            {/* Payment Methods */}
            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Payment Methods
              </h3>
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-4">
                <div className="flex items-center gap-4 pb-4 border-b border-slate-700/50">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Mastercard</div>
                    <div className="text-sm text-slate-400">•••• •••• •••• 4242</div>
                  </div>
                  <Badge variant="success" size="sm">Default</Badge>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Recent Activity
              </h3>
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 divide-y divide-slate-700/50">
                {transactions.slice(0, 3).map((txn) => (
                  <div key={txn.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        txn.type === 'debit'
                          ? 'bg-red-500/10'
                          : 'bg-emerald-500/10'
                      }`}>
                        {txn.type === 'debit' ? (
                          <Send className={`w-5 h-5 text-red-400`} />
                        ) : (
                          <Plus className={`w-5 h-5 text-emerald-400`} />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{txn.description}</div>
                        <div className="text-xs text-slate-500">{formatDate(txn.date)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold text-sm ${
                        txn.type === 'debit'
                          ? 'text-red-400'
                          : 'text-emerald-400'
                      }`}>
                        {txn.type === 'debit' ? '-' : '+'}{formatCurrency(txn.amount)}
                      </div>
                      <div className={`text-xs flex items-center justify-end gap-1 ${getStatusColor(txn.status)}`}>
                        {getStatusIcon(txn.status)}
                        {txn.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 divide-y divide-slate-700/50">
            {transactions.map((txn) => (
              <div key={txn.id} className="flex items-center justify-between p-4 hover:bg-slate-700/20 transition">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    txn.type === 'debit'
                      ? 'bg-red-500/10'
                      : 'bg-emerald-500/10'
                  }`}>
                    {txn.type === 'debit' ? (
                      <Send className={`w-5 h-5 text-red-400`} />
                    ) : (
                      <Plus className={`w-5 h-5 text-emerald-400`} />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{txn.description}</div>
                    <div className="text-xs text-slate-500">{formatDate(txn.date)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${
                    txn.type === 'debit'
                      ? 'text-red-400'
                      : 'text-emerald-400'
                  }`}>
                    {txn.type === 'debit' ? '-' : '+'}{formatCurrency(txn.amount)}
                  </div>
                  <div className={`text-xs flex items-center justify-end gap-1 ${getStatusColor(txn.status)}`}>
                    {getStatusIcon(txn.status)}
                    {txn.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;
