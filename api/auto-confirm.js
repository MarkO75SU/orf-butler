import { methodGuard } from '../lib/http.js';

export default async function handler(req, res) {
    if (methodGuard(req, res, 'POST')) return;

    const { userId } = req.body || {};
    if (!userId) {
        return res.status(400).json({ error: 'userId erforderlich' });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
        return res.status(500).json({ error: 'Supabase nicht konfiguriert' });
    }

    try {
        // Direkter REST-Aufruf an Supabase Auth Admin API
        const response = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'apikey': serviceKey,
                'Authorization': `Bearer ${serviceKey}`
            },
            body: JSON.stringify({
                email_confirm: true,
                email_confirmed_at: new Date().toISOString()
            })
        });

        if (!response.ok) {
            const text = await response.text();
            console.error('Supabase admin API error:', response.status, text);
            return res.status(500).json({ error: 'Bestätigung fehlgeschlagen' });
        }

        res.json({ success: true });
    } catch (e) {
        console.error('Auto-confirm exception:', e);
        res.status(500).json({ error: 'Bestätigung fehlgeschlagen' });
    }
}
