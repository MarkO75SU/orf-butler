import { methodGuard } from '../lib/http.js';

export default function handler(req, res) {
    if (methodGuard(req, res, 'GET')) return;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!url || !key) {
        return res.status(500).json({ error: 'Supabase not configured' });
    }

    res.json({ url, key });
}
