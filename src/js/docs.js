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
    const mouseBtn = isWin ? "right mouse button" : "right-click (two fingers)";
    const shell = isWin ? "PowerShell or Command Prompt" : "Terminal";

    let cliSection = "";
    
    if (tool.id === "opencode" || tool.id === "ollama" || tool.id === "aider" || tool.id === "claude_code" || tool.id === "cline") {
        const cli = CLI_COMMANDS[tool.id];
        if (cli) {
            cliSection = `

## CLI Tools (Optional)
If you haven't installed ${cli.name} yet, run the following command in your ${shell}:

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
# Step-by-Step Guide for ${tool.name}

This guide is written so that you don't need computer knowledge. Just follow each click.
${cliSection}
## Step 1: Find the file
1. You just downloaded a file named \`${tool.config_file}\`.
2. Find this file in your "Downloads" folder.
3. **${mouseBtn}** on the file.
4. Select **"Copy"** from the menu.

## Step 2: Find the right location
1. You need to put the file in a special location on your computer.
2. This location is: \`${path}\`
${isWin ? `
3. Press the **Windows key** (bottom left) and the letter **R** at the same time.
4. A small window opens. Type the path from above and press Enter.` : `
3. Click "Go" in your menu bar, then "Go to Folder...".
4. Type the path from above and press Enter.`}

## Step 3: Paste the file
1. When you are in the folder mentioned above, **${mouseBtn}** on a free white space.
2. Select **"Paste"** from the menu.
3. If asked whether to replace an existing file, click **"Yes"** or **"Replace"**.

## Step 4: Add your API Key
1. **${mouseBtn}** on the pasted file \`${tool.config_file}\`.
2. Select **"Open with..."** and choose a text editor like "Notepad" (Windows) or "TextEdit" (Mac).
3. Find \`DEIN_API_KEY_HERE\` in the text.
4. Delete this text and replace it with your personal OpenRouter key.
5. Click **"File"** and then **"Save"**.

Done! Your ${tool.name} assistant is now ready.
    `.trim();
}
