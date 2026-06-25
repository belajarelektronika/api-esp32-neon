import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metode tidak diizinkan' });

  try {
    const sql = neon(process.env.DATABASE_URL);
    // Menangkap device_id dari ESP32
    const { device_id, suhu, kelembapan } = req.body;

    await sql`
      INSERT INTO data_sensor (device_id, suhu, kelembapan)
      VALUES (${device_id}, ${suhu}, ${kelembapan})
    `;

    return res.status(200).json({ success: true, message: 'Data berhasil disimpan!' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
