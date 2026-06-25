// NAMA FILE BARU: api/history.js (ATAU api/history.ts)
import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.DATABASE_URL);

    // JALUR 1: GET (Untuk melihat histori di Web)
    if (req.method === 'GET') {
      const { device_id, start, end } = req.query;
      if (!device_id) return res.status(400).json({ error: "device_id wajib diisi" });

      let data;
      if (start && end) {
        data = await sql`
          SELECT * FROM data_sensor 
          WHERE device_id = ${device_id} 
          AND waktu >= ${start} 
          AND waktu <= ${end} 
          ORDER BY waktu DESC LIMIT 100
        `;
      } else {
        data = await sql`
          SELECT * FROM data_sensor 
          WHERE device_id = ${device_id} 
          ORDER BY waktu DESC LIMIT 100
        `;
      }
      return res.status(200).json(data);
    }

    // JALUR 2: DELETE (Untuk tombol Hapus Data di Web)
    else if (req.method === 'DELETE') {
      const { device_id, start, end } = req.body;
      if (!device_id || !start || !end) {
        return res.status(400).json({ error: "Data tidak lengkap" });
      }

      const result = await sql`
        DELETE FROM data_sensor 
        WHERE device_id = ${device_id} 
        AND waktu >= ${start} 
        AND waktu <= ${end}
        RETURNING id
      `;

      return res.status(200).json({ success: true, deleted_count: result.length });
    }

    // Jika metode selain GET dan DELETE (Otomatis ditolak dengan kode 405)
    else {
      res.setHeader('Allow', ['GET', 'DELETE']);
      return res.status(405).json({ error: 'Metode tidak diizinkan' });
    }

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
