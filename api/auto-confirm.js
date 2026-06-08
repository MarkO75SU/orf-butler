import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId, email } = req.body || {};
    if (!userId && !email) {
        return res.status(400).json({ error: 'userId oder email erforderlich' });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
        return res.status(500).json({ error: 'Supabase nicht konfiguriert' });
    }

    const adminClient = createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });

    const updateData = { email_confirm: true };

    const { data, error } = userId
        ? await adminClient.auth.admin.updateUserById(userId, updateData)
        : await adminClient.auth.admin.updateUserByEmail(email, updateData);

    if (error) {
        console.error('Auto-confirm error:', error);
        return res.status(500).json({ error: 'Bestätigung fehlgeschlagen' });
    }

    res.json({ success: true });
}
