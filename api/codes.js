import { readCodes, writeCodes } from '../lib/github-store.js';

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

    const { action } = req.query;

    try {
        switch (action) {
            case 'generate': {
                if (!verifyAdmin(req)) {
                    return res.status(401).json({ error: 'Admin-Zugang erforderlich' });
                }
                const count = Math.min(parseInt(req.body?.count) || 1, 100);
                const maxUses = parseInt(req.body?.maxUses) || 10;
                const { codes: store, sha } = await readCodes();
                if (!store.nextAnonId) store.nextAnonId = 1;
                const generated = [];
                for (let i = 0; i < count; i++) {
                    let code = generateCode();
                    while (store.codes[code]) {
                        code = generateCode();
                    }
                    store.codes[code] = {
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
                if (!entry) return res.status(404).json({ error: 'Ungültiger Code' });
                if (!entry.active) return res.status(403).json({ error: 'Code wurde deaktiviert' });
                if (entry.uses >= entry.maxUses) return res.status(403).json({ error: 'Code bereits aufgebraucht' });
                entry.uses += 1;
                const anonId = 'anon' + String(store.nextAnonId || 1).padStart(4, '0');
                store.nextAnonId = (store.nextAnonId || 1) + 1;
                await writeCodes(store, sha);
                return res.json({
                    success: true,
                    code: cleaned,
                    anonId: anonId,
                    uses: entry.uses,
                    maxUses: entry.maxUses,
                    remaining: entry.maxUses - entry.uses
                });
            }

            case 'check': {
                const checkCode = (req.query.code || '').toUpperCase().trim();
                const { codes: store } = await readCodes();
                const entry = store.codes[checkCode];
                if (!entry) return res.json({ valid: false, reason: 'not_found' });
                if (!entry.active) return res.json({ valid: false, reason: 'deactivated' });
                if (entry.uses >= entry.maxUses) return res.json({ valid: false, reason: 'exhausted' });
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
        return res.status(500).json({ error: e.message });
    }
}
