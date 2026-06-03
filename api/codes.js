import { readCodes, writeCodes } from '../lib/github-store.js';

const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000;
const RATE_LIMIT_MAX = 30;

function checkRateLimit(ip) {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);
    if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW) {
        rateLimitMap.set(ip, { windowStart: now, count: 1 });
        return true;
    }
    if (entry.count >= RATE_LIMIT_MAX) return false;
    entry.count++;
    return true;
}

function generateCode(length = 8) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

function verifyAdmin(req) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Basic ')) return false;
    const decoded = Buffer.from(auth.slice(6), 'base64').toString();
    const [user, pass] = decoded.split(':');
    return user === process.env.LOGIN_USER && pass === process.env.LOGIN_PASS;
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
    if (!checkRateLimit(ip)) {
        return res.status(429).json({ error: 'Zu viele Anfragen. Bitte warten.' });
    }

    const { action } = req.query;

    try {
        switch (action) {
            case 'generate': {
                if (!verifyAdmin(req)) {
                    return res.status(401).json({ error: 'Admin-Zugang erforderlich' });
                }
                const count = Math.max(1, Math.min(parseInt(req.body?.count) || 1, 100));
                const maxUses = Math.max(1, parseInt(req.body?.maxUses) || 10);
                const { codes: store, sha } = await readCodes();
                if (!store.nextAnonId) store.nextAnonId = 1;
                const generated = [];
                for (let i = 0; i < count; i++) {
                    let code = generateCode();
                    while (store.codes[code]) {
                        code = generateCode();
                    }
                    const anonId = 'anon' + String(store.nextAnonId).padStart(3, '0');
                    store.nextAnonId += 1;
                    store.codes[code] = {
                        anonId,
                        maxUses,
                        uses: 0,
                        active: true,
                        createdAt: new Date().toISOString()
                    };
                    generated.push(code);
                }
                await writeCodes(store, sha);
                return res.json({ generated, count });
            }

            case 'redeem': {
                const { code } = req.body || {};
                if (!code) return res.status(400).json({ error: 'Code erforderlich' });
                const cleaned = code.toUpperCase().trim();
                const { codes: store, sha } = await readCodes();
                const entry = store.codes[cleaned];
                if (!entry || !entry.active || entry.uses >= entry.maxUses) {
                    return res.status(401).json({ error: 'Ungültiger oder verbrauchter Code' });
                }
                entry.uses += 1;
                await writeCodes(store, sha);
                res.setHeader('Set-Cookie', 'orf_session=1; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800');
                return res.json({
                    success: true,
                    code: cleaned,
                    anonId: entry.anonId || 'anon',
                    uses: entry.uses,
                    maxUses: entry.maxUses,
                    remaining: entry.maxUses - entry.uses
                });
            }

            case 'check': {
                const checkCode = (req.query.code || '').toUpperCase().trim();
                const { codes: store } = await readCodes();
                const entry = store.codes[checkCode];
                const valid = entry && entry.active && entry.uses < entry.maxUses;
                if (!valid) return res.json({ valid: false });
                return res.json({
                    valid: true,
                    uses: entry.uses,
                    maxUses: entry.maxUses,
                    remaining: entry.maxUses - entry.uses
                });
            }

            case 'list': {
                if (!verifyAdmin(req)) {
                    return res.status(401).json({ error: 'Admin-Zugang erforderlich' });
                }
                const { codes: store } = await readCodes();
                return res.json(store);
            }

            case 'revoke': {
                if (!verifyAdmin(req)) {
                    return res.status(401).json({ error: 'Admin-Zugang erforderlich' });
                }
                const revokeCode = (req.body?.code || '').toUpperCase().trim();
                if (!revokeCode) return res.status(400).json({ error: 'Code erforderlich' });
                const { codes: store, sha } = await readCodes();
                if (!store.codes[revokeCode]) return res.status(404).json({ error: 'Code nicht gefunden' });
                store.codes[revokeCode].active = false;
                await writeCodes(store, sha);
                return res.json({ success: true, code: revokeCode, status: 'revoked' });
            }

            case 'reset': {
                if (!verifyAdmin(req)) {
                    return res.status(401).json({ error: 'Admin-Zugang erforderlich' });
                }
                const resetCode = (req.body?.code || '').toUpperCase().trim();
                if (!resetCode) return res.status(400).json({ error: 'Code erforderlich' });
                const { codes: store, sha } = await readCodes();
                if (!store.codes[resetCode]) return res.status(404).json({ error: 'Code nicht gefunden' });
                store.codes[resetCode].uses = 0;
                store.codes[resetCode].active = true;
                await writeCodes(store, sha);
                return res.json({ success: true, code: resetCode, uses: 0, status: 'reset' });
            }

            default:
                return res.status(400).json({ error: 'Unbekannte Aktion. Nutze: generate, redeem, check, list, revoke, reset' });
        }
    } catch (e) {
        console.error('Codes API error:', e);
        return res.status(500).json({ error: 'Interner Serverfehler' });
    }
}
