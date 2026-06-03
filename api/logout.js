export default function handler(req, res) {
    res.setHeader('Set-Cookie', 'orf_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
    res.json({ success: true });
}
