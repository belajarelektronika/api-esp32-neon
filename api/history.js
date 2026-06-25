import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Metode tidak diizinkan' });

  try {
    const sql = neon(process.env.DATABASE_URL);
    // Menangkap filter tanggal DAN filter device_id dari Web
    const { start, end, device_id } = req.query;
    let data;

    if (start && end && device_id) {
      data = await sql`SELECT id, suhu, kelembapan, waktu FROM data_sensor WHERE waktu >= ${start}::timestamp AND waktu <= ${end}::timestamp AND device_id = ${device_id} ORDER BY waktu DESC LIMIT 1000`;
    } else if (device_id) {
      data = await sql`SELECT id, suhu, kelembapan, waktu FROM data_sensor WHERE device_id = ${device_id} ORDER BY waktu DESC LIMIT 30`;
    } else {
      data = await sql`SELECT id, suhu, kelembapan, waktu FROM data_sensor ORDER BY waktu DESC LIMIT 30`;
    }

    return res.status(200).json(data.reverse());
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
