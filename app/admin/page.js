'use client';

import Link from 'next/link';
import { useState } from 'react';

const agendas = {
  Luca: [['09:00', 'Marco Bianchi', 'Taglio + Barba', '333 1234567', 'Confermato'], ['10:30', 'Andrea Russo', 'Solo Taglio', '340 9876543', 'In attesa']],
  Emanuele: [['15:00', 'Giovanni Ferri', 'Modellatura Barba', '338 1122334', 'Confermato'], ['18:45', 'Davide Conti', 'Taglio + Barba', '392 4455667', 'Confermato']],
};
const appointmentServices = ['Taglio Capelli Uomo - 45 min', 'Taglio + Barba - 1 ora', 'Modellatura Barba - 30 min', 'Taglio BIMBO - 30 min', 'Trattamento viso - 30 min'];
const appointmentTimes = ['09:00', '09:15', '09:30', '09:45', '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45', '12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45', '14:00', '14:15', '14:30', '14:45', '15:00', '15:15', '15:30', '15:45', '16:00', '16:15', '16:30', '16:45', '17:00', '17:15', '17:30', '17:45', '18:00', '18:15', '18:30', '18:45'];

export default function AdminPage() {
  const [active, setActive] = useState('Luca');
  const [appointments, setAppointments] = useState(agendas);
  const [showCreate, setShowCreate] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState({ barber: 'Luca', service: appointmentServices[0], date: '', time: appointmentTimes[0], customer: '', phone: '' });
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  function handleLogin(event) {
    event.preventDefault();
    if (username === 'admin' && password === 'admin') {
      setAuthenticated(true);
      setLoginError('');
      return;
    }
    setLoginError('Username o password non validi.');
  }

  function handleCreateAppointment(event) {
    event.preventDefault();
    const newAppointment = [appointmentForm.time, appointmentForm.customer, appointmentForm.service, appointmentForm.phone, 'In attesa'];
    setAppointments((current) => ({
      ...current,
      [appointmentForm.barber]: [...current[appointmentForm.barber], newAppointment].sort((first, second) => first[0].localeCompare(second[0])),
    }));
    setActive(appointmentForm.barber);
    setShowCreate(false);
    setAppointmentForm({ barber: 'Luca', service: appointmentServices[0], date: '', time: appointmentTimes[0], customer: '', phone: '' });
  }

  if (!authenticated) {
    return <div className="admin admin-login-page"><main className="admin-login"><div className="admin-login-card"><Link className="brand" href="/"><span>Lui</span> Admin Panel</Link><div className="eyebrow">Area riservata</div><h1>Accedi alla dashboard</h1><p>Inserisci le credenziali per gestire gli appuntamenti.</p><form onSubmit={handleLogin}><label htmlFor="admin-username">Username</label><input id="admin-username" type="text" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required /><label htmlFor="admin-password">Password</label><input id="admin-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />{loginError && <div className="admin-login-error" role="alert">{loginError}</div>}<button className="button" type="submit">Accedi</button></form><Link className="admin-back-link" href="/">Torna alla home</Link></div></main></div>;
  }

  return <div className="admin"><header className="admin-nav"><div className="shell" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><Link className="brand" href="/"><span>Lui</span> Admin Panel</Link><button className="button ghost" onClick={() => { setAuthenticated(false); setUsername(''); setPassword(''); }}>Esci</button></div></header><main className="shell"><div className="dashboard-head"><div><div className="eyebrow">Venerdì, 4 settembre 2026</div><h1 style={{fontSize: 'clamp(2.3rem, 5vw, 4rem)', margin: '8px 0'}}>Agenda appuntamenti</h1></div><button className="button" onClick={() => setShowCreate(true)}>+ Nuovo appuntamento</button></div><div className="tabs">{Object.keys(appointments).map(name => <button key={name} className={`tab ${active === name ? 'active' : ''}`} onClick={() => setActive(name)}>Agenda {name}</button>)}</div><div className="table-wrap"><table><thead><tr><th>Orario</th><th>Cliente</th><th>Servizio</th><th>Telefono</th><th>Stato</th><th>Azioni</th></tr></thead><tbody>{appointments[active].map(row => <tr key={`${row[0]}-${row[1]}`}><td><strong className="gold">{row[0]}</strong></td><td><strong>{row[1]}</strong></td><td>{row[2]}</td><td>{row[3]}</td><td className="status">{row[4]}</td><td><button aria-label={`Modifica ${row[1]}`} onClick={() => alert(`Modifica ${row[1]}`)}>✎</button> <button aria-label={`Elimina ${row[1]}`} onClick={() => alert(`Elimina ${row[1]}`)}>×</button></td></tr>)}</tbody></table></div></main>{showCreate && <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowCreate(false); }}><section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="new-appointment-title"><div className="admin-modal-head"><div><div className="eyebrow">Agenda</div><h2 id="new-appointment-title">Nuovo appuntamento</h2></div><button className="admin-modal-close" type="button" aria-label="Chiudi" onClick={() => setShowCreate(false)}>×</button></div><form onSubmit={handleCreateAppointment}><div className="admin-form-grid"><label>Professionista<select value={appointmentForm.barber} onChange={(event) => setAppointmentForm({ ...appointmentForm, barber: event.target.value })}>{Object.keys(agendas).map(name => <option key={name}>{name}</option>)}</select></label><label>Servizio<select value={appointmentForm.service} onChange={(event) => setAppointmentForm({ ...appointmentForm, service: event.target.value })}>{appointmentServices.map(service => <option key={service}>{service}</option>)}</select></label><label>Data<input type="date" value={appointmentForm.date} onChange={(event) => setAppointmentForm({ ...appointmentForm, date: event.target.value })} required /></label><label>Orario<select value={appointmentForm.time} onChange={(event) => setAppointmentForm({ ...appointmentForm, time: event.target.value })}>{appointmentTimes.map(time => <option key={time}>{time}</option>)}</select></label><label>Nome e cognome<input type="text" value={appointmentForm.customer} onChange={(event) => setAppointmentForm({ ...appointmentForm, customer: event.target.value })} required /></label><label>Numero di cellulare<input type="tel" value={appointmentForm.phone} onChange={(event) => setAppointmentForm({ ...appointmentForm, phone: event.target.value })} required /></label></div><div className="admin-modal-actions"><button className="button ghost" type="button" onClick={() => setShowCreate(false)}>Annulla</button><button className="button" type="submit">Salva appuntamento</button></div></form></section></div>}</div>;
}
