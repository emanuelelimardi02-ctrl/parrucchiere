'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import CalendarPicker from '../components/CalendarPicker';

const times = ['09:00', '09:15', '09:30', '09:45', '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45', '12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45', '14:00', '14:15', '14:30', '14:45', '15:00', '15:15', '15:30', '15:45', '16:00', '16:15', '16:30', '16:45', '17:00', '17:15', '17:30', '17:45', '18:00', '18:15', '18:30', '18:45'];
const services = [['taglio', 'Taglio Capelli Uomo - €20,00', '45 min'], ['taglio_barba', 'Taglio Capelli Uomo + Barba - €25,00', '1 ora'], ['barba', 'Modellatura Barba - €10,00', '30 min'], ['bimbo', 'Taglio BIMBO (0 - 5 anni) - €15,00', '30 min'], ['skincare', 'Trattamento viso - €25,00', '30 min']];

export default function BookingPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ serviceKey: '', barber: '', date: '', time: '', customerName: '', phone: '' });
  const [error, setError] = useState('');
  const [unavailableTimes, setUnavailableTimes] = useState([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [closedDay, setClosedDay] = useState(false);
  const [calendarSaved, setCalendarSaved] = useState(false);

  useEffect(() => {
    if (!form.serviceKey || !form.barber || !form.date) {
      setUnavailableTimes([]);
      setClosedDay(false);
      return;
    }
    const controller = new AbortController();
    setLoadingTimes(true);
    fetch(`/api/appointments?barber=${encodeURIComponent(form.barber)}&date=${encodeURIComponent(form.date)}&serviceKey=${encodeURIComponent(form.serviceKey)}`, { signal: controller.signal })
      .then((response) => response.json().then((data) => ({ response, data })))
      .then(({ response, data }) => {
        if (!response.ok) throw new Error(data.error);
        setUnavailableTimes(data.unavailableTimes);
        setClosedDay(data.closed === true);
        setForm((current) => data.unavailableTimes.includes(current.time) ? { ...current, time: '' } : current);
      })
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError('Impossibile verificare gli orari disponibili.');
      })
      .finally(() => setLoadingTimes(false));
    return () => controller.abort();
  }, [form.serviceKey, form.barber, form.date]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    const response = await fetch('/api/appointments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error || 'Impossibile inviare la richiesta.');
      return;
    }
    setSent(true);
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function saveToCalendar() {
    const serviceName = selectedService?.[1].replace(/ - €\d+,\d{2}/, '') || 'Appuntamento';
    const [year, month, day] = form.date.split('-');
    const [hours, minutes] = form.time.split(':').map(Number);
    const start = new Date(Number(year), Number(month) - 1, Number(day), hours, minutes);
    const durationMinutes = selectedService?.[2] === '1 ora' ? 60 : Number.parseInt(selectedService?.[2], 10);
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
    const formatCalendarDate = (date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
    const escapeCalendarText = (value) => value.replace(/[\\;,]/g, '\\$&').replace(/\r?\n/g, '\\n');
    const calendar = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Lui Parrucchieri Uomo//Prenotazioni//IT', 'BEGIN:VEVENT', `UID:appointment-${Date.now()}@lui-parrucchieri`, `DTSTAMP:${formatCalendarDate(new Date())}`, `DTSTART:${formatCalendarDate(start)}`, `DTEND:${formatCalendarDate(end)}`, `SUMMARY:${escapeCalendarText(serviceName)}`, `DESCRIPTION:${escapeCalendarText(`Appuntamento con ${form.barber} per ${serviceName}`)}`, 'LOCATION:Via Toscana n.44, 04100 Latina', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([calendar], { type: 'text/calendar;charset=utf-8' }));
    link.download = `appuntamento-lui-parrucchieri-${form.date}.ics`;
    link.click();
    URL.revokeObjectURL(link.href);
    setCalendarSaved(true);
  }

  const selectedService = services.find((service) => service[0] === form.serviceKey);
  const formattedDate = form.date ? new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${form.date}T12:00:00`)) : '';
  const today = new Date().toISOString().split('T')[0];

  return <div className="booking-page page-bg"><nav className="nav simple-nav shell"><Link className="brand" href="/"><span>Lui</span> Parrucchieri</Link><Link className="button ghost" href="/">Torna alla home</Link></nav><main className="shell"><div className="form-wrap"><div className="eyebrow">Prenotazioni online</div><p className="muted"></p>{sent ? <div className="booking-confirmation"><div className="booking-confirmation-icon">✓</div><h2>Appuntamento confermato</h2><p>Ti aspettiamo da Lui Parrucchieri Uomo.</p><div className="booking-summary"><div><span>Servizio</span><strong>{selectedService?.[1].replace(/ - €\d+,\d{2}/, '')}</strong></div><div><span>Data</span><strong>{formattedDate}</strong></div><div><span>Ora</span><strong>{form.time}</strong></div><div><span>Professionista</span><strong>{form.barber}</strong></div></div><p className="booking-confirmation-note">La tua prenotazione è stata salvata correttamente.</p><button className="button booking-calendar-button" type="button" onClick={saveToCalendar}>{calendarSaved ? 'Calendario aggiornato' : 'Salva nel calendario'} <span>+</span></button></div> : <form onSubmit={handleSubmit}>
    <section className="form-section"><h2>01 / Servizio</h2><select required value={form.serviceKey} onChange={(event) => updateField('serviceKey', event.target.value)}><option value="" disabled>Seleziona dal listino...</option>{services.map(service => <option key={service[0]} value={service[0]}>{service[1]} - {service[2]}</option>)}</select></section>
    <section className="form-section"><h2>02 / Professionista</h2><div className="choice-grid">{['Emanuele', 'Luca'].map(name => <label key={name}><input type="radio" name="barber" value={name} checked={form.barber === name} onChange={(event) => updateField('barber', event.target.value)} required /><span className="choice">{name}</span></label>)}</div></section>
    <section className="form-section"><h2>03 / Data e orario</h2><CalendarPicker value={form.date} minDate={today} onChange={(value) => updateField('date', value)} /><p className="muted">{loadingTimes ? 'Verifica degli orari in corso...' : closedDay ? 'Il salone è chiuso la domenica e il lunedì.' : 'Orari disponibili ogni 15 minuti:'}</p><div className="time-grid">{times.map(time => { const disabled = !form.serviceKey || !form.barber || !form.date || closedDay || unavailableTimes.includes(time); return <label key={time}><input type="radio" name="time" value={time} checked={form.time === time} onChange={(event) => updateField('time', event.target.value)} disabled={disabled} required /><span className={`time${disabled ? ' disabled' : ''}`}>{time}</span></label>; })}</div></section>
    <section className="form-section"><h2>04 / I tuoi dati</h2><div className="form-row"><input type="text" value={form.customerName} onChange={(event) => updateField('customerName', event.target.value)} placeholder="Nome e cognome" required /><input type="tel" value={form.phone} onChange={(event) => updateField('phone', event.target.value)} placeholder="Numero di cellulare" pattern="(?:\+39[\s.-]?)?3[0-9]{2}[\s.-]?[0-9]{6,7}" title="Inserisci un numero di cellulare italiano valido (9 o 10 cifre)" inputMode="tel" required /></div></section>
    {error && <div className="notice booking-error">{error}</div>}<button className="button" style={{width: '100%', marginTop: 36}} type="submit">Conferma prenotazione <span>→</span></button>
  </form>}</div></main><footer className="footer"><div className="shell"><small>© 2026 Lui Parrucchieri Uomo · Via Toscana n.44, Latina</small></div></footer></div>;
}
