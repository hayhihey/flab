import React from 'react';
import { HelpCircle, MessageCircle, Phone, Mail, FileText, Search, ChevronRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HelpSupport: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');

  const faqs = [
    {
      category: 'Rides',
      questions: [
        { q: 'How do I request a ride?', a: 'Open the app, enter your destination, select vehicle type, and tap "Request Ride".' },
        { q: 'Can I schedule a ride in advance?', a: 'Yes! Use the "Schedule" option to book rides up to 30 days in advance.' },
        { q: 'How is the fare calculated?', a: 'Fares are based on base fare + distance traveled + time taken.' },
      ],
    },
    {
      category: 'Payments',
      questions: [
        { q: 'What payment methods are accepted?', a: 'We accept cards, wallet balance, and mobile money.' },
        { q: 'Can I use promo codes?', a: 'Yes! Enter promo codes at checkout to get discounts.' },
        { q: 'How do I add money to my wallet?', a: 'Go to Wallet → Add Money and choose your payment method.' },
      ],
    },
    {
      category: 'Loyalty & Rewards',
      questions: [
        { q: 'How do I earn loyalty points?', a: 'You earn 1 point per ₦1 spent, plus bonus points based on your tier.' },
        { q: 'When do I get upgraded to a higher tier?', a: 'Tiers are based on total completed rides: Bronze (0-50), Silver (51-200), Gold (201-500), Platinum (501+).' },
        { q: 'Can I redeem points for cash?', a: 'Yes! Minimum redemption is 100 points = ₦100 to your wallet.' },
      ],
    },
    {
      category: 'Safety',
      questions: [
        { q: 'What is the SOS button?', a: 'Emergency button that alerts police, control center, and your emergency contacts with your live location.' },
        { q: 'Can I share my trip with someone?', a: 'Yes! Use the "Share Trip" feature to send live tracking to trusted contacts.' },
        { q: 'Are all drivers verified?', a: 'Yes, all drivers undergo background checks and vehicle inspections.' },
      ],
    },
  ];

  const contactOptions = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'Call Us',
      description: '24/7 Phone Support',
      action: '+234-800-RIDE-HELP',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Email Us',
      description: 'Get response in 24 hours',
      action: 'support@ridehub.com',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'Live Chat',
      description: 'Chat with our team',
      action: 'Start Chat',
      color: 'from-green-500 to-emerald-500',
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
          
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Help & Support</h1>
              <p className="text-slate-400 mt-1">We're here to help you</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Contact Options */}
        <div className="grid md:grid-cols-3 gap-4">
          {contactOptions.map((option, index) => (
            <button
              key={index}
              className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 group text-left"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${option.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {option.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">{option.title}</h3>
              <p className="text-sm text-slate-400 mb-3">{option.description}</p>
              <span className="text-primary-500 font-medium text-sm">{option.action}</span>
            </button>
          ))}
        </div>

        {/* FAQs */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((category, catIndex) => (
              <div key={catIndex} className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4">{category.category}</h3>
                <div className="space-y-3">
                  {category.questions.map((faq, faqIndex) => (
                    <details key={faqIndex} className="group">
                      <summary className="flex items-center justify-between cursor-pointer p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-all duration-300 list-none">
                        <span className="text-white font-medium">{faq.q}</span>
                        <ChevronRight className="w-5 h-5 text-slate-400 group-open:rotate-90 transition-transform duration-300" />
                      </summary>
                      <div className="mt-2 p-4 text-slate-400 text-sm leading-relaxed">
                        {faq.a}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h2 className="text-xl font-bold text-white mb-4">Quick Links</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { title: 'Terms of Service', icon: <FileText className="w-5 h-5" /> },
              { title: 'Privacy Policy', icon: <FileText className="w-5 h-5" /> },
              { title: 'Community Guidelines', icon: <FileText className="w-5 h-5" /> },
              { title: 'Report a Problem', icon: <FileText className="w-5 h-5" /> },
            ].map((link, index) => (
              <button
                key={index}
                className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-white/10 hover:border-primary-500/50 hover:bg-slate-800 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 group-hover:text-primary-500 transition-colors">
                    {link.icon}
                  </span>
                  <span className="text-white font-medium">{link.title}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-primary-500 transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Still Need Help */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border border-white/10 text-center">
          <h3 className="text-xl font-bold text-white mb-2">Still need help?</h3>
          <p className="text-slate-400 mb-4">Our support team is available 24/7 to assist you</p>
          <button className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-primary-500/30">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};
