import { neon } from '@neondatabase/serverless';
import { barbers, isValidPhone, isValidTime, normalizePhone, services, timeToMinutes } from '../../lib/appointments';

export const runtime = 'nodejs';

function getDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL non configurata');
  }
  return neon(process.env.DATABASE_URL);
}

async function ensureTable(sql) {
  await sql`CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    barber VARCHAR(32) NOT NULL,
    service_key VARCHAR(32) NOT NULL,
    service_label VARCHAR(120) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    customer_name VARCHAR(120) NOT NULL,
    customer_phone VARCHAR(40) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Approvato',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
}

function isClosedDay(date) {
  const day = new Date(`${date}T00:00:00Z`).getUTCDay();
  return day === 0 || day === 1;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const barber = searchParams.get('barber');
    const date = searchParams.get('date');
    const serviceKey = searchParams.get('serviceKey');
    const sql = getDatabase();
    await ensureTable(sql);
    if (barber && date && serviceKey && services[serviceKey]) {
      const service = services[serviceKey];
      if (isClosedDay(date)) return Response.json({ unavailableTimes: [], closed: true });
      const booked = await sql`SELECT TO_CHAR(appointment_time, 'HH24:MI') AS time, duration_minutes AS duration FROM appointments WHERE barber = ${barber} AND appointment_date = ${date}::date`;
      const unavailableTimes = [];
      for (let hour = 9; hour <= 18; hour += 1) {
        for (let minute = 0; minute < 60; minute += 15) {
          const slotStart = (hour * 60) + minute;
          const slotEnd = slotStart + service.duration;
          const overlaps = booked.some((appointment) => {
            const appointmentStart = timeToMinutes(appointment.time);
            const appointmentEnd = appointmentStart + appointment.duration;
            return appointmentStart < slotEnd && appointmentEnd > slotStart;
          });
          if (overlaps) unavailableTimes.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
        }
      }
      return Response.json({ unavailableTimes });
    }
      await sql`UPDATE appointments SET status = 'Approvato' WHERE status <> 'Approvato'`;
    const appointments = await sql`SELECT id, barber, service_key AS "serviceKey", service_label AS "serviceLabel", duration_minutes AS "durationMinutes", TO_CHAR(appointment_date, 'YYYY-MM-DD') AS date, TO_CHAR(appointment_time, 'HH24:MI') AS time, customer_name AS "customerName", customer_phone AS phone, status FROM appointments ORDER BY appointment_date, appointment_time`;
      return Response.json({ appointments });
  } catch (error) {
    console.error('GET /api/appointments', error);
    return Response.json({ error: 'Impossibile caricare gli appuntamenti.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { barber, serviceKey, date, time, customerName, phone } = body;
    const service = services[serviceKey];

    if (!barbers.includes(barber) || !service || !date || !isValidTime(time) || !customerName?.trim()) {
      return Response.json({ error: 'Compila tutti i campi obbligatori.' }, { status: 400 });
    }
    if (!isValidPhone(phone)) return Response.json({ error: 'Inserisci un numero di cellulare italiano valido.' }, { status: 400 });
    if (isClosedDay(date)) return Response.json({ error: 'Il salone è chiuso la domenica e il lunedì.' }, { status: 400 });
    if (timeToMinutes(time) % 15 !== 0) {
      return Response.json({ error: 'L’orario deve essere scelto a intervalli di 15 minuti.' }, { status: 400 });
    }

    const sql = getDatabase();
    await ensureTable(sql);
    const startMinutes = timeToMinutes(time);
    const endMinutes = startMinutes + service.duration;
    const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;
    const conflicts = await sql`SELECT id FROM appointments WHERE barber = ${barber} AND appointment_date = ${date}::date AND appointment_time < ${endTime}::time AND appointment_time + (duration_minutes * INTERVAL '1 minute') > ${time}::time LIMIT 1`;

    if (conflicts.length > 0) {
      return Response.json({ error: 'Questo orario non è disponibile per il professionista selezionato.' }, { status: 409 });
    }

    const [appointment] = await sql`INSERT INTO appointments (barber, service_key, service_label, duration_minutes, appointment_date, appointment_time, customer_name, customer_phone) VALUES (${barber}, ${serviceKey}, ${service.label}, ${service.duration}, ${date}::date, ${time}::time, ${customerName.trim()}, ${normalizePhone(phone)}) RETURNING id, barber, service_key AS "serviceKey", service_label AS "serviceLabel", duration_minutes AS "durationMinutes", TO_CHAR(appointment_date, 'YYYY-MM-DD') AS date, TO_CHAR(appointment_time, 'HH24:MI') AS time, customer_name AS "customerName", customer_phone AS phone, status`;
    return Response.json({ appointment }, { status: 201 });
  } catch (error) {
    console.error('POST /api/appointments', error);
    return Response.json({ error: 'Impossibile salvare l’appuntamento.' }, { status: 500 });
  }
}

async function findConflicts(sql, { barber, date, time, duration }, excludedId) {
  const startMinutes = timeToMinutes(time);
  const endTime = `${String(Math.floor((startMinutes + duration) / 60)).padStart(2, '0')}:${String((startMinutes + duration) % 60).padStart(2, '0')}`;
  return sql`SELECT id FROM appointments WHERE barber = ${barber} AND appointment_date = ${date}::date AND appointment_time < ${endTime}::time AND appointment_time + (duration_minutes * INTERVAL '1 minute') > ${time}::time ${excludedId ? sql`AND id <> ${excludedId}` : sql``} LIMIT 1`;
}

export async function PATCH(request) {
  try {
    const { id, barber, serviceKey, date, time } = await request.json();
    const service = services[serviceKey];
    if (!Number.isInteger(Number(id)) || !barbers.includes(barber) || !service || !date || !isValidTime(time) || isClosedDay(date) || timeToMinutes(time) % 15 !== 0) {
      return Response.json({ error: 'Dati appuntamento non validi.' }, { status: 400 });
    }
    const sql = getDatabase();
    await ensureTable(sql);
    const conflicts = await findConflicts(sql, { barber, date, time, duration: service.duration }, Number(id));
    if (conflicts.length > 0) return Response.json({ error: 'Questo orario non è disponibile.' }, { status: 409 });
    const [appointment] = await sql`UPDATE appointments SET barber = ${barber}, service_key = ${serviceKey}, service_label = ${service.label}, duration_minutes = ${service.duration}, appointment_date = ${date}::date, appointment_time = ${time}::time WHERE id = ${Number(id)} RETURNING id, barber, service_key AS "serviceKey", service_label AS "serviceLabel", duration_minutes AS "durationMinutes", TO_CHAR(appointment_date, 'YYYY-MM-DD') AS date, TO_CHAR(appointment_time, 'HH24:MI') AS time, customer_name AS "customerName", customer_phone AS phone, status`;
    if (!appointment) return Response.json({ error: 'Appuntamento non trovato.' }, { status: 404 });
    return Response.json({ appointment });
  } catch (error) {
    console.error('PATCH /api/appointments', error);
    return Response.json({ error: 'Impossibile modificare l’appuntamento.' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const id = Number(new URL(request.url).searchParams.get('id'));
    if (!Number.isInteger(id)) return Response.json({ error: 'ID non valido.' }, { status: 400 });
    const sql = getDatabase();
    await ensureTable(sql);
    const deleted = await sql`DELETE FROM appointments WHERE id = ${id} RETURNING id`;
    if (deleted.length === 0) return Response.json({ error: 'Appuntamento non trovato.' }, { status: 404 });
    return Response.json({ deleted: id });
  } catch (error) {
    console.error('DELETE /api/appointments', error);
    return Response.json({ error: 'Impossibile cancellare l’appuntamento.' }, { status: 500 });
  }
}
