// ORF-Butler Auto-Installer (Premium)
// Usage: node auto-install.js
// Kopiert Config-Dateien automatisch an die richtigen Pfade.

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(r => rl.question(q, r));

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

async function detectOS() {
    const p = process.platform;
    if (p === 'win32') return 'win32';
    if (p === 'darwin') return 'darwin';
    return 'linux';
}

async function findConfigFiles(dir) {
    return fs.readdirSync(dir).filter(f =>
        f.endsWith('-config.json') || f.endsWith('.md')
    ).map(f => {
        const base = f.replace(/-config\.json$/, '').replace(/\.md$/, '');
        return { file: f, toolId: base.toLowerCase().replace(/ /g, '_') };
    });
}

async function run() {
    console.log(`\n${BOLD}${CYAN}╔══════════════════════════════════════╗${RESET}`);
    console.log(`${BOLD}${CYAN}║   ORF-Butler Auto-Installer (Premium) ║${RESET}`);
    console.log(`${BOLD}${CYAN}╚══════════════════════════════════════╝${RESET}\n`);

    const os = await detectOS();
    console.log(`${YELLOW}Betriebssystem:${RESET} ${os}\n`);

    const configs = await findConfigFiles(__dirname);
    if (configs.length === 0) {
        console.log(`${RED}Keine Config-Dateien gefunden.${RESET}`);
        console.log(`${YELLOW}Lege das Skript in den Ordner mit den Config-Dateien.${RESET}\n`);
        rl.close();
        return;
    }

    console.log(`${BOLD}Gefundene Konfigurationen:${RESET}`);
    configs.forEach((c, i) => {
        const info = OS_PATHS[os][c.toolId];
        console.log(`  ${i + 1}. ${info ? info.label : c.toolId} (${c.file})`);
    });
    console.log();

    let installed = 0, skipped = 0;

    for (const config of configs) {
        const info = OS_PATHS[os][config.toolId];
        if (!info || !info.path) {
            console.log(`${YELLOW}⚠ ${config.toolId}: Kein Pfad bekannt → übersprungen${RESET}`);
            skipped++;
            continue;
        }

        const destPath = info.path;
        const srcPath = path.join(__dirname, config.file);

        if (!fs.existsSync(srcPath)) {
            console.log(`${RED}✗ ${info.label}: ${config.file} nicht gefunden${RESET}`);
            skipped++;
            continue;
        }

        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
            const create = await ask(`${YELLOW}Verzeichnis fehlt: ${destDir}${RESET}\nErstellen? (j/N): `);
            if (create.toLowerCase() === 'j' || create.toLowerCase() === 'y') {
                fs.mkdirSync(destDir, { recursive: true });
            } else {
                console.log(`${YELLOW}  → Übersprungen${RESET}`);
                skipped++;
                continue;
            }
        }

        if (fs.existsSync(destPath)) {
            const overwrite = await ask(`${YELLOW}${info.label}: Existiert bereits${RESET}\nÜberschreiben? (j/N): `);
            if (overwrite.toLowerCase() !== 'j' && overwrite.toLowerCase() !== 'y') {
                console.log(`${YELLOW}  → Übersprungen${RESET}`);
                skipped++;
                continue;
            }
        }

        try {
            fs.copyFileSync(srcPath, destPath);
            console.log(`${GREEN}✔ ${info.label} → ${destPath}${RESET}`);
            installed++;
        } catch (err) {
            console.log(`${RED}✗ ${info.label}: ${err.message}${RESET}`);
            skipped++;
        }
    }

    console.log(`\n${BOLD}══════════════════════════════════════${RESET}`);
    console.log(`${GREEN}✔ Installiert: ${installed}${RESET}`);
    console.log(`${YELLOW}⚠ Übersprungen: ${skipped}${RESET}`);
    console.log(`\n${CYAN}Fertig! Starte dein Tool neu.${RESET}\n`);
    rl.close();
}

run().catch(err => {
    console.error(`${RED}Fehler: ${err.message}${RESET}`);
    rl.close();
    process.exit(1);
});
