const GITHUB_REPO = process.env.GITHUB_REPO || 'MarkO75SU/orfb';
const GH_TOKEN = process.env.GH_TOKEN || process.env.GH_PAT_TOKEN;
const CODES_PATH = 'data/codes.json';
const BRANCH = 'main';

export async function readCodes() {
    if (GH_TOKEN) {
        try {
            const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${CODES_PATH}`;
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${GH_TOKEN}` }
            });
            if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
            const data = await res.json();
            const content = Buffer.from(data.content, 'base64').toString('utf-8');
            return { codes: JSON.parse(content), sha: data.sha };
        } catch (e) {
            console.warn('GitHub read failed, falling back to direct:', e.message);
        }
    }
    // Fallback: try direct fs read (local dev only)
    try {
        const fs = await import('fs');
        const content = fs.readFileSync(CODES_PATH, 'utf-8');
        return { codes: JSON.parse(content), sha: null };
    } catch {
        return { codes: { codes: {} }, sha: null };
    }
}

export async function writeCodes(codesData, sha) {
    if (GH_TOKEN) {
        const content = Buffer.from(JSON.stringify(codesData, null, 2)).toString('base64');
        const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${CODES_PATH}`;
        const body = {
            message: `Codes: ${codesData.codes ? Object.keys(codesData.codes).length + ' codes' : 'update'}`,
            content,
            branch: BRANCH
        };
        if (sha) body.sha = sha;
        const res = await fetch(url, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${GH_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        if (!res.ok) {
            const err = await res.text();
            throw new Error(`GitHub write error: ${res.status} - ${err}`);
        }
        return true;
    }
    // Fallback: direct fs write (local dev)
    const fs = await import('fs');
    fs.writeFileSync(CODES_PATH, JSON.stringify(codesData, null, 2) + '\n');
    return true;
}
