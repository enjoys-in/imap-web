'use client';

import React, { useState } from 'react';
import { Link2, Copy, Check, Calendar, Clock, X, Globe, User, Sparkles } from 'lucide-react';
import { useSession } from '@/components/providers/SessionProvider';
import { useToastStore } from '@/stores/useToastStore';
import { useCalendarsStore } from '@/stores/useCalendarsStore';
import { createAppointment } from '@/lib/api/handlers/calendar';
import { format, addDays } from 'date-fns';

interface CalendarBookingModalProps {
  open: boolean;
  onClose: () => void;
}

export function CalendarBookingModal({ open, onClose }: CalendarBookingModalProps) {
  const { user, account } = useSession();
  const [copied, setCopied] = useState(false);
  const [duration, setDuration] = useState<number>(30);
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(1);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('10:00 AM');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  const addToast = useToastStore((s) => s.addToast);
  const reloadCalendars = useCalendarsStore((s) => s.load);

  if (!open) return null;

  const username =
    user?.display_name?.toLowerCase().replace(/\s+/g, '-') ||
    account?.email?.split('@')[0] ||
    'my-calendar';

  const bookingUrl = `https://airsend.in/book/${username}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(bookingUrl);
      setCopied(true);
      addToast({
        title: 'Booking link copied',
        description: 'Anyone with this link can view your availability and schedule time with you.',
        type: 'success',
      });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      addToast({
        title: 'Copy failed',
        description: 'Unable to access clipboard.',
        type: 'error',
      });
    }
  };

  const handleBookTestSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooking(true);

    try {
      const targetDate = addDays(new Date(), selectedDayOffset);
      const [timePart, modifier] = selectedTimeSlot.split(' ');
      let [hours, minutes] = timePart.split(':').map(Number);
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;

      const startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), hours, minutes);
      const endDate = new Date(startDate.getTime() + duration * 60000);

      await createAppointment({
        title: `${duration}m Meeting: ${guestName || 'Guest'} & ${user?.display_name || 'Me'}`,
        startUtc: startDate.toISOString(),
        endUtc: endDate.toISOString(),
        location: 'Microsoft Teams / Webex',
        notes: `Booked via AirSend Personal Booking Link.\nGuest: ${guestName} (${guestEmail})\nDuration: ${duration} minutes.`,
        attendees: guestEmail ? [guestEmail] : undefined,
      });

      addToast({
        title: 'Meeting Scheduled',
        description: `Booked for ${format(startDate, 'EEEE, MMM d, yyyy h:mm a')}.`,
        type: 'success',
      });

      reloadCalendars({ force: true }).catch(() => {});
      onClose();
    } catch (err: any) {
      addToast({
        title: 'Booking failed',
        description: err?.message || 'Could not schedule meeting slot.',
        type: 'error',
      });
    } finally {
      setIsBooking(false);
    }
  };

  const days = [1, 2, 3, 4].map((offset) => {
    const d = addDays(new Date(), offset);
    return {
      offset,
      dayName: format(d, 'EEE'),
      dateStr: format(d, 'MMM d'),
    };
  });

  const slots = ['09:30 AM', '10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '04:30 PM'];

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white dark:bg-[#1f1f1f] rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <span>Personal Booking Page</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  Calendly Style
                </span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Share your booking link so clients &amp; teammates can pick available slots
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shareable Link Box */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-2">
            <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Your Shareable Booking Link
            </span>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-1.5 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-300 dark:border-neutral-700 font-mono text-xs text-neutral-800 dark:text-neutral-200 truncate select-all">
                {bookingUrl}
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Scheduling Simulation */}
          <div className="space-y-3 pt-1">
            <span className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">
              Meeting Slot Preview
            </span>

            {/* Duration Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 mr-1">
                Duration:
              </span>
              {[15, 30, 45, 60].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    duration === d
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {d}m
                </button>
              ))}
            </div>

            {/* Day Selector */}
            <div className="grid grid-cols-4 gap-2">
              {days.map((day) => (
                <button
                  key={day.offset}
                  type="button"
                  onClick={() => setSelectedDayOffset(day.offset)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    selectedDayOffset === day.offset
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
                      : 'border-neutral-200 dark:border-neutral-700/80 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold tracking-wider">{day.dayName}</div>
                  <div className="text-sm font-extrabold mt-0.5">{day.dateStr}</div>
                </button>
              ))}
            </div>

            {/* Time Slot Grid */}
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                Available Start Times
              </span>
              <div className="grid grid-cols-3 gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTimeSlot(slot)}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      selectedTimeSlot === slot
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>{slot}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Booking Form */}
            <form onSubmit={handleBookTestSlot} className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Guest Name (e.g. Sarah Connor)"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  required
                />
                <input
                  type="email"
                  placeholder="Guest Email (sarah@example.com)"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBooking}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{isBooking ? 'Scheduling...' : 'Book Meeting Slot'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
