import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { User, Mail, Phone, MapPin, Camera, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/context/store';
export const EditProfile = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: '',
        profilePhoto: null,
    });
    const [loading, setLoading] = useState(false);
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handlePhotoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, profilePhoto: e.target.files[0] });
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // TODO: Call API to update profile
            await new Promise(resolve => setTimeout(resolve, 1000));
            alert('Profile updated successfully!');
            navigate('/profile');
        }
        catch (error) {
            console.error('Update error:', error);
            alert('Failed to update profile');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-slate-950 pb-20", children: [_jsx("div", { className: "bg-gradient-to-b from-slate-900 to-slate-950 border-b border-white/10", children: _jsxs("div", { className: "max-w-2xl mx-auto px-4 py-6", children: [_jsxs("button", { onClick: () => navigate('/profile'), className: "flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4", children: [_jsx(ArrowLeft, { className: "w-5 h-5" }), _jsx("span", { children: "Back" })] }), _jsx("h1", { className: "text-2xl font-bold text-white", children: "Edit Profile" }), _jsx("p", { className: "text-slate-400 mt-1", children: "Update your personal information" })] }) }), _jsx("div", { className: "max-w-2xl mx-auto px-4 py-6", children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsx("div", { className: "bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10", children: _jsxs("div", { className: "flex flex-col items-center", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-3xl font-bold", children: user?.name?.charAt(0)?.toUpperCase() || 'U' }), _jsxs("label", { className: "absolute bottom-0 right-0 p-2 bg-primary-500 rounded-full cursor-pointer hover:bg-primary-600 transition-colors shadow-lg", children: [_jsx(Camera, { className: "w-4 h-4 text-white" }), _jsx("input", { type: "file", accept: "image/*", onChange: handlePhotoChange, className: "hidden" })] })] }), _jsx("p", { className: "text-sm text-slate-400 mt-3", children: "Click camera to change photo" })] }) }), _jsxs("div", { className: "bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10 space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Full Name" }), _jsxs("div", { className: "relative", children: [_jsx(User, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" }), _jsx("input", { type: "text", name: "name", value: formData.name, onChange: handleChange, className: "w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500", placeholder: "Enter your name", required: true })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Email Address" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" }), _jsx("input", { type: "email", name: "email", value: formData.email, onChange: handleChange, className: "w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500", placeholder: "your@email.com", required: true })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Phone Number" }), _jsxs("div", { className: "relative", children: [_jsx(Phone, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" }), _jsx("input", { type: "tel", name: "phone", value: formData.phone, onChange: handleChange, className: "w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500", placeholder: "+234 800 000 0000", required: true })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Home Address (Optional)" }), _jsxs("div", { className: "relative", children: [_jsx(MapPin, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" }), _jsx("input", { type: "text", name: "address", value: formData.address, onChange: handleChange, className: "w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500", placeholder: "Enter your address" })] })] })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full py-4 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2", children: loading ? (_jsx("div", { className: "w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" })) : (_jsxs(_Fragment, { children: [_jsx(Save, { className: "w-5 h-5" }), "Save Changes"] })) })] }) })] }));
};
