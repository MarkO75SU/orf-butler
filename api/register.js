import { methodGuard } from '../lib/http.js';

export default async function handler(req, res) {
    if (methodGuard(req, res, 'POST')) return;

    const { email, password } = req.body || {};
    if (!email || !password) {
        return res.status(400).json({ error: 'E-Mail und Passwort erforderlich' });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
        return res.status(500).json({ error: 'Supabase nicht konfiguriert' });
    }

    const headers = {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
    };

    async function createUser() {
        const res = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ email, password, email_confirm: true })
        });
        return res.json();
    }

    async function updateUser(userId) {
        const res = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
                password,
                email_confirm: true,
                email_confirmed_at: new Date().toISOString()
            })
        });
        return res.json();
    }

    async function findUser() {
        const res = await fetch(`${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(email)}`, { headers });
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data[0];
        if (data.users && data.users.length > 0) return data.users[0];
        return null;
    }

    try {
        // Versuche zuerst zu erstellen
        let result = await createUser();

        // Falls User existiert, aktualisieren
        if (result.id && result.email) {
            // User wurde neu erstellt
            res.setHeader('Set-Cookie', 'orf_session=1; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000');
            return res.json({ success: true, user: { id: result.id, email: result.email }, existing: false });
        }

        // User existiert bereits – suchen und updaten
        const existing = await findUser();
        if (!existing || !existing.id) {
            const msg = result?.msg || (Array.isArray(result) ? result.map(d => d.msg).join(', ') : null) || 'Registrierung fehlgeschlagen';
            return res.status(422).json({ error: msg });
        }

        result = await updateUser(existing.id);

        if (!result.id) {
            console.error('Update user failed:', JSON.stringify(result));
            return res.status(500).json({ error: 'Benutzer konnte nicht aktualisiert werden' });
        }

        res.setHeader('Set-Cookie', 'orf_session=1; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000');
        res.json({ success: true, user: { id: result.id, email }, existing: true });
    } catch (e) {
        console.error('Register exception:', e);
        res.status(500).json({ error: 'Serverfehler bei Registrierung' });
    }
}
