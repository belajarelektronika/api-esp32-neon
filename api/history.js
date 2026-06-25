import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Metode tidak diizinkan' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    
    // Menangkap parameter rentang tanggal dari web
    const { start, end } = req.query;

    let data;

    if (start && end) {
      // Jika user mengisi rentang tanggal di web, cari data di antara tanggal tersebut
      data = await sql`
        SELECT id, suhu, kelembapan, waktu
        FROM data_sensor
        WHERE waktu >= ${start}::timestamp AND waktu <= ${end}::timestamp
        ORDER BY waktu DESC
        LIMIT 1000
      `;
    } else {
      // Jika web baru dibuka (tanpa filter), tampilkan 30 data terakhir saja
      data = await sql`
        SELECT id, suhu, kelembapan, waktu
        FROM data_sensor
        ORDER BY waktu DESC
        LIMIT 30
      `;
    }

    const dataKronologis = data.reverse();
    return res.status(200).json(dataKronologis);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
