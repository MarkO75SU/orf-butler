import { t, setLanguage, getLang } from './i18n.js';
import { TOOL_TEMPLATES } from './templates.js';
import { generateConfig } from './templates.js';
import { generateInstallMD, OS_PATHS } from './docs.js';
import { isAuthenticated, logout, getUser } from './auth.js';
import { MODEL_MAPPING, MODEL_HISTORY } from './mapping.js';

const ADMIN_USER = 'generali';
const isAdmin = () => getUser() === ADMIN_USER;

let state = {
    selectedModels: [],
    selectedTools: [],
    selectedBundle: 'basic'
};

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
        historyTitle: "Historische Free-Modelle",
        historyToggleShow: "▼ Einblenden",
        historyToggleHide: "▲ Ausblenden",
        historyAvailable: "Verfügbar",
        historyReason: "Grund",
        adminBadge: "ADMIN",
        bundleFree: "Kostenlos"
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
        historyTitle: "Historical Free Models",
        historyToggleShow: "▼ Show",
        historyToggleHide: "▲ Hide",
        historyAvailable: "Available",
        historyReason: "Reason",
        adminBadge: "ADMIN",
        bundleFree: "Free"
    }
};

window.setLang = (lang) => {
    setLanguage(lang);
    loadModels();
    updateUI();
};

window.logout = () => {
    logout();
    window.location.href = 'landing.html';
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
    document.getElementById('history-title').textContent = texts.historyTitle;
    document.getElementById('history-toggle-text').textContent = texts.historyToggleShow;
    
    // Admin badge
    const badge = document.getElementById('admin-badge');
    if (badge) {
        if (isAdmin()) {
            badge.classList.remove('hidden');
            badge.textContent = texts.adminBadge;
        } else {
            badge.classList.add('hidden');
        }
    }
    
    // Bundle pricing for admin
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
    
    document.getElementById('summary-model').textContent = modelNames || texts.noModel;
    document.getElementById('summary-tool').textContent = toolNames || texts.noTool;
    document.getElementById('summary-bundle').textContent = bundleLabel;
    
    const btn = document.getElementById('download-btn');
    btn.disabled = state.selectedModels.length === 0 || state.selectedTools.length === 0;
}

async function loadModels() {
    const grid = document.getElementById('models-grid');
    
    // Load static models only (sorted alphabetically)
    const sortedStatic = Object.entries(MODEL_MAPPING).sort((a, b) => a[0].localeCompare(b[0]));
    
    sortedStatic.forEach(([id, data]) => {
        const div = createModelCard(id, data, data.context);
        grid.appendChild(div);
    });
}

function createModelCard(id, data, context) {
    const div = document.createElement('div');
    div.className = `model-card text-left transition flex items-start gap-3 cursor-pointer ${state.selectedModels.includes(id) ? 'selected' : ''}`;
    div.setAttribute('data-model-id', id);
    div.onclick = () => toggleModel(id);
    
    const isGerman = getLang() === 'de';
    const role = data ? (isGerman && data.role_de ? data.role_de : data.role) : id.split('/')[0];
    const desc = data ? (isGerman && data.desc_de ? data.desc_de : data.desc_en) : '';
    const langs = data && data.languages ? data.languages.slice(0, 4).join(', ') : '';
    const ctx = context ? (typeof context === 'number' ? `${(context / 1000).toFixed(0)}k` : context) : '?';
    const uptime = data && data.uptime ? data.uptime : null;
    const latency = data && data.latency ? data.latency : null;
    const status = data && data.status ? data.status : null;
    
    const statusColor = status === 'online' ? 'text-green-400' : status === 'degraded' ? 'text-yellow-400' : 'text-red-400';
    const statusLabel = isGerman ? (status === 'online' ? 'Online' : status === 'degraded' ? 'Eingeschränkt' : 'Offline') : (status === 'online' ? 'Online' : status === 'degraded' ? 'Degraded' : 'Offline');
    
    div.innerHTML = `
        <input type="checkbox" class="mt-1 accent-sky-500 w-4 h-4" ${state.selectedModels.includes(id) ? 'checked' : ''} onclick="event.stopPropagation()" onchange="toggleModel('${id}')">
        <div class="flex-1">
            <div class="text-sm font-bold text-sky-500 uppercase mb-1">${id}</div>
            <div class="flex justify-between items-center mb-1">
                <span class="text-xs font-bold text-white uppercase">${role}</span>
                <span class="text-xs text-slate-500 font-mono">${ctx}</span>
            </div>
            <div class="text-xs text-slate-600 truncate">${desc}</div>
            ${langs ? `<div class="text-xs text-slate-500 mt-1 truncate">${langs}</div>` : ''}
            <div class="flex items-center gap-3 mt-2 text-xs">
                ${uptime ? `<span class="text-slate-400">Uptime: <span class="text-green-400">${uptime}</span></span>` : ''}
                ${latency ? `<span class="text-slate-400">Latenz: <span class="text-sky-400">${latency}</span></span>` : ''}
                ${status ? `<span class="${statusColor}">● ${statusLabel}</span>` : ''}
            </div>
        </div>
    `;
    return div;
}

function loadTools() {
    const grid = document.getElementById('tools-grid');
    
    // Sort tools alphabetically by name
    const sortedTools = Object.entries(TOOL_TEMPLATES).sort((a, b) => a[1].name.localeCompare(b[1].name));
    
    sortedTools.forEach(([id, tool]) => {
        const div = document.createElement('div');
        div.className = `tool-card text-left transition flex items-start gap-3 cursor-pointer ${state.selectedTools.includes(id) ? 'selected' : ''}`;
        div.setAttribute('data-tool-id', id);
        div.onclick = () => toggleTool(id);
        
        div.innerHTML = `
            <input type="checkbox" class="mt-1 accent-sky-500 w-4 h-4" ${state.selectedTools.includes(id) ? 'checked' : ''} onclick="event.stopPropagation()" onchange="toggleTool('${id}')">
            <div class="flex-1">
                <div class="flex justify-between items-center">
                    <span class="text-sm font-bold text-white uppercase">${tool.name}</span>
                    <span class="status-badge status-${tool.status}">${tool.status}</span>
                </div>
                <p class="text-xs text-slate-500 mt-1">${tool.desc || ''}</p>
            </div>
        `;
        grid.appendChild(div);
    });
}

window.toggleModel = (id) => {
    if (state.selectedModels.includes(id)) {
        state.selectedModels = state.selectedModels.filter(m => m !== id);
    } else {
        state.selectedModels.push(id);
    }
    updateModelCards();
    updateSummary();
};

window.toggleTool = (id) => {
    if (state.selectedTools.includes(id)) {
        state.selectedTools = state.selectedTools.filter(t => t !== id);
    } else {
        state.selectedTools.push(id);
    }
    updateToolCards();
    updateSummary();
};

function updateModelCards() {
    document.querySelectorAll('#models-grid .model-card').forEach((div) => {
        const modelId = div.getAttribute('data-model-id');
        const checkbox = div.querySelector('input[type="checkbox"]');
        if (modelId && checkbox) {
            checkbox.checked = state.selectedModels.includes(modelId);
            if (state.selectedModels.includes(modelId)) {
                div.classList.add('selected');
            } else {
                div.classList.remove('selected');
            }
        }
    });
}

function updateToolCards() {
    document.querySelectorAll('#tools-grid .tool-card').forEach((div) => {
        const toolId = div.getAttribute('data-tool-id');
        const checkbox = div.querySelector('input[type="checkbox"]');
        if (toolId) {
            if (state.selectedTools.includes(toolId)) {
                div.classList.add('selected');
                if (checkbox) checkbox.checked = true;
            } else {
                div.classList.remove('selected');
                if (checkbox) checkbox.checked = false;
            }
        }
    });
}

window.selectModel = (id) => {
    toggleModel(id);
};

window.selectTool = (id) => {
    toggleTool(id);
};

window.selectBundle = (bundle) => {
    state.selectedBundle = bundle;
    
    document.getElementById('bundle-basic').classList.remove('border-sky-500', 'border-sky-600');
    document.getElementById('bundle-premium').classList.remove('border-sky-500', 'border-sky-600');
    document.getElementById('bundle-basic').classList.add('border-slate-800');
    document.getElementById('bundle-premium').classList.add('border-slate-800');
    
    const selected = document.getElementById(`bundle-${bundle}`);
    selected.classList.remove('border-slate-800');
    selected.classList.add('border-sky-500');
    
    updateSummary();
};

function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

window.generateAndDownload = async () => {
    if (state.selectedModels.length === 0 || state.selectedTools.length === 0) return;
    
    const os = navigator.platform.toLowerCase().includes('win') ? 'win32' : 'darwin';
    const zip = new JSZip();
    
    state.selectedTools.forEach(toolId => {
        const tool = TOOL_TEMPLATES[toolId];
        const models = state.selectedModels.map(id => [id, MODEL_MAPPING[id] || { role: 'Selected', context: '?' }]);
        
        const configContent = generateConfig(toolId, models, state.selectedBundle);
        const path = OS_PATHS[os][toolId];
        const installMD = generateInstallMD({ id: toolId, name: tool.name, config_file: tool.config_file }, os, state.selectedBundle, path);
        
        const safeName = tool.name.toLowerCase().replace(/ /g, '-');
        zip.file(safeName + '-config.json', configContent);
        zip.file(safeName + '-INSTALL.md', installMD);
    });
    
    const content = await zip.generateAsync({ type: 'blob' });
    downloadFile('orfb-configs.zip', content);
};

function loadHistory() {
    const grid = document.getElementById('history-grid');
    if (!grid) return;
    
    const sorted = [...MODEL_HISTORY].sort((a, b) => a.id.localeCompare(b.id));
    
    sorted.forEach(m => {
        const div = document.createElement('div');
        div.className = 'history-card';
        const isGerman = getLang() === 'de';
        const role = isGerman && m.role_de ? m.role_de : m.role;
        const desc = isGerman && m.desc_de ? m.desc_de : m.desc_en;
        const langs = m.languages ? m.languages.slice(0, 4).join(', ') : '';
        const reason = isGerman && m.reason_de ? m.reason_de : m.reason;
        
        div.innerHTML = `
            <div class="text-xs font-bold text-slate-500 uppercase mb-1">${m.id}</div>
            <div class="flex justify-between items-center mb-1">
                <span class="text-xs font-bold text-white uppercase">${role}</span>
                <span class="text-xs text-slate-600 font-mono">${m.context}</span>
            </div>
            <div class="text-xs text-slate-600 truncate mb-1">${desc}</div>
            ${langs ? `<div class="text-xs text-slate-600 truncate">${langs}</div>` : ''}
            <div class="flex items-center gap-3 mt-2 text-[10px]">
                <span class="text-slate-500">${isGerman ? 'Verfügbar' : 'Available'}: <span class="text-sky-400">${m.available}</span></span>
                <span class="text-slate-500">${isGerman ? 'Grund' : 'Reason'}: <span class="text-yellow-400">${reason}</span></span>
            </div>
        `;
        grid.appendChild(div);
    });
}

window.toggleHistory = () => {
    const grid = document.getElementById('history-grid');
    const toggle = document.getElementById('history-toggle-text');
    const isHidden = grid.classList.contains('hidden');
    const lang = getLang();
    const texts = translations[lang] || translations.de;
    
    if (isHidden) {
        grid.classList.remove('hidden');
        toggle.textContent = texts.historyToggleHide;
    } else {
        grid.classList.add('hidden');
        toggle.textContent = texts.historyToggleShow;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (!isAuthenticated()) {
        window.location.href = 'landing.html';
        return;
    }
    
    setLanguage('de');
    loadModels();
    loadTools();
    loadHistory();
    updateSummary();
    
    document.getElementById('bundle-basic').classList.add('border-sky-500');
    document.getElementById('bundle-premium').classList.remove('border-sky-500');
});
