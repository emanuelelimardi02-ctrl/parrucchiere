import './globals.css';

export const metadata = {
  title: 'Lui Parrucchieri Uomo | Latina',
  description: 'Barber shop uomo a Latina. Tagli, barba e trattamenti skin care.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
