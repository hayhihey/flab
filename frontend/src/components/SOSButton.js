import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { AlertTriangle, Phone, Shield, Users, MapPin } from 'lucide-react';
import axios from 'axios';
export const SOSButton = ({ rideId, userId, currentLocation, onSOSTriggered, }) => {
    const [showModal, setShowModal] = useState(false);
    const [sosType, setSOSType] = useState('emergency');
    const [description, setDescription] = useState('');
    const [triggering, setTriggering] = useState(false);
    const handleSOSTrigger = async () => {
        if (!rideId) {
            alert('No active ride to trigger SOS');
            return;
        }
        setTriggering(true);
        try {
            const response = await axios.post('/api/safety/sos', {
                rideId,
                userId,
                location: currentLocation,
                type: sosType,
                description,
            });
            console.log('SOS triggered:', response.data);
            // Notify user
            alert(`🚨 EMERGENCY SERVICES ALERTED!\n\n${response.data.emergencyResponse.status}\n\nHelp is on the way. Stay safe.`);
            setShowModal(false);
            onSOSTriggered?.();
        }
        catch (error) {
            console.error('SOS trigger error:', error);
            alert('Failed to trigger SOS. Please call emergency services directly: 112');
        }
        finally {
            setTriggering(false);
        }
    };
    return (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setShowModal(true), className: "fixed bottom-24 right-6 w-16 h-16 bg-red-600 hover:bg-red-700 rounded-full shadow-2xl flex items-center justify-center z-50 animate-pulse", children: _jsx(Shield, { className: "w-8 h-8 text-white" }) }), showModal && (_jsx("div", { className: "fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-slate-900 rounded-xl max-w-md w-full p-6 border border-red-500/50", children: [_jsxs("div", { className: "flex items-center gap-3 mb-6", children: [_jsx("div", { className: "w-12 h-12 bg-red-600 rounded-full flex items-center justify-center", children: _jsx(AlertTriangle, { className: "w-6 h-6 text-white" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-white", children: "Emergency SOS" }), _jsx("p", { className: "text-sm text-slate-400", children: "Help will be dispatched immediately" })] })] }), _jsxs("div", { className: "space-y-4 mb-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Emergency Type" }), _jsx("div", { className: "grid grid-cols-2 gap-2", children: [
                                                { value: 'emergency', label: 'Emergency', icon: AlertTriangle },
                                                { value: 'unsafe_driving', label: 'Unsafe Driving', icon: Phone },
                                                { value: 'harassment', label: 'Harassment', icon: Users },
                                                { value: 'accident', label: 'Accident', icon: MapPin },
                                            ].map(({ value, label, icon: Icon }) => (_jsxs("button", { onClick: () => setSOSType(value), className: `p-3 rounded-lg border-2 transition-all ${sosType === value
                                                    ? 'border-red-500 bg-red-500/20'
                                                    : 'border-slate-700 hover:border-slate-600'}`, children: [_jsx(Icon, { className: "w-5 h-5 mx-auto mb-1 text-white" }), _jsx("div", { className: "text-xs text-white", children: label })] }, value))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Additional Details (Optional)" }), _jsx("textarea", { value: description, onChange: (e) => setDescription(e.target.value), placeholder: "Describe the situation...", className: "w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none", rows: 3 })] }), _jsxs("div", { className: "bg-red-500/10 border border-red-500/30 rounded-lg p-4", children: [_jsx("h4", { className: "font-medium text-red-400 mb-2", children: "What happens next:" }), _jsxs("ul", { className: "text-sm text-slate-300 space-y-1", children: [_jsx("li", { children: "\u2713 Local police will be alerted with your GPS location" }), _jsx("li", { children: "\u2713 Your emergency contacts will receive SMS notification" }), _jsx("li", { children: "\u2713 Company control center will monitor your ride" }), _jsx("li", { children: "\u2713 Live tracking link will be sent to your contacts" })] })] })] }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: () => setShowModal(false), className: "flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all", children: "Cancel" }), _jsx("button", { onClick: handleSOSTrigger, disabled: triggering || !rideId, className: "flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2", children: triggering ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" }), "Alerting..."] })) : (_jsxs(_Fragment, { children: [_jsx(Shield, { className: "w-5 h-5" }), "TRIGGER SOS"] })) })] }), _jsx("div", { className: "mt-4 text-center", children: _jsxs("p", { className: "text-xs text-slate-400", children: ["Or call emergency services directly:", _jsx("a", { href: "tel:112", className: "text-red-400 font-bold ml-2", children: "112" })] }) })] }) }))] }));
};
