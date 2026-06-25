import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Hanya mengizinkan pemanggilan tipe GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Metode tidak diizinkan' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);

    // Mengambil 30 data terakhir dari database Neon
    const data = await sql`
      SELECT id, suhu, kelembapan, waktu
      FROM data_sensor
      ORDER BY waktu DESC
      LIMIT 30
    `;

    // Membalikkan urutan data agar susunannya kronologis (dari waktu lama ke baru) saat digambar di grafik
    const dataKronologis = data.reverse();

    return res.status(200).json(dataKronologis);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
