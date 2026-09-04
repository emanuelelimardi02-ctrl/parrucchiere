# Lui Parrucchieri Uomo

Sito Next.js per Lui Parrucchieri Uomo, con homepage, prenotazione e agenda admin.

## Avvio locale

Richiede Node.js 20.9 o superiore.

```bash
npm install
npm run dev
```

Apri `http://localhost:3000`.

## Deploy su Vercel

Importa la cartella del progetto in Vercel oppure esegui:

```bash
npx vercel
```

Vercel rileva automaticamente Next.js. Il modulo di prenotazione attualmente mostra una conferma lato client; per salvare o notificare le richieste serve collegare un database o un provider email a una Route Handler/API.
