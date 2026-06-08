export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, password } = req.body || {};
    if (!email || !password) {
        return res.status(400).json({ error: 'E-Mail und Passwort erforderlich' });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
        return res.status(500).json({ error: 'Supabase nicht konfiguriert' });
    }

    try {
        // User via Supabase Admin API erstellen (kein Rate Limit)
        const createRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': serviceKey,
                'Authorization': `Bearer ${serviceKey}`
            },
            body: JSON.stringify({
                email,
                password,
                email_confirm: true
            })
        });

        const data = await createRes.json();

        if (!createRes.ok) {
            console.error('Register API error:', createRes.status, data);
            const msg = data?.msg || (Array.isArray(data) ? data[0]?.msg : null) || 'Registrierung fehlgeschlagen';
            return res.status(createRes.status).json({ error: msg });
        }

        // Set session cookie for middleware
        res.setHeader('Set-Cookie', 'orf_session=1; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000');

        res.json({
            success: true,
            user: { id: data.id, email: data.email }
        });
    } catch (e) {
        console.error('Register exception:', e);
        res.status(500).json({ error: 'Serverfehler bei Registrierung' });
    }
}
