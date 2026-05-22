// src/js/templates.js
import { MODEL_MAPPING } from './mapping.js';

export const TOOL_TEMPLATES = {
    "continue": { 
        name: "VS Code (Continue)", 
        config_file: "config.json", 
        type: "json_global", 
        status: "stable",
        desc: "Industriestandard für VS Code Integration." 
    },
    "opencode": { 
        name: "OpenCode CLI", 
        config_file: "opencode.json", 
        type: "json_global", 
        status: "stable",
        desc: "Hochperformante Terminal-AI." 
    },
    "antigravity": { 
        name: "Antigravity", 
        config_file: "settings.yaml", 
        type: "yaml_config", 
        status: "partial", 
        todo: "Endpoint-Mapping für Antigravity-Core verifizieren.",
        desc: "Spezialisierte Agentic-Workflows." 
    },
    "zed": { 
        name: "Zed Editor", 
        config_file: "settings.json", 
        type: "json_merge", 
        status: "stable",
        desc: "High-Performance Rust Editor." 
    },
    "aider": { 
        name: "Aider CLI", 
        config_file: ".aider.conf.yml", 
        type: "yaml_config", 
        status: "stable",
        desc: "Bestes Terminal-Pair-Programming Tool." 
    },
    "amazon_q": { 
        name: "Amazon Q", 
        config_file: "instructions.md", 
        type: "instruction_paste", 
        status: "stable",
        desc: "Cloud-Spezialist für AWS-Workflows." 
    },
    "cursor": {
        name: "Cursor Editor",
        config_file: ".cursorrules",
        type: "instruction_paste",
        status: "stable",
        desc: "AI-native Code Editor mit Deep Context."
    },
    "windsurf": {
        name: "Windsurf Editor",
        config_file: ".windsurfrules",
        type: "instruction_paste",
        status: "stable",
        desc: "Agentic IDE mit Flow-Autonomie."
    },
    "claude_code": {
        name: "Claude Code CLI",
        config_file: "CLAUDE.md",
        type: "instruction_paste",
        status: "stable",
        desc: "Anthropics offizielles Terminal-Tool."
    },
    "github_copilot": {
        name: "GitHub Copilot",
        config_file: ".github/copilot-instructions.md",
        type: "instruction_paste",
        status: "stable",
        desc: "Microsofts AI-Pair-Programmer."
    },
    "cline": {
        name: "Cline",
        config_file: ".clinerules",
        type: "instruction_paste",
        status: "stable",
        desc: "Open-Source Agentic Coding Assistant."
    },
    "codeium": {
        name: "Codeium / Windsurf",
        config_file: ".codeiumrules",
        type: "instruction_paste",
        status: "stable",
        desc: "Schnelle Code-Vervollständigung."
    }
};

export function generateConfig(toolId, models, tier) {
    const tool = TOOL_TEMPLATES[toolId] || { type: "json_global" };
    const [id, data] = models[0];

    if (tool.type === "json_global" || tool.type === "json_merge") {
        return JSON.stringify({
            models: [{
                title: `ORF-${tier.toUpperCase()}`,
                provider: "openrouter",
                model: id,
                ...(tier === "premium" && { system_prompt: data.premium_prompt })
            }]
        }, null, 2);
    }
    
    if (tool.type === "yaml_config") {
        return `model: openrouter/${id}\nendpoint: https://openrouter.ai/api/v1\n# ORF-Butler ${tier} synthezised`;
    }

    return `# ORF-Butler Instructions\n${tier === 'premium' ? data.premium_prompt : 'Act as a professional coder.'}`;
}
