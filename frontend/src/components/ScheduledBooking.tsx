import React, { useState } from 'react';
import { Calendar, Clock, Users, Share2, Repeat, ChevronRight, Info } from 'lucide-react';

interface ScheduledBookingProps {
  onSchedule: (data: {
    scheduledFor: Date;
    isRecurring: boolean;
    recurringPattern?: string;
    isCarpool: boolean;
    carpoolSeats?: number;
  }) => void;
}

export const ScheduledBooking: React.FC<ScheduledBookingProps> = ({ onSchedule }) => {
  const [bookingType, setBookingType] = useState<'now' | 'scheduled' | 'recurring' | 'carpool'>('now');
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

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700">
      <h3 className="text-lg font-semibold text-white mb-4">Booking Options</h3>

      {/* Booking Type Selector */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => setBookingType('now')}
          className={`p-4 rounded-lg border-2 transition-all ${
            bookingType === 'now'
              ? 'border-primary bg-primary/10'
              : 'border-slate-700 hover:border-slate-600'
          }`}
        >
          <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
          <div className="text-sm font-medium text-white">Book Now</div>
        </button>

        <button
          onClick={() => setBookingType('scheduled')}
          className={`p-4 rounded-lg border-2 transition-all ${
            bookingType === 'scheduled'
              ? 'border-primary bg-primary/10'
              : 'border-slate-700 hover:border-slate-600'
          }`}
        >
          <Calendar className="w-6 h-6 mx-auto mb-2 text-primary" />
          <div className="text-sm font-medium text-white">Schedule</div>
        </button>

        <button
          onClick={() => setBookingType('recurring')}
          className={`p-4 rounded-lg border-2 transition-all ${
            bookingType === 'recurring'
              ? 'border-primary bg-primary/10'
              : 'border-slate-700 hover:border-slate-600'
          }`}
        >
          <Repeat className="w-6 h-6 mx-auto mb-2 text-primary" />
          <div className="text-sm font-medium text-white">Recurring</div>
        </button>

        <button
          onClick={() => setBookingType('carpool')}
          className={`p-4 rounded-lg border-2 transition-all ${
            bookingType === 'carpool'
              ? 'border-secondary bg-secondary/10'
              : 'border-slate-700 hover:border-slate-600'
          }`}
        >
          <Users className="w-6 h-6 mx-auto mb-2 text-secondary" />
          <div className="text-sm font-medium text-white">Carpool</div>
        </button>
      </div>

      {/* Scheduled Ride Options */}
      {(bookingType === 'scheduled' || bookingType === 'recurring') && (
        <div className="space-y-4 mb-6">
          <div>
            <label htmlFor="scheduled-date" className="block text-sm font-medium text-slate-300 mb-2">Date</label>
            <input
              id="scheduled-date"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Select scheduled ride date"
            />
          </div>

          <div>
            <label htmlFor="scheduled-time" className="block text-sm font-medium text-slate-300 mb-2">Time</label>
            <input
              id="scheduled-time"
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Select scheduled ride time"
            />
          </div>

          {bookingType === 'recurring' && (
            <div>
              <label htmlFor="recurring-pattern" className="block text-sm font-medium text-slate-300 mb-2">Repeat Pattern</label>
              <select
                id="recurring-pattern"
                value={recurringPattern}
                onChange={(e) => setRecurringPattern(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Select recurring ride pattern"
              >
                <option value="">Select pattern</option>
                <option value="daily_morning">Daily - Morning (same time)</option>
                <option value="daily_evening">Daily - Evening (same time)</option>
                <option value="weekdays_morning">Weekdays - Morning</option>
                <option value="weekdays_evening">Weekdays - Evening</option>
                <option value="monday">Every Monday</option>
                <option value="tuesday">Every Tuesday</option>
                <option value="wednesday">Every Wednesday</option>
                <option value="thursday">Every Thursday</option>
                <option value="friday">Every Friday</option>
              </select>
              <p className="mt-2 text-xs text-slate-400 flex items-start gap-2">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Perfect for daily commutes! You'll get notifications before each scheduled ride.</span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Carpool Options */}
      {bookingType === 'carpool' && (
        <div className="space-y-4 mb-6">
          <div className="p-4 bg-secondary/10 border border-secondary/30 rounded-lg">
            <div className="flex items-start gap-3">
              <Share2 className="w-5 h-5 text-secondary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-medium text-white mb-1">Save 40-60% with Carpooling!</h4>
                <p className="text-sm text-slate-300">
                  Share your ride with others going in the same direction. Eco-friendly and budget-friendly.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Seats Needed
            </label>
            <div className="flex gap-2">
              {[1, 2, 3].map((seats) => (
                <button
                  key={seats}
                  onClick={() => setCarpoolSeats(seats)}
                  className={`flex-1 py-3 rounded-lg border-2 transition-all ${
                    carpoolSeats === seats
                      ? 'border-secondary bg-secondary/10 text-secondary'
                      : 'border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  {seats} {seats === 1 ? 'Seat' : 'Seats'}
                </button>
              ))}
            </div>
          </div>

          <div className="text-sm text-slate-400">
            <p className="mb-2">• You'll share the ride with other passengers</p>
            <p className="mb-2">• Driver may make multiple pickups/dropoffs</p>
            <p>• ETA may be slightly longer but you save money!</p>
          </div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={
          (bookingType === 'scheduled' || bookingType === 'recurring') &&
          (!scheduledDate || !scheduledTime)
        }
        className="w-full py-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {bookingType === 'now' && 'Book Ride Now'}
        {bookingType === 'scheduled' && 'Schedule Ride'}
        {bookingType === 'recurring' && 'Set Recurring Ride'}
        {bookingType === 'carpool' && 'Find Carpool'}
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};
