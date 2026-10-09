import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const CODES_PATH = path.join(PROJECT_ROOT, 'data', 'codes.json');

const GITHUB_REPO = process.env.GITHUB_REPO || 'MarkO75SU/orfb';
const GH_TOKEN = process.env.GH_TOKEN || process.env.GH_PAT_TOKEN;
const BRANCH = 'main';
const CONTENT_URL = `https://api.github.com/repos/${GITHUB_REPO}/contents/data/codes.json`;

export class ConflictError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ConflictError';
    }
}

function emptyStore() {
    return { codes: {}, nextAnonId: 1 };
}

function normalize(parsed) {
    if (!parsed || typeof parsed !== 'object') return emptyStore();
    if (!parsed.codes || typeof parsed.codes !== 'object') parsed.codes = {};
    if (!parsed.nextAnonId) parsed.nextAnonId = 1;
    return parsed;
}

// Fail-closed: wenn GH_TOKEN gesetzt ist, wird ein GitHub-Fehler propagiert
// (kein stilles Ausweichen auf einen evtl. veralteten lokalen Snapshot).
export async function readCodes() {
    if (GH_TOKEN) {
        const res = await fetch(CONTENT_URL + `?ref=${BRANCH}`, {
            headers: { Authorization: `Bearer ${GH_TOKEN}` },
            cache: 'no-store'
        });
        if (res.status === 404) return { codes: emptyStore(), sha: null };
        if (!res.ok) throw new Error(`GitHub read error: ${res.status}`);
        const data = await res.json();
        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        return { codes: normalize(JSON.parse(content)), sha: data.sha };
    }
    try {
        const fs = await import('fs');
        const content = fs.readFileSync(CODES_PATH, 'utf-8');
        return { codes: normalize(JSON.parse(content)), sha: null };
    } catch {
        return { codes: emptyStore(), sha: null };
    }
}

export async function writeCodes(codesData, sha) {
    if (GH_TOKEN) {
        const content = Buffer.from(JSON.stringify(codesData, null, 2) + '\n').toString('base64');
        const body = {
            message: `Codes: ${codesData.codes ? Object.keys(codesData.codes).length + ' codes' : 'update'}`,
            content,
            branch: BRANCH
        };
        if (sha) body.sha = sha;
        const res = await fetch(CONTENT_URL, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${GH_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        if (res.status === 409 || res.status === 422) {
            throw new ConflictError(`GitHub conflict: ${res.status}`);
        }
        if (!res.ok) {
            const err = await res.text();
            throw new Error(`GitHub write error: ${res.status} - ${err}`);
        }
        return true;
    }
    const fs = await import('fs');
    const tmp = CODES_PATH + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(codesData, null, 2) + '\n');
    fs.renameSync(tmp, CODES_PATH);
    return true;
}

// Read-Modify-Write mit Optimistic Concurrency: liest frischen sha, wendet den
// Mutator an und wiederholt bei Konflikt (409/422) mit neuem sha.
export async function withCodes(mutator, attempts = 4) {
    let lastErr;
    for (let attempt = 0; attempt < attempts; attempt++) {
        const { codes, sha } = await readCodes();
        const payload = mutator(codes);
        try {
            await writeCodes(codes, sha);
            return payload;
        } catch (e) {
            if (e instanceof ConflictError) {
                lastErr = e;
                continue;
            }
            throw e;
        }
    }
    throw lastErr || new ConflictError('Codes-Update: Konflikt nach mehreren Versuchen');
}
