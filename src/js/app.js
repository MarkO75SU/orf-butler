import { t, setLanguage, getLang } from './i18n.js';
import { getPromptOfDay, generateRSS } from './prompts.js';
import { MODEL_MAPPING, getBestModels } from './mapping.js';
import { TOOL_TEMPLATES, generateConfig } from './templates.js';
import { generateInstallMD, OS_PATHS } from './docs.js';
import { fetchLiveFreeModels } from './api.js';
import { isAuthenticated, login } from './auth.js';

let selections = { tool: '', lang: '', tier: '', os: navigator.platform.toLowerCase().includes('win') ? 'win32' : 'darwin' };

window.switchLang = (lang) => {
    setLanguage(lang);
    document.querySelectorAll('.flag-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');
    updateUI();
};

window.updateUI = () => {
    document.getElementById('ui-title').innerText = t('title');
    document.getElementById('ui-subtitle').innerText = t('subtitle');
    document.getElementById('ui-mission-title').innerText = t('mission_title');
    document.getElementById('ui-mission-text').innerHTML = t('mission_text');
    document.getElementById('tool-search').placeholder = t('search_placeholder');
    document.getElementById('ui-recommendations').innerText = t('recommendations');
    document.getElementById('ui-roster-title').innerText = t('roster_title');
    document.getElementById('ui-potd-title').innerText = t('potd_title');
    document.getElementById('ui-rss-link').innerText = t('potd_rss');
    document.getElementById('ui-step-stack').innerText = t('step_stack');
    document.getElementById('ui-step-tier').innerText = t('step_tier');
    document.getElementById('ui-step-finish').innerText = t('step_finish');
    document.getElementById('download-btn').innerText = t('deploy_btn');
    document.getElementById('ui-tier-basic').innerText = t('basic_tier');
    document.getElementById('ui-tier-premium').innerText = t('premium_tier');
    
    const potd = getPromptOfDay();
    document.getElementById('potd-title').innerText = potd.title;
    document.getElementById('potd-text').innerText = potd.prompt;

    renderRoster();
    filterTools();
    renderTopPicks();
};

window.nextStep = (step, data) => {
    selections = { ...selections, ...data };
    document.querySelectorAll('[id^="step-"]').forEach(el => el.className = 'step-hidden');
    document.getElementById(`step-${step}`).className = 'step-active';
};

window.finishWizard = (tier) => {
    selections.tier = tier;
    nextStep('finish', {});
    const tool = TOOL_TEMPLATES[selections.tool];
    const models = getBestModels(selections.lang, 'coding');
    const configContent = generateConfig(selections.tool, models, selections.tier);
    const path = OS_PATHS[selections.os][selections.tool];
    const toolWithId = { ...tool, id: selections.tool };
    const installMD = generateInstallMD(toolWithId, selections.os, selections.tier, path);

    document.getElementById('download-btn').onclick = () => {
        downloadFile(tool.config_file, configContent);
        downloadFile('INSTALL.md', installMD);
    };
};

const renderRoster = async () => {
    const rosterContainer = document.getElementById('model-roster');
    if (!rosterContainer) return;
    rosterContainer.innerHTML = "";

    const freeModels = await fetchLiveFreeModels();
    
    if (!freeModels || freeModels.length === 0) {
        rosterContainer.innerHTML = `
            <div class="text-[10px] text-yellow-500 p-4 border border-yellow-900 bg-yellow-900/20 rounded">
                ${getLang() === 'de' ? 'Keine Live-Daten verfügbar. API-Anfrage fehlgeschlagen.' : 'No live data available. API request failed.'}
            </div>
        `;
        return;
    }

    const sortedModels = freeModels.sort((a, b) => (b.context || 0) - (a.context || 0));
    
    sortedModels.slice(0, 20).forEach(model => {
        const div = document.createElement('div');
        div.className = "model-card flex flex-col";
        const provider = model.id.split('/')[0];
        const role = provider.length > 10 ? 'Unknown' : provider.charAt(0).toUpperCase() + provider.slice(1);
        
        div.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <span class="text-[9px] font-black text-sky-500 uppercase tracking-widest">${role}</span>
                <span class="text-[7px] text-slate-600 font-mono">${(model.context / 1000).toFixed(0)}k</span>
            </div>
            <div class="text-[8px] text-slate-400 uppercase tracking-tighter mb-1">${model.id}</div>
            <button onclick="copyModelName('${model.id}')" class="mt-1 text-[7px] text-slate-500 hover:text-sky-400 uppercase tracking-widest text-left flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                <span>${getLang() === 'de' ? 'Kopieren' : 'Copy'}</span>
            </button>
        `;
        rosterContainer.appendChild(div);
    });
};

window.copyModelName = (name) => {
    navigator.clipboard.writeText(name).then(() => {
        alert(getLang() === 'de' ? 'Modelname kopiert!' : 'Model name copied!');
    });
};

const renderTopPicks = () => {
    const picksContainer = document.getElementById('top-picks');
    if (!picksContainer) return;
    const picks = ['opencode', 'continue', 'antigravity', 'zed', 'aider', 'amazon_q'];
    picksContainer.innerHTML = "";
    const sortedPicks = picks.map(id => ({id, ...TOOL_TEMPLATES[id]})).sort((a, b) => a.name.localeCompare(b.name));
    sortedPicks.forEach(tool => {
        const btn = document.createElement('button');
        btn.className = "bg-[#16161a] p-3 border border-slate-800 hover:border-sky-600 transition text-left flex justify-between items-center";
        btn.onclick = () => nextStep(2, {tool: tool.id});
        btn.innerHTML = `<span class="text-[9px] font-bold text-white uppercase tracking-widest">${tool.name}</span><span class="status-badge status-${tool.status}">${tool.status}</span>`;
        picksContainer.appendChild(btn);
    });
};

window.filterTools = () => {
    const searchInput = document.getElementById('tool-search');
    const grid = document.getElementById('tool-grid');
    if (!searchInput || !grid) return;
    const query = searchInput.value.toLowerCase();
    grid.innerHTML = "";
    const sortedTools = Object.entries(TOOL_TEMPLATES).sort((a, b) => a[1].name.localeCompare(b[1].name));
    sortedTools.forEach(([id, tool]) => {
        if (tool.name.toLowerCase().includes(query)) {
            const btn = document.createElement('button');
            btn.className = "bg-[#1a1a1e] p-3 rounded border border-slate-800 hover:border-sky-600 transition text-left flex justify-between items-center";
            btn.onclick = () => nextStep(2, {tool: id});
            btn.innerHTML = `<span class="text-[9px] font-bold uppercase tracking-widest">${tool.name}</span><span class="status-badge status-${tool.status}">${tool.status}</span>`;
            grid.appendChild(btn);
        }
    });
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

window.downloadRSS = () => {
    const content = generateRSS();
    const blob = new Blob([content], { type: 'application/rss+xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orf-butler-prompts.xml';
    a.click();
    window.URL.revokeObjectURL(url);
};

// Initial Start
document.addEventListener('DOMContentLoaded', async () => {
    const modal = document.getElementById('login-modal');
    const form = document.getElementById('login-form');
    
    if (!isAuthenticated()) {
        modal.classList.remove('hidden');
    }
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const user = document.getElementById('login-username').value;
            const pass = document.getElementById('login-password').value;
            const remember = document.getElementById('login-remember').checked;
            
            const success = await login(user, pass, remember);
            
            if (success) {
                modal.classList.add('hidden');
                updateUI();
            } else {
                document.getElementById('login-error').classList.remove('hidden');
            }
        });
    }
    
    updateUI();
});
