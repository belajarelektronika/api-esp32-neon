import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // 1. Validasi: Hanya izinkan metode POST dari ESP32
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metode tidak diizinkan. Gunakan POST.' });
  }

  try {
    // 2. Buka koneksi ke Database Neon
    const sql = neon(process.env.DATABASE_URL);
    
    // 3. Tangkap data yang dikirim oleh ESP32
    const { device_id, suhu, kelembapan } = req.body;

    // 4. Validasi isi data agar database tidak error jika ada yang kosong
    if (!device_id || suhu === undefined || kelembapan === undefined) {
      return res.status(400).json({ error: 'Data tidak lengkap. Pastikan ada device_id, suhu, dan kelembapan.' });
    }

    // 5. Simpan ke dalam tabel 'data_sensor'
    await sql`
      INSERT INTO data_sensor (device_id, suhu, kelembapan)
      VALUES (${device_id}, ${suhu}, ${kelembapan})
    `;

    // 6. Berikan balasan sukses ke ESP32 (Kode 200)
    return res.status(200).json({ 
      success: true, 
      message: 'Data berhasil disimpan ke database Neon!' 
    });

  } catch (error) {
    // 7. Tangani error jika terjadi masalah di server atau database
    console.error("Gagal menyimpan data dari ESP32:", error);
    return res.status(500).json({ error: error.message });
  }
}
