import { setLanguage, getLang } from './i18n.js';
import { TOOL_TEMPLATES, generateConfig } from './templates.js';
import { generateInstallMD, OS_PATHS } from './docs.js';
import { logout } from './auth.js';
import { MODEL_MAPPING } from './mapping.js';
import { BMC_URL } from './config.js';

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
        selectAll: "Alle Auswählen",
        downloadBtn: "Als ZIP Herunterladen",
        noModel: "Keine Modelle ausgewählt",
        noTool: "Keine Tools ausgewählt",
        bundleFree: "GRATIS",
        thanksTitle: "Download gestartet ☕",
        thanksText: "Hat dir der Konfigurator geholfen? Unterstütze das Projekt mit einer Tasse Kaffee.",
        thanksBtn: "☕ Kaffee kaufen",
        thanksClose: "Weiter",
        modelSearchPlaceholder: "🔍 Suche nach ID, Tag, Rolle oder Beschreibung...",
        modelError: "Fehler beim Laden der Modelle",
        newBadge: "NEU",
        toolTypeLabel: "Typ:"
    },
    en: {
        selectAll: "Select All",
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
        bundleFree: "FREE",
        thanksTitle: "Download started ☕",
        thanksText: "Did the configurator help you? Support the project with a cup of coffee.",
        thanksBtn: "☕ Buy me a coffee",
        thanksClose: "Continue",
        modelSearchPlaceholder: "🔍 Search by ID, tag, role or description...",
        modelError: "Error loading models",
        newBadge: "NEW",
        toolTypeLabel: "Type:"
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

    document.getElementById('bundle-basic-price').textContent = texts.bundleFree;
    document.getElementById('bundle-premium-price').textContent = texts.bundleFree;

    setText('model-search', null, texts.modelSearchPlaceholder, 'placeholder');
    setText('model-error', texts.modelError);

    setText('thanks-title', texts.thanksTitle);
    setText('thanks-text', texts.thanksText);
    setText('thanks-bmc', texts.thanksBtn);
    setText('thanks-close-btn', texts.thanksClose);
    updateLangButtons();

    document.querySelectorAll('a[data-bmc]').forEach(a => {
        const utm = a.getAttribute('data-bmc') === 'thanks'
            ? '?utm_source=orfb&utm_medium=app&utm_campaign=download'
            : '?utm_source=orfb&utm_medium=app';
        a.href = BMC_URL + utm;
    });

    updateSelectedCount();
    loadTools();

    updateSummary();
}

function setText(id, text, value = undefined, attr = 'textContent') {
    const el = document.getElementById(id);
    if (!el) return;
    if (attr === 'placeholder') {
        el.placeholder = value;
    } else {
        el.textContent = text;
    }
}

function updateSummary() {
    const lang = getLang();
    const texts = translations[lang] || translations.de;
    
    const modelNames = state.selectedModels.map(id => {
        const data = MODEL_MAPPING[id];
        return data ? data.role : id.split('/').pop();
    }).join(', ');
    
    const toolNames = state.selectedTools.map(id => TOOL_TEMPLATES[id]?.name || id).join(', ');
    
    const bundleLabel = state.selectedBundle === 'basic'
        ? 'Standard Bundle'
        : 'Premium Bundle';

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
    const texts = translations[lang] || translations.de;

    entries.forEach(([id, data]) => {
        const card = document.createElement('div');
        const role = lang === 'de' ? data.role_de : data.role;
        const desc = lang === 'de' ? data.desc_de : data.desc_en;
        const checkId = `model-${id.replace(/[:/.]/g, '-')}`;
        const isChecked = state.selectedModels.includes(id) ? 'checked' : '';
        const neueBadge = data.new ? `<span class="text-[9px] bg-sky-600 text-white px-1.5 py-0.5 rounded font-bold ml-1">${texts.newBadge}</span>` : '';
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
    const lang = getLang();
    const texts = translations[lang] || translations.de;

    const entries = Object.entries(TOOL_TEMPLATES).sort(([, a], [, b]) => a.name.localeCompare(b.name));

    entries.forEach(([id, tool]) => {
        const card = document.createElement('div');
        const checkId = `tool-${id}`;
        const isChecked = state.selectedTools.includes(id) ? 'checked' : '';
        const desc = lang === 'en' && tool.desc_en ? tool.desc_en : tool.desc;

        card.className = `tool-card bg-[#1a1a1e] border ${isChecked ? 'border-sky-600' : 'border-slate-800'} rounded p-4 cursor-pointer hover:border-sky-500 transition`;
        card.setAttribute('data-tool-id', id);
        card.innerHTML = `
            <div class="flex items-start gap-3">
                <input type="checkbox" id="${checkId}" ${isChecked} 
                    class="mt-1 accent-sky-600 cursor-pointer shrink-0"
                    onclick="event.stopPropagation(); window.toggleTool('${id}')">
                <label for="${checkId}" class="cursor-pointer flex-1" onclick="event.stopPropagation()">
                    <div class="text-xs font-bold text-white">${tool.name}</div>
                    <div class="text-[10px] text-slate-500 mt-1">${desc || ''}</div>
                    <div class="flex gap-2 mt-2">
                        <span class="text-[9px] text-slate-600">${texts.toolTypeLabel} ${tool.type || '?'}</span>
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
    const labelEl = document.getElementById('select-all-label');
    if (countEl) {
        const total = Object.keys(MODEL_MAPPING).length;
        const selected = state.selectedModels.length;
        const lang = getLang();
        const countText = lang === 'en' ? `${selected}/${total} selected` : `${selected}/${total} ausgewählt`;
        countEl.textContent = selected > 0 ? countText : '';
    }
    if (checkEl) {
        checkEl.checked = state.selectedModels.length === Object.keys(MODEL_MAPPING).length && state.selectedModels.length > 0;
    }
    if (labelEl) {
        const lang = getLang();
        labelEl.textContent = lang === 'en' ? 'Select All' : 'Alle Auswählen';
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
        const installMD = generateInstallMD({ id: toolId, name: tool.name, config_file: tool.config_file }, os, state.selectedBundle, path, getLang());
        
        const safeName = toolId.replace(/_/g, '-');
        zip.file(safeName + '-config.json', configContent);
        if (state.selectedBundle !== 'premium') {
            zip.file(safeName + '-INSTALL.md', installMD);
        }
    });
    
    // Manifest mit ausgewählten Tools
    zip.file('manifest.txt', state.selectedTools.join('\n'));
    
    if (state.selectedBundle === 'premium') {
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
            
            zip.file('README-AUTOINSTALL.md', autoInstallReadme(getLang()));
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

    trackEvent('download', {
        models: state.selectedModels.length,
        tools: state.selectedTools.join(','),
        bundle: state.selectedBundle,
        os,
        lang: getLang()
    });
    document.getElementById('thanks-modal')?.classList.remove('hidden');
    document.getElementById('thanks-close-btn')?.focus();

    } finally {
        btn.disabled = false;
        btn.textContent = origText;
        btn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
}
function autoInstallReadme(lang) {
    if (lang === 'en') {
        return `# ORF-Butler Auto-Installer (Premium)

Automatically copies all config files to the correct paths.

## Usage

### Windows
Double-click **auto-install-win.bat**

### Mac
Double-click **auto-install-mac.command**

### Linux
Double-click **auto-install-linux.sh**

### Alternative (any system)
Run \`node auto-install.js\` in the terminal

## Requirements

- Node.js 18+ (https://nodejs.org) – only for the Node version
- Config files (.json/.yml/.yaml) in the same folder
- OpenRouter API key: stored ONLY locally in the config, no server upload

## Interactive Menu

If a config already exists, the installer asks:

  [1] **Overwrite** – old config is replaced (backup as .backup)
  [2] **Comment out** – old config stays as a comment, new one below
  [3] **Merge** (JSON only) – both structures are merged
  [s] **Skip** – do nothing, config stays unchanged

## Project Folder

Tool configs that belong to your project (Cursor, Windsurf, Claude Code, Cline,
Codeium, RooCode, Aider, Antigravity, LiteLLM, Cody, Tabby) are written into a
project folder. The installer searches common locations for a Git repository
(marker: .git) and shows a menu:

  [1..n] **Detected project folders** – pick one
  [Enter] **Current folder** – the folder you started the installer from
  [f] **Custom path** – type any path

Global configs (OpenCode, Continue, Zed) always go to your home directory.

## What happens?

1. The script detects your operating system (Windows/Mac/Linux)
2. It finds the correct directories for each tool
3. For project-local configs it asks which project folder to use
4. Existing configs are backed up (suffix .backup)
5. On conflict: you decide via the menu
6. Done – restart your tool
`;
    }
    return `# ORF-Butler Auto-Installer (Premium)

Kopiert alle Config-Dateien automatisch an die richtigen Pfade.

## Verwendung

### Windows
Doppelklick auf **auto-install-win.bat**

### Mac
Doppelklick auf **auto-install-mac.command**

### Linux
Doppelklick auf **auto-install-linux.sh**

### Alternativ (jedes System)
\`node auto-install.js\` im Terminal

## Voraussetzungen

- Node.js 18+ (https://nodejs.org) – nur für die Node-Version
- Config-Dateien (.json/.yml/.yaml) im selben Ordner
- OpenRouter API-Key: Wird NUR lokal in der Config gespeichert, kein Server-Versand

## Interaktives Menü

Existiert eine Config bereits, fragt der Installer:

  [1] **Überschreiben** – alte Config wird ersetzt (Backup als .backup)
  [2] **Auskommentieren** – alte bleibt als Kommentar, neue darunter
  [3] **Mergen** (nur JSON) – beide Strukturen werden zusammengeführt
  [s] **Überspringen** – nichts tun, Config bleibt unverändert

## Projektordner

Tool-Configs, die zum Projekt gehören (Cursor, Windsurf, Claude Code, Cline,
Codeium, RooCode, Aider, Antigravity, LiteLLM, Cody, Tabby), werden in einen
Projektordner geschrieben. Der Installer sucht in typischen Ordnern nach einem
Git-Repository (Marker: .git) und zeigt ein Menü:

  [1..n] **Gefundene Projektordner** – einen auswählen
  [Enter] **Aktueller Ordner** – der Ordner, aus dem der Installer gestartet wurde
  [f] **Eigener Pfad** – beliebigen Pfad eingeben

Globale Configs (OpenCode, Continue, Zed) landen immer im Home-Verzeichnis.

## Was passiert?

1. Das Skript erkennt dein Betriebssystem (Windows/Mac/Linux)
2. Es findet die richtigen Verzeichnisse für jedes Tool
3. Für projekt-lokale Configs fragt es nach dem Projektordner
4. Existierende Configs werden gesichert (Endung .backup)
5. Bei Konflikt: Du entscheidest via Menü
6. Fertig – starte dein Tool neu
`;
}
function trackEvent(name, props) {
    try { window.umami?.track(name, props); } catch {}
}
function updateLangButtons() {
    const lang = getLang();
    document.querySelectorAll('[data-lang]').forEach(btn => {
        btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang));
    });
}
window.closeThanks = () => {
    document.getElementById('thanks-modal')?.classList.add('hidden');
    document.getElementById('download-btn')?.focus();
};
window.downloadZIP = downloadZIP;

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

    document.querySelectorAll('a[data-bmc]').forEach(a => {
        a.addEventListener('click', () => trackEvent('bmc_click', { location: a.getAttribute('data-bmc') }));
    });
    
    const langBtns = document.querySelectorAll('[data-lang]');
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => window.setLang(btn.dataset.lang));
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !document.getElementById('thanks-modal')?.classList.contains('hidden')) {
            window.closeThanks();
        }
    });
});
