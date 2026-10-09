// Gemeinsame HTTP-Helfer für die Serverless-API.
export function applyCors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export function handlePreflight(req, res) {
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return true;
    }
    return false;
}

export function methodGuard(req, res, ...allowed) {
    if (!allowed.includes(req.method)) {
        res.status(405).json({ error: 'Method not allowed' });
        return true;
    }
    return false;
}

export function clientIp(req) {
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim()
        || req.socket?.remoteAddress
        || 'unknown';
}
