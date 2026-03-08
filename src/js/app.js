import { t, setLanguage, getLang } from './i18n.js';
import { TOOL_TEMPLATES } from './templates.js';
import { generateConfig } from './templates.js';
import { generateInstallMD, OS_PATHS } from './docs.js';
import { fetchLiveFreeModels } from './api.js';
import { isAuthenticated, logout } from './auth.js';
import { MODEL_MAPPING } from './mapping.js';

let state = {
    selectedModel: null,
    selectedTool: null,
    selectedBundle: 'basic'
};

const translations = {
    de: {
        step1Title: "Wähle dein Free-LLM Model",
        step1Desc: "Wähle ein kostenloses Modell von OpenRouter",
        step2Title: "Wähle dein Tool",
        step2Desc: "Für welches Tool soll die Config erstellt werden?",
        step3Title: "Wähle dein Bundle",
        step3Desc: "Welches Paket möchtest du?",
        step4Title: "Checkout & Download",
        step4Desc: "Erstelle und lade deine Config herunter",
        summaryModel: "Ausgewähltes Model:",
        summaryTool: "Tool:",
        summaryBundle: "Bundle:",
        downloadBtn: "Config Herunterladen",
        noModel: "Kein Model ausgewählt",
        noTool: "Kein Tool ausgewählt"
    },
    en: {
        step1Title: "Select your Free-LLM Model",
        step1Desc: "Choose a free model from OpenRouter",
        step2Title: "Select your Tool",
        step2Desc: "Which tool should the config be created for?",
        step3Title: "Select your Bundle",
        step3Desc: "Which package do you want?",
        step4Title: "Checkout & Download",
        step4Desc: "Create and download your config",
        summaryModel: "Selected Model:",
        summaryTool: "Tool:",
        summaryBundle: "Bundle:",
        downloadBtn: "Download Config",
        noModel: "No model selected",
        noTool: "No tool selected"
    }
};

window.setLang = (lang) => {
    setLanguage(lang);
    updateUI();
};

window.logout = () => {
    logout();
    window.location.href = 'login.html';
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
    
    updateSummary();
}

function updateSummary() {
    const lang = getLang();
    const texts = translations[lang] || translations.de;
    
    document.getElementById('summary-model').textContent = state.selectedModel || texts.noModel;
    document.getElementById('summary-tool').textContent = state.selectedTool ? TOOL_TEMPLATES[state.selectedTool]?.name || state.selectedTool : texts.noTool;
    document.getElementById('summary-bundle').textContent = state.selectedBundle === 'basic' ? 'Standard Bundle (5€)' : 'Premium Bundle (20€)';
    
    const btn = document.getElementById('download-btn');
    btn.disabled = !state.selectedModel || !state.selectedTool;
}

async function loadModels() {
    const grid = document.getElementById('models-grid');
    const errorEl = document.getElementById('model-error');
    
    // Load static mapping data first (with full details)
    Object.entries(MODEL_MAPPING).forEach(([id, data]) => {
        const div = document.createElement('button');
        div.className = `model-card text-left transition ${state.selectedModel === id ? 'selected' : ''}`;
        div.onclick = () => selectModel(id);
        
        const langs = data.languages ? data.languages.slice(0, 4).join(', ') : '';
        
        div.innerHTML = `
            <div class="flex justify-between items-start mb-1">
                <span class="text-[9px] font-black text-sky-500 uppercase">${data.role}</span>
                <span class="text-[7px] text-slate-500 font-mono">${data.context}</span>
            </div>
            <div class="text-[8px] text-slate-400 truncate">${id}</div>
            <div class="text-[7px] text-slate-600 mt-1 truncate">${data.desc}</div>
            <div class="text-[6px] text-slate-500 mt-1 truncate">${langs}</div>
        `;
        grid.appendChild(div);
    });
    
    // Try to load live models and merge
    try {
        const liveModels = await fetchLiveFreeModels();
        
        if (!liveModels || liveModels.length === 0) {
            return;
        }
        
        liveModels.forEach(m => {
            if (MODEL_MAPPING[m.id]) return;
            
            const div = document.createElement('button');
            div.className = `model-card text-left transition ${state.selectedModel === m.id ? 'selected' : ''}`;
            div.onclick = () => selectModel(m.id);
            
            const provider = m.id.split('/')[0];
            const context = m.context_length ? `${(m.context_length / 1000).toFixed(0)}k` : '?';
            
            div.innerHTML = `
                <div class="flex justify-between items-start mb-1">
                    <span class="text-[9px] font-black text-sky-500 uppercase">${provider}</span>
                    <span class="text-[7px] text-slate-500 font-mono">${context}</span>
                </div>
                <div class="text-[8px] text-slate-400 truncate">${m.id}</div>
                <div class="text-[7px] text-yellow-500 mt-1 truncate">Live Model</div>
            `;
            grid.appendChild(div);
        });
    } catch (e) {
        // Static models already shown
    }
}

function loadTools() {
    const grid = document.getElementById('tools-grid');
    
    Object.entries(TOOL_TEMPLATES).forEach(([id, tool]) => {
        const div = document.createElement('button');
        div.className = `tool-card text-left transition ${state.selectedTool === id ? 'selected' : ''}`;
        div.onclick = () => selectTool(id);
        
        div.innerHTML = `
            <div class="flex justify-between items-center">
                <span class="text-xs font-bold text-white uppercase">${tool.name}</span>
                <span class="status-badge status-${tool.status}">${tool.status}</span>
            </div>
            <p class="text-[10px] text-slate-500 mt-1">${tool.desc || ''}</p>
        `;
        grid.appendChild(div);
    });
}

window.selectModel = (id) => {
    state.selectedModel = id;
    
    document.querySelectorAll('#models-grid .model-card').forEach(el => {
        el.classList.remove('selected');
    });
    
    const cards = document.querySelectorAll('#models-grid .model-card');
    const models = document.querySelectorAll('#models-grid .model-card > div:last-child');
    for (let i = 0; i < models.length; i++) {
        if (models[i].textContent === id) {
            cards[i].classList.add('selected');
            break;
        }
    }
    
    updateSummary();
};

window.selectTool = (id) => {
    state.selectedTool = id;
    
    document.querySelectorAll('#tools-grid .tool-card').forEach(el => {
        el.classList.remove('selected');
    });
    
    const buttons = document.querySelectorAll('#tools-grid .tool-card');
    Object.keys(TOOL_TEMPLATES).forEach((toolId, index) => {
        if (toolId === id) {
            buttons[index].classList.add('selected');
        }
    });
    
    updateSummary();
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

window.generateAndDownload = () => {
    if (!state.selectedModel || !state.selectedTool) return;
    
    const os = navigator.platform.toLowerCase().includes('win') ? 'win32' : 'darwin';
    const tool = TOOL_TEMPLATES[state.selectedTool];
    const models = [[state.selectedModel, { role: 'Selected', context: '?' }]];
    
    const configContent = generateConfig(state.selectedTool, models, state.selectedBundle);
    const path = OS_PATHS[os][state.selectedTool];
    const installMD = generateInstallMD({ id: state.selectedTool, name: tool.name, config_file: tool.config_file }, os, state.selectedBundle, path);
    
    downloadFile(tool.config_file, configContent);
    downloadFile('INSTALL.md', installMD);
};

document.addEventListener('DOMContentLoaded', () => {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }
    
    setLanguage('de');
    loadModels();
    loadTools();
    updateSummary();
    
    document.getElementById('bundle-basic').classList.add('border-sky-500');
    document.getElementById('bundle-premium').classList.remove('border-sky-500');
});
