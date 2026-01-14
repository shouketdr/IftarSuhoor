"use client";
import React, { useState, useEffect } from 'react';
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { Moon, Sun, CheckCircle2, MapPin, Calendar as CalIcon } from 'lucide-react';

export default function RamadanTracker() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
  const [completedFasts, setCompletedFasts] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
    const saved = localStorage.getItem('ramadan_fasts');
    if (saved) setCompletedFasts(JSON.parse(saved));
  }, []);

  const userCoords = coords ? new Coordinates(coords.lat, coords.lng) : new Coordinates(21.4225, 39.8262);
  const times = new PrayerTimes(userCoords, selectedDate, CalculationMethod.UmmAlQura());

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(selectedDate),
    end: endOfMonth(selectedDate),
  });

  const toggleFast = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const updated = completedFasts.includes(dateStr) 
      ? completedFasts.filter(d => d !== dateStr)
      : [...completedFasts, dateStr];
    setCompletedFasts(updated);
    localStorage.setItem('ramadan_fasts', JSON.stringify(updated));
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 max-w-md mx-auto pb-20">
      <header className="flex justify-between items-center mb-6 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-emerald-400">Ramadan Tracker</h1>
          <p className="text-slate-400 flex items-center text-xs"><MapPin size={12} className="mr-1" /> Global GPS</p>
        </div>
        <div className="bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/40 text-emerald-400 font-bold">{completedFasts.length} Fasts</div>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-900 p-4 rounded-3xl border border-indigo-500/20 text-center">
          <Moon className="text-indigo-400 mx-auto mb-1" size={20} />
          <p className="text-slate-400 text-[10px] uppercase">Suhoor</p>
          <p className="text-lg font-bold">{format(times.fajr, 'hh:mm a')}</p>
        </div>
        <div className="bg-slate-900 p-4 rounded-3xl border border-orange-500/20 text-center">
          <Sun className="text-orange-400 mx-auto mb-1" size={20} />
          <p className="text-slate-400 text-[10px] uppercase">Iftar</p>
          <p className="text-lg font-bold">{format(times.maghrib, 'hh:mm a')}</p>
        </div>
      </div>

      <div className="bg-slate-900 rounded-3xl p-4 border border-slate-800 mb-6">
        <h2 className="font-semibold flex items-center gap-2 mb-4"><CalIcon size={18} className="text-emerald-500" />{format(selectedDate, 'MMMM yyyy')}</h2>
        <div className="grid grid-cols-7 gap-2">
          {daysInMonth.map((day, idx) => {
            const isSelected = isSameDay(day, selectedDate);
            const isDone = completedFasts.includes(format(day, 'yyyy-MM-dd'));
            return (
              <button key={idx} onClick={() => setSelectedDate(day)}
                className={`relative aspect-square rounded-xl flex items-center justify-center text-sm ${isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-800'}`}>
                {format(day, 'd')}
                {isDone && <div className="absolute top-1 right-1 bg-emerald-400 rounded-full w-2 h-2" />}
              </button>
            );
          })}
        </div>
      </div>

      <button onClick={() => toggleFast(selectedDate)} className="w-full py-4 rounded-2xl font-bold bg-emerald-600 text-white flex items-center justify-center gap-2">
        <CheckCircle2 size={20} /> {completedFasts.includes(format(selectedDate, 'yyyy-MM-dd')) ? 'Fast Saved' : 'Mark as Fasted'}
      </button>
    </div>
  );
}
