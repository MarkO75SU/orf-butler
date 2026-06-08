export default function handler(req, res) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!url || !key) {
        return res.status(500).json({ error: 'Supabase nicht konfiguriert' });
    }

    res.json({ url, key });
}
