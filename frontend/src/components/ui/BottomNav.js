import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Map, Calculator, User, Wallet } from 'lucide-react';
const navItems = [
    { icon: _jsx(Home, { className: "w-5 h-5" }), label: 'Home', path: '/dashboard' },
    { icon: _jsx(Map, { className: "w-5 h-5" }), label: 'Ride', path: '/ride' },
    { icon: _jsx(Wallet, { className: "w-5 h-5" }), label: 'Wallet', path: '/wallet' },
    { icon: _jsx(Calculator, { className: "w-5 h-5" }), label: 'Fares', path: '/fare-calculator' },
    { icon: _jsx(User, { className: "w-5 h-5" }), label: 'Profile', path: '/profile' },
];
export const BottomNav = () => {
    const location = useLocation();
    // Don't show on auth page
    if (location.pathname === '/' || location.pathname === '/auth') {
        return null;
    }
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "h-20 md:hidden" }), _jsxs("nav", { className: "fixed bottom-0 left-0 right-0 z-50 md:hidden", children: [_jsx("div", { className: "absolute inset-0 bg-slate-900/80 backdrop-blur-xl border-t border-white/10" }), _jsx("div", { className: "relative px-2 pb-safe", children: _jsx("div", { className: "flex items-center justify-around h-16", children: navItems.map((item) => {
                                const isActive = location.pathname === item.path ||
                                    (item.path === '/dashboard' && location.pathname === '/');
                                return (_jsxs(NavLink, { to: item.path, className: `
                    relative flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-xl
                    transition-all duration-300 group min-w-[60px]
                  `, children: [isActive && (_jsx("span", { className: "absolute inset-0 bg-gradient-to-b from-primary-500/20 to-transparent rounded-xl" })), _jsxs("span", { className: `
                      relative transition-all duration-300
                      ${isActive
                                                ? 'text-primary-500 scale-110'
                                                : 'text-slate-500 group-hover:text-slate-300'}
                    `, children: [item.icon, isActive && (_jsx("span", { className: "absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full" }))] }), _jsx("span", { className: `
                      text-[10px] font-medium transition-colors duration-300
                      ${isActive ? 'text-primary-500' : 'text-slate-500 group-hover:text-slate-300'}
                    `, children: item.label })] }, item.path));
                            }) }) })] })] }));
};
export default BottomNav;
