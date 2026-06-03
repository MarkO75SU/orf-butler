import fs from 'fs';
import path from 'path';
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
        "continue": { path: process.env.USERPROFILE + '\\.continue\\config.json', label: 'VS Code (Continue)' },
        "opencode": { path: process.env.USERPROFILE + '\\AppData\\Roaming\\opencode\\opencode.json', label: 'OpenCode CLI' },
        "zed": { path: process.env.USERPROFILE + '\\AppData\\Roaming\\Zed\\settings.json', label: 'Zed Editor' },
        "aider": { path: process.cwd() + '\\.aider.conf.yml', label: 'Aider CLI' },
        "antigravity": { path: process.cwd() + '\\settings.yaml', label: 'Antigravity' },
        "amazon_q": { path: null, label: 'Amazon Q (Browser)' },
        "cursor": { path: process.cwd() + '\\.cursorrules', label: 'Cursor Editor' },
        "windsurf": { path: process.cwd() + '\\.windsurfrules', label: 'Windsurf Editor' },
        "claude_code": { path: process.cwd() + '\\CLAUDE.md', label: 'Claude Code CLI' },
        "github_copilot": { path: process.cwd() + '\\.github\\copilot-instructions.md', label: 'GitHub Copilot' },
        "cline": { path: process.cwd() + '\\.clinerules', label: 'Cline' },
        "codeium": { path: process.cwd() + '\\.codeiumrules', label: 'Codeium / Windsurf' }
    },
    darwin: {
        "continue": { path: process.env.HOME + '/.continue/config.json', label: 'VS Code (Continue)' },
        "opencode": { path: process.env.HOME + '/.config/opencode/opencode.json', label: 'OpenCode CLI' },
        "zed": { path: process.env.HOME + '/.config/zed/settings.json', label: 'Zed Editor' },
        "aider": { path: process.cwd() + '/.aider.conf.yml', label: 'Aider CLI' },
        "antigravity": { path: process.cwd() + '/settings.yaml', label: 'Antigravity' },
        "amazon_q": { path: null, label: 'Amazon Q (Browser)' },
        "cursor": { path: process.cwd() + '/.cursorrules', label: 'Cursor Editor' },
        "windsurf": { path: process.cwd() + '/.windsurfrules', label: 'Windsurf Editor' },
        "claude_code": { path: process.cwd() + '/CLAUDE.md', label: 'Claude Code CLI' },
        "github_copilot": { path: process.cwd() + '/.github/copilot-instructions.md', label: 'GitHub Copilot' },
        "cline": { path: process.cwd() + '/.clinerules', label: 'Cline' },
        "codeium": { path: process.cwd() + '/.codeiumrules', label: 'Codeium / Windsurf' }
    },
    linux: {
        "continue": { path: process.env.HOME + '/.continue/config.json', label: 'VS Code (Continue)' },
        "opencode": { path: process.env.HOME + '/.config/opencode/opencode.json', label: 'OpenCode CLI' },
        "zed": { path: process.env.HOME + '/.config/zed/settings.json', label: 'Zed Editor' },
        "aider": { path: process.cwd() + '/.aider.conf.yml', label: 'Aider CLI' },
        "antigravity": { path: process.cwd() + '/settings.yaml', label: 'Antigravity' },
        "amazon_q": { path: null, label: 'Amazon Q (Browser)' },
        "cursor": { path: process.cwd() + '/.cursorrules', label: 'Cursor Editor' },
        "windsurf": { path: process.cwd() + '/.windsurfrules', label: 'Windsurf Editor' },
        "claude_code": { path: process.cwd() + '/CLAUDE.md', label: 'Claude Code CLI' },
        "github_copilot": { path: process.cwd() + '/.github/copilot-instructions.md', label: 'GitHub Copilot' },
        "cline": { path: process.cwd() + '/.clinerules', label: 'Cline' },
        "codeium": { path: process.cwd() + '/.codeiumrules', label: 'Codeium / Windsurf' }
    }
};

function detectOS() {
    const p = process.platform;
    if (p === 'win32') return 'win32';
    if (p === 'darwin') return 'darwin';
    return 'linux';
}

function findConfigFiles(dir) {
    return fs.readdirSync(dir).filter(f =>
        f.endsWith('-config.json') || f.endsWith('.md')
    ).map(f => {
        const base = f.replace(/-config\.json$/, '').replace(/\.md$/, '');
        return { file: f, toolId: base.toLowerCase().replace(/ /g, '_') };
    });
}

function askQuestion(query) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => rl.question(query, answer => { rl.close(); resolve(answer.trim()); }));
}

function isJsonFile(filePath) {
    return filePath.endsWith('.json');
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

    console.log(`\n  ${YELLOW}⚠ ${label}: Config existiert bereits!${RESET}`);
    console.log(`    Pfad: ${destPath}`);
    console.log(`  ${BOLD}Was möchtest du tun?${RESET}`);
    console.log(`    ${CYAN}[1]${RESET} Überschreiben (alte Config verloren)`);
    console.log(`    ${CYAN}[2]${RESET} Auskommentieren + neue daneben schreiben`);
    console.log(`    ${CYAN}[3]${RESET} Beide Inhalte mergen (nur bei JSON)`);
    console.log(`    ${CYAN}[s]${RESET} Überspringen (nichts tun)`);

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

    const os = detectOS();
    console.log(`  Betriebssystem: ${os}\n`);

    const configs = findConfigFiles(__dirname);
    if (configs.length === 0) {
        console.log(`  ${RED}Keine Config-Dateien gefunden.${RESET}`);
        console.log(`  ${YELLOW}Lege das Skript in den Ordner mit den Config-Dateien.${RESET}\n`);
        return;
    }

    console.log(`  ${BOLD}Gefundene Konfigurationen:${RESET}`);
    configs.forEach((c, i) => {
        const info = OS_PATHS[os][c.toolId];
        const label = info ? info.label : c.toolId;
        console.log(`    ${i + 1}. ${label}`);
    });
    console.log();

    let installed = 0, skipped = 0;

    for (const config of configs) {
        const info = OS_PATHS[os][config.toolId];
        if (!info || !info.path) {
            console.log(`  ${YELLOW}⚠ ${config.toolId}: Nur im Browser nutzbar → übersprungen${RESET}`);
            skipped++;
            continue;
        }

        const destPath = info.path;
        const srcPath = path.join(__dirname, config.file);

        if (!fs.existsSync(srcPath)) {
            console.log(`  ${RED}✗ ${info.label}: Datei nicht gefunden${RESET}`);
            skipped++;
            continue;
        }

        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
            try {
                fs.mkdirSync(destDir, { recursive: true });
                console.log(`  ${CYAN}📁 Ordner erstellt: ${destDir}${RESET}`);
            } catch (err) {
                console.log(`  ${RED}✗ ${info.label}: Ordner konnte nicht erstellt werden - ${err.message}${RESET}`);
                skipped++;
                continue;
            }
        }

        if (fs.existsSync(destPath)) {
            const result = await handleExistingFile(destPath, srcPath, info.label);
            if (result === 'skipped') { skipped++; continue; }
            installed++;
        } else {
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
    console.log(`  ${GREEN}✔ Erfolgreich installiert: ${installed}${RESET}`);
    console.log(`  ${YELLOW}⚠ Übersprungen: ${skipped}${RESET}`);
    console.log(`\n  ${CYAN}✅ Fertig! Starte dein Tool neu.${RESET}\n`);
}

run();
