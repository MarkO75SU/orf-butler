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
    }
};

export const OS_PATHS = {
    "win32": {
        "continue": "C:\\Benutzer\\[DeinName]\\.continue\\config.json",
        "cursor": ".cursorrules (In deinem Projektordner)",
        "zed": "C:\\Benutzer\\[DeinName]\\AppData\\Roaming\\Zed\\settings.json",
        "aider": ".aider.conf.yml (In deinem Projektordner)",
        "copilot": ".github\\copilot-instructions.md (In deinem Projektordner)",
        "amazon_q": "Amazon Q Einstellungen im Browser",
        "opencode": "C:\\Benutzer\\[DeinName]\\AppData\\Roaming\\opencode\\opencode.json",
        "antigravity": "settings.yaml (In deinem Projektordner)"
    },
    "darwin": {
        "continue": "Benutzer/[DeinName]/.continue/config.json",
        "cursor": ".cursorrules (In deinem Projektordner)",
        "zed": "~/.config/zed/settings.json",
        "aider": ".aider.conf.yml",
        "copilot": ".github/copilot-instructions.md",
        "amazon_q": "Amazon Q Einstellungen",
        "opencode": "~/.config/opencode/opencode.json",
        "antigravity": "settings.yaml"
    }
};

export function generateInstallMD(tool, os, tier, path) {
    const isWin = os === "win32";
    const mouseBtn = isWin ? "rechte Maustaste" : "Sekundärklick (Zwei Finger)";
    const shell = isWin ? "PowerShell oder Eingabeaufforderung" : "Terminal";
    
    let cliSection = "";
    
    if (tool.id === "opencode" || tool.id === "ollama" || tool.id === "aider") {
        const cli = CLI_COMMANDS[tool.id];
        if (cli) {
            cliSection = `

## CLI Werkzeuge (Optional)
Falls du ${cli.name} noch nicht installiert hast, führe folgenden Befehl in deinem ${shell} aus:

### Installation:
\`\`\`bash
${cli.install[os]}
\`\`\`

### Update:
\`\`\`bash
${cli.update[os]}
\`\`\`
`;
        }
    }
    
    return `
# Schritt-für-Schritt Anleitung für ${tool.name}

Diese Anleitung ist so geschrieben, dass du keine Computer-Kenntnisse benötigst. Folge einfach jedem Klick.
${cliSection}
## Schritt 1: Die Datei finden
1. Du hast gerade eine Datei namens \`${tool.config_file}\` heruntergeladen.
2. Suche diese Datei in deinem "Downloads"-Ordner (das ist der Ordner mit dem blauen Pfeil nach unten).
3. Klicke mit der **${mouseBtn}** auf die Datei.
4. Wähle aus dem Menü den Punkt **"Kopieren"** aus.

## Schritt 2: Den richtigen Ort finden
1. Du musst die Datei nun an einen speziellen Ort auf deinem Computer bringen.
2. Dieser Ort ist: \`${path}\`
${isWin ? `
3. Drücke auf deiner Tastatur gleichzeitig die Taste mit dem **Windows-Logo** (unten links) und den Buchstaben **R**.
4. Ein kleines Fenster öffnet sich. Tippe dort den Pfad von oben ein und drücke die Eingabetaste (Enter).` : `
3. Klicke oben in deiner Menüleiste auf "Gehe zu" und dann auf "Gehe zum Ordner...".
4. Tippe dort den Pfad von oben ein und drücke die Eingabetaste.`}

## Schritt 3: Die Datei einfügen
1. Wenn du in dem oben genannten Ordner bist, klicke auf eine freie weiße Stelle mit der **${mouseBtn}**.
2. Wähle aus dem Menü den Punkt **"Einfügen"**.
3. Falls gefragt wird, ob eine vorhandene Datei überschrieben werden soll, klicke auf **"Ja"** oder **"Ersetzen"**.

## Schritt 4: Deinen Schlüssel (API-Key) eintragen
1. Klicke mit der **${mouseBtn}** auf die eingefügte Datei \`${tool.config_file}\`.
2. Wähle **"Öffnen mit..."** und suche ein Programm wie "Editor" (Windows) oder "TextEdit" (Mac).
3. Suche im Text nach der Stelle \`DEIN_API_KEY_HIER\`.
4. Lösche diesen Text vorsichtig und füge stattdessen deinen persönlichen Schlüssel von OpenRouter ein.
5. Klicke oben links auf **"Datei"** und dann auf **"Speichern"**.

Fertig! Dein Assistent ist nun bereit.
    `.trim();
}
