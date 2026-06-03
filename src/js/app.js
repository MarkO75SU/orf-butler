import { setLanguage, getLang } from './i18n.js';
import { TOOL_TEMPLATES, generateConfig } from './templates.js';
import { generateInstallMD, OS_PATHS } from './docs.js';
import { isAuthenticated, logout, getUser } from './auth.js';
import { MODEL_MAPPING } from './mapping.js';

const ADMIN_USER = 'generali';
const isAdmin = () => getUser() === ADMIN_USER;

let state = {
    selectedModels: [],
    selectedTools: [],
    selectedBundle: 'basic'
};

function saveState() {
    try { sessionStorage.setItem('orf_state', JSON.stringify(state)); } catch {}
}

function loadState() {
    try {
        const saved = sessionStorage.getItem('orf_state');
        if (saved) {
            const parsed = JSON.parse(saved);
            state.selectedModels = parsed.selectedModels || [];
            state.selectedTools = parsed.selectedTools || [];
            state.selectedBundle = parsed.selectedBundle || 'basic';
        }
    } catch {}
}

const translations = {
    de: {
        step1Title: "Wähle deine Free-LLM Modelle",
        step1Desc: "Wähle ein oder mehrere Modelle von OpenRouter",
        step2Title: "Wähle deine Tools",
        step2Desc: "Wähle ein oder mehrere Tools für die Config",
        step3Title: "Wähle dein Bundle",
        step3Desc: "Welches Paket möchtest du?",
        step4Title: "Checkout & Download",
        step4Desc: "Erstelle und lade deine Configs herunter",
        summaryModel: "Ausgewählte Modelle:",
        summaryTool: "Tools:",
        summaryBundle: "Bundle:",
        downloadBtn: "Als ZIP Herunterladen",
        noModel: "Keine Modelle ausgewählt",
        noTool: "Keine Tools ausgewählt",
        adminBadge: "ADMIN",
        bundleFree: "Kostenlos",
        codesTitle: "🔑 Code-Verwaltung",
        codesGenerate: "Codes generieren",
        codesGenerateBtn: "Generieren",
        codesList: "Codes anzeigen",
        codesRevoke: "Deaktivieren",
        codesReset: "Zurücksetzen",
        codesNone: "Keine Codes vorhanden",
        codesUsage: "Nutzungen",
        codesActive: "Aktiv",
        codesInactive: "Inaktiv",
        codesRefresh: "Aktualisieren",
        codesClose: "Schließen"
    },
    en: {
        step1Title: "Select your Free-LLM Models",
        step1Desc: "Select one or more models from OpenRouter",
        step2Title: "Select your Tools",
        step2Desc: "Select one or more tools for the config",
        step3Title: "Select your Bundle",
        step3Desc: "Which package do you want?",
        step4Title: "Checkout & Download",
        step4Desc: "Create and download your configs",
        summaryModel: "Selected Models:",
        summaryTool: "Tools:",
        summaryBundle: "Bundle:",
        downloadBtn: "Download as ZIP",
        noModel: "No models selected",
        noTool: "No tools selected",
        adminBadge: "ADMIN",
        bundleFree: "Free",
        codesTitle: "🔑 Code Management",
        codesGenerate: "Generate codes",
        codesGenerateBtn: "Generate",
        codesList: "View codes",
        codesRevoke: "Revoke",
        codesReset: "Reset",
        codesNone: "No codes available",
        codesUsage: "Uses",
        codesActive: "Active",
        codesInactive: "Inactive",
        codesRefresh: "Refresh",
        codesClose: "Close"
    }
};

window.setLang = (lang) => {
    setLanguage(lang);
    loadModels();
    updateUI();
};

window.logout = () => {
    logout();
    sessionStorage.removeItem('orf_state');
    window.location.href = '/landing';
};

function updateUI() {
    const lang = getLang();
    const texts = translations[lang] || translations.de;
    
    document.getElementById('step1-title').textContent = texts.step1Title;
    document.getElementById('step1-desc').textContent = texts.step1Desc;
    document.getElementById('step2-title').textContent = texts.step2Title;
    document.getElementById('step2-desc').textContent = texts.step2Desc;
    document.getElementById('step3-title').textContent = texts.step3Title;
    document.getElementById('step3-desc').textContent = texts.step3Desc;
    document.getElementById('step4-title').textContent = texts.step4Title;
    document.getElementById('step4-desc').textContent = texts.step4Desc;
    document.getElementById('summary-model-label').textContent = texts.summaryModel;
    document.getElementById('summary-tool-label').textContent = texts.summaryTool;
    document.getElementById('summary-bundle-label').textContent = texts.summaryBundle;
    document.getElementById('download-btn').textContent = texts.downloadBtn;
    const badge = document.getElementById('admin-badge');
    const adminBtn = document.getElementById('admin-btn');
    if (badge && adminBtn) {
        if (isAdmin()) {
            badge.classList.remove('hidden');
            badge.textContent = texts.adminBadge;
            adminBtn.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
            adminBtn.classList.add('hidden');
        }
    }
    
    const admin = isAdmin();
    document.getElementById('bundle-basic-price').textContent = admin ? texts.bundleFree : '5€';
    document.getElementById('bundle-premium-price').textContent = admin ? texts.bundleFree : '20€';
    
    updateSummary();
}

function updateSummary() {
    const lang = getLang();
    const texts = translations[lang] || translations.de;
    
    const modelNames = state.selectedModels.map(id => {
        const data = MODEL_MAPPING[id];
        return data ? data.role : id.split('/').pop();
    }).join(', ');
    
    const toolNames = state.selectedTools.map(id => TOOL_TEMPLATES[id]?.name || id).join(', ');
    
    const admin = isAdmin();
    const bundleLabel = state.selectedBundle === 'basic' 
        ? `Standard Bundle${admin ? '' : ' (5€)'}` 
        : `Premium Bundle${admin ? '' : ' (20€)'}`;

    document.getElementById('summary-models').textContent = state.selectedModels.length 
        ? `(${state.selectedModels.length}) ${modelNames}` 
        : texts.noModel;
    document.getElementById('summary-tools').textContent = state.selectedTools.length 
        ? `(${state.selectedTools.length}) ${toolNames}` 
        : texts.noTool;
    document.getElementById('summary-bundle').textContent = bundleLabel;
}

function loadModels() {
    const grid = document.getElementById('models-grid');
    grid.innerHTML = '';
    const lang = getLang();
    
    const entries = Object.entries(MODEL_MAPPING).sort(([idA, a], [idB, b]) => {
        if (a.new && !b.new) return -1;
        if (!a.new && b.new) return 1;
        return idA.localeCompare(idB);
    });
    
    entries.forEach(([id, data]) => {
        const card = document.createElement('div');
        const role = lang === 'de' ? data.role_de : data.role;
        const desc = lang === 'de' ? data.desc_de : data.desc_en;
        const checkId = `model-${id.replace(/[:/.]/g, '-')}`;
        const isChecked = state.selectedModels.includes(id) ? 'checked' : '';
        const neueBadge = data.new ? '<span class="text-[9px] bg-sky-600 text-white px-1.5 py-0.5 rounded font-bold ml-1">NEU</span>' : '';
        const tags = data.tags || [];
        const tagColors = {
            coding: 'bg-emerald-900/60 text-emerald-400',
            reasoning: 'bg-violet-900/60 text-violet-400',
            vision: 'bg-cyan-900/60 text-cyan-400',
            multimodal: 'bg-pink-900/60 text-pink-400',
            chat: 'bg-blue-900/60 text-blue-400',
            lightweight: 'bg-amber-900/60 text-amber-400',
            agent: 'bg-orange-900/60 text-orange-400',
            moe: 'bg-slate-800 text-slate-400',
            multilingual: 'bg-indigo-900/60 text-indigo-400',
            embedding: 'bg-teal-900/60 text-teal-400',
            'open-source': 'bg-green-900/60 text-green-400',
            audio: 'bg-purple-900/60 text-purple-400',
            video: 'bg-rose-900/60 text-rose-400'
        };
        const tagHtml = tags.map(t => `<span class="text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${tagColors[t] || 'bg-slate-800 text-slate-500'}">${t}</span>`).join('');
        const modIcon = data.modality_icon ? `<span class="text-[10px] ml-1">${data.modality_icon}</span>` : '';
        
        card.className = `model-card bg-[#1a1a1e] border ${isChecked ? 'border-sky-600' : 'border-slate-800'} rounded p-4 cursor-pointer hover:border-sky-500 transition`;
        card.setAttribute('data-model-id', id);
        card.innerHTML = `
            <div class="flex items-start gap-3">
                <input type="checkbox" id="${checkId}" ${isChecked} 
                    class="mt-1 accent-sky-600 cursor-pointer shrink-0"
                    onclick="event.stopPropagation(); window.toggleModel('${id}')">
                <label for="${checkId}" class="cursor-pointer flex-1 min-w-0" onclick="event.stopPropagation()">
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-bold text-white truncate">${id}</span>
                        <a href="https://openrouter.ai/models/${id}" target="_blank" rel="noopener" class="text-[9px] text-sky-600 hover:text-sky-400 shrink-0" onclick="event.stopPropagation()">↗</a>
                        ${neueBadge}
                    </div>
                    <div class="flex items-center gap-1 mt-1">
                        <span class="text-[10px] text-sky-400 truncate">${role}</span>
                        ${modIcon}
                    </div>
                    <div class="text-[10px] text-slate-500 mt-1 leading-relaxed">${desc}</div>
                    <div class="flex flex-wrap gap-1 mt-2">${tagHtml}</div>
                    <div class="flex gap-2 mt-1 text-[9px] text-slate-600">
                        <span>${data.context || '?'} ctx</span>
                        <span>${data.languages?.join(', ') || ''}</span>
                    </div>
                </label>
            </div>
        `;
        card.addEventListener('click', (e) => {
            if (e.target.type !== 'checkbox') {
                const cb = card.querySelector('input[type="checkbox"]');
                cb.checked = !cb.checked;
                window.toggleModel(id);
            }
        });
        grid.appendChild(card);
    });
}

function createModelCard(modelId) {
    const data = MODEL_MAPPING[modelId];
    if (!data) return;
    const lang = getLang();
    const role = lang === 'de' ? data.role_de : data.role;
    const grid = document.getElementById('models-grid');
    const existing = grid.querySelector(`[data-model-id="${modelId}"]`);
    if (existing) {
        const cb = existing.querySelector('input[type="checkbox"]');
        cb.checked = state.selectedModels.includes(modelId);
        existing.className = `model-card bg-[#1a1a1e] border ${cb.checked ? 'border-sky-600' : 'border-slate-800'} rounded p-4 cursor-pointer hover:border-sky-500 transition`;
    }
}

function loadTools() {
    const grid = document.getElementById('tools-grid');
    grid.innerHTML = '';
    
    const entries = Object.entries(TOOL_TEMPLATES).sort(([, a], [, b]) => a.name.localeCompare(b.name));
    
    entries.forEach(([id, tool]) => {
        const card = document.createElement('div');
        const checkId = `tool-${id}`;
        const isChecked = state.selectedTools.includes(id) ? 'checked' : '';
        
        card.className = `tool-card bg-[#1a1a1e] border ${isChecked ? 'border-sky-600' : 'border-slate-800'} rounded p-4 cursor-pointer hover:border-sky-500 transition`;
        card.setAttribute('data-tool-id', id);
        card.innerHTML = `
            <div class="flex items-start gap-3">
                <input type="checkbox" id="${checkId}" ${isChecked} 
                    class="mt-1 accent-sky-600 cursor-pointer shrink-0"
                    onclick="event.stopPropagation(); window.toggleTool('${id}')">
                <label for="${checkId}" class="cursor-pointer flex-1" onclick="event.stopPropagation()">
                    <div class="text-xs font-bold text-white">${tool.name}</div>
                    <div class="text-[10px] text-slate-500 mt-1">${tool.desc || ''}</div>
                    <div class="flex gap-2 mt-2">
                        <span class="text-[9px] text-slate-600">Typ: ${tool.type || '?'}</span>
                        <span class="text-[9px] text-slate-600">Status: ${tool.status || '?'}</span>
                    </div>
                </label>
            </div>
        `;
        card.addEventListener('click', (e) => {
            if (e.target.type !== 'checkbox') {
                const cb = card.querySelector('input[type="checkbox"]');
                cb.checked = !cb.checked;
                window.toggleTool(id);
            }
        });
        grid.appendChild(card);
    });
}

function updateModelCards() {
    const cards = document.querySelectorAll('#models-grid .model-card');
    cards.forEach(card => {
        const id = card.getAttribute('data-model-id');
        if (!id) return;
        const cb = card.querySelector('input[type="checkbox"]');
        if (cb) {
            cb.checked = state.selectedModels.includes(id);
            card.className = `model-card bg-[#1a1a1e] border ${cb.checked ? 'border-sky-600' : 'border-slate-800'} rounded p-4 cursor-pointer hover:border-sky-500 transition`;
        }
    });
}

function updateToolCards() {
    const cards = document.querySelectorAll('#tools-grid .tool-card');
    cards.forEach(card => {
        const id = card.getAttribute('data-tool-id');
        if (!id) return;
        const cb = card.querySelector('input[type="checkbox"]');
        if (cb) {
            cb.checked = state.selectedTools.includes(id);
            card.className = `tool-card bg-[#1a1a1e] border ${cb.checked ? 'border-sky-600' : 'border-slate-800'} rounded p-4 cursor-pointer hover:border-sky-500 transition`;
        }
    });
}

window.toggleModel = (id) => {
    const idx = state.selectedModels.indexOf(id);
    if (idx === -1) {
        state.selectedModels.push(id);
    } else {
        state.selectedModels.splice(idx, 1);
    }
    saveState();
    updateModelCards();
    updateSummary();
    updateSelectedCount();
};

window.toggleTool = (id) => {
    const idx = state.selectedTools.indexOf(id);
    if (idx === -1) {
        state.selectedTools.push(id);
    } else {
        state.selectedTools.splice(idx, 1);
    }
    saveState();
    updateToolCards();
    updateSummary();
};

function filterModels(query) {
    const q = query.toLowerCase().trim();
    const cards = document.querySelectorAll('#models-grid .model-card');
    let visibleCount = 0;
    cards.forEach(card => {
        const id = (card.getAttribute('data-model-id') || '').toLowerCase();
        const text = (card.textContent || '').toLowerCase();
        const match = !q || id.includes(q) || text.includes(q);
        card.style.display = match ? '' : 'none';
        if (match) visibleCount++;
    });
}
window.filterModels = filterModels;

function updateSelectedCount() {
    const countEl = document.getElementById('selected-count');
    const checkEl = document.getElementById('select-all-models');
    if (countEl) {
        const total = Object.keys(MODEL_MAPPING).length;
        const selected = state.selectedModels.length;
        countEl.textContent = selected > 0 ? `${selected}/${total} ausgewählt` : '';
    }
    if (checkEl) {
        checkEl.checked = state.selectedModels.length === Object.keys(MODEL_MAPPING).length && state.selectedModels.length > 0;
    }
}

window.toggleAllModels = (checked) => {
    const allIds = Object.keys(MODEL_MAPPING);
    state.selectedModels = checked ? [...allIds] : [];
    saveState();
    updateModelCards();
    updateSummary();
    updateSelectedCount();
};

function selectBundle(type) {
    state.selectedBundle = type;
    saveState();
    document.querySelectorAll('.bundle-card').forEach(c => {
        c.classList.remove('border-sky-600');
        c.classList.add('border-slate-800');
    });
    const el = document.getElementById(`bundle-${type}`);
    if (el) {
        el.classList.remove('border-slate-800');
        el.classList.add('border-sky-600');
    }
    updateSummary();
}
window.selectBundle = selectBundle;

function initBundleSelection() {
    document.getElementById('bundle-basic')?.addEventListener('click', () => selectBundle('basic'));
    document.getElementById('bundle-premium')?.addEventListener('click', () => selectBundle('premium'));
}

async function downloadZIP() {
    if (state.selectedModels.length === 0 || state.selectedTools.length === 0) {
        alert(getLang() === 'de' ? 'Bitte wähle Modelle und Tools aus.' : 'Please select models and tools.');
        return;
    }
    
    const btn = document.getElementById('download-btn');
    const origText = btn.textContent;
    btn.disabled = true;
    btn.textContent = getLang() === 'de' ? 'Generiere ZIP...' : 'Generating ZIP...';
    btn.classList.add('opacity-50', 'cursor-not-allowed');
    
    try {
        const zip = new JSZip();
    const os = navigator.platform.toLowerCase().includes('win') ? 'win32' : 
               navigator.platform.toLowerCase().includes('mac') ? 'darwin' : 'linux';
    
    const primaryModel = state.selectedModels[0];
    
    state.selectedTools.forEach(toolId => {
        const tool = TOOL_TEMPLATES[toolId];
        if (!tool) return;
        
        const modelTuples = state.selectedModels.map(id => [id, MODEL_MAPPING[id]]);
        const configContent = generateConfig(toolId, modelTuples, state.selectedBundle);
        const path = OS_PATHS[os][toolId];
        const installMD = generateInstallMD({ id: toolId, name: tool.name, config_file: tool.config_file }, os, state.selectedBundle, path);
        
        const safeName = toolId.replace(/_/g, '-');
        zip.file(safeName + '-config.json', configContent);
        zip.file(safeName + '-INSTALL.md', installMD);
    });
    
    if (state.selectedBundle === 'premium' || isAdmin()) {
        try {
            const launchers = [
                ['auto-install.js', 'auto-install.js'],
                ['auto-install-win.bat', 'auto-install-win.bat'],
                ['auto-install-mac.command', 'auto-install-mac.command'],
                ['auto-install-linux.sh', 'auto-install-linux.sh']
            ];
            for (const [src, dest] of launchers) {
                const res = await fetch('./scripts/' + src);
                if (res.ok) {
                    const text = await res.text();
                    zip.file(dest, text);
                }
            }
            
            if (zip.file('auto-install-mac.command')) {
                zip.file('auto-install-mac.command').unixPermissions = '755';
            }
            if (zip.file('auto-install-linux.sh')) {
                zip.file('auto-install-linux.sh').unixPermissions = '755';
            }
            
            zip.file('README-AUTOINSTALL.md',
`# ORF-Butler Auto-Installer (Premium)

Kopiert alle Config-Dateien automatisch an die richtigen Pfade.

## Verwendung

### Windows
Doppelklick auf **auto-install-win.bat** (erkennbar am Zahnrad-Symbol)

### Mac
Doppelklick auf **auto-install-mac.command**

### Linux
Doppelklick auf **auto-install-linux.sh**

### Alternativ (jedes System)
\`node auto-install.js\` im Terminal

## Voraussetzungen

- Node.js 18+ (https://nodejs.org)
- Config-Dateien im selben Ordner

## Was passiert?

1. Das Skript erkennt dein Betriebssystem (Windows/Mac/Linux)
2. Es findet die richtigen Verzeichnisse für jedes Tool
3. Existierende Configs werden gesichert und ersetzt
4. Fertig – starte dein Tool neu
`);
        } catch (e) {
            console.warn('Auto-installer not available:', e.message);
        }
    }
    
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orfb-configs.zip';
    a.click();
    URL.revokeObjectURL(url);

    } finally {
        btn.disabled = false;
        btn.textContent = origText;
        btn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
}
window.downloadZIP = downloadZIP;

// ---- Code Management (Admin) ----

let _adminCreds = null;

function getAdminCreds() {
    if (_adminCreds) return _adminCreds;
    const user = getUser();
    const pass = prompt('Admin-Passwort eingeben (das aus der .env-Datei):');
    if (!pass) return null;
    _adminCreds = btoa(user + ':' + pass);
    return _adminCreds;
}

window.openCodesPanel = async () => {
    const panel = document.getElementById('codes-modal');
    if (panel) panel.classList.remove('hidden');
    _adminCreds = null;
    if (!getAdminCreds()) return;
    await refreshCodesList();
};

window.closeCodesPanel = () => {
    const panel = document.getElementById('codes-modal');
    if (panel) panel.classList.add('hidden');
};

window.generateCodes = async () => {
    const count = parseInt(document.getElementById('codes-count')?.value) || 5;
    const maxUses = parseInt(document.getElementById('codes-maxuses')?.value) || 10;
    const creds = getAdminCreds();
    if (!creds) return;
    try {
        const res = await fetch('/api/codes?action=generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Basic ' + creds },
            body: JSON.stringify({ count, maxUses })
        });
        const data = await res.json();
        if (res.ok) {
            alert(data.generated.length + ' Codes generiert:\n\n' + data.generated.join('\n'));
            await refreshCodesList();
        } else {
            alert('Fehler: ' + (data.error || res.status));
        }
    } catch (e) {
        alert('Fehler: ' + e.message);
    }
};

window.revokeCode = async (code) => {
    if (!confirm('Code ' + code + ' deaktivieren?')) return;
    const creds = getAdminCreds();
    if (!creds) return;
    try {
        const res = await fetch('/api/codes?action=revoke', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Basic ' + creds },
            body: JSON.stringify({ code })
        });
        if (res.ok) {
            await refreshCodesList();
        } else {
            const data = await res.json();
            alert('Fehler: ' + (data.error || res.status));
        }
    } catch (e) {
        alert('Fehler: ' + e.message);
    }
};

window.resetCode = async (code) => {
    if (!confirm('Code ' + code + ' zurücksetzen (0 Nutzungen)?')) return;
    const creds = getAdminCreds();
    if (!creds) return;
    try {
        const res = await fetch('/api/codes?action=reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Basic ' + creds },
            body: JSON.stringify({ code })
        });
        if (res.ok) {
            await refreshCodesList();
        } else {
            const data = await res.json();
            alert('Fehler: ' + (data.error || res.status));
        }
    } catch (e) {
        alert('Fehler: ' + e.message);
    }
};

function escHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
}

window.copyCode = (code, btn) => {
    const info = window.__codesData ? window.__codesData[code] : null;
    const anon = info ? info.anonId : '';
    const text = anon ? anon + ' - ' + code : code;
    navigator.clipboard.writeText(text).then(() => {
        const orig = btn.textContent;
        btn.textContent = '✅';
        setTimeout(() => btn.textContent = orig, 1000);
    }).catch(() => alert(text));
};

window.refreshCodesList = async () => {
    const creds = getAdminCreds();
    if (!creds) return;
    try {
        const res = await fetch('/api/codes?action=list', {
            headers: { Authorization: 'Basic ' + creds }
        });
        const data = await res.json();
        window.__codesData = data.codes || {};
        const tbody = document.getElementById('codes-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';
        const entries = Object.entries(data.codes || {});
        if (entries.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-slate-500 text-[10px] text-center py-4">Keine Codes vorhanden</td></tr>';
            return;
        }
        entries.forEach(([code, info]) => {
            const tr = document.createElement('tr');
            tr.className = 'border-b border-slate-800 text-[10px]';
            const active = info.active ? 'text-green-500' : 'text-red-500';
            const activeText = info.active ? 
                (getLang() === 'de' ? 'Aktiv' : 'Active') : 
                (getLang() === 'de' ? 'Inaktiv' : 'Inactive');
            const anonUser = info.anonId || '-';
            const safeCode = escHtml(code);
            tr.innerHTML = `
                <td class="py-2 px-2 font-mono text-white">
                    ${safeCode}
                    <button data-code="${safeCode}" class="copy-btn text-slate-500 hover:text-slate-300 ml-1" title="Kopieren">📋</button>
                </td>
                <td class="py-2 px-2">${escHtml(String(info.uses))}/${escHtml(String(info.maxUses))}</td>
                <td class="py-2 px-2 text-sky-400">${escHtml(anonUser)}</td>
                <td class="py-2 px-2 ${active}">${activeText}</td>
                <td class="py-2 px-2 text-slate-500">${new Date(info.createdAt).toLocaleDateString()}</td>
                <td class="py-2 px-2">
                    <button data-code="${safeCode}" class="revoke-btn text-red-400 hover:text-red-300 mr-2" ${!info.active ? 'disabled' : ''}>Widerrufen</button>
                    <button data-code="${safeCode}" class="reset-btn text-yellow-400 hover:text-yellow-300">Reset</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        tbody.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', () => copyCode(btn.dataset.code, btn));
        });
        tbody.querySelectorAll('.revoke-btn').forEach(btn => {
            btn.addEventListener('click', () => revokeCode(btn.dataset.code));
        });
        tbody.querySelectorAll('.reset-btn').forEach(btn => {
            btn.addEventListener('click', () => resetCode(btn.dataset.code));
        });
    } catch (e) {
        console.error('Failed to load codes:', e);
    }
};

// ---- Init ----

document.addEventListener('DOMContentLoaded', () => {
    const lang = getLang() || 'de';
    setLanguage(lang);
    loadState();
    loadModels();
    loadTools();
    initBundleSelection();
    const bundleEl = document.getElementById('bundle-' + state.selectedBundle);
    if (bundleEl) {
        bundleEl.classList.remove('border-slate-800');
        bundleEl.classList.add('border-sky-600');
    }
    updateSelectedCount();
    updateUI();
    
    document.getElementById('download-btn')?.addEventListener('click', downloadZIP);
    
    const langBtns = document.querySelectorAll('[data-lang]');
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => window.setLang(btn.dataset.lang));
    });
});
