export const services = {
  taglio: { label: 'Taglio Capelli Uomo', price: '€20,00', duration: 45 },
  taglio_barba: { label: 'Taglio + Barba', price: '€25,00', duration: 60 },
  barba: { label: 'Modellatura Barba', price: '€10,00', duration: 30 },
  bimbo: { label: 'Taglio BIMBO', price: '€15,00', duration: 30 },
  skincare: { label: 'Trattamento viso', price: '€25,00', duration: 30 },
};

export const barbers = ['Luca', 'Emanuele'];

export function isValidTime(value) {
  return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function timeToMinutes(value) {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

export function normalizePhone(value) {
  return value.replace(/[\s().-]/g, '').replace(/^\+39/, '');
}

export function isValidPhone(value) {
  return typeof value === 'string' && /^3\d{8,9}$/.test(normalizePhone(value));
}
