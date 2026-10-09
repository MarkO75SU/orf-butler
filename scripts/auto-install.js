import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

const OS_PATHS = {
    win32: {
        "continue": { scope: 'global', path: process.env.USERPROFILE + '\\.continue\\config.json', label: 'VS Code (Continue)' },
        "opencode": { scope: 'global', path: process.env.USERPROFILE + '\\.config\\opencode\\opencode.json', label: 'OpenCode CLI' },
        "zed": { scope: 'global', path: process.env.USERPROFILE + '\\AppData\\Roaming\\Zed\\settings.json', label: 'Zed Editor' },
        "aider": { scope: 'project', rel: '.aider.conf.yml', label: 'Aider CLI' },
        "antigravity": { scope: 'project', rel: 'settings.yaml', label: 'Antigravity' },
        "cursor": { scope: 'project', rel: '.cursorrules', label: 'Cursor Editor' },
        "windsurf": { scope: 'project', rel: '.windsurfrules', label: 'Windsurf Editor' },
        "claude_code": { scope: 'project', rel: 'CLAUDE.md', label: 'Claude Code CLI' },
        "github_copilot": { scope: 'project', rel: '.github/copilot-instructions.md', label: 'GitHub Copilot' },
        "cline": { scope: 'project', rel: '.clinerules', label: 'Cline' },
        "codeium": { scope: 'project', rel: '.codeiumrules', label: 'Codeium / Windsurf' },
        "roocode": { scope: 'project', rel: '.roorules', label: 'RooCode' },
        "litellm": { scope: 'project', rel: 'litellm_config.yaml', label: 'LiteLLM' },
        "cody": { scope: 'project', rel: '.cody/config.json', label: 'Cody' },
        "tabby": { scope: 'project', rel: 'tabby_config.json', label: 'Tabby' }
    },
    darwin: {
        "continue": { scope: 'global', path: process.env.HOME + '/.continue/config.json', label: 'VS Code (Continue)' },
        "opencode": { scope: 'global', path: process.env.HOME + '/.config/opencode/opencode.json', label: 'OpenCode CLI' },
        "zed": { scope: 'global', path: process.env.HOME + '/.config/zed/settings.json', label: 'Zed Editor' },
        "aider": { scope: 'project', rel: '.aider.conf.yml', label: 'Aider CLI' },
        "antigravity": { scope: 'project', rel: 'settings.yaml', label: 'Antigravity' },
        "cursor": { scope: 'project', rel: '.cursorrules', label: 'Cursor Editor' },
        "windsurf": { scope: 'project', rel: '.windsurfrules', label: 'Windsurf Editor' },
        "claude_code": { scope: 'project', rel: 'CLAUDE.md', label: 'Claude Code CLI' },
        "github_copilot": { scope: 'project', rel: '.github/copilot-instructions.md', label: 'GitHub Copilot' },
        "cline": { scope: 'project', rel: '.clinerules', label: 'Cline' },
        "codeium": { scope: 'project', rel: '.codeiumrules', label: 'Codeium / Windsurf' },
        "roocode": { scope: 'project', rel: '.roorules', label: 'RooCode' },
        "litellm": { scope: 'project', rel: 'litellm_config.yaml', label: 'LiteLLM' },
        "cody": { scope: 'project', rel: '.cody/config.json', label: 'Cody' },
        "tabby": { scope: 'project', rel: 'tabby_config.json', label: 'Tabby' }
    },
    linux: {
        "continue": { scope: 'global', path: process.env.HOME + '/.continue/config.json', label: 'VS Code (Continue)' },
        "opencode": { scope: 'global', path: process.env.HOME + '/.config/opencode/opencode.json', label: 'OpenCode CLI' },
        "zed": { scope: 'global', path: process.env.HOME + '/.config/zed/settings.json', label: 'Zed Editor' },
        "aider": { scope: 'project', rel: '.aider.conf.yml', label: 'Aider CLI' },
        "antigravity": { scope: 'project', rel: 'settings.yaml', label: 'Antigravity' },
        "cursor": { scope: 'project', rel: '.cursorrules', label: 'Cursor Editor' },
        "windsurf": { scope: 'project', rel: '.windsurfrules', label: 'Windsurf Editor' },
        "claude_code": { scope: 'project', rel: 'CLAUDE.md', label: 'Claude Code CLI' },
        "github_copilot": { scope: 'project', rel: '.github/copilot-instructions.md', label: 'GitHub Copilot' },
        "cline": { scope: 'project', rel: '.clinerules', label: 'Cline' },
        "codeium": { scope: 'project', rel: '.codeiumrules', label: 'Codeium / Windsurf' },
        "roocode": { scope: 'project', rel: '.roorules', label: 'RooCode' },
        "litellm": { scope: 'project', rel: 'litellm_config.yaml', label: 'LiteLLM' },
        "cody": { scope: 'project', rel: '.cody/config.json', label: 'Cody' },
        "tabby": { scope: 'project', rel: 'tabby_config.json', label: 'Tabby' }
    }
};

function detectOS() {
    const p = process.platform;
    if (p === 'win32') return 'win32';
    if (p === 'darwin') return 'darwin';
    return 'linux';
}

function findConfigFiles(dir) {
    return fs.readdirSync(dir).filter(f => f.endsWith('-config.json')).map(f => {
        const base = f.replace(/-config\.json$/, '');
        return { file: f, toolId: base.toLowerCase().replace(/[-\s]+/g, '_') };
    });
}

// Sucht Projektordner (Marker: .git) rund um Home/Desktop/Documents
function findProjectRoots(zipDir, limit = 8) {
    const roots = [];
    const seen = new Set();
    const push = d => {
        const r = path.resolve(d);
        if (!seen.has(r)) { seen.add(r); roots.push(r); }
    };
    push(zipDir);

    const home = os.homedir();
    const bases = [home, path.join(home, 'Desktop'), path.join(home, 'Documents'),
                   path.join(home, 'Projects'), path.join(home, 'dev'), path.join(home, 'code')];
    for (const b of bases) {
        if (!fs.existsSync(b)) continue;
        if (fs.existsSync(path.join(b, '.git'))) push(b);
        let entries = [];
        try { entries = fs.readdirSync(b, { withFileTypes: true }); } catch { continue; }
        for (const e of entries) {
            if (!e.isDirectory()) continue;
            const full = path.join(b, e.name);
            if (fs.existsSync(path.join(full, '.git'))) push(full);
            if (roots.length >= limit + 1) break;
        }
        if (roots.length >= limit + 1) break;
    }
    return roots;
}

async function chooseProjectRoot(zipDir) {
    const roots = findProjectRoots(zipDir);
    console.log(`\n  ${BOLD}Projektordner für projekt-lokale Configs${RESET}`);
    console.log(`  ${CYAN}(.cursorrules, CLAUDE.md, .clinerules, …)${RESET}`);
    console.log(`    ${CYAN}[Enter]${RESET} Behalte aktuellen Ordner: ${zipDir}`);
    roots.slice(1).forEach((r, i) => console.log(`    ${CYAN}[${i + 1}]${RESET} ${r}`));
    console.log(`    ${CYAN}[f]${RESET} Eigenen Pfad eingeben`);

    const answer = await askQuestion(`  → `);
    if (!answer || answer === '0') return zipDir;
    if (answer.toLowerCase() === 'f') {
        const custom = await askQuestion(`  Pfad: `);
        return custom ? path.resolve(custom.replace(/^"|"$/g, '')) : zipDir;
    }
    const idx = parseInt(answer, 10);
    const pick = roots[idx];
    if (idx >= 1 && pick) return pick;
    console.log(`  ${YELLOW}⚠ Ungültige Eingabe – aktueller Ordner${RESET}`);
    return zipDir;
}

function askQuestion(query) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => rl.question(query, answer => { rl.close(); resolve(answer.trim()); }));
}

function isJsonFile(filePath) {
    return filePath.endsWith('.json');
}

function validateConfig(content, ext) {
    if (ext === '.json') {
        try { JSON.parse(content); return true; }
        catch (e) { return `JSON ungültig: ${e.message}`; }
    }
    if (ext === '.yml' || ext === '.yaml') {
        const lines = content.split('\n').filter(l => l.trim() && !l.trim().startsWith('#'));
        const hasKeyValue = lines.some(l => l.includes(':'));
        return hasKeyValue || true;
    }
    return true;
}

function checkApiKeyPlaceholder(content) {
    return content.includes('DEIN_API_KEY_HERE');
}

function mergeJson(existingContent, newContent) {
    try {
        const existing = JSON.parse(existingContent);
        const incoming = JSON.parse(newContent);
        const merged = { ...existing, ...incoming };
        return JSON.stringify(merged, null, 2);
    } catch {
        return null;
    }
}

function commentOutLines(content, ext) {
    const lines = content.split('\n');
    if (ext === '.json') {
        return lines.map(l => '// ' + l).join('\n');
    }
    if (ext === '.yml' || ext === '.yaml') {
        return lines.map(l => '# ' + l).join('\n');
    }
    return lines.map(l => '<!-- ' + l + ' -->').join('\n');
}

async function handleExistingFile(destPath, srcPath, label) {
    const existingContent = fs.readFileSync(destPath, 'utf-8');
    const newContent = fs.readFileSync(srcPath, 'utf-8');
    const ext = path.extname(destPath);
    const backupPath = destPath + '.backup-' + new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

    console.log(`\n  ${YELLOW}⚠ ${label}: Config existiert bereits!${RESET}`);
    console.log(`    Pfad: ${destPath}`);
    console.log(`  ${GREEN}📦 Backup wird erstellt: ${path.basename(backupPath)}${RESET}`);
    fs.copyFileSync(destPath, backupPath);

    console.log(`  ${BOLD}Was möchtest du tun?${RESET}`);
    console.log(`    ${CYAN}[1]${RESET} Überschreiben (Backup in .backup-...)`);
    console.log(`    ${CYAN}[2]${RESET} Auskommentieren + neue daneben (Backup in .backup-...)`);
    console.log(`    ${CYAN}[3]${RESET} Beide Inhalte mergen (nur JSON, Backup in .backup-...)`);
    console.log(`    ${CYAN}[s]${RESET} Überspringen (Backup bleibt, nichts geändert)`);

    const answer = await askQuestion(`  → `);

    if (answer === 's' || answer === 'S') {
        console.log(`  ${YELLOW}⚠ ${label}: Übersprungen${RESET}`);
        return 'skipped';
    }

    if (answer === '1') {
        fs.copyFileSync(srcPath, destPath);
        console.log(`  ${GREEN}✔ ${label}: Überschrieben${RESET}`);
        return 'overwritten';
    }

    if (answer === '2') {
        const commented = commentOutLines(existingContent, ext);
        const combined = commented + '\n\n// --- ORF-Butler Config ---\n\n' + newContent;
        fs.writeFileSync(destPath, combined);
        console.log(`  ${GREEN}✔ ${label}: Alte Config auskommentiert + neue geschrieben${RESET}`);
        return 'commented';
    }

    if (answer === '3') {
        if (!isJsonFile(destPath)) {
            console.log(`  ${YELLOW}⚠ Merge nur bei JSON-Dateien möglich – überspringe${RESET}`);
            return 'skipped';
        }
        const merged = mergeJson(existingContent, newContent);
        if (!merged) {
            console.log(`  ${RED}✗ Merge fehlgeschlagen (ungültiges JSON) – überspringe${RESET}`);
            return 'skipped';
        }
        fs.writeFileSync(destPath, merged);
        console.log(`  ${GREEN}✔ ${label}: JSON gemerged${RESET}`);
        return 'merged';
    }

    console.log(`  ${YELLOW}⚠ Ungültige Eingabe – übersprungen${RESET}`);
    return 'skipped';
}

async function run() {
    console.log(`\n${BOLD}${CYAN}╔══════════════════════════════════════╗${RESET}`);
    console.log(`${BOLD}${CYAN}║   ORF-Butler Auto-Installer (Premium) ║${RESET}`);
    console.log(`${BOLD}${CYAN}╚══════════════════════════════════════╝${RESET}\n`);

    const os_key = detectOS();
    console.log(`  Betriebssystem: ${os_key}\n`);

    const previewAnswer = await askQuestion(`  Config vor dem Speichern prüfen? (j/n, Enter = nein): `);
    const previewEnabled = previewAnswer.toLowerCase() === 'j';

    // Log-Datei initialisieren
    const logPath = path.join(__dirname, 'install-log.txt');
    const logLines = [`ORF-Butler Auto-Installer Log`, `Datum: ${new Date().toISOString()}`, `----------------------------------------`];
    function log(msg) { logLines.push(msg); }
    function writeLog() { try { fs.writeFileSync(logPath, logLines.join('\n')); } catch {} }

    // Manifest-Prüfung
    let manifestTools = null;
    try {
        const manifestContent = fs.readFileSync(path.join(__dirname, 'manifest.txt'), 'utf-8');
        manifestTools = manifestContent.split('\n').map(l => l.trim()).filter(Boolean);
    } catch {}

    const configs = findConfigFiles(__dirname);
    if (configs.length === 0) {
        console.log(`  ${RED}Keine Config-Dateien gefunden.${RESET}`);
        console.log(`  ${YELLOW}Lege das Skript in den Ordner mit den Config-Dateien.${RESET}\n`);
        return;
    }

    console.log(`  ${BOLD}Gefundene Konfigurationen:${RESET}`);
    configs.forEach((c, i) => {
        const info = OS_PATHS[os_key][c.toolId];
        const label = info ? info.label : c.toolId;
        console.log(`    ${i + 1}. ${label}`);
    });
    console.log();

    const projectKeys = new Set(Object.entries(OS_PATHS[os_key])
        .filter(([, i]) => i.scope === 'project').map(([k]) => k));
    const needsProject = configs.some(c =>
        projectKeys.has(c.toolId) && (!manifestTools || manifestTools.includes(c.toolId)));

    const zipDir = __dirname;
    const projectRoot = needsProject ? await chooseProjectRoot(zipDir) : zipDir;
    log(`Projektordner: ${projectRoot}`);

    let installed = 0, skipped = 0, warnings = [];

    for (const config of configs) {
        const info = OS_PATHS[os_key][config.toolId];
        if (!info) {
            console.log(`  ${YELLOW}⚠ ${config.toolId}: Unbekanntes Tool → übersprungen${RESET}`);
            skipped++;
            continue;
        }

        const destPath = info.scope === 'project'
            ? path.join(projectRoot, info.rel)
            : info.path;
        const srcPath = path.join(__dirname, config.file);

        if (!fs.existsSync(srcPath)) {
            console.log(`  ${RED}✗ ${info.label}: Datei nicht gefunden${RESET}`);
            skipped++;
            continue;
        }

        // Manifest-Prüfung: nur Tools verarbeiten, die im Bundle waren
        if (manifestTools && !manifestTools.includes(config.toolId)) {
            skipped++;
            continue;
        }

        const newContent = fs.readFileSync(srcPath, 'utf-8');
        const ext = path.extname(config.file);

        // Pro Tool Bestätigung
        const toolConfirm = await askQuestion(`  Config für ${info.label} installieren? (j/n, Enter=ja): `);
        if (toolConfirm.toLowerCase() === 'n') {
            console.log(`  ${YELLOW}⚠ ${info.label}: Übersprungen${RESET}`);
            skipped++;
            continue;
        }

        const valid = validateConfig(newContent, ext);
        if (valid !== true) {
            console.log(`  ${RED}✗ ${info.label}: ${valid} → übersprungen${RESET}`);
            skipped++;
            continue;
        }

        if (checkApiKeyPlaceholder(newContent)) {
            warnings.push(info.label);
        }

        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
            try {
                fs.mkdirSync(destDir, { recursive: true });
                console.log(`  ${CYAN}📁 Ordner erstellt: ${destDir}${RESET}`);
            } catch (err) {
                console.log(`  ${RED}✗ ${info.label}: Ordner konnte nicht erstellt werden${RESET}`);
                skipped++;
                continue;
            }
        }

        if (fs.existsSync(destPath)) {
            const result = await handleExistingFile(destPath, srcPath, info.label);
            if (result === 'skipped') { skipped++; continue; }
            installed++;
        } else {
            if (previewEnabled) {
                console.log(`\n  ${BOLD}═══ Vorschau: ${info.label} ═══${RESET}`);
                console.log(fs.readFileSync(srcPath, 'utf-8'));
                const confirm = await askQuestion(`  Speichern unter ${destPath}? (j/n): `);
                if (confirm.toLowerCase() !== 'j') {
                    const downloadPath = path.join(os.homedir(), 'Downloads', config.file);
                    try {
                        fs.copyFileSync(srcPath, downloadPath);
                        console.log(`  ${GREEN}✔ ${info.label} → In Downloads gespeichert${RESET}`);
                        installed++;
                    } catch (err) {
                        console.log(`  ${RED}✗ ${info.label}: Fehler - ${err.message}${RESET}`);
                        skipped++;
                    }
                    continue;
                }
            }
            try {
                fs.copyFileSync(srcPath, destPath);
                console.log(`  ${GREEN}✔ ${info.label} → Installiert${RESET}`);
                installed++;
            } catch (err) {
                console.log(`  ${RED}✗ ${info.label}: Fehler - ${err.message}${RESET}`);
                skipped++;
            }
        }
    }

    console.log(`\n  ${BOLD}══════════════════════════════════════${RESET}`);
    console.log(`  ${BOLD}  Zusammenfassung${RESET}`);
    console.log(`  ${BOLD}══════════════════════════════════════${RESET}`);
    console.log(`  ${GREEN}✔ Erfolgreich installiert: ${installed}${RESET}`);
    console.log(`  ${YELLOW}⚠ Übersprungen: ${skipped}${RESET}`);

    writeLog();

    if (warnings.length > 0) {
        console.log(`\n  ${YELLOW}${BOLD}⚠ ACHTUNG: API-Key erforderlich${RESET}`);
        console.log(`  ${YELLOW}Folgende Configs enthalten noch 'DEIN_API_KEY_HERE':${RESET}`);
        warnings.forEach(label => console.log(`    - ${label}`));
        console.log(`  ${CYAN}→ In der Config-Datei mit Texteditor öffnen und ersetzen.${RESET}`);
        console.log(`  ${CYAN}→ Kostenlosen Key holen: https://openrouter.ai/keys${RESET}`);
    }

    console.log(`  ${CYAN}Log: ${logPath}${RESET}`);
    console.log(`\n  ${CYAN}✅ Fertig! Starte dein Tool neu.${RESET}\n`);
}

export { OS_PATHS, findConfigFiles, findProjectRoots, chooseProjectRoot, detectOS };

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) run();
