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
        "github_copilot": ".github\\copilot-instructions.md (In deinem Projektordner)",
        "opencode": "C:\\Users\\[YourName]\\.config\\opencode\\opencode.json",
        "antigravity": "settings.yaml (In deinem Projektordner)",
        "claude_code": "CLAUDE.md (In deinem Projektordner)",
        "cline": ".clinerules (In deinem Projektordner)",
        "codeium": ".codeiumrules (In deinem Projektordner)",
        "roocode": ".roorules (In deinem Projektordner)",
        "litellm": "litellm_config.yaml (In deinem Projektordner)",
        "cody": ".cody/config.json (In deinem Projektordner)",
        "tabby": "tabby_config.json (In deinem Projektordner)"
    },
    "darwin": {
        "continue": "~/.continue/config.json",
        "cursor": ".cursorrules (In deinem Projektordner)",
        "windsurf": ".windsurfrules (In deinem Projektordner)",
        "zed": "~/.config/zed/settings.json",
        "aider": ".aider.conf.yml",
        "github_copilot": ".github/copilot-instructions.md",
        "opencode": "~/.config/opencode/opencode.json",
        "antigravity": "settings.yaml (In deinem Projektordner)",
        "claude_code": "CLAUDE.md (In deinem Projektordner)",
        "cline": ".clinerules (In deinem Projektordner)",
        "codeium": ".codeiumrules (In deinem Projektordner)",
        "roocode": ".roorules (In deinem Projektordner)",
        "litellm": "litellm_config.yaml (In deinem Projektordner)",
        "cody": ".cody/config.json (In deinem Projektordner)",
        "tabby": "tabby_config.json (In deinem Projektordner)"
    },
    "linux": {
        "continue": "~/.continue/config.json",
        "cursor": ".cursorrules (In deinem Projektordner)",
        "windsurf": ".windsurfrules (In deinem Projektordner)",
        "zed": "~/.config/zed/settings.json",
        "aider": ".aider.conf.yml",
        "github_copilot": ".github/copilot-instructions.md",
        "opencode": "~/.config/opencode/opencode.json",
        "antigravity": "settings.yaml (In deinem Projektordner)",
        "claude_code": "CLAUDE.md (In deinem Projektordner)",
        "cline": ".clinerules (In deinem Projektordner)",
        "codeium": ".codeiumrules (In deinem Projektordner)",
        "roocode": ".roorules (In deinem Projektordner)",
        "litellm": "litellm_config.yaml (In deinem Projektordner)",
        "cody": ".cody/config.json (In deinem Projektordner)",
        "tabby": "tabby_config.json (In deinem Projektordner)"
    }
};

export function generateInstallMD(tool, os, tier, path, lang = "de") {
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
            needInstall: 'Antigravity IDE installieren.',
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
        },
        roocode: {
            type: 'extension',
            desc: 'RooCode - VS Code Extension für agentische KI-Entwicklung mit OpenRouter.',
            needInstall: 'RooCode Extension im VS Code Marketplace installieren.',
            configAt: '.roorules im Projektordner',
            howToUse: 'VS Code -> RooCode Icon in der Sidebar -> OpenRouter als Provider wählen -> Config wird automatisch gelesen.',
            note: 'RooCode unterstützt OpenRouter-Modelle direkt. Die Config definiert das Verhalten.'
        },
        litellm: {
            type: 'config',
            desc: 'LiteLLM – Universeller LLM-Proxy. Unterstützt OpenRouter, OpenAI, Anthropic & mehr.',
            needInstall: 'pip install litellm oder npm install -g litellm-proxy',
            installCmd: 'pip install litellm',
            configAt: 'litellm_config.yaml im Projektordner',
            howToUse: '`litellm --model openrouter/google/gemma-4-26b-a4b-it:free --port 8000` starten. Dann in deinem Tool als API-Endpoint localhost:8000 eintragen.',
            note: 'LiteLLM routet Anfragen an OpenRouter. Der API-Key wird in der Config gesetzt.'
        },
        cody: {
            type: 'extension',
            desc: 'Cody (Sourcegraph) – AI Coding Assistant mit tiefem Codebase-Kontext.',
            needInstall: 'Cody Extension im VS Code Marketplace installieren.',
            configAt: '.cody/config.json im Projektordner',
            howToUse: 'VS Code → Cody Icon in der Sidebar → OpenRouter als Provider auswählen.',
            note: 'Cody unterstützt OpenRouter als Provider. Config definiert model und API-Key.'
        },
        tabby: {
            type: 'config',
            desc: 'Tabby – Self-hosted AI Coding Assistant.',
            needInstall: 'Tabby Docker: docker run -p 8080:8080 tabbyml/tabby serve --model StarCoder-1B',
            installCmd: 'docker run -p 8080:8080 tabbyml/tabby serve --model StarCoder-1B',
            configAt: 'tabby_config.json im Projektordner',
            howToUse: 'Tabby-Server starten → In VS Code Tabby Extension verbinden → Config platziert.',
            note: 'Tabby läuft lokal. Falls kein eigener GPU-Server, OpenRouter als Fallback nutzen.'
        }
    };

    const toolGuidesEn = {
        continue: {
            type: 'extension',
            desc: 'VS Code extension for AI assistance.',
            needInstall: 'Install the Continue extension from the VS Code Marketplace (Ctrl+Shift+X → search for "Continue").',
            configAt: path || home + '/.continue/config.json',
            howToUse: 'Open VS Code → Ctrl+Shift+P → "Continue: Open Chat" → the chat panel at the bottom right shows your model. Or Ctrl+L for inline chat.',
            note: 'The model runs on OpenRouter servers (cloud). You need a free OpenRouter account and API key.'
        },
        cursor: {
            type: 'rules',
            desc: '.cursorrules is read automatically by Cursor Editor.',
            needInstall: 'Install the Cursor Editor from cursor.com.',
            configAt: 'In the same folder as your project.',
            howToUse: 'Open Cursor → open the chat (Ctrl+I) → switch the model in the top dropdown to "OpenRouter".',
            note: 'The model runs on OpenRouter servers (cloud). You need a free OpenRouter account and API key.'
        },
        windsurf: {
            type: 'rules',
            desc: '.windsurfrules is read automatically by Windsurf Editor.',
            needInstall: 'Install the Windsurf Editor from codeium.com/windsurf.',
            configAt: 'In the same folder as your project.',
            howToUse: 'Open Windsurf → open Cascade (Ctrl+Shift+P → "Cascade: Open") → switch the model to OpenRouter.',
            note: 'The model runs on OpenRouter servers (cloud). You need a free OpenRouter account and API key.'
        },
        zed: {
            type: 'config',
            desc: 'Zed Editor uses settings.json for AI models.',
            needInstall: 'Install the Zed Editor from zed.dev.',
            configAt: path || home + '/.config/zed/settings.json',
            howToUse: 'Open Zed → Ctrl+R → Assistant panel → the model should appear as "ORF".',
            note: 'The model runs on OpenRouter servers (cloud). You need a free OpenRouter account and API key.'
        },
        aider: {
            type: 'cli',
            desc: 'Aider CLI – terminal-based pair programming.',
            needInstall: 'pip install aider-chat (Python 3.9-3.12 required). Alternatively: curl -LsSf https://aider.chat/install.sh | sh',
            installCmd: 'pip install aider-chat',
            configAt: '.aider.conf.yml in your project folder.',
            howToUse: 'Open a terminal → cd into your project directory → run `aider --model openrouter/YOUR_MODEL`.',
            note: 'The model runs on OpenRouter servers (cloud). You need a free OpenRouter account and API key.'
        },
        opencode: {
            type: 'cli',
            desc: 'OpenCode CLI – terminal-based AI.',
            needInstall: 'npm install -g opencode-ai',
            installCmd: 'npm install -g opencode-ai',
            configAt: path || home + '/.config/opencode/opencode.json',
            howToUse: 'Open a terminal → run `opencode` → the model is loaded automatically.',
            note: 'The model runs on OpenRouter servers (cloud). You need a free OpenRouter account and API key.'
        },
        antigravity: {
            type: 'yaml',
            desc: 'Antigravity – agentic coding IDE (settings.yaml).',
            needInstall: 'Install the Antigravity IDE.',
            configAt: path || 'settings.yaml in your current folder.',
            howToUse: 'Start Antigravity → the config is loaded automatically.',
            note: 'The model runs on OpenRouter servers (cloud). You need a free OpenRouter account and API key.'
        },
        claude_code: {
            type: 'cli',
            desc: 'Claude Code CLI – Anthropic\'s official terminal tool.',
            needInstall: 'Install via curl -fsSL https://claude.ai/install.sh | bash (Mac/Linux) or winget install Anthropic.ClaudeCode (Windows). Alternatively: npm install -g @anthropic-ai/claude-code',
            installCmd: 'curl -fsSL https://claude.ai/install.sh | bash',
            configAt: 'CLAUDE.md in your project folder.',
            howToUse: 'Open a terminal → cd into your project → run `claude`.',
            note: 'The model runs on OpenRouter servers (cloud). You need a free OpenRouter account and API key.'
        },
        github_copilot: {
            type: 'instructions',
            desc: 'GitHub Copilot – custom instructions for VS Code.',
            needInstall: 'Install the GitHub Copilot extension in VS Code + an active GitHub subscription.',
            configAt: '.github/copilot-instructions.md in your project.',
            howToUse: 'Open VS Code → Copilot Chat (Ctrl+Shift+I) → Copilot uses the instructions automatically.',
            note: 'GitHub Copilot uses OpenAI models by default. The instructions adapt its behavior.'
        },
        cline: {
            type: 'extension',
            desc: 'Cline (CLI + VS Code) – open-source agentic coding assistant.',
            needInstall: 'Install the Cline extension from the VS Code Marketplace. For the CLI: npm install -g cline.',
            configAt: '.clinerules in your project folder.',
            howToUse: 'Terminal: run `cline`. VS Code: Cline icon in the sidebar → select the OpenRouter model.',
            note: 'The model runs on OpenRouter servers (cloud). You need a free OpenRouter account and API key.'
        },
        codeium: {
            type: 'rules',
            desc: 'Codeium/Windsurf – .codeiumrules for code completion.',
            needInstall: 'Install the Windsurf Editor (codeium.com/windsurf). Codeium is integrated into Windsurf.',
            configAt: '.codeiumrules in your project folder.',
            howToUse: 'Open Windsurf → Cascade panel → check the model settings.',
            note: 'Codeium has been integrated into Windsurf. The config is read automatically by the editor.'
        },
        roocode: {
            type: 'extension',
            desc: 'RooCode – VS Code extension for agentic AI development with OpenRouter.',
            needInstall: 'Install the RooCode extension from the VS Code Marketplace.',
            configAt: '.roorules in your project folder',
            howToUse: 'VS Code → RooCode icon in the sidebar → select OpenRouter as provider → the config is read automatically.',
            note: 'RooCode supports OpenRouter models directly. The config defines the behavior.'
        },
        litellm: {
            type: 'config',
            desc: 'LiteLLM – universal LLM proxy. Supports OpenRouter, OpenAI, Anthropic & more.',
            needInstall: 'pip install litellm or npm install -g litellm-proxy',
            installCmd: 'pip install litellm',
            configAt: 'litellm_config.yaml in your project folder',
            howToUse: 'Start `litellm --model openrouter/google/gemma-4-26b-a4b-it:free --port 8000`. Then set localhost:8000 as the API endpoint in your tool.',
            note: 'LiteLLM routes requests to OpenRouter. The API key is set in the config.'
        },
        cody: {
            type: 'extension',
            desc: 'Cody (Sourcegraph) – AI coding assistant with deep codebase context.',
            needInstall: 'Install the Cody extension from the VS Code Marketplace.',
            configAt: '.cody/config.json in your project folder',
            howToUse: 'VS Code → Cody icon in the sidebar → select OpenRouter as provider.',
            note: 'Cody supports OpenRouter as a provider. The config defines model and API key.'
        },
        tabby: {
            type: 'config',
            desc: 'Tabby – self-hosted AI coding assistant.',
            needInstall: 'Tabby Docker: docker run -p 8080:8080 tabbyml/tabby serve --model StarCoder-1B',
            installCmd: 'docker run -p 8080:8080 tabbyml/tabby serve --model StarCoder-1B',
            configAt: 'tabby_config.json in your project folder',
            howToUse: 'Start the Tabby server → connect the Tabby extension in VS Code → the config is placed.',
            note: 'Tabby runs locally. If you don\'t have your own GPU server, use OpenRouter as a fallback.'
        }
    };

    const genericDe = { type: 'generic', desc: '', needInstall: '', configAt: path, howToUse: 'Config wurde installiert. Starte das Tool neu.', note: '' };
    const genericEn = { type: 'generic', desc: '', needInstall: '', configAt: path, howToUse: 'The config was installed. Restart the tool.', note: '' };

    let guide = lang === 'en' ? (toolGuidesEn[tool.id] || genericEn) : (toolGuides[tool.id] || genericDe);
    if (guide.configAt) {
        guide = { ...guide, configAt: String(guide.configAt).replace(/\(In deinem Projektordner\)/, lang === 'en' ? '(in your project folder)' : '(in deinem Projektordner)') };
    }

    let installCmdSection = '';
    if (guide.installCmd) {
        installCmdSection = `
### Installation:
\`\`\`bash
${guide.installCmd}
\`\`\``;
    }

    if (lang === 'en') {
        return `
# ${tool.name} – Setup Guide

## What is this?
${guide.desc}

## Good to know
${guide.note}

## 1. Install the tool (if not installed)
${guide.needInstall}${installCmdSection}

## 2. Config file
The config was installed at:
\`${guide.configAt}\`

If it still contains \`DEIN_API_KEY_HERE\`:
1. Open the file in a text editor
2. Replace \`DEIN_API_KEY_HERE\` with your OpenRouter API key
3. Save

## 3. Usage
${guide.howToUse}

## 4. Troubleshooting
- Config not found? → Re-run the installer
- Model not showing up? → Restart the tool
- "Invalid API Key"? → Check the key in the config
- Still having issues? → See openrouter.ai/docs for help
${isPremium ? `
## 5. Premium Features
This config contains extended settings:
- Optimized temperature (0.3) for more consistent answers
- Higher token limit (4096) for extensive generations
- Expert system prompt for more precise code generation
    ` : ''}
    `.trim();
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
