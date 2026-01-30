import React, { useState } from 'react';
import { Bell, Car, Gift, Package, AlertCircle, CheckCircle, Clock, X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  type: 'ride' | 'promotion' | 'parcel' | 'safety' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: React.ReactNode;
}

export const Notifications: React.FC = () => {
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'ride',
      title: 'Ride Completed',
      message: 'Your ride to Victoria Island has been completed. ₦1,500 charged.',
      time: '2 hours ago',
      read: false,
      icon: <Car className="w-5 h-5" />,
    },
    {
      id: '2',
      type: 'promotion',
      title: '20% Off Your Next Ride!',
      message: 'Use code SAVE20 and get 20% discount on your next 3 rides. Valid until Feb 5.',
      time: '5 hours ago',
      read: false,
      icon: <Gift className="w-5 h-5" />,
    },
    {
      id: '3',
      type: 'parcel',
      title: 'Parcel Delivered',
      message: 'Your parcel to Lekki has been successfully delivered. View proof of delivery.',
      time: '1 day ago',
      read: false,
      icon: <Package className="w-5 h-5" />,
    },
    {
      id: '4',
      type: 'system',
      title: 'Loyalty Tier Upgraded!',
      message: 'Congratulations! You\'ve been upgraded to Silver tier. Enjoy 5% cashback on all rides.',
      time: '2 days ago',
      read: true,
      icon: <CheckCircle className="w-5 h-5" />,
    },
    {
      id: '5',
      type: 'safety',
      title: 'Safety Feature Update',
      message: 'New SOS button added. Quickly alert emergency contacts during rides.',
      time: '3 days ago',
      read: true,
      icon: <AlertCircle className="w-5 h-5" />,
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'ride': return 'from-blue-500 to-cyan-500';
      case 'promotion': return 'from-primary-500 to-secondary-500';
      case 'parcel': return 'from-purple-500 to-pink-500';
      case 'safety': return 'from-red-500 to-orange-500';
      case 'system': return 'from-green-500 to-emerald-500';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Notifications</h1>
                <p className="text-slate-400 text-sm">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                </p>
              </div>
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-primary-500 hover:text-primary-400 transition-colors font-medium"
              >
                Mark all read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No notifications yet</h3>
            <p className="text-slate-400">We'll notify you when something new happens</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => markAsRead(notification.id)}
              className={`
                relative bg-slate-900/50 backdrop-blur-xl rounded-2xl p-4 border cursor-pointer
                transition-all duration-300 group
                ${notification.read 
                  ? 'border-white/5 hover:border-white/10' 
                  : 'border-primary-500/30 hover:border-primary-500/50 bg-slate-900/70'}
              `}
            >
              {/* Unread indicator */}
              {!notification.read && (
                <div className="absolute top-4 right-4 w-2 h-2 bg-primary-500 rounded-full" />
              )}

              <div className="flex gap-4">
                {/* Icon */}
                <div className={`p-3 bg-gradient-to-br ${getTypeColor(notification.type)} rounded-xl flex-shrink-0 h-fit`}>
                  {notification.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold mb-1">{notification.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-2">{notification.message}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>{notification.time}</span>
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification.id);
                  }}
                  className="flex-shrink-0 p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 h-fit"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
