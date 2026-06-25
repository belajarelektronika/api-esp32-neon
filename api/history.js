import { Pool } from 'pg';

// Inisialisasi koneksi ke Database Neon
// Pastikan DATABASE_URL sudah terpasang di Environment Variables Vercel Anda
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

export default async function handler(req, res) {
    // ========================================================
    // SESUAIKAN NAMA TABEL & KOLOM INI DENGAN DATABASE ANDA!
    // ========================================================
    const NAMA_TABEL = 'data_sensor'; 
    const KOLOM_ID = 'device_id';
    const KOLOM_WAKTU = 'waktu';

    // --------------------------------------------------------
    // JALUR 1: GET (Mengambil Histori untuk Grafik & Tabel)
    // --------------------------------------------------------
    if (req.method === 'GET') {
        try {
            const { device_id, start, end } = req.query;

            if (!device_id) {
                return res.status(400).json({ error: "device_id wajib diisi" });
            }

            let query = `SELECT * FROM ${NAMA_TABEL} WHERE ${KOLOM_ID} = $1`;
            let values = [device_id];

            // Jika user memilih rentang tanggal di menu filter
            if (start && end) {
                query += ` AND ${KOLOM_WAKTU} >= $2 AND ${KOLOM_WAKTU} <= $3`;
                values.push(start, end);
            }

            // Urutkan dari yang terbaru, batasi 100 data agar web tidak berat
            query += ` ORDER BY ${KOLOM_WAKTU} DESC LIMIT 100`;

            const result = await pool.query(query, values);
            
            // Kembalikan data dalam format JSON ke web frontend
            return res.status(200).json(result.rows);

        } catch (error) {
            console.error("Error GET history:", error);
            return res.status(500).json({ error: "Gagal mengambil data dari database" });
        }
    }

    // --------------------------------------------------------
    // JALUR 2: DELETE (Menghapus Histori Permanen)
    // --------------------------------------------------------
    else if (req.method === 'DELETE') {
        try {
            const { device_id, start, end } = req.body;

            // Validasi: Pastikan semua isian dari web terkirim
            if (!device_id || !start || !end) {
                return res.status(400).json({ error: "Pilih mesin dan rentang waktu dengan lengkap!" });
            }

            const query = `
                DELETE FROM ${NAMA_TABEL} 
                WHERE ${KOLOM_ID} = $1 
                AND ${KOLOM_WAKTU} >= $2 
                AND ${KOLOM_WAKTU} <= $3
            `;
            
            const values = [device_id, start, end];
            
            // Eksekusi penghapusan ke database Neon
            const result = await pool.query(query, values);

            // Kembalikan status sukses ke web beserta jumlah baris yang terhapus
            return res.status(200).json({ 
                success: true, 
                message: "Penghapusan berhasil",
                deleted_count: result.rowCount 
            });

        } catch (error) {
            console.error("Error DELETE history:", error);
            return res.status(500).json({ error: "Gagal mengeksekusi penghapusan di database" });
        }
    }

    // --------------------------------------------------------
    // JALUR 3: Metode Tidak Dikenal
    // --------------------------------------------------------
    else {
        res.setHeader('Allow', ['GET', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} tidak diizinkan` });
    }
}
