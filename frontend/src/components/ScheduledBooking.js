import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Calendar, Clock, Users, Share2, Repeat, ChevronRight, Info } from 'lucide-react';
export const ScheduledBooking = ({ onSchedule }) => {
    const [bookingType, setBookingType] = useState('now');
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [recurringPattern, setRecurringPattern] = useState('');
    const [carpoolSeats, setCarpoolSeats] = useState(1);
    const handleSubmit = () => {
        if (bookingType === 'now') {
            onSchedule({
                scheduledFor: new Date(),
                isRecurring: false,
                isCarpool: false,
            });
            return;
        }
        const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
        onSchedule({
            scheduledFor: scheduledDateTime,
            isRecurring: bookingType === 'recurring',
            recurringPattern: bookingType === 'recurring' ? recurringPattern : undefined,
            isCarpool: bookingType === 'carpool',
            carpoolSeats: bookingType === 'carpool' ? carpoolSeats : undefined,
        });
    };
    return (_jsxs("div", { className: "bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700", children: [_jsx("h3", { className: "text-lg font-semibold text-white mb-4", children: "Booking Options" }), _jsxs("div", { className: "grid grid-cols-2 gap-3 mb-6", children: [_jsxs("button", { onClick: () => setBookingType('now'), className: `p-4 rounded-lg border-2 transition-all ${bookingType === 'now'
                            ? 'border-primary bg-primary/10'
                            : 'border-slate-700 hover:border-slate-600'}`, children: [_jsx(Clock, { className: "w-6 h-6 mx-auto mb-2 text-primary" }), _jsx("div", { className: "text-sm font-medium text-white", children: "Book Now" })] }), _jsxs("button", { onClick: () => setBookingType('scheduled'), className: `p-4 rounded-lg border-2 transition-all ${bookingType === 'scheduled'
                            ? 'border-primary bg-primary/10'
                            : 'border-slate-700 hover:border-slate-600'}`, children: [_jsx(Calendar, { className: "w-6 h-6 mx-auto mb-2 text-primary" }), _jsx("div", { className: "text-sm font-medium text-white", children: "Schedule" })] }), _jsxs("button", { onClick: () => setBookingType('recurring'), className: `p-4 rounded-lg border-2 transition-all ${bookingType === 'recurring'
                            ? 'border-primary bg-primary/10'
                            : 'border-slate-700 hover:border-slate-600'}`, children: [_jsx(Repeat, { className: "w-6 h-6 mx-auto mb-2 text-primary" }), _jsx("div", { className: "text-sm font-medium text-white", children: "Recurring" })] }), _jsxs("button", { onClick: () => setBookingType('carpool'), className: `p-4 rounded-lg border-2 transition-all ${bookingType === 'carpool'
                            ? 'border-secondary bg-secondary/10'
                            : 'border-slate-700 hover:border-slate-600'}`, children: [_jsx(Users, { className: "w-6 h-6 mx-auto mb-2 text-secondary" }), _jsx("div", { className: "text-sm font-medium text-white", children: "Carpool" })] })] }), (bookingType === 'scheduled' || bookingType === 'recurring') && (_jsxs("div", { className: "space-y-4 mb-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Date" }), _jsx("input", { type: "date", value: scheduledDate, onChange: (e) => setScheduledDate(e.target.value), min: new Date().toISOString().split('T')[0], max: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], className: "w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Time" }), _jsx("input", { type: "time", value: scheduledTime, onChange: (e) => setScheduledTime(e.target.value), className: "w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary" })] }), bookingType === 'recurring' && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Repeat Pattern" }), _jsxs("select", { value: recurringPattern, onChange: (e) => setRecurringPattern(e.target.value), className: "w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary", children: [_jsx("option", { value: "", children: "Select pattern" }), _jsx("option", { value: "daily_morning", children: "Daily - Morning (same time)" }), _jsx("option", { value: "daily_evening", children: "Daily - Evening (same time)" }), _jsx("option", { value: "weekdays_morning", children: "Weekdays - Morning" }), _jsx("option", { value: "weekdays_evening", children: "Weekdays - Evening" }), _jsx("option", { value: "monday", children: "Every Monday" }), _jsx("option", { value: "tuesday", children: "Every Tuesday" }), _jsx("option", { value: "wednesday", children: "Every Wednesday" }), _jsx("option", { value: "thursday", children: "Every Thursday" }), _jsx("option", { value: "friday", children: "Every Friday" })] }), _jsxs("p", { className: "mt-2 text-xs text-slate-400 flex items-start gap-2", children: [_jsx(Info, { className: "w-4 h-4 flex-shrink-0 mt-0.5" }), _jsx("span", { children: "Perfect for daily commutes! You'll get notifications before each scheduled ride." })] })] }))] })), bookingType === 'carpool' && (_jsxs("div", { className: "space-y-4 mb-6", children: [_jsx("div", { className: "p-4 bg-secondary/10 border border-secondary/30 rounded-lg", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(Share2, { className: "w-5 h-5 text-secondary flex-shrink-0 mt-1" }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-white mb-1", children: "Save 40-60% with Carpooling!" }), _jsx("p", { className: "text-sm text-slate-300", children: "Share your ride with others going in the same direction. Eco-friendly and budget-friendly." })] })] }) }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Seats Needed" }), _jsx("div", { className: "flex gap-2", children: [1, 2, 3].map((seats) => (_jsxs("button", { onClick: () => setCarpoolSeats(seats), className: `flex-1 py-3 rounded-lg border-2 transition-all ${carpoolSeats === seats
                                        ? 'border-secondary bg-secondary/10 text-secondary'
                                        : 'border-slate-700 text-slate-300 hover:border-slate-600'}`, children: [seats, " ", seats === 1 ? 'Seat' : 'Seats'] }, seats))) })] }), _jsxs("div", { className: "text-sm text-slate-400", children: [_jsx("p", { className: "mb-2", children: "\u2022 You'll share the ride with other passengers" }), _jsx("p", { className: "mb-2", children: "\u2022 Driver may make multiple pickups/dropoffs" }), _jsx("p", { children: "\u2022 ETA may be slightly longer but you save money!" })] })] })), _jsxs("button", { onClick: handleSubmit, disabled: (bookingType === 'scheduled' || bookingType === 'recurring') &&
                    (!scheduledDate || !scheduledTime), className: "w-full py-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2", children: [bookingType === 'now' && 'Book Ride Now', bookingType === 'scheduled' && 'Schedule Ride', bookingType === 'recurring' && 'Set Recurring Ride', bookingType === 'carpool' && 'Find Carpool', _jsx(ChevronRight, { className: "w-5 h-5" })] })] }));
};
