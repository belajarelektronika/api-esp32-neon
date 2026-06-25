import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  try {
    // Membuka koneksi menggunakan cara yang sama persis dengan api/save
    const sql = neon(process.env.DATABASE_URL);

    // --------------------------------------------------------
    // JALUR 1: GET (Mengambil Histori untuk Grafik & Tabel)
    // --------------------------------------------------------
    if (req.method === 'GET') {
      const { device_id, start, end } = req.query;

      if (!device_id) {
        return res.status(400).json({ error: "device_id wajib diisi" });
      }

      let data;
      // Jika user mengisi rentang waktu di menu pencarian
      if (start && end) {
        data = await sql`
          SELECT * FROM data_sensor 
          WHERE device_id = ${device_id} 
          AND waktu >= ${start} 
          AND waktu <= ${end} 
          ORDER BY waktu DESC LIMIT 100
        `;
      } 
      // Jika ditarik otomatis (awal buka web) tanpa rentang waktu
      else {
        data = await sql`
          SELECT * FROM data_sensor 
          WHERE device_id = ${device_id} 
          ORDER BY waktu DESC LIMIT 100
        `;
      }

      // Langsung kembalikan datanya ke web
      return res.status(200).json(data);
    }

    // --------------------------------------------------------
    // JALUR 2: DELETE (Menghapus Histori Permanen)
    // --------------------------------------------------------
    else if (req.method === 'DELETE') {
      const { device_id, start, end } = req.body;

      if (!device_id || !start || !end) {
        return res.status(400).json({ error: "Pilih mesin dan rentang waktu dengan lengkap!" });
      }

      // Menghapus dan meminta database mengembalikan ID yang terhapus (RETURNING id) 
      // untuk dihitung jumlahnya
      const result = await sql`
        DELETE FROM data_sensor 
        WHERE device_id = ${device_id} 
        AND waktu >= ${start} 
        AND waktu <= ${end}
        RETURNING id
      `;

      return res.status(200).json({ 
        success: true, 
        message: "Penghapusan berhasil",
        deleted_count: result.length 
      });
    }

    // --------------------------------------------------------
    // JALUR 3: Tolak Selain GET dan DELETE
    // --------------------------------------------------------
    else {
      res.setHeader('Allow', ['GET', 'DELETE']);
      return res.status(405).json({ error: 'Metode tidak diizinkan' });
    }

  } catch (error) {
    console.error("Terjadi error di API History:", error);
    return res.status(500).json({ error: error.message });
  }
}
