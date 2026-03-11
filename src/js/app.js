import { t, setLanguage, getLang } from './i18n.js';
import { TOOL_TEMPLATES } from './templates.js';
import { generateConfig } from './templates.js';
import { generateInstallMD, OS_PATHS } from './docs.js';
import { fetchLiveFreeModels } from './api.js';
import { isAuthenticated, logout } from './auth.js';
import { MODEL_MAPPING } from './mapping.js';

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
        downloadBtn: "Configs Herunterladen",
        noModel: "Keine Modelle ausgewählt",
        noTool: "Keine Tools ausgewählt"
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
        downloadBtn: "Download Configs",
        noModel: "No models selected",
        noTool: "No tools selected"
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
    
    const modelNames = state.selectedModels.map(id => {
        const data = MODEL_MAPPING[id];
        return data ? data.role : id.split('/').pop();
    }).join(', ');
    
    const toolNames = state.selectedTools.map(id => TOOL_TEMPLATES[id]?.name || id).join(', ');
    
    document.getElementById('summary-model').textContent = modelNames || texts.noModel;
    document.getElementById('summary-tool').textContent = toolNames || texts.noTool;
    document.getElementById('summary-bundle').textContent = state.selectedBundle === 'basic' ? 'Standard Bundle (5€)' : 'Premium Bundle (20€)';
    
    const btn = document.getElementById('download-btn');
    btn.disabled = state.selectedModels.length === 0 || state.selectedTools.length === 0;
}

async function loadModels() {
    const grid = document.getElementById('models-grid');
    const errorEl = document.getElementById('model-error');
    
    // Load static mapping data first (with full details)
    Object.entries(MODEL_MAPPING).forEach(([id, data]) => {
        const div = document.createElement('button');
        div.className = `model-card text-left transition flex items-start gap-3 ${state.selectedModels.includes(id) ? 'selected' : ''}`;
        div.onclick = () => toggleModel(id);
        
        const langs = data.languages ? data.languages.slice(0, 4).join(', ') : '';
        
        div.innerHTML = `
            <input type="checkbox" class="mt-1 accent-sky-500 w-4 h-4" ${state.selectedModels.includes(id) ? 'checked' : ''}>
            <div class="flex-1">
                <div class="flex justify-between items-start mb-1">
                    <span class="text-sm font-bold text-sky-500 uppercase">${data.role}</span>
                    <span class="text-xs text-slate-500 font-mono">${data.context}</span>
                </div>
                <div class="text-xs text-slate-400 truncate">${id}</div>
                <div class="text-xs text-slate-600 truncate">${data.desc}</div>
                <div class="text-xs text-slate-500 mt-1 truncate">${langs}</div>
            </div>
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
            div.className = `model-card text-left transition flex items-start gap-3 ${state.selectedModels.includes(m.id) ? 'selected' : ''}`;
            div.onclick = () => toggleModel(m.id);
            
            const provider = m.id.split('/')[0];
            const context = m.context_length ? `${(m.context_length / 1000).toFixed(0)}k` : '?';
            
            div.innerHTML = `
                <input type="checkbox" class="mt-1 accent-sky-500 w-4 h-4" ${state.selectedModels.includes(m.id) ? 'checked' : ''}>
                <div class="flex-1">
                    <div class="flex justify-between items-start mb-1">
                        <span class="text-sm font-bold text-sky-500 uppercase">${provider}</span>
                        <span class="text-xs text-slate-500 font-mono">${context}</span>
                    </div>
                    <div class="text-xs text-slate-400 truncate">${m.id}</div>
                    <div class="text-xs text-yellow-500 truncate">Live Model</div>
                </div>
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
        div.className = `tool-card text-left transition flex items-start gap-3 ${state.selectedTools.includes(id) ? 'selected' : ''}`;
        div.onclick = () => toggleTool(id);
        
        div.innerHTML = `
            <input type="checkbox" class="mt-1 accent-sky-500 w-4 h-4" ${state.selectedTools.includes(id) ? 'checked' : ''}>
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
    document.querySelectorAll('#models-grid .model-card').forEach((div, index) => {
        const modelId = Object.keys(MODEL_MAPPING)[index];
        const checkbox = div.querySelector('input[type="checkbox"]');
        if (checkbox) {
            checkbox.checked = state.selectedModels.includes(modelId);
        }
        if (state.selectedModels.includes(modelId)) {
            div.classList.add('selected');
        } else {
            div.classList.remove('selected');
        }
    });
}

function updateToolCards() {
    document.querySelectorAll('#tools-grid .tool-card').forEach((div) => {
        const checkbox = div.querySelector('input[type="checkbox"]');
        const toolId = Object.keys(TOOL_TEMPLATES).find(id => div.textContent.includes(TOOL_TEMPLATES[id].name));
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

window.generateAndDownload = () => {
    if (state.selectedModels.length === 0 || state.selectedTools.length === 0) return;
    
    const os = navigator.platform.toLowerCase().includes('win') ? 'win32' : 'darwin';
    
    state.selectedTools.forEach(toolId => {
        const tool = TOOL_TEMPLATES[toolId];
        const models = state.selectedModels.map(id => [id, MODEL_MAPPING[id] || { role: 'Selected', context: '?' }]);
        
        const configContent = generateConfig(toolId, models, state.selectedBundle);
        const path = OS_PATHS[os][toolId];
        const installMD = generateInstallMD({ id: toolId, name: tool.name, config_file: tool.config_file }, os, state.selectedBundle, path);
        
        const safeName = tool.name.toLowerCase().replace(/ /g, '-');
        downloadFile(safeName + '-config.json', configContent);
        downloadFile(safeName + '-INSTALL.md', installMD);
    });
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
