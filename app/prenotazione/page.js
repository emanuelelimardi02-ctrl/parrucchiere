'use client';

import Link from 'next/link';
import { useState } from 'react';

const times = ['09:00', '09:15', '09:30', '09:45', '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45', '12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45', '14:00', '14:15', '14:30', '14:45', '15:00', '15:15', '15:30', '15:45', '16:00', '16:15', '16:30', '16:45', '17:00', '17:15', '17:30', '17:45', '18:00', '18:15', '18:30', '18:45'];
const services = [['taglio', 'Taglio Capelli Uomo - €20,00', '45 min'], ['taglio_barba', 'Taglio Capelli Uomo + Barba - €25,00', '1 ora'], ['barba', 'Modellatura Barba - €10,00', '30 min'], ['bimbo', 'Taglio BIMBO (0 - 5 anni) - €15,00', '30 min'], ['skincare', 'Trattamento viso - €25,00', '30 min']];

export default function BookingPage() {
  const [sent, setSent] = useState(false);
  return <div className="booking-page page-bg"><nav className="nav simple-nav shell"><Link className="brand" href="/"><span>Lui</span> Parrucchieri</Link><Link className="button ghost" href="/">Torna alla home</Link></nav><main className="shell"><div className="form-wrap"><div className="eyebrow">Prenotazioni online</div><h1>Prenota appuntamento</h1><p className="muted">Scegli servizio, professionista e orario.</p>{sent ? <div className="notice">Richiesta ricevuta. Ti ricontatteremo presto per confermare l'appuntamento.</div> : <form onSubmit={(event) => { event.preventDefault(); setSent(true); }}>
    <section className="form-section"><h2>01 / Servizio</h2><select required defaultValue=""><option value="" disabled>Seleziona dal listino...</option>{services.map(service => <option key={service[0]} value={service[0]}>{service[1]} - {service[2]}</option>)}</select></section>
    <section className="form-section"><h2>02 / Professionista</h2><div className="choice-grid">{['Emanuele', 'Luca'].map(name => <label key={name}><input type="radio" name="barber" value={name} required /><span className="choice">{name}</span></label>)}</div></section>
    <section className="form-section"><h2>03 / Data e orario</h2><input type="date" required /><p className="muted">Orari disponibili:</p><div className="time-grid">{times.map((time, index) => { const disabled = index % 5 === 4; return <label key={time}><input type="radio" name="time" value={time} disabled={disabled} required /><span className={`time${disabled ? ' disabled' : ''}`}>{time}</span></label>; })}</div></section>
    <section className="form-section"><h2>04 / I tuoi dati</h2><div className="form-row"><input type="text" placeholder="Nome e cognome" required /><input type="tel" placeholder="Numero di cellulare" required /></div></section>
    <button className="button" style={{width: '100%', marginTop: 36}} type="submit">Conferma prenotazione <span>→</span></button>
  </form>}</div></main><footer className="footer"><div className="shell"><small>© 2026 Lui Parrucchieri Uomo · Via Toscana n.44, Latina</small></div></footer></div>;
}
