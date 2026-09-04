import Link from 'next/link';

const services = [
  { icon: '✂', title: 'Capelli', items: [['Taglio Capelli', '€20,00'], ['Taglio Bimbo (0-5 anni)', '€15,00']] },
  { icon: '◒', title: 'Barba', items: [['Modellatura Barba', '€10,00'], ['Taglio + Barba', '€25,00']] },
  { icon: '✦', title: 'Care', items: [['Trattamento Skin Care', '€25,00']] },
];
const depotGallery = ['depot1a.jpg', 'depot3a1.jpg', 'depot2a.jpg'];
const gallery = ['img_home1.jpg', 'img_home2.jpg', 'img_home-3.jpg', 'img_home5.jpg', 'img_home6.jpg', 'img_home7.jpg'];

export default function Home() {
  return <div className="home-page">
    <header className="home-hero">
      <nav className="home-nav shell">
        <Link className="home-brand" href="/"><span>Lui</span> Parrucchieri</Link>
        <div className="home-nav-links">
          <a href="#chi-siamo">Il Salone</a><a href="#servizi">Servizi &amp; Prezzi</a><a href="#prodotti">Prodotti</a><a href="#contatti">Contatti</a>
          <Link className="home-button" href="/prenotazione">Prenota Appuntamento</Link>
        </div>
      </nav>
      <div className="home-hero-content shell"><div className="home-eyebrow">Barber Shop in Latina</div><h1><span>Lui Parrucchieri Uomo</span><span>Modern Haircut</span></h1><Link className="home-button home-button-large" href="/prenotazione">Prenota il tuo posto</Link></div>
    </header>
    <main>
      <section id="chi-siamo" className="home-section home-about shell"><img src="/img/luiparrucchieri_home1.jpg" alt="Luca ed Emanuele al lavoro" /><div><h2>Luca ed Emanuele</h2><p className="home-lead">LUI PARRUCCHIERI è un salone creato per riportare nel settore uomo un po&apos; di quel &quot;vecchio stile&quot; perso negli anni, con un trattamento barba usufruendo dei panni caldi e tagli tradizionali (pettine e forbice).</p><p>Luca ed Emanuele giovani, simpatici e professionali oltre a questo vi offrono anche la loro freschezza su tagli di ultima tendenza con tecniche di taglio e sfumatura sempre aggiornati.</p><p>Ambiente molto familiare e solare dove non mancano servizi di ogni tipo, con l utilizzo del brand DEPOT (esclusivamente italiano) raggiungono i massimi termini di professionalità e qualità, poiché i prodotti vengono realizzati con erbe e confezionati con plastica riciclabile.</p><ul className="home-checks"><li>Tagli tradizionali a pettine e forbice</li><li>Sfumature moderne e hair styling</li><li>Ambiente solare e familiare</li></ul></div></section>
      <section id="servizi" className="home-section home-dark"><div className="shell"><div className="home-section-heading"><img className="home-services-logo" src="/img/logo-servizi.png" alt="Lui Parrucchieri" /><h2>I Nostri Servizi</h2><p>Prenditi cura del tuo stile</p></div><div className="home-service-grid">{services.map(service => <article className="home-service" key={service.title}><div className="home-icon">{service.icon}</div><h3>{service.title}</h3>{service.items.map(item => <div className="home-price" key={item[0]}><span>{item[0]}</span><strong>{item[1]}</strong></div>)}</article>)}</div></div></section>
      <section id="prodotti" className="home-section home-products"><div className="shell"><div className="home-section-heading"><h2>L&apos;eccellenza per la tua pelle</h2><p>Raggiungiamo i massimi termini di professionalità e qualità utilizzando esclusivamente il brand <strong>DEPOT</strong>. Prodotti italiani di altissima gamma, realizzati con erbe naturali e confezionati con plastica riciclabile.</p></div><div className="home-gallery home-depot-gallery">{depotGallery.map(image => <img key={image} src={`/img/${image}`} alt="Prodotti DEPOT" />)}</div><div className="home-depot-title"><h3>DEPOT</h3><p>THE MALE TOOLS &amp; CO.</p></div><div className="home-section-heading home-work-heading"><h2>I Nostri Lavori</h2><p>Un&apos;occhiata ad alcuni dei nostri ultimi tagli</p></div><div className="home-gallery">{gallery.map(image => <img key={image} src={`/img/${image}`} alt="Lavoro di Lui Parrucchieri" />)}</div><div className="home-instagram"><a className="home-outline-button" target="_blank" href="https://www.instagram.com/luiparrucchieriuomo?igsi=a3N5cXBuZmFpNHNk"><span className="instagram-mark" aria-hidden="true"></span>Seguici su Instagram</a><Link className="home-button" href="/prenotazione">Prenota Appuntamento</Link></div></div></section>
    </main>
    <footer id="contatti" className="home-footer"><div className="shell home-footer-grid"><div><h3><span>Lui</span> Parrucchieri Uomo</h3><p>Via Toscana n.44, 04100 Latina<br />338 2411070</p></div><div><h4>Orari di Apertura</h4><p><strong>Mar - Sab:</strong> 09:00 - 19:30<br /><strong>Domenica e Lunedì:</strong> Chiuso</p></div><div className="home-footer-social"><p><a href="#contatti"><span className="instagram-mark" aria-hidden="true"></span>Instagram</a><a href="#contatti">Facebook</a></p><small>&copy; 2026 Lui Parrucchieri Uomo di Pietrangeli Emanuele.<br />P.Iva 03178900597</small></div></div></footer>
  </div>;
}
