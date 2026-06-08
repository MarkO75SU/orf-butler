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
            win32: `npm install -g opencode-ai`,
            darwin: `brew install anomalyco/tap/opencode`,
            linux: `npm install -g opencode-ai`
        },
        update: {
            win32: `npm update -g opencode-ai`,
            darwin: `brew upgrade anomalyco/tap/opencode`,
            linux: `npm update -g opencode-ai`
        }
    },
    "aider": {
        name: "Aider",
        install: {
            win32: `pip install aider-chat`,
            darwin: `pip install aider-chat`,
            linux: `pip install aider-chat`
        },
        update: {
            win32: `pip install --upgrade aider-chat`,
            darwin: `pip install --upgrade aider-chat`,
            linux: `pip install --upgrade aider-chat`
        }
    },
    "claude_code": {
        name: "Claude Code",
        install: {
            win32: `winget install Anthropic.ClaudeCode`,
            darwin: `curl -fsSL https://claude.ai/install.sh | bash`,
            linux: `curl -fsSL https://claude.ai/install.sh | bash`
        },
        update: {
            win32: `winget upgrade Anthropic.ClaudeCode`,
            darwin: `npm update -g @anthropic-ai/claude-code`,
            linux: `npm update -g @anthropic-ai/claude-code`
        }
    },
    "cline": {
        name: "Cline",
        install: {
            win32: `npm install -g cline`,
            darwin: `npm install -g cline`,
            linux: `npm install -g cline`
        },
        update: {
            win32: `npm update -g cline`,
            darwin: `npm update -g cline`,
            linux: `npm update -g cline`
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
        "opencode": "C:\\Users\\[YourName]\\.config\\opencode\\opencode.json",
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
        "opencode": "~/.config/opencode/opencode.json",
        "antigravity": "settings.yaml (In deinem Projektordner)",
        "claude_code": "CLAUDE.md (In deinem Projektordner)",
        "cline": ".clinerules (In deinem Projektordner)",
        "codeium": ".codeiumrules (In deinem Projektordner)"
    },
    "linux": {
        "continue": "~/.continue/config.json",
        "cursor": ".cursorrules (In deinem Projektordner)",
        "windsurf": ".windsurfrules (In deinem Projektordner)",
        "zed": "~/.config/zed/settings.json",
        "aider": ".aider.conf.yml",
        "copilot": ".github/copilot-instructions.md",
        "opencode": "~/.config/opencode/opencode.json",
        "antigravity": "settings.yaml (In deinem Projektordner)",
        "claude_code": "CLAUDE.md (In deinem Projektordner)",
        "cline": ".clinerules (In deinem Projektordner)",
        "codeium": ".codeiumrules (In deinem Projektordner)"
    }
};

export function generateInstallMD(tool, os, tier, path) {
    const isWin = os === "win32";
    const shell = isWin ? "PowerShell or Command Prompt" : "Terminal";
    const home = isWin ? '%USERPROFILE%' : '~';
    const isPremium = tier === "premium";

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
            needInstall: 'pip install aider-chat (Python 3.9-3.12 erforderlich). Alternativ: curl -LsSf https://aider.chat/install.sh | sh',
            installCmd: 'pip install aider-chat',
            configAt: '.aider.conf.yml im aktuellen Projektordner.',
            howToUse: 'Terminal öffnen → in dein Projektverzeichnis wechseln → `aider --model openrouter/DEIN_MODELL` ausführen.',
            note: 'Das Modell läuft auf OpenRouter-Servern (Cloud). Du brauchst einen kostenlosen OpenRouter-Account und API-Key.'
        },
        opencode: {
            type: 'cli',
            desc: 'OpenCode CLI – Terminal-basierte KI.',
            needInstall: 'npm install -g opencode-ai',
            installCmd: 'npm install -g opencode-ai',
            configAt: path || home + '/.config/opencode/opencode.json',
            howToUse: 'Terminal öffnen → `opencode` ausführen → Das Modell wird automatisch geladen.',
            note: 'Das Modell läuft auf OpenRouter-Servern (Cloud). Du brauchst einen kostenlosen OpenRouter-Account und API-Key.'
        },
        antigravity: {
            type: 'yaml',
            desc: 'Antigravity – Agentic Coding IDE (settings.yaml).',
            needInstall: 'Antigravity IDE installieren (ag社).',
            configAt: path || 'settings.yaml im aktuellen Ordner.',
            howToUse: 'Antigravity starten → Config wird automatisch geladen.',
            note: 'Das Modell läuft auf OpenRouter-Servern (Cloud). Du brauchst einen kostenlosen OpenRouter-Account und API-Key.'
        },
        claude_code: {
            type: 'cli',
            desc: 'Claude Code CLI – Anthropics offizielles Terminal-Tool.',
            needInstall: 'Installation via curl -fsSL https://claude.ai/install.sh | bash (Mac/Linux) oder winget install Anthropic.ClaudeCode (Windows). Alternativ: npm install -g @anthropic-ai/claude-code',
            installCmd: 'curl -fsSL https://claude.ai/install.sh | bash',
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
            desc: 'Cline (CLI + VS Code) – Open-Source agentischer Coding-Assistent.',
            needInstall: 'Cline Extension im VS Code Marketplace installieren. Für CLI: npm install -g cline.',
            configAt: '.clinerules in deinem Projektordner.',
            howToUse: 'Terminal: `cline` ausführen. VS Code: Cline-Symbol in der Sidebar → OpenRouter-Modell auswählen.',
            note: 'Das Modell läuft auf OpenRouter-Servern (Cloud). Du brauchst einen kostenlosen OpenRouter-Account und API-Key.'
        },
        codeium: {
            type: 'rules',
            desc: 'Codeium/Windsurf – .codeiumrules für Code-Vervollständigung.',
            needInstall: 'Windsurf Editor installieren (codeium.com/windsurf). Codeium ist in Windsurf integriert.',
            configAt: '.codeiumrules in deinem Projektordner.',
            howToUse: 'Windsurf öffnen → Cascade-Panel → Modell-Einstellungen prüfen.',
            note: 'Codeium wurde in Windsurf integriert. Die Config wird automatisch vom Editor gelesen.'
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
${isPremium ? `
## 5. Premium Features
Diese Config enthält erweiterte Einstellungen:
- Optimierte Temperature (0.3) für konsistentere Antworten
- Höheres Token-Limit (4096) für umfangreiche Generierungen
- Expert System-Prompt für präzisere Code-Generierung
    ` : ''}
    `.trim();
}
