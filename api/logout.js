import { methodGuard } from './../lib/http.js';

export default function handler(req, res) {
    if (methodGuard(req, res, 'POST')) return;
    res.setHeader('Set-Cookie', 'orf_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
    res.json({ success: true });
}
