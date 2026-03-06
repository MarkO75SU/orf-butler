export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { username, password } = req.body;
    
    const validUser = process.env.LOGIN_USER;
    const validPass = process.env.LOGIN_PASS;
    
    if (!validUser || !validPass) {
        return res.status(500).json({ error: 'Zugangsdaten nicht konfiguriert' });
    }
    
    if (username === validUser && password === validPass) {
        return res.json({ success: true });
    }
    
    res.status(401).json({ error: 'Zugang verweigert' });
}
