import fs from 'fs';

const MAPPING_PATH = 'src/js/mapping.js';
const CHANGELOG_PATH = 'data/changelog.json';
const OPENROUTER_API = 'https://openrouter.ai/api/v1/models';

function extractTags(id, name, description, inputModalities) {
    const tags = new Set();
    const text = (id + ' ' + name + ' ' + (description || '')).toLowerCase();
    const mods = inputModalities || ['text'];

    if (mods.includes('image')) tags.add('vision');
    if (mods.includes('audio')) tags.add('audio');
    if (mods.includes('video')) tags.add('video');
    const hasNonText = mods.some(m => m !== 'text');
    if (mods.length > 1 || hasNonText) tags.add('multimodal');

    if (/coder|code generation|codegen|programming|laguna|poolside/i.test(text)) tags.add('coding');
    if (/reason(ing)?\b|thinking|chain.of.thought|cot|deepseek.*r1/i.test(text)) tags.add('reasoning');
    if (/chat|instruct|assistant|hermes|general/i.test(text)) tags.add('chat');
    if (/lightweight|compact|small|efficient|1\.\d+b|2b\b|3b\b|9b\b|nano/i.test(text)) tags.add('lightweight');
    if (/moe|mixture.of.experts/i.test(text)) tags.add('moe');
    if (/agent(ic)?\b|function.call|tool.use/i.test(text)) tags.add('agent');
    if (/multilingual|translation/i.test(text)) tags.add('multilingual');
    if (/embedding|retrieval|rag/i.test(text)) tags.add('embedding');
    if (/open.?weight|open.?source/i.test(text)) tags.add('open-source');

    return [...tags].sort();
}

function determineRole(tags, id, name) {
    const text = (id + ' ' + name).toLowerCase();
    if (tags.includes('coding') || /coder|code|laguna|poolside/i.test(text)) return { role: 'Code', role_de: 'Code' };
    if (tags.includes('reasoning') || /deepseek.*r1|reason/i.test(text)) return { role: 'Reasoning', role_de: 'Logik' };
    if (tags.includes('chat') || /instruct|hermes/i.test(text)) return { role: 'Chat', role_de: 'Chat' };
    if (tags.includes('lightweight') || /nano|small/i.test(text)) return { role: 'Lightweight', role_de: 'Leichtgewicht' };
    return { role: 'General', role_de: 'Allgemein' };
}

function makeGermanDesc(desc, role) {
    if (!desc || desc.length < 10) {
        const map = { 'Code': 'Code-Generierungs-Modell über OpenRouter kostenlos.', 'Reasoning': 'Logik-Modell über OpenRouter kostenlos.', 'Chat': 'Chat-Modell über OpenRouter kostenlos.', 'Lightweight': 'Leichtgewicht-Modell über OpenRouter kostenlos.', 'General': 'Allgemeines KI-Modell über OpenRouter kostenlos.' };
        return map[role] || 'KI-Modell über OpenRouter kostenlos.';
    }
    return desc;
}

function shortDesc(text, maxLen = 140) {
    if (!text) return '';
    let clean = text.replace(/\s+/g, ' ').trim();
    // Split on '. ' (period + space) for sentence boundaries, but protect numbers like "30.7B"
    const cleaned = clean.replace(/(\d)\.(\d)/g, '$1<DOT>$2');
    const sentences = cleaned.split('. ');
    if (sentences.length > 0) {
        let first = sentences[0].replace(/<DOT>/g, '.').trim();
        if (first.length >= 20 && first.length <= maxLen) return first + '.';
        if (first.length > maxLen) return first.slice(0, first.lastIndexOf(' ', maxLen)) + '...';
    }
    if (clean.length <= maxLen) return clean;
    return clean.slice(0, clean.lastIndexOf(' ', maxLen)) + '...';
}

function guessLanguages(id, name, description) {
    const langs = ['python', 'javascript', 'typescript', 'go', 'rust', 'java'];
    const lower = (id + ' ' + name + ' ' + (description || '')).toLowerCase();
    const matched = langs.filter(l => lower.includes(l));
    return matched.length > 0 ? matched : ['python', 'javascript', 'typescript'];
}

function modalityLabel(mods) {
    if (!mods || mods.length <= 1) return '';
    const labels = { image: '🖼️', audio: '🎤', video: '🎬' };
    const icons = mods.filter(m => m !== 'text').map(m => labels[m] || m).join(' ');
    return icons || '';
}

async function fetchFreeModels() {
    const res = await fetch(OPENROUTER_API);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();

    return data.data
        .filter(m => m.id.endsWith(':free'))
        .map(m => ({
            id: m.id,
            name: m.name || m.id,
            context: m.context_length || null,
            description: m.description || '',
            inputModalities: m.architecture?.input_modalities || ['text'],
        }))
        .sort((a, b) => a.id.localeCompare(b.id));
}

function buildMappingContent(freeModels, existingIds) {
    const withNew = freeModels.map(m => ({
        ...m,
        isNew: !existingIds.has(m.id)
    }));

    withNew.sort((a, b) => {
        if (a.isNew !== b.isNew) return a.isNew ? -1 : 1;
        return a.id.localeCompare(b.id);
    });

    let out = 'export const MODEL_MAPPING = {\n';
    withNew.forEach((m, i) => {
        const tags = extractTags(m.id, m.name, m.description, m.inputModalities);
        const { role, role_de } = determineRole(tags, m.id, m.name);
        const descEn = shortDesc(m.description) || (role + ' model via OpenRouter free tier.');
        const descDe = makeGermanDesc(descEn, role) || (role_de + '-Modell über OpenRouter kostenlos.');
        const ctxStr = m.context ? (m.context < 1000 ? `${m.context}` : `${Math.round(m.context/1000)}k`) : '?';
        const modIcon = modalityLabel(m.inputModalities);
        const isMultimodal = m.inputModalities.some(m => m !== 'text');

        out += '    "' + m.id + '": {\n';
        out += '        role: "' + role + '",\n';
        out += '        role_de: "' + role_de + '",\n';
        out += '        context: "' + ctxStr + '",\n';
        out += '        desc_en: ' + JSON.stringify(descEn) + ',\n';
        out += '        desc_de: ' + JSON.stringify(descDe) + ',\n';
        if (isMultimodal) {
            out += '        modalities: ' + JSON.stringify(m.inputModalities) + ',\n';
            out += '        modality_icon: "' + modIcon + '",\n';
        }
        const langs = guessLanguages(m.id, m.name, m.description);
        out += '        tags: ' + JSON.stringify(tags) + ',\n';
        out += '        languages: ' + JSON.stringify(langs) + (m.isNew ? ',\n        new: true' : '') + '\n';
        out += '    }' + (i < withNew.length - 1 ? ',' : '') + '\n';
    });
    out += '};\n';
    return out;
}

function readExistingModelIds(content) {
    const ids = [...content.matchAll(/"([^"]+:free)"/g)].map(m => m[1]);
    return new Set(ids);
}

function loadChangelog() {
    try {
        return JSON.parse(fs.readFileSync(CHANGELOG_PATH, 'utf-8'));
    } catch {
        return { entries: [] };
    }
}

function saveChangelog(log) {
    const dir = CHANGELOG_PATH.split('/').slice(0, -1).join('/');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CHANGELOG_PATH, JSON.stringify(log, null, 2));
}

async function main() {
    console.log('Fetching free models from OpenRouter...');
    const freeModels = await fetchFreeModels();
    console.log('Found ' + freeModels.length + ' free models');

    let existingContent = '';
    try {
        existingContent = fs.readFileSync(MAPPING_PATH, 'utf-8');
    } catch {
        existingContent = '';
    }

    const existingIds = readExistingModelIds(existingContent);
    const newIds = new Set(freeModels.map(m => m.id));

    const added = [...newIds].filter(id => !existingIds.has(id)).sort();
    const removed = [...existingIds].filter(id => !newIds.has(id)).sort();

    const changelog = loadChangelog();
    const today = new Date().toISOString().split('T')[0];

    if (added.length > 0 || removed.length > 0) {
        let msg = '### ' + today + '\n';
        if (added.length > 0) {
            msg += '**Neu hinzugefügt:**\n';
            added.forEach(id => {
                const m = freeModels.find(f => f.id === id);
                const tags = m ? extractTags(m.id, m.name, m.description, m.inputModalities).join(', ') : '';
                msg += '- ' + id + (tags ? ' (' + tags + ')' : '') + '\n';
            });
        }
        if (removed.length > 0) {
            msg += '**Entfernt:**\n';
            removed.forEach(id => msg += '- ' + id + '\n');
        }
        msg += '\n';

        changelog.entries.unshift({
            date: today,
            added: added.map(id => {
                const m = freeModels.find(f => f.id === id);
                return { id, tags: m ? extractTags(m.id, m.name, m.description, m.inputModalities) : [] };
            }),
            removed: [...removed]
        });
        if (changelog.entries.length > 50) changelog.entries.length = 50;
        saveChangelog(changelog);

        fs.writeFileSync('model-changes.txt', msg);
        console.log('Model changes detected:\n' + msg);
    } else {
        console.log('No model changes detected.');
        try { fs.unlinkSync('model-changes.txt'); } catch {}
    }

    const header = '// Auto-generated by scripts/update-models.js\n// Last updated: ' + today + '\n\n';
    const newMapping = buildMappingContent(freeModels, existingIds);

    const restMatch = existingContent.match(/\nexport function getBestModels/);
    const rest = restMatch ? existingContent.slice(restMatch.index) : '';

    fs.writeFileSync(MAPPING_PATH, header + newMapping + rest);
    console.log('Updated ' + MAPPING_PATH);
}

main().catch(err => {
    console.error('Update failed:', err.message);
    process.exit(1);
});
