import { methodGuard } from '../lib/http.js';

export default function handler(req, res) {
    if (methodGuard(req, res, 'POST')) return;

    const { username, password } = req.body || {};
    
    const validUser = process.env.LOGIN_USER;
    const validPass = process.env.LOGIN_PASS;
    
    if (!validUser || !validPass) {
        return res.status(500).json({ error: 'Zugangsdaten nicht konfiguriert' });
    }
    
    if (username === validUser && password === validPass) {
        res.setHeader('Set-Cookie', 'orf_session=1; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000');
        return res.json({ success: true });
    }
    
    res.status(401).json({ error: 'Zugang verweigert' });
}
