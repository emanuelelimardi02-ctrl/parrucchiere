'use client';

import { useState } from 'react';

const weekDays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];

function dateKey(date) {
  return date.toISOString().slice(0, 10);
}

function parseDate(value) {
  if (!value) return new Date();
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

export default function CalendarPicker({ value, onChange, minDate }) {
  const minimumDate = parseDate(minDate || dateKey(new Date()));
  const selectedDate = value ? parseDate(value) : null;
  const [visibleMonth, setVisibleMonth] = useState(() => selectedDate || minimumDate);
  const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1, 12);
  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0, 12).getDate();
  const leadingDays = (firstDay.getDay() + 6) % 7;
  const days = Array.from({ length: leadingDays + daysInMonth }, (_, index) => index < leadingDays ? null : new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), index - leadingDays + 1, 12));

  function moveMonth(offset) {
    setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1, 12));
  }

  return <div className="calendar-picker">
    <div className="calendar-header"><button type="button" className="calendar-nav" aria-label="Mese precedente" onClick={() => moveMonth(-1)} disabled={visibleMonth.getFullYear() === minimumDate.getFullYear() && visibleMonth.getMonth() <= minimumDate.getMonth()}>‹</button><strong>{monthNames[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}</strong><button type="button" className="calendar-nav" aria-label="Mese successivo" onClick={() => moveMonth(1)}>›</button></div>
    <div className="calendar-weekdays">{weekDays.map((day) => <span key={day}>{day}</span>)}</div>
    <div className="calendar-days">{days.map((day, index) => { if (!day) return <span className="calendar-empty" key={`empty-${index}`} />; const dayOfWeek = day.getDay(); const disabled = day < minimumDate || dayOfWeek === 0 || dayOfWeek === 1; const selected = selectedDate && dateKey(day) === dateKey(selectedDate); return <button type="button" key={dateKey(day)} className={`calendar-day${selected ? ' selected' : ''}${disabled ? ' disabled' : ''}`} disabled={disabled} onClick={() => onChange(dateKey(day))}>{day.getDate()}</button>; })}</div>
    {value && <div className="calendar-selected">Data selezionata: <strong>{new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(selectedDate)}</strong></div>}
  </div>;
}
