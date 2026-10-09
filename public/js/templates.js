// public/js/templates.js
import { MODEL_MAPPING } from './mapping.js';

export const TOOL_TEMPLATES = {
    "continue": { 
        name: "VS Code (Continue)", 
        config_file: "config.json", 
        type: "json_global", 
        status: "stable",
        desc: "Industry standard for VS Code integration."
    },
    "opencode": { 
        name: "OpenCode CLI", 
        config_file: "opencode.json", 
        type: "opencode", 
        status: "stable",
        desc: "High-performance terminal AI."
    },
    "antigravity": { 
        name: "Antigravity", 
        config_file: "settings.yaml", 
        type: "yaml_config", 
        status: "partial", 
        todo: "Verify endpoint mapping for the Antigravity core.",
        desc: "Specialized agentic workflows."
    },
    "zed": { 
        name: "Zed Editor", 
        config_file: "settings.json", 
        type: "json_merge", 
        status: "stable",
        desc: "High-performance Rust editor."
    },
    "aider": { 
        name: "Aider CLI", 
        config_file: ".aider.conf.yml", 
        type: "yaml_config", 
        status: "stable",
        desc: "Best terminal pair-programming tool."
    },
    "cursor": {
        name: "Cursor Editor",
        config_file: ".cursorrules",
        type: "instruction_paste",
        status: "stable",
        desc: "AI-native code editor with deep context."
    },
    "windsurf": {
        name: "Windsurf Editor",
        config_file: ".windsurfrules",
        type: "instruction_paste",
        status: "stable",
        desc: "Agentic IDE with flow autonomy."
    },
    "claude_code": {
        name: "Claude Code CLI",
        config_file: "CLAUDE.md",
        type: "instruction_paste",
        status: "stable",
        desc: "Anthropic's official terminal tool."
    },
    "github_copilot": {
        name: "GitHub Copilot",
        config_file: ".github/copilot-instructions.md",
        type: "instruction_paste",
        status: "stable",
        desc: "Microsoft's AI pair programmer."
    },
    "cline": {
        name: "Cline",
        config_file: ".clinerules",
        type: "instruction_paste",
        status: "stable",
        desc: "Open-source agentic coding assistant."
    },
    "codeium": {
        name: "Codeium / Windsurf",
        config_file: ".codeiumrules",
        type: "instruction_paste",
        status: "stable",
        desc: "Fast code completion."
    },
    "roocode": {
        name: "RooCode",
        config_file: ".roorules",
        type: "instruction_paste",
        status: "stable",
        desc: "VS Code extension for agentic AI development."
    },
    "litellm": {
        name: "LiteLLM",
        config_file: "litellm_config.yaml",
        type: "yaml_config",
        status: "stable",
        desc: "Universal LLM proxy (OpenRouter, OpenAI, etc.)."
    },
    "cody": {
        name: "Cody (Sourcegraph)",
        config_file: ".cody/config.json",
        type: "json_global",
        status: "stable",
        desc: "AI coding assistant with codebase context."
    },
    "tabby": {
        name: "Tabby",
        config_file: "tabby_config.json",
        type: "json_global",
        status: "stable",
        desc: "Self-hosted AI coding assistant."
    }
};

const EXPERT_PROMPT = 'Act as an expert software engineer. Think step-by-step, write clean maintainable code, add error handling and tests.';

export function generateConfig(toolId, models, tier, apiKey) {
    const tool = TOOL_TEMPLATES[toolId] || { type: "json_global" };
    const [firstId, firstData] = models[0];
    const isFull = tier === "full";

    const fullExtras = isFull ? {
        instructions: [firstData?.system_prompt || EXPERT_PROMPT]
    } : {};

    const fullProviderOptions = isFull ? {
        temperature: 0.3,
        max_tokens: 4096
    } : {};

    if (tool.type === "opencode") {
        const cfg = {
            $schema: "https://opencode.ai/config.json",
            model: firstId,
            small_model: firstId,
            provider: {
                openrouter: {
                    options: {
                        apiKey: apiKey || 'YOUR_API_KEY_HERE',
                        ...fullProviderOptions
                    }
                }
            },
            ...fullExtras
        };
        return JSON.stringify(cfg, null, 2);
    }

    if (tool.type === "json_global" || tool.type === "json_merge") {
        const allModels = models.map(([id, data]) => ({
            title: `ORF-${id.split('/')[1] || id}`,
            provider: "openrouter",
            model: id,
            apiKey: apiKey || 'YOUR_API_KEY_HERE',
            ...(isFull && { 
                system_prompt: firstData?.system_prompt || 'Act as an expert software engineer.',
                temperature: 0.3,
                max_tokens: 4096
            })
        }));
        return JSON.stringify({ models: allModels }, null, 2);
    }
    
    if (tool.type === "yaml_config") {
        let yaml = `api_key: ${apiKey || 'YOUR_API_KEY_HERE'}\nmodel: openrouter/${firstId}\nendpoint: https://openrouter.ai/api/v1\n# ORF-Butler ${tier}`;
        if (isFull) {
            yaml += "\ntemperature: 0.3\nmax_tokens: 4096\n";
            yaml += `pre_prompt: "${firstData?.system_prompt || 'Act as an expert software engineer.'}"`;
        }
        return yaml;
    }

    const basePrompt = isFull 
        ? (firstData?.system_prompt || EXPERT_PROMPT)
        : 'Act as a professional coder.';
    return `# ORF-Butler ${tier.toUpperCase()} Instructions\n${basePrompt}`;
}
