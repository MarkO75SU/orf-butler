import { methodGuard } from '../lib/http.js';

export default function handler(req, res) {
    if (methodGuard(req, res, 'POST')) return;
    res.setHeader('Set-Cookie', 'orf_session=1; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000');
    res.json({ success: true });
}
