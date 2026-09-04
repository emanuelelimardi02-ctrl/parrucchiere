'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import CalendarPicker from '../components/CalendarPicker';

const demoAppointments = {
  Luca: [{ id: 'demo-luca-1', time: '09:00', customerName: 'Marco Bianchi', serviceLabel: 'Taglio + Barba', phone: '333 1234567', status: 'Approvato' }, { id: 'demo-luca-2', time: '10:30', customerName: 'Andrea Russo', serviceLabel: 'Solo Taglio', phone: '340 9876543', status: 'Approvato' }],
  Emanuele: [{ id: 'demo-emanuele-1', time: '15:00', customerName: 'Giovanni Ferri', serviceLabel: 'Modellatura Barba', phone: '338 1122334', status: 'Approvato' }, { id: 'demo-emanuele-2', time: '18:45', customerName: 'Davide Conti', serviceLabel: 'Taglio + Barba', phone: '392 4455667', status: 'Approvato' }],
};
const serviceOptions = [['taglio', 'Taglio Capelli Uomo - 45 min'], ['taglio_barba', 'Taglio + Barba - 1 ora'], ['barba', 'Modellatura Barba - 30 min'], ['bimbo', 'Taglio BIMBO - 30 min'], ['skincare', 'Trattamento viso - 30 min']];
const times = Array.from({ length: 40 }, (_, index) => `${String(9 + Math.floor(index / 4)).padStart(2, '0')}:${String((index % 4) * 15).padStart(2, '0')}`);
const emptyForm = { id: null, barber: 'Luca', serviceKey: 'taglio', date: '', time: times[0], customerName: '', phone: '' };

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [active, setActive] = useState('Luca');
  const [appointments, setAppointments] = useState(demoAppointments);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [availableTimes, setAvailableTimes] = useState(times);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!authenticated) return;
    setLoading(true);
    fetch('/api/appointments').then((response) => response.json().then((data) => ({ response, data }))).then(({ response, data }) => {
      if (!response.ok) throw new Error(data.error);
      const loaded = { Luca: [], Emanuele: [] };
      data.appointments.forEach((appointment) => loaded[appointment.barber].push(appointment));
      setAppointments(loaded);
    }).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false));
  }, [authenticated]);

  useEffect(() => {
    if (!modalOpen || !form.date) { setAvailableTimes(times); return undefined; }
    const controller = new AbortController();
    fetch(`/api/appointments?barber=${encodeURIComponent(form.barber)}&date=${encodeURIComponent(form.date)}&serviceKey=${encodeURIComponent(form.serviceKey)}`, { signal: controller.signal }).then((response) => response.json()).then((data) => {
      const unavailable = data.closed ? times : data.unavailableTimes || [];
      const currentAppointmentTime = appointments[active].find((appointment) => appointment.id === form.id)?.time;
      const nextTimes = times.filter((time) => !unavailable.includes(time) || time === currentAppointmentTime);
      setAvailableTimes(nextTimes);
      setForm((current) => nextTimes.includes(current.time) ? current : { ...current, time: nextTimes[0] || '' });
    }).catch((requestError) => { if (requestError.name !== 'AbortError') setError('Impossibile verificare gli orari.'); });
    return () => controller.abort();
  }, [modalOpen, form.barber, form.date, form.serviceKey, form.id, appointments, active]);

  async function handleAuth(event) {
    event.preventDefault();
    setAuthLoading(true); setAuthError('');
    const response = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: authMode, username, password }) });
    const data = await response.json();
    setAuthLoading(false);
    if (!response.ok) { setAuthError(data.error); return; }
    setAuthenticated(true);
  }

  function openCreate() { setForm({ ...emptyForm, date: today }); setError(''); setModalOpen(true); }
  function openEdit(appointment) { setForm({ id: appointment.id, barber: active, serviceKey: serviceOptions.find(([key, label]) => label.startsWith(appointment.serviceLabel))?.[0] || 'taglio', date: appointment.date || today, time: appointment.time, customerName: appointment.customerName, phone: appointment.phone }); setError(''); setModalOpen(true); }
  async function saveAppointment(event) {
    event.preventDefault(); setError('');
    const response = await fetch('/api/appointments', { method: form.id ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form.id ? form : { ...form, customerName: form.customerName, phone: form.phone }) });
    const data = await response.json();
    if (!response.ok) { setError(data.error); return; }
    const saved = data.appointment;
    setAppointments((current) => ({ ...current, [saved.barber]: form.id ? current[saved.barber].map((item) => item.id === saved.id ? saved : item) : [...current[saved.barber], saved].sort((a, b) => a.time.localeCompare(b.time)) }));
    setActive(saved.barber); setModalOpen(false);
  }
  async function deleteAppointment(appointment) {
    const response = await fetch(`/api/appointments?id=${appointment.id}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) { setError(data.error); return; }
    setAppointments((current) => ({ ...current, [active]: current[active].filter((item) => item.id !== appointment.id) }));
    setDeleteTarget(null);
  }

  function askDelete(appointment) {
    setError('');
    setDeleteTarget(appointment);
  }

  if (!authenticated) return <div className="admin admin-login-page"><main className="admin-login"><div className="admin-login-card"><Link className="brand" href="/"><span>Lui</span> Admin Panel</Link><div className="eyebrow">Area riservata</div><h1>{authMode === 'login' ? 'Accedi alla dashboard' : 'Crea un account admin'}</h1><p>{authMode === 'login' ? 'Inserisci le credenziali per gestire gli appuntamenti.' : 'Registra un nuovo utente per accedere alla dashboard.'}</p><form onSubmit={handleAuth}><label htmlFor="admin-username">Username</label><input id="admin-username" value={username} onChange={(event) => setUsername(event.target.value)} minLength={3} required /><label htmlFor="admin-password">Password</label><input id="admin-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={4} required />{authError && <div className="admin-login-error">{authError}</div>}<button className="button" disabled={authLoading}>{authLoading ? 'Attendi...' : authMode === 'login' ? 'Accedi' : 'Crea account'}</button></form><button className="admin-auth-toggle" onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }} type="button">{authMode === 'login' ? 'Crea un nuovo account' : 'Hai già un account? Accedi'}</button><Link className="admin-back-link" href="/">Torna alla home</Link></div></main></div>;

  const rows = appointments[active];
  return <div className="admin"><header className="admin-nav"><div className="shell" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><Link className="brand" href="/"><span>Lui</span> Admin Panel</Link><button className="button ghost" onClick={() => setAuthenticated(false)}>Esci</button></div></header><main className="shell"><div className="dashboard-head"><div><div className="eyebrow">Venerdì, 4 settembre 2026</div><h1 style={{ fontSize: 'clamp(2.3rem, 5vw, 4rem)', margin: '8px 0' }}>Agenda appuntamenti</h1></div><button className="button" onClick={openCreate}>+ Nuovo appuntamento</button></div>{error && <div className="admin-login-error">{error}</div>}{loading && <p className="muted">Caricamento appuntamenti...</p>}<div className="tabs">{Object.keys(appointments).map((name) => <button key={name} className={`tab ${active === name ? 'active' : ''}`} onClick={() => setActive(name)}>Agenda {name}</button>)}</div><div className="table-wrap"><table><thead><tr><th>Orario</th><th>Cliente</th><th>Servizio</th><th>Telefono</th><th>Azioni</th></tr></thead><tbody>{rows.map((appointment) => <tr key={appointment.id}><td><strong className="gold">{appointment.time}</strong></td><td><strong>{appointment.customerName}</strong></td><td>{appointment.serviceLabel}</td><td>{appointment.phone}</td><td><button className="admin-action" onClick={() => openEdit(appointment)}>Modifica</button><button className="admin-action danger" onClick={() => askDelete(appointment)}>Cancella</button></td></tr>)}</tbody></table></div></main>{modalOpen && <div className="admin-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setModalOpen(false)}><section className="admin-modal" role="dialog" aria-modal="true"><div className="admin-modal-head"><div><div className="eyebrow">Agenda</div><h2>{form.id ? 'Modifica appuntamento' : 'Nuovo appuntamento'}</h2></div><button className="admin-modal-close" onClick={() => setModalOpen(false)} type="button">×</button></div><form onSubmit={saveAppointment}><div className="admin-form-grid"><label>Professionista<select value={form.barber} onChange={(event) => setForm({ ...form, barber: event.target.value })}>{Object.keys(appointments).map((name) => <option key={name}>{name}</option>)}</select></label><label>Servizio<select value={form.serviceKey} onChange={(event) => setForm({ ...form, serviceKey: event.target.value })}>{serviceOptions.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label></div><CalendarPicker value={form.date} minDate={today} onChange={(value) => setForm({ ...form, date: value })} /><label className="admin-full-label">Orario<select value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} required>{availableTimes.map((time) => <option key={time}>{time}</option>)}</select></label><div className="admin-form-grid"><label>Nome e cognome<input value={form.customerName} onChange={(event) => setForm({ ...form, customerName: event.target.value })} readOnly required /></label><label>Numero di cellulare<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} readOnly required /></label></div>{error && <div className="admin-login-error">{error}</div>}<div className="admin-modal-actions"><button className="button ghost" type="button" onClick={() => setModalOpen(false)}>Annulla</button><button className="button" type="submit">{form.id ? 'Salva modifiche' : 'Salva appuntamento'}</button></div></form></section></div>}{deleteTarget && <div className="admin-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setDeleteTarget(null)}><section className="admin-delete-modal" role="dialog" aria-modal="true" aria-labelledby="delete-appointment-title"><div className="admin-delete-icon">!</div><h2 id="delete-appointment-title">Eliminare appuntamento?</h2><p>Stai per cancellare l’appuntamento di <strong>{deleteTarget.customerName}</strong> alle <strong>{deleteTarget.time}</strong>.</p><div className="admin-modal-actions"><button className="button ghost" type="button" onClick={() => setDeleteTarget(null)}>Annulla</button><button className="button danger-button" type="button" onClick={() => deleteAppointment(deleteTarget)}>Cancella appuntamento</button></div></section></div>}</div>;
}
