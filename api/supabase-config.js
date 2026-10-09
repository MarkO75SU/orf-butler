import { methodGuard } from '../lib/http.js';

export default function handler(req, res) {
    if (methodGuard(req, res, 'GET')) return;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!url || !key) {
        // Social login is optional: report it as disabled instead of erroring.
        return res.status(200).json({ configured: false });
    }

    res.json({ configured: true, url, key });
}
