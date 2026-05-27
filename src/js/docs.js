// src/js/docs.js
export const CLI_COMMANDS = {
    "ollama": {
        name: "Ollama",
        install: {
            win32: `winget install Ollama.Ollama`,
            darwin: `brew install ollama/tap/ollama`,
            linux: `curl -fsSL https://ollama.com/install.sh | sh`
        },
        update: {
            win32: `winget upgrade Ollama.Ollama`,
            darwin: `brew upgrade ollama/tap/ollama`,
            linux: `curl -fsSL https://ollama.com/install.sh | sh`
        }
    },
    "opencode": {
        name: "OpenCode",
        install: {
            win32: `winget install opencode`,
            darwin: `brew install opencode`,
            linux: `npm install -g opencode`
        },
        update: {
            win32: `winget upgrade opencode`,
            darwin: `brew upgrade opencode`,
            linux: `npm update -g opencode`
        }
    },
    "aider": {
        name: "Aider",
        install: {
            win32: `pip install aider-install`,
            darwin: `pip install aider-install`,
            linux: `pip install aider-install`
        },
        update: {
            win32: `pip install --upgrade aider-install`,
            darwin: `pip install --upgrade aider-install`,
            linux: `pip install --upgrade aider-install`
        }
    },
    "claude_code": {
        name: "Claude Code",
        install: {
            win32: `npm install -g @anthropic-ai/claude-code`,
            darwin: `npm install -g @anthropic-ai/claude-code`,
            linux: `npm install -g @anthropic-ai/claude-code`
        },
        update: {
            win32: `npm update -g @anthropic-ai/claude-code`,
            darwin: `npm update -g @anthropic-ai/claude-code`,
            linux: `npm update -g @anthropic-ai/claude-code`
        }
    },
    "cline": {
        name: "Cline",
        install: {
            win32: `winget install cline`,
            darwin: `brew install cline`,
            linux: `npm install -g @cline/cline`
        },
        update: {
            win32: `winget upgrade cline`,
            darwin: `brew upgrade cline`,
            linux: `npm update -g @cline/cline`
        }
    }
};

export const OS_PATHS = {
    "win32": {
        "continue": "C:\\Users\\[YourName]\\.continue\\config.json",
        "cursor": ".cursorrules (In deinem Projektordner)",
        "windsurf": ".windsurfrules (In deinem Projektordner)",
        "zed": "C:\\Users\\[YourName]\\AppData\\Roaming\\Zed\\settings.json",
        "aider": ".aider.conf.yml (In deinem Projektordner)",
        "copilot": ".github\\copilot-instructions.md (In deinem Projektordner)",
        "amazon_q": "Amazon Q Settings im Browser",
        "opencode": "C:\\Users\\[YourName]\\AppData\\Roaming\\opencode\\opencode.json",
        "antigravity": "settings.yaml (In deinem Projektordner)",
        "claude_code": "CLAUDE.md (In deinem Projektordner)",
        "cline": ".clinerules (In deinem Projektordner)",
        "codeium": ".codeiumrules (In deinem Projektordner)"
    },
    "darwin": {
        "continue": "Users/[YourName]/.continue/config.json",
        "cursor": ".cursorrules (In deinem Projektordner)",
        "windsurf": ".windsurfrules (In deinem Projektordner)",
        "zed": "~/.config/zed/settings.json",
        "aider": ".aider.conf.yml",
        "copilot": ".github/copilot-instructions.md",
        "amazon_q": "Amazon Q Settings",
        "opencode": "~/.config/opencode/opencode.json",
        "antigravity": "settings.yaml",
        "claude_code": "CLAUDE.md (In deinem Projektordner)",
        "cline": ".clinerules (In deinem Projektordner)",
        "codeium": ".codeiumrules (In deinem Projektordner)"
    }
};

export function generateInstallMD(tool, os, tier, path) {
    const isWin = os === "win32";
    const shell = isWin ? "PowerShell or Command Prompt" : "Terminal";
    const home = isWin ? '%USERPROFILE%' : '~';

    const toolGuides = {
        continue: {
            type: 'extension',
            desc: 'VS Code Erweiterung für KI-Assistenz.',
            needInstall: 'Continue Extension im VS Code Marketplace installieren (Strg+Shift+X → "Continue" suchen).',
            configAt: path || home + '/.continue/config.json',
            howToUse: 'VS Code öffnen → Strg+Shift+P → "Continue: Open Chat" → Chat-Panel unten rechts zeigt dein Modell an. Oder Strg+L für Inline-Chat.',
            note: 'Das Modell läuft auf OpenRouter-Servern (Cloud). Du brauchst einen kostenlosen OpenRouter-Account und API-Key.'
        },
        cursor: {
            type: 'rules',
            desc: '.cursorrules wird von Cursor Editor automatisch gelesen.',
            needInstall: 'Cursor Editor installieren von cursor.com.',
            configAt: 'Im selben Ordner wie dein Projekt.',
            howToUse: 'Cursor öffnen → Chat öffnen (Strg+I) → Modell oben im Dropdown auf "OpenRouter" umstellen.',
            note: 'Das Modell läuft auf OpenRouter-Servern (Cloud). Du brauchst einen kostenlosen OpenRouter-Account und API-Key.'
        },
        windsurf: {
            type: 'rules',
            desc: '.windsurfrules wird von Windsurf Editor automatisch gelesen.',
            needInstall: 'Windsurf Editor installieren von codeium.com/windsurf.',
            configAt: 'Im selben Ordner wie dein Projekt.',
            howToUse: 'Windsurf öffnen → Cascade-Öffnung (Strg+Shift+P → "Cascade: Open") → Modell auf OpenRouter umstellen.',
            note: 'Das Modell läuft auf OpenRouter-Servern (Cloud). Du brauchst einen kostenlosen OpenRouter-Account und API-Key.'
        },
        zed: {
            type: 'config',
            desc: 'Zed Editor nutzt settings.json für KI-Modelle.',
            needInstall: 'Zed Editor installieren von zed.dev.',
            configAt: path || home + '/.config/zed/settings.json',
            howToUse: 'Zed öffnen → Strg+R → Assistant-Panel → Modell sollte als "ORF" erscheinen.',
            note: 'Das Modell läuft auf OpenRouter-Servern (Cloud). Du brauchst einen kostenlosen OpenRouter-Account und API-Key.'
        },
        aider: {
            type: 'cli',
            desc: 'Aider CLI – Terminal-basiertes Pair-Programming.',
            needInstall: 'pip install aider-install',
            installCmd: 'pip install aider-install',
            configAt: '.aider.conf.yml im aktuellen Projektordner.',
            howToUse: 'Terminal öffnen → in dein Projektverzeichnis wechseln → `aider --model openrouter/DEIN_MODELL` ausführen.',
            note: 'Das Modell läuft auf OpenRouter-Servern (Cloud). Du brauchst einen kostenlosen OpenRouter-Account und API-Key.'
        },
        amazon_q: {
            type: 'browser',
            desc: 'Amazon Q – Nur im Browser nutzbar (keine lokale Config).',
            needInstall: 'Amazon Q Web unter q.amazon.com öffnen.',
            configAt: 'n/a (Browser)',
            howToUse: 'Amazon Q Web öffnen → Anleitung aus der Config-Datei manuell einfügen.',
            note: 'Dieses Tool hat keine automatische Config-Installation. Folge der Anleitung in der Config-Datei.'
        },
        opencode: {
            type: 'cli',
            desc: 'OpenCode CLI – Terminal-basierte KI.',
            needInstall: 'npm install -g opencode',
            installCmd: 'npm install -g opencode',
            configAt: path || home + '/.config/opencode/opencode.json',
            howToUse: 'Terminal öffnen → `opencode` ausführen → Das Modell wird automatisch geladen.',
            note: 'Das Modell läuft auf OpenRouter-Servern (Cloud). Du brauchst einen kostenlosen OpenRouter-Account und API-Key.'
        },
        antigravity: {
            type: 'yaml',
            desc: 'Antigravity – settings.yaml Konfiguration.',
            needInstall: 'Antigravity installieren (siehe antigravity.dev).',
            configAt: path || 'settings.yaml im aktuellen Ordner.',
            howToUse: 'Antigravity starten → Config wird automatisch geladen.',
            note: 'Das Modell läuft auf OpenRouter-Servern (Cloud). Du brauchst einen kostenlosen OpenRouter-Account und API-Key.'
        },
        claude_code: {
            type: 'cli',
            desc: 'Claude Code CLI – Anthropics offizielles Terminal-Tool.',
            needInstall: 'npm install -g @anthropic-ai/claude-code',
            installCmd: 'npm install -g @anthropic-ai/claude-code',
            configAt: 'CLAUDE.md in deinem Projektordner.',
            howToUse: 'Terminal öffnen → in dein Projekt wechseln → `claude` ausführen.',
            note: 'Das Modell läuft auf OpenRouter-Servern (Cloud). Du brauchst einen kostenlosen OpenRouter-Account und API-Key.'
        },
        github_copilot: {
            type: 'instructions',
            desc: 'GitHub Copilot – Custom Instructions für VS Code.',
            needInstall: 'GitHub Copilot Extension in VS Code installieren + aktives GitHub-Abo.',
            configAt: '.github/copilot-instructions.md in deinem Projekt.',
            howToUse: 'VS Code öffnen → Copilot Chat (Strg+Shift+I) → Copilot nutzt die Instructions automatisch.',
            note: 'GitHub Copilot nutzt standardmäßig OpenAI-Modelle. Die Instructions passen das Verhalten an.'
        },
        cline: {
            type: 'extension',
            desc: 'Cline – VS Code Extension für agentische Workflows.',
            needInstall: 'Cline Extension im VS Code Marketplace installieren.',
            configAt: '.clinerules in deinem Projektordner.',
            howToUse: 'VS Code öffnen → Cline-Symbol in der Sidebar → OpenRouter-Modell auswählen.',
            note: 'Das Modell läuft auf OpenRouter-Servern (Cloud). Du brauchst einen kostenlosen OpenRouter-Account und API-Key.'
        },
        codeium: {
            type: 'rules',
            desc: 'Codeium – .codeiumrules für Code-Vervollständigung.',
            needInstall: 'Codeium Extension in VS Code installieren oder Windsurf nutzen.',
            configAt: '.codeiumrules in deinem Projektordner.',
            howToUse: 'VS Code öffnen → Codeium Chat → Modell-Einstellungen prüfen.',
            note: 'Codeium hat eigene Modelle. Die Config passt ergänzende Einstellungen an.'
        }
    };

    const guide = toolGuides[tool.id] || { type: 'generic', desc: '', needInstall: '', configAt: path, howToUse: 'Config wurde installiert. Starte das Tool neu.', note: '' };

    let installCmdSection = '';
    if (guide.installCmd) {
        installCmdSection = `
### Installation:
\`\`\`bash
${guide.installCmd}
\`\`\``;
    }

    return `
# ${tool.name} – Setup-Anleitung

## Was ist das?
${guide.desc}

## Wichtig zu wissen
${guide.note}

## 1. Tool installieren (falls nicht vorhanden)
${guide.needInstall}${installCmdSection}

## 2. Config-Datei
Die Config wurde installiert unter:
\`${guide.configAt}\`

Falls darin noch \`DEIN_API_KEY_HERE\` steht:
1. Datei mit Texteditor öffnen
2. \`DEIN_API_KEY_HERE\` durch deinen OpenRouter-API-Key ersetzen
3. Speichern

## 3. Nutzung
${guide.howToUse}

## 4. Problembehebung
- Config nicht gefunden? → Installer erneut ausführen
- Modell erscheint nicht? → Tool neustarten
- "Invalid API Key"? → Key in der Config prüfen
- Weiterhin Probleme? → openrouter.ai/docs für Hilfe
    `.trim();
}
