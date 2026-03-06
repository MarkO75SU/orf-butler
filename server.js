import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const VALID_USER = process.env.LOGIN_USER;
const VALID_PASS = process.env.LOGIN_PASS;

app.use(express.static(__dirname));

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!VALID_USER || !VALID_PASS) {
        return res.status(500).json({ error: 'Server: Zugangsdaten nicht konfiguriert' });
    }
    
    if (username === VALID_USER && password === VALID_PASS) {
        return res.json({ success: true });
    }
    
    res.status(401).json({ error: 'Zugang verweigert' });
});

app.listen(PORT, () => {
    console.log(`Server: http://localhost:${PORT}`);
});
