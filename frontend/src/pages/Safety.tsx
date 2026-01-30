import React from 'react';
import { Shield, Phone, Users, AlertTriangle, MapPin, Video, FileText, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SOSButton } from '@/components/SOSButton';
import { useAuthStore } from '@/context/store';

export const Safety: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const safetyFeatures = [
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: 'Emergency SOS',
      description: 'Quickly alert authorities and emergency contacts during a ride',
      color: 'from-red-500 to-orange-500',
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: '24/7 Support',
      description: 'Round-the-clock customer support for any safety concerns',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Share Trip Details',
      description: 'Share your live location and ride details with trusted contacts',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: 'Route Monitoring',
      description: 'Real-time route tracking with deviation alerts',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: <Video className="w-6 h-6" />,
      title: 'Ride Recording',
      description: 'Optional audio/video recording with your consent for safety',
      color: 'from-yellow-500 to-amber-500',
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'Driver Verification',
      description: 'All drivers are background-checked and verified',
      color: 'from-indigo-500 to-violet-500',
    },
  ];

  const emergencyContacts = [
    { name: 'Police', number: '112', icon: '🚔' },
    { name: 'Ambulance', number: '112', icon: '🚑' },
    { name: 'Fire Service', number: '112', icon: '🚒' },
    { name: 'Support', number: '+234-800-RIDE-HELP', icon: '📞' },
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
            <div className="p-4 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Safety Center</h1>
              <p className="text-slate-400 mt-1">Your safety is our top priority</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Emergency Alert Banner */}
        <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-500 rounded-xl flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">In an Emergency?</h3>
              <p className="text-slate-300 mb-4">
                If you're in immediate danger during a ride, use the SOS button to alert authorities and your emergency contacts instantly.
              </p>
              {user && <SOSButton userId={user.id} />}
            </div>
          </div>
        </div>

        {/* Safety Features Grid */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Safety Features</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {safetyFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 group"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-4">Emergency Contacts</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {emergencyContacts.map((contact, index) => (
              <a
                key={index}
                href={`tel:${contact.number}`}
                className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-white/10 hover:border-primary-500/50 hover:bg-slate-800 transition-all duration-300 group"
              >
                <span className="text-3xl">{contact.icon}</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-white group-hover:text-primary-500 transition-colors">
                    {contact.name}
                  </h4>
                  <p className="text-sm text-slate-400">{contact.number}</p>
                </div>
                <Phone className="w-5 h-5 text-slate-500 group-hover:text-primary-500 transition-colors" />
              </a>
            ))}
          </div>
        </div>

        {/* Safety Tips */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-4">Safety Tips</h2>
          <ul className="space-y-3">
            {[
              'Always verify the driver and vehicle details before entering',
              'Share your trip details with trusted contacts',
              'Sit in the back seat for better personal space',
              'Trust your instincts - if something feels wrong, speak up',
              'Keep your phone charged and accessible',
              'Follow the GPS route and report any unusual detours',
            ].map((tip, index) => (
              <li key={index} className="flex items-start gap-3 text-slate-300">
                <div className="w-6 h-6 bg-primary-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary-500 text-sm font-bold">{index + 1}</span>
                </div>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Report an Issue */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border border-white/10">
          <h2 className="text-xl font-bold text-white mb-2">Report a Safety Issue</h2>
          <p className="text-slate-400 mb-4">
            If you experienced any safety concerns during your ride, please let us know so we can take appropriate action.
          </p>
          <button className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-red-500/30">
            Report Safety Issue
          </button>
        </div>
      </div>
    </div>
  );
};
