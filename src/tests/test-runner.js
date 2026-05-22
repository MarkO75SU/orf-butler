import { TRANSLATIONS, setLanguage, getLang, t } from '../js/i18n.js';
import { DAILY_PROMPTS, getPromptOfDay, generateRSS } from '../js/prompts.js';
import { MODEL_MAPPING, getBestModels, MODEL_HISTORY } from '../js/mapping.js';
import { TOOL_TEMPLATES, generateConfig } from '../js/templates.js';
import { generateInstallMD, CLI_COMMANDS, OS_PATHS } from '../js/docs.js';
import { checkAuth, isAuthenticated, login, loginWithCode, logout, getUser } from '../js/auth.js';
import { fetchLiveFreeModels, verifyUpdateWindow } from '../js/api.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (!condition) throw new Error(`FAILED: ${message}`);
    passed++;
    console.log(`PASSED: ${message}`);
}

function runTestGroup(name, fn) {
    console.log(`\n--- ${name} ---`);
    try { fn(); } catch (error) { failed++; console.error(`\n${error.message}`); }
}

console.log("=== RUNNING ALL TESTS ===\n");

// ──────────────────────────────────────────────
// 1. i18n Tests
// ──────────────────────────────────────────────
runTestGroup("i18n Tests", () => {
    assert(TRANSLATIONS.de.title === "Openrouter Free Butler", "i18n: DE title");
    assert(TRANSLATIONS.en.title === "Openrouter Free Butler", "i18n: EN title");
    assert(TRANSLATIONS.de.search_placeholder, "i18n: DE search_placeholder");
    assert(TRANSLATIONS.en.search_placeholder, "i18n: EN search_placeholder");
    assert(TRANSLATIONS.de.deploy_btn, "i18n: DE deploy_btn");
    assert(TRANSLATIONS.en.deploy_btn, "i18n: EN deploy_btn");
    assert(TRANSLATIONS.de.recommendations, "i18n: DE recommendations");
    assert(TRANSLATIONS.en.recommendations, "i18n: EN recommendations");
    assert(TRANSLATIONS.de.roster_title, "i18n: DE roster_title");
    assert(TRANSLATIONS.en.roster_title, "i18n: EN roster_title");
    assert(TRANSLATIONS.de.potd_title, "i18n: DE potd_title");
    assert(TRANSLATIONS.en.potd_title, "i18n: EN potd_title");
    assert(TRANSLATIONS.de.basic_tier, "i18n: DE basic_tier");
    assert(TRANSLATIONS.en.basic_tier, "i18n: EN basic_tier");
    assert(TRANSLATIONS.de.premium_tier, "i18n: DE premium_tier");
    assert(TRANSLATIONS.en.premium_tier, "i18n: EN premium_tier");
    assert(TRANSLATIONS.de.mission_title, "i18n: DE mission_title");
    assert(TRANSLATIONS.en.mission_title, "i18n: EN mission_title");

    setLanguage('de');
    assert(getLang() === 'de', "i18n: setLanguage/getLang DE");
    assert(t('title') === "Openrouter Free Butler", "i18n: t() returns DE key");

    setLanguage('en');
    assert(getLang() === 'en', "i18n: setLanguage/getLang EN");
    assert(t('title') === "Openrouter Free Butler", "i18n: t() returns EN key");
    assert(t('nonexistent_key') === 'nonexistent_key', "i18n: t() missing key returns key");
});

// ──────────────────────────────────────────────
// 2. Prompt Tests
// ──────────────────────────────────────────────
runTestGroup("Prompt Tests", () => {
    const prompt = getPromptOfDay();
    assert(prompt && typeof prompt === 'object', "Prompts: getPromptOfDay returns object");
    assert(typeof prompt.title === 'string' && prompt.title.length > 0, "Prompts: title is non-empty string");
    assert(typeof prompt.prompt === 'string' && prompt.prompt.length > 0, "Prompts: prompt is non-empty string");
    assert(DAILY_PROMPTS.some(p => p.title === prompt.title), "Prompts: title found in DAILY_PROMPTS");
    assert(DAILY_PROMPTS.length === 4, "Prompts: DAILY_PROMPTS has 4 entries");

    const rss = generateRSS();
    assert(rss.includes('<?xml'), "Prompts: generateRSS starts with XML");
    assert(rss.includes('<rss'), "Prompts: generateRSS contains RSS tag");
    assert(rss.includes(prompt.title), "Prompts: generateRSS contains prompt title");
    assert(rss.includes(prompt.prompt), "Prompts: generateRSS contains prompt text");
});

// ──────────────────────────────────────────────
// 3. Mapping Tests
// ──────────────────────────────────────────────
runTestGroup("Mapping Tests", () => {
    const ids = Object.keys(MODEL_MAPPING);
    assert(ids.length >= 16, "Mapping: 16+ models in database");

    const required = [
        "qwen/qwen2.5-coder-32b:free",
        "qwen/qwen2.5-coder-1.5b:free",
        "qwen/qwen2.5-7b-instruct:free",
        "deepseek/deepseek-coder-33b:free",
        "deepseek/deepseek-chat:free",
        "meta-llama/llama-3.2-1b-instruct:free",
        "meta-llama/llama-3.2-3b-instruct:free",
        "google/gemma-2-2b-it:free",
        "google/gemma-2-9b-it:free",
        "mistralai/mistral-nemo-minitron-8b-instruct:free",
        "stabilityai/stable-code-3b:free",
        "nousresearch/hermes-3-llama-3.1-8b:free",
        "cohere/aya-expanse-8b:free",
        "microsoft/phi-3-mini-128k-instruct:free",
        "microsoft/phi-3.5-mini-instruct:free",
        "thudm/glm-4-9b-chat:free"
    ];
    required.forEach(id => assert(MODEL_MAPPING[id], `Mapping: ${id} exists`));

    // Check all models have bilingual fields + metadata
    Object.entries(MODEL_MAPPING).forEach(([id, m]) => {
        assert(m.role, `Mapping: ${id} has role`);
        assert(m.role_de, `Mapping: ${id} has role_de`);
        assert(m.desc_en, `Mapping: ${id} has desc_en`);
        assert(m.desc_de, `Mapping: ${id} has desc_de`);
        assert(m.context, `Mapping: ${id} has context`);
        assert(Array.isArray(m.languages) && m.languages.length > 0, `Mapping: ${id} has languages`);
        assert(m.uptime, `Mapping: ${id} has uptime`);
        assert(m.latency, `Mapping: ${id} has latency`);
        assert(m.status, `Mapping: ${id} has status`);
        assert(['online', 'degraded'].includes(m.status), `Mapping: ${id} status valid`);
        assert(id.endsWith(':free'), `Mapping: ${id} ends with :free`);
    });

    const qwen = MODEL_MAPPING["qwen/qwen2.5-coder-32b:free"];
    assert(qwen.languages.includes("javascript"), "Mapping: Qwen includes JS");
    assert(qwen.languages.includes("python"), "Mapping: Qwen includes Python");
});

// ──────────────────────────────────────────────
// 4. getBestModels Tests
// ──────────────────────────────────────────────
runTestGroup("getBestModels Tests", () => {
    const pythonModels = getBestModels('python', 'coding');
    assert(pythonModels.length > 0, "getBestModels: Returns Python models");
    assert(pythonModels.every(([_, d]) => d.languages.includes("python")), "getBestModels: Python filter correct");

    const jsModels = getBestModels('javascript', 'coding');
    assert(jsModels.length > 0, "getBestModels: Returns JS models");
    assert(jsModels.every(([_, d]) => d.languages.includes("javascript")), "getBestModels: JS filter correct");

    const goModels = getBestModels('go', 'coding');
    assert(goModels.length > 0, "getBestModels: Returns Go models");
    assert(goModels.some(([_, d]) => d.languages.includes("go")), "getBestModels: Some Go models in results");

    const rustModels = getBestModels('rust', 'coding');
    assert(rustModels.length > 0, "getBestModels: Returns Rust models");
    assert(rustModels.some(([_, d]) => d.languages.includes("rust")), "getBestModels: Some Rust models in results");

    const allModels = getBestModels('unknown', 'any');
    assert(allModels.length >= 10, "getBestModels: Unknown lang returns default slice");
});

// ──────────────────────────────────────────────
// 5. Model History Tests
// ──────────────────────────────────────────────
runTestGroup("Model History Tests", () => {
    assert(MODEL_HISTORY.length >= 12, "History: 12+ archived models");
    assert(MODEL_HISTORY.every(m => m.id), "History: All have ID");
    assert(MODEL_HISTORY.every(m => m.role), "History: All have role");
    assert(MODEL_HISTORY.every(m => m.role_de), "History: All have role_de");
    assert(MODEL_HISTORY.every(m => m.desc_en), "History: All have desc_en");
    assert(MODEL_HISTORY.every(m => m.desc_de), "History: All have desc_de");
    assert(MODEL_HISTORY.every(m => m.available), "History: All have available period");
    assert(MODEL_HISTORY.every(m => m.reason), "History: All have removal reason");
    assert(MODEL_HISTORY.every(m => m.reason_de), "History: All have reason_de");
    assert(MODEL_HISTORY.every(m => Array.isArray(m.languages) && m.languages.length > 0), "History: All have languages");
    assert(MODEL_HISTORY.every(m => m.context), "History: All have context");

    const specific = {
        "openai/gpt-3.5-turbo": "moved to paid",
        "anthropic/claude-3-haiku": "moved to paid",
        "meta-llama/llama-2-70b-chat": "superseded by Llama 3"
    };
    Object.entries(specific).forEach(([id, reason]) => {
        const entry = MODEL_HISTORY.find(m => m.id === id);
        assert(entry, `History: ${id} exists`);
        assert(entry.reason === reason, `History: ${id} reason correct: "${reason}"`);
    });
});

// ──────────────────────────────────────────────
// 6. Templates Tests
// ──────────────────────────────────────────────
runTestGroup("Templates Tests", () => {
    const allTools = ["opencode", "continue", "zed", "aider", "antigravity", "amazon_q",
                      "cursor", "windsurf", "claude_code", "github_copilot", "cline", "codeium"];
    allTools.forEach(id => assert(TOOL_TEMPLATES[id], `Templates: ${id} exists`));

    Object.entries(TOOL_TEMPLATES).forEach(([id, tool]) => {
        assert(tool.name, `Templates: ${id} has name`);
        assert(tool.config_file, `Templates: ${id} has config_file`);
        assert(tool.type, `Templates: ${id} has type`);
        assert(tool.status, `Templates: ${id} has status`);
        assert(tool.desc, `Templates: ${id} has desc`);
        assert(["stable", "partial"].includes(tool.status), `Templates: ${id} status valid`);
        assert(["json_global", "json_merge", "yaml_config", "instruction_paste"].includes(tool.type), `Templates: ${id} type valid`);
    });

    assert(TOOL_TEMPLATES["opencode"].type === "json_global", "Templates: OpenCode type json_global");
    assert(TOOL_TEMPLATES["aider"].type === "yaml_config", "Templates: Aider type yaml_config");
    assert(TOOL_TEMPLATES["cursor"].type === "instruction_paste", "Templates: Cursor type instruction_paste");
    assert(TOOL_TEMPLATES["antigravity"].status === "partial", "Templates: Antigravity status partial");
    assert(TOOL_TEMPLATES["ollama"] === undefined, "Templates: Ollama NOT a template");
});

// ──────────────────────────────────────────────
// 7. Config Generation Tests
// ──────────────────────────────────────────────
runTestGroup("Config Generation Tests", () => {
    const testModels = [["qwen/qwen2.5-coder-32b:free", MODEL_MAPPING["qwen/qwen2.5-coder-32b:free"]]];

    // JSON type (opencode)
    const jsonConfig = generateConfig("opencode", testModels, "basic");
    const parsedJson = JSON.parse(jsonConfig);
    assert(parsedJson.models[0].model === "qwen/qwen2.5-coder-32b:free", "generateConfig: JSON model correct");
    assert(parsedJson.models[0].provider === "openrouter", "generateConfig: JSON provider correct");
    assert(!parsedJson.models[0].system_prompt, "generateConfig: Basic no system_prompt");

    // Premium JSON
    const pm = [{ ...MODEL_MAPPING["qwen/qwen2.5-coder-32b:free"], premium_prompt: "You are an expert." }];
    const premConfig = generateConfig("opencode", [["test/model", pm[0]]], "premium");
    const parsedPrem = JSON.parse(premConfig);
    assert(parsedPrem.models[0].system_prompt === "You are an expert.", "generateConfig: Premium has system_prompt");

    // YAML type (aider)
    const yamlConfig = generateConfig("aider", testModels, "basic");
    assert(yamlConfig.includes("model:"), "generateConfig: YAML contains model");
    assert(yamlConfig.includes("openrouter/"), "generateConfig: YAML contains openrouter/");
    assert(yamlConfig.includes("endpoint:"), "generateConfig: YAML contains endpoint");

    // Instruction type (cursor)
    const instrConfig = generateConfig("cursor", testModels, "basic");
    assert(instrConfig.includes("ORF-Butler"), "generateConfig: Instruction contains ORF-Butler");
    assert(instrConfig.includes("professional coder"), "generateConfig: Instruction contains prompt text");

    // Premium instruction
    const premInstr = generateConfig("cursor", [["test/model", pm[0]]], "premium");
    assert(premInstr.includes("You are an expert."), "generateConfig: Premium instruction has premium_prompt");
});

// ──────────────────────────────────────────────
// 8. CLI Commands Tests
// ──────────────────────────────────────────────
runTestGroup("CLI Commands Tests", () => {
    const allCLI = ["ollama", "opencode", "aider", "claude_code", "cline"];
    const platforms = ["win32", "darwin", "linux"];

    allCLI.forEach(id => {
        assert(CLI_COMMANDS[id], `CLI: ${id} exists`);
        platforms.forEach(p => {
            assert(CLI_COMMANDS[id].install[p], `CLI: ${id} install.${p} exists`);
            assert(CLI_COMMANDS[id].update[p], `CLI: ${id} update.${p} exists`);
        });
    });

    assert(CLI_COMMANDS["ollama"].install.win32 === "winget install Ollama.Ollama", "CLI: Ollama Win install");
    assert(CLI_COMMANDS["ollama"].install.darwin === "brew install ollama/tap/ollama", "CLI: Ollama Mac install");
    assert(CLI_COMMANDS["opencode"].install.linux === "npm install -g opencode", "CLI: OpenCode Linux install");
    assert(CLI_COMMANDS["claude_code"].install.win32 === "npm install -g @anthropic-ai/claude-code", "CLI: Claude Code install");
    assert(CLI_COMMANDS["cline"].install.darwin === "brew install cline", "CLI: Cline Mac install");
});

// ──────────────────────────────────────────────
// 9. InstallMD Tests
// ──────────────────────────────────────────────
runTestGroup("InstallMD Tests", () => {
    const md = generateInstallMD({ id: "opencode", name: "OpenCode", config_file: "opencode.json" }, "win32", "basic", "C:\\test");
    assert(md.includes("Step-by-Step"), "InstallMD: Title");
    assert(md.includes("winget install opencode"), "InstallMD: Win install command");
    assert(md.includes("DEIN_API_KEY_HERE"), "InstallMD: API placeholder");
    assert(md.includes("C:\\test"), "InstallMD: Win path in body");
    assert(md.includes("PowerShell"), "InstallMD: Win shell reference");

    const mdMac = generateInstallMD({ id: "opencode", name: "OpenCode", config_file: "opencode.json" }, "darwin", "basic", "~/.config");
    assert(mdMac.includes("brew install opencode"), "InstallMD: Mac install command");
    assert(mdMac.includes("~/.config"), "InstallMD: Mac path in body");
    assert(mdMac.includes("Terminal"), "InstallMD: Mac shell reference");

    const mdClaude = generateInstallMD({ id: "claude_code", name: "Claude Code", config_file: "CLAUDE.md" }, "darwin", "basic", "~/CLAUDE.md");
    assert(mdClaude.includes("Claude Code"), "InstallMD: Claude Code title");
    assert(mdClaude.includes("npm install -g @anthropic-ai/claude-code"), "InstallMD: Claude Code install command");
});

// ──────────────────────────────────────────────
// 10. OS Paths Tests
// ──────────────────────────────────────────────
runTestGroup("OS Paths Tests", () => {
    const allToolPaths = ["continue", "cursor", "windsurf", "zed", "aider", "copilot",
                          "amazon_q", "opencode", "antigravity", "claude_code", "cline", "codeium"];

    allToolPaths.forEach(id => {
        assert(OS_PATHS["win32"][id], `OS_PATHS: win32/${id} exists`);
        assert(OS_PATHS["darwin"][id], `OS_PATHS: darwin/${id} exists`);
    });

    assert(OS_PATHS["win32"]["opencode"].includes("AppData"), "OS_PATHS: Win opencode contains AppData");
    assert(OS_PATHS["darwin"]["opencode"].includes("~/.config"), "OS_PATHS: Mac opencode contains ~/.config");
    assert(OS_PATHS["win32"]["continue"].includes(".continue"), "OS_PATHS: Win continue path");
    assert(OS_PATHS["darwin"]["zed"].includes(".config/zed"), "OS_PATHS: Mac zed path");
    assert(OS_PATHS["win32"]["antigravity"].includes("settings.yaml"), "OS_PATHS: Win antigravity path");
    assert(OS_PATHS["darwin"]["cline"].includes(".clinerules"), "OS_PATHS: Mac cline path");
    assert(OS_PATHS["win32"]["cursor"].includes(".cursorrules"), "OS_PATHS: Win cursor path");
    assert(OS_PATHS["darwin"]["windsurf"].includes(".windsurfrules"), "OS_PATHS: Mac windsurf path");
});

// ──────────────────────────────────────────────
// 11. Auth Tests
// ──────────────────────────────────────────────
runTestGroup("Auth Tests", () => {
    assert(typeof checkAuth === 'function', "Auth: checkAuth is function");
    assert(typeof isAuthenticated === 'function', "Auth: isAuthenticated is function");
    assert(typeof login === 'function', "Auth: login is function");
    assert(typeof loginWithCode === 'function', "Auth: loginWithCode is function");
    assert(typeof logout === 'function', "Auth: logout is function");
    assert(typeof getUser === 'function', "Auth: getUser is function");
});

// ──────────────────────────────────────────────
// 12. API Tests
// ──────────────────────────────────────────────
runTestGroup("API Tests", () => {
    assert(typeof fetchLiveFreeModels === 'function', "API: fetchLiveFreeModels is function");

    // verifyUpdateWindow tests
    assert(typeof verifyUpdateWindow === 'function', "API: verifyUpdateWindow is function");

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const fiveWeeks = 35 * 24 * 60 * 60 * 1000;

    assert(verifyUpdateWindow(new Date(now - oneDay).toISOString()) === true, "API: 1 day ago within window");
    assert(verifyUpdateWindow(new Date(now - 27 * oneDay).toISOString()) === true, "API: 27 days within window");
    assert(verifyUpdateWindow(new Date(now - fiveWeeks).toISOString()) === false, "API: 35 days outside window");
    assert(verifyUpdateWindow(new Date(now).toISOString()) === true, "API: Today within window");
});

// ──────────────────────────────────────────────
// 13. Cross-Module Integration Tests
// ──────────────────────────────────────────────
runTestGroup("Integration Tests", () => {
    // getBestModels -> generateConfig pipeline
    const models = getBestModels('python', 'coding');
    assert(models.length > 0, "Integration: Python models available");

    const config = generateConfig("opencode", models, "basic");
    const parsed = JSON.parse(config);
    assert(parsed.models[0].provider === "openrouter", "Integration: Provider is openrouter");

    const hasValidModel = models.some(([id]) => {
        try {
            JSON.parse(generateConfig("opencode", [[id, MODEL_MAPPING[id]]], "basic"));
            return true;
        } catch { return false; }
    });
    assert(hasValidModel, "Integration: At least one model generates valid config");

    // All tools generate valid config with first model
    const firstModel = Object.entries(MODEL_MAPPING)[0];
    Object.keys(TOOL_TEMPLATES).forEach(toolId => {
        const result = generateConfig(toolId, [firstModel], "basic");
        assert(result && result.length > 0, `Integration: ${toolId} generates non-empty config`);
    });

    // All model IDs in mapping are unique
    const ids = Object.keys(MODEL_MAPPING);
    assert(new Set(ids).size === ids.length, "Integration: All model IDs unique");
});

// ──────────────────────────────────────────────
console.log(`\n=== TEST SUMMARY ===`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed > 0) process.exit(1);
console.log("\n=== ALL TESTS PASSED ===");
