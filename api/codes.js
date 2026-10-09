import { randomInt } from 'crypto';
import { readCodes, withCodes } from '../lib/github-store.js';
import { applyCors, handlePreflight, methodGuard, clientIp } from '../lib/http.js';

const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000;
const RATE_LIMIT_MAX = 30;

class HttpError extends Error {
    constructor(status, body) {
        super(body?.error || 'Fehler');
        this.status = status;
        this.body = body;
    }
}

function checkRateLimit(ip) {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap) {
        if (now - entry.windowStart > RATE_LIMIT_WINDOW) rateLimitMap.delete(key);
    }
    const entry = rateLimitMap.get(ip);
    if (!entry) {
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
        code += chars[randomInt(0, chars.length)];
    }
    return code;
}

function verifyAdmin(req) {
    const user = process.env.LOGIN_USER;
    const pass = process.env.LOGIN_PASS;
    if (!user || !pass) return false;
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Basic ')) return false;
    const decoded = Buffer.from(auth.slice(6), 'base64').toString();
    const idx = decoded.indexOf(':');
    if (idx < 0) return false;
    return decoded.slice(0, idx) === user && decoded.slice(idx + 1) === pass;
}

export default async function handler(req, res) {
    applyCors(res);
    if (handlePreflight(req, res)) return;
    if (methodGuard(req, res, 'GET', 'POST')) return;

    const ip = clientIp(req);
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
                const body = req.body || {};
                const count = Math.max(1, Math.min(parseInt(body.count) || 1, 100));
                const maxUses = Math.max(1, parseInt(body.maxUses) || 10);
                const payload = await withCodes((store) => {
                    const generated = [];
                    for (let i = 0; i < count; i++) {
                        let code = generateCode();
                        while (store.codes[code]) code = generateCode();
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
                    return { generated, count };
                });
                return res.json(payload);
            }

            case 'redeem': {
                const { code } = req.body || {};
                if (!code) return res.status(400).json({ error: 'Code erforderlich' });
                const cleaned = code.toUpperCase().trim();
                const payload = await withCodes((store) => {
                    const entry = store.codes[cleaned];
                    if (!entry || !entry.active || entry.uses >= entry.maxUses) {
                        throw new HttpError(401, { error: 'Ungültiger oder verbrauchter Code' });
                    }
                    entry.uses += 1;
                    return {
                        success: true,
                        code: cleaned,
                        anonId: entry.anonId || 'anon',
                        uses: entry.uses,
                        maxUses: entry.maxUses,
                        remaining: entry.maxUses - entry.uses
                    };
                });
                res.setHeader('Set-Cookie', 'orf_session=1; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800');
                return res.json(payload);
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
                const payload = await withCodes((store) => {
                    if (!store.codes[revokeCode]) {
                        throw new HttpError(404, { error: 'Code nicht gefunden' });
                    }
                    store.codes[revokeCode].active = false;
                    return { success: true, code: revokeCode, status: 'revoked' };
                });
                return res.json(payload);
            }

            case 'reset': {
                if (!verifyAdmin(req)) {
                    return res.status(401).json({ error: 'Admin-Zugang erforderlich' });
                }
                const resetCode = (req.body?.code || '').toUpperCase().trim();
                if (!resetCode) return res.status(400).json({ error: 'Code erforderlich' });
                const payload = await withCodes((store) => {
                    if (!store.codes[resetCode]) {
                        throw new HttpError(404, { error: 'Code nicht gefunden' });
                    }
                    store.codes[resetCode].uses = 0;
                    store.codes[resetCode].active = true;
                    return { success: true, code: resetCode, uses: 0, status: 'reset' };
                });
                return res.json(payload);
            }

            default:
                return res.status(400).json({ error: 'Unbekannte Aktion. Nutze: generate, redeem, check, list, revoke, reset' });
        }
    } catch (e) {
        if (e instanceof HttpError) {
            return res.status(e.status).json(e.body);
        }
        console.error('Codes API error:', e);
        return res.status(500).json({ error: 'Interner Serverfehler' });
    }
}
