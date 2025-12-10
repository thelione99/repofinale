import express from 'express';
import mysql from 'mysql2/promise';
import { Resend } from 'resend';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

// Configurazione Iniziale
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middleware
app.use(express.json());
app.use(cors());

// --- DATABASE CONNECTION POOL ---
const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// --- API ENDPOINTS ---

// 1. GET GUESTS (Protetto)
app.get('/api/guests', async (req, res) => {
  const password = req.headers['x-admin-password'];
  if (password !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const [rows] = await pool.query('SELECT * FROM guests ORDER BY createdAt DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. REGISTER (Pubblico)
app.post('/api/register', async (req, res) => {
  try {
    const data = req.body;
    const id = randomUUID();
    const now = Date.now();
    await pool.execute(
      'INSERT INTO guests (id, firstName, lastName, email, instagram, status, isUsed, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, data.firstName, data.lastName, data.email, data.instagram, 'PENDING', false, now]
    );
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. APPROVE (Protetto)
app.post('/api/approve', async (req, res) => {
  const password = req.headers['x-admin-password'];
  if (password !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { id } = req.body;
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    // Aggiorna DB
    await pool.execute('UPDATE guests SET status = ?, qrCode = ? WHERE id = ?', ['APPROVED', id, id]);
    
    // Prendi dati utente
    const [rows] = await pool.execute('SELECT * FROM guests WHERE id = ?', [id]);
    const guest = rows[0];

    // Invia Email
    await resend.emails.send({
      from: 'RUSSOLOCO <no-reply@russoloco.it>', // Oppure 'info@russoloco.it' se hai configurato il dominio su Resend
      to: [guest.email],
      subject: 'SEI DENTRO. Accesso RUSSOLOCO Approvato.',
      html: `
        <!DOCTYPE html>
        <html>
          <body style="background-color: #000000; margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px; text-align: center;">
              
              <img src="https://russoloco.it/logo.png" alt="RUSSOLOCO" style="width: 100px; height: 100px; border-radius: 12px; margin-bottom: 20px;" />
              
              <h1 style="color: #ffffff; font-size: 32px; letter-spacing: 4px; margin: 0; font-weight: 800;">RUSSOLOCO</h1>
              <p style="color: #dc2626; font-size: 18px; letter-spacing: 2px; font-style: italic; margin-top: 5px; margin-bottom: 30px;">"XMAS EVE"</p>
              
              <p style="color: #a3a3a3; font-size: 16px; margin-bottom: 30px;">
                Benvenuto, <strong style="color: #ffffff;">${guest.firstName}</strong>.<br>
                Il caos ti attende. Mostra questo QR all'ingresso.
              </p>
              
              <div style="background-color: #1a1a1a; padding: 20px; display: inline-block; border-radius: 20px; border: 1px solid #333;">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${id}&color=000000&bgcolor=ffffff&margin=10" alt="QR Accesso" style="border-radius: 10px; display: block;" />
              </div>
              
              <p style="margin-top: 20px; color: #525252; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">
                ID Univoco: ${id}
              </p>
              
            </div>
          </body>
        </html>
      `
    });

    res.json({ success: true, guest });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. REJECT (Protetto)
app.post('/api/reject', async (req, res) => {
  const password = req.headers['x-admin-password'];
  if (password !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { id } = req.body;
    await pool.execute('UPDATE guests SET status = ? WHERE id = ?', ['REJECTED', id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. SCAN (Protetto)
app.post('/api/scan', async (req, res) => {
  const password = req.headers['x-admin-password'];
  if (password !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { qrContent } = req.body;
    const [rows] = await pool.query('SELECT * FROM guests WHERE id = ?', [qrContent]);
    const guest = rows[0];

    if (!guest) return res.json({ valid: false, message: 'NON TROVATO', type: 'error' });
    if (guest.status !== 'APPROVED') return res.json({ valid: false, message: 'NON APPROVATO', type: 'error' });
    if (guest.isUsed) {
        const time = new Date(guest.usedAt).toLocaleTimeString();
        return res.json({ valid: false, guest, message: `GIÀ ENTRATO ALLE ${time}`, type: 'warning' });
    }

    const now = Date.now();
    await pool.execute('UPDATE guests SET isUsed = true, usedAt = ? WHERE id = ?', [now, guest.id]);
    guest.isUsed = true;
    guest.usedAt = now;

    res.json({ valid: true, guest, message: 'BENVENUTO', type: 'success' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. RESET (Protetto)
app.post('/api/reset', async (req, res) => {
  const password = req.headers['x-admin-password'];
  if (password !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });

  try {
    await pool.execute('DELETE FROM guests');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- SERVE FRONTEND (React) ---
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// --- START SERVER ---
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server attivo sulla porta ${PORT}`);
});