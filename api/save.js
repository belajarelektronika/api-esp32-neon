import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Hanya menerima metode POST (pengiriman data)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metode tidak diizinkan' });
  }

  try {
    // Menerima data JSON dari ESP32
    const { suhu, kelembapan } = req.body;

    // Validasi data sederhana
    if (suhu === undefined || kelembapan === undefined) {
      return res.status(400).json({ error: 'Data suhu atau kelembapan tidak lengkap' });
    }

    // Menghubungkan ke Neon menggunakan Environment Variable yang akan kita set nanti
    const sql = neon(process.env.DATABASE_URL);

    // Menjalankan perintah SQL untuk menyimpan data
    await sql`
      INSERT INTO data_sensor (suhu, kelembapan)
      VALUES (${suhu}, ${kelembapan})
    `;

    return res.status(200).json({ success: true, message: 'Data berhasil disimpan ke Neon!' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
