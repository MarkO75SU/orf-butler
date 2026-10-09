import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const app = express();
app.use(express.json());
app.use(express.static(PUBLIC_DIR));

app.get('/landing', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'landing.html')));
app.get('/app', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'app.html')));
app.get('/imprint', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'imprint.html')));
app.get('/privacy', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'privacy.html')));

const VALID_USER = process.env.LOGIN_USER;
const VALID_PASS = process.env.LOGIN_PASS;

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!VALID_USER || !VALID_PASS) {
        return res.status(500).json({ error: 'Credentials not configured' });
    }
    
    if (username === VALID_USER && password === VALID_PASS) {
        return res.json({ success: true });
    }
    
    res.status(401).json({ error: 'Access denied' });
});

app.listen(3000, () => {
    console.log('Server: http://localhost:3000');
});
