import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Map, Clock, Calculator, User, Wallet } from 'lucide-react';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: <Home className="w-5 h-5" />, label: 'Home', path: '/dashboard' },
  { icon: <Map className="w-5 h-5" />, label: 'Ride', path: '/ride' },
  { icon: <Wallet className="w-5 h-5" />, label: 'Wallet', path: '/wallet' },
  { icon: <Calculator className="w-5 h-5" />, label: 'Fares', path: '/fare-calculator' },
  { icon: <User className="w-5 h-5" />, label: 'Profile', path: '/profile' },
];

export const BottomNav: React.FC = () => {
  const location = useLocation();

  // Don't show on auth page
  if (location.pathname === '/' || location.pathname === '/auth') {
    return null;
  }

  return (
    <>
      {/* Spacer for bottom nav */}
      <div className="h-20 md:hidden" />
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        {/* Glass background with blur */}
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl border-t border-white/10" />
        
        {/* Safe area padding for iOS */}
        <div className="relative px-2 pb-safe">
          <div className="flex items-center justify-around h-16">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path === '/dashboard' && location.pathname === '/');
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`
                    relative flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-xl
                    transition-all duration-300 group min-w-[60px]
                  `}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <span className="absolute inset-0 bg-gradient-to-b from-primary-500/20 to-transparent rounded-xl" />
                  )}
                  
                  {/* Icon container */}
                  <span
                    className={`
                      relative transition-all duration-300
                      ${isActive 
                        ? 'text-primary-500 scale-110' 
                        : 'text-slate-500 group-hover:text-slate-300'}
                    `}
                  >
                    {item.icon}
                    
                    {/* Active dot */}
                    {isActive && (
                      <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full" />
                    )}
                  </span>
                  
                  {/* Label */}
                  <span
                    className={`
                      text-[10px] font-medium transition-colors duration-300
                      ${isActive ? 'text-primary-500' : 'text-slate-500 group-hover:text-slate-300'}
                    `}
                  >
                    {item.label}
                  </span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
