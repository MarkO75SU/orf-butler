import { DAILY_PROMPTS, getPromptOfDay, generateRSS } from '../public/js/prompts.js';
import { MODEL_MAPPING, getBestModels, MODEL_HISTORY } from '../public/js/mapping.js';
import { TOOL_TEMPLATES, generateConfig } from '../public/js/templates.js';
import { generateInstallMD, CLI_COMMANDS, OS_PATHS } from '../public/js/docs.js';
import { fetchLiveFreeModels } from '../public/js/api.js';
import { BMC_URL } from '../public/js/config.js';
import fs from 'fs';

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

const asyncGroups = [];
function runAsyncTestGroup(name, fn) {
    asyncGroups.push({ name, fn });
}

console.log("=== RUNNING ALL TESTS ===\n");

// ──────────────────────────────────────────────
// 1. Prompt Tests
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
// 2. Mapping Tests
// ──────────────────────────────────────────────
runTestGroup("Mapping Tests", () => {
    const ids = Object.keys(MODEL_MAPPING);
    assert(ids.length > 0, "Mapping: database is not empty");

    // The daily model update swaps IDs – check structure instead of hardcoded IDs
    Object.entries(MODEL_MAPPING).forEach(([id, m]) => {
        assert(m.role, `Mapping: ${id} has role`);
        assert(m.desc, `Mapping: ${id} has desc`);
        assert(m.context, `Mapping: ${id} has context`);
        assert(!('role_de' in m), `Mapping: ${id} has no role_de`);
        assert(!('desc_de' in m), `Mapping: ${id} has no desc_de`);
        assert(!('desc_en' in m), `Mapping: ${id} has no desc_en`);
        assert(Array.isArray(m.languages) && m.languages.length > 0, `Mapping: ${id} has languages`);
        assert(Array.isArray(m.tags) && m.tags.length > 0, `Mapping: ${id} has tags`);
        assert(id.endsWith(':free'), `Mapping: ${id} ends with :free`);
    });

    const withJs = ids.filter(id => MODEL_MAPPING[id].languages.includes('javascript'));
    const withPy = ids.filter(id => MODEL_MAPPING[id].languages.includes('python'));
    assert(withJs.length > 0, "Mapping: at least one model includes JS");
    assert(withPy.length > 0, "Mapping: at least one model includes Python");
});

// ──────────────────────────────────────────────
// 3. getBestModels Tests
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
    assert(Array.isArray(rustModels), "getBestModels: Returns array for Rust");

    const allModels = getBestModels('unknown', 'any');
    assert(allModels.length >= 10, "getBestModels: Unknown lang returns default slice");
});

// ──────────────────────────────────────────────
// 4. Model History Tests
// ──────────────────────────────────────────────
runTestGroup("Model History Tests", () => {
    assert(MODEL_HISTORY.length >= 12, "History: 12+ archived models");
    assert(MODEL_HISTORY.every(m => m.id), "History: All have ID");
    assert(MODEL_HISTORY.every(m => m.role), "History: All have role");
    assert(MODEL_HISTORY.every(m => m.desc), "History: All have desc");
    assert(MODEL_HISTORY.every(m => !('role_de' in m)), "History: No role_de");
    assert(MODEL_HISTORY.every(m => !('desc_de' in m)), "History: No desc_de");
    assert(MODEL_HISTORY.every(m => m.available), "History: All have available period");
    assert(MODEL_HISTORY.every(m => m.reason), "History: All have removal reason");
    assert(MODEL_HISTORY.every(m => !('reason_de' in m)), "History: No reason_de");
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
// 5. Templates Tests
// ──────────────────────────────────────────────
runTestGroup("Templates Tests", () => {
    const allTools = ["opencode", "continue", "zed", "aider", "antigravity",
                      "cursor", "windsurf", "claude_code", "github_copilot", "cline", "codeium"];
    allTools.forEach(id => assert(TOOL_TEMPLATES[id], `Templates: ${id} exists`));

    Object.entries(TOOL_TEMPLATES).forEach(([id, tool]) => {
        assert(tool.name, `Templates: ${id} has name`);
        assert(tool.config_file, `Templates: ${id} has config_file`);
        assert(tool.type, `Templates: ${id} has type`);
        assert(tool.status, `Templates: ${id} has status`);
        assert(tool.desc, `Templates: ${id} has desc`);
        assert(!('desc_en' in tool) && !('desc_de' in tool), `Templates: ${id} has no legacy desc fields`);
        assert(["stable", "partial"].includes(tool.status), `Templates: ${id} status valid`);
        assert(["json_global", "json_merge", "yaml_config", "instruction_paste", "opencode"].includes(tool.type), `Templates: ${id} type valid`);
    });

    assert(TOOL_TEMPLATES["opencode"].type === "opencode", "Templates: OpenCode type opencode");
    assert(TOOL_TEMPLATES["aider"].type === "yaml_config", "Templates: Aider type yaml_config");
    assert(TOOL_TEMPLATES["cursor"].type === "instruction_paste", "Templates: Cursor type instruction_paste");
    assert(TOOL_TEMPLATES["antigravity"].status === "partial", "Templates: Antigravity status partial");
    assert(TOOL_TEMPLATES["ollama"] === undefined, "Templates: Ollama NOT a template");
});

// ──────────────────────────────────────────────
// 6. Config Generation Tests
// ──────────────────────────────────────────────
runTestGroup("Config Generation Tests", () => {
    const [testId, testData] = Object.entries(MODEL_MAPPING)[0];
    const testModels = [[testId, testData]];

    // JSON type (continue)
    const jsonConfig = generateConfig("continue", testModels, "standard");
    const parsedJson = JSON.parse(jsonConfig);
    assert(parsedJson.models[0].model === testId, "generateConfig: JSON model correct");
    assert(parsedJson.models[0].provider === "openrouter", "generateConfig: JSON provider correct");
    assert(!parsedJson.models[0].system_prompt, "generateConfig: Standard no system_prompt");

    // OpenCode type
    const opencodeConfig = generateConfig("opencode", testModels, "standard");
    const parsedOpencode = JSON.parse(opencodeConfig);
    assert(parsedOpencode.provider.openrouter.options.apiKey === "YOUR_API_KEY_HERE", "generateConfig: OpenCode has apiKey");
    assert(parsedOpencode.model === testId, "generateConfig: OpenCode model");

    // Full JSON
    const fm = [{ ...testData, system_prompt: "You are an expert." }];
    const fullConfig = generateConfig("continue", [["test/model", fm[0]]], "full");
    const parsedFull = JSON.parse(fullConfig);
    assert(parsedFull.models[0].system_prompt === "You are an expert.", "generateConfig: Full has system_prompt");

    // YAML type (aider)
    const yamlConfig = generateConfig("aider", testModels, "standard");
    assert(yamlConfig.includes("model:"), "generateConfig: YAML contains model");
    assert(yamlConfig.includes("openrouter/"), "generateConfig: YAML contains openrouter/");
    assert(yamlConfig.includes("endpoint:"), "generateConfig: YAML contains endpoint");

    // Instruction type (cursor)
    const instrConfig = generateConfig("cursor", testModels, "standard");
    assert(instrConfig.includes("ORF-Butler"), "generateConfig: Instruction contains ORF-Butler");
    assert(instrConfig.includes("professional coder"), "generateConfig: Instruction contains prompt text");

    // Full instruction
    const fullInstr = generateConfig("cursor", [["test/model", fm[0]]], "full");
    assert(fullInstr.includes("You are an expert."), "generateConfig: Full instruction has system_prompt");
});

// ──────────────────────────────────────────────
// 7. CLI Commands Tests
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
    assert(CLI_COMMANDS["opencode"].install.linux === "npm install -g opencode-ai", "CLI: OpenCode Linux install");
    assert(CLI_COMMANDS["claude_code"].install.win32 === "winget install Anthropic.ClaudeCode", "CLI: Claude Code install");
    assert(CLI_COMMANDS["cline"].install.darwin === "npm install -g cline", "CLI: Cline Mac install");
});

// ──────────────────────────────────────────────
// 8. InstallMD Tests
// ──────────────────────────────────────────────
runTestGroup("InstallMD Tests", () => {
    const md = generateInstallMD({ id: "opencode", name: "OpenCode", config_file: ".opencode.json" }, "win32", "standard", "C:\\test");
    assert(md.includes("Setup Guide"), "InstallMD: Title");
    assert(md.includes("npm install -g opencode-ai"), "InstallMD: Win install command");
    assert(md.includes("YOUR_API_KEY_HERE"), "InstallMD: API placeholder");
    assert(md.includes("C:\\test"), "InstallMD: Win path in body");
    assert(!md.includes("Setup-Anleitung"), "InstallMD: no German title");

    const mdMac = generateInstallMD({ id: "opencode", name: "OpenCode", config_file: ".opencode.json" }, "darwin", "standard", "~/.config");
    assert(mdMac.includes("npm install -g opencode-ai"), "InstallMD: Mac install command");
    assert(mdMac.includes("~/.config"), "InstallMD: Mac path in body");

    const mdClaude = generateInstallMD({ id: "claude_code", name: "Claude Code", config_file: "CLAUDE.md" }, "darwin", "standard", "~/CLAUDE.md");
    assert(mdClaude.includes("Claude Code"), "InstallMD: Claude Code title");
    assert(mdClaude.includes("curl -fsSL https://claude.ai/install.sh | bash"), "InstallMD: Claude Code install command");

    const mdFull = generateInstallMD({ id: "opencode", name: "OpenCode", config_file: ".opencode.json" }, "win32", "full", "C:\\test");
    assert(mdFull.includes("Full Bundle Features"), "InstallMD: Full bundle section");
});

// ──────────────────────────────────────────────
// 9. OS Paths Tests
// ──────────────────────────────────────────────
runTestGroup("OS Paths Tests", () => {
    const allToolPaths = ["continue", "cursor", "windsurf", "zed", "aider", "github_copilot",
                          "opencode", "antigravity", "claude_code", "cline", "codeium",
                          "roocode", "litellm", "cody", "tabby"];
    const platforms = ["win32", "darwin", "linux"];

    allToolPaths.forEach(id => {
        platforms.forEach(p => assert(OS_PATHS[p][id], `OS_PATHS: ${p}/${id} exists`));
    });

    Object.keys(TOOL_TEMPLATES).forEach(id => {
        platforms.forEach(p => assert(OS_PATHS[p][id], `OS_PATHS parity: ${p} covers template ${id}`));
    });

    assert(!OS_PATHS["win32"]["amazon_q"], "OS_PATHS: amazon_q removed");
    assert(OS_PATHS["win32"]["github_copilot"].includes("copilot-instructions"), "OS_PATHS: Win github_copilot path");

    assert(OS_PATHS["win32"]["opencode"].includes(".config"), "OS_PATHS: Win opencode contains .config");
    assert(OS_PATHS["darwin"]["opencode"].includes("~/.config"), "OS_PATHS: Mac opencode contains ~/.config");
    assert(OS_PATHS["win32"]["continue"].includes(".continue"), "OS_PATHS: Win continue path");
    assert(OS_PATHS["darwin"]["continue"].includes("~/.continue"), "OS_PATHS: Mac continue path is absolute");
    assert(OS_PATHS["darwin"]["zed"].includes(".config/zed"), "OS_PATHS: Mac zed path");
    assert(OS_PATHS["win32"]["antigravity"].includes("settings.yaml"), "OS_PATHS: Win antigravity path");
    assert(OS_PATHS["darwin"]["cline"].includes(".clinerules"), "OS_PATHS: Mac cline path");
    assert(OS_PATHS["win32"]["cursor"].includes(".cursorrules"), "OS_PATHS: Win cursor path");
    assert(OS_PATHS["darwin"]["windsurf"].includes(".windsurfrules"), "OS_PATHS: Mac windsurf path");

    // No drift: config_file (target name) must match the OS path name
    const baseName = (s) => String(s).replace(/\s*\(.*?\)\s*$/, '').split(/[\\/]/).pop();
    Object.keys(TOOL_TEMPLATES).forEach(id => {
        const expected = baseName(TOOL_TEMPLATES[id].config_file);
        platforms.forEach(p => {
            assert(baseName(OS_PATHS[p][id]) === expected,
                `OS_PATHS/config_file parity: ${p}/${id} -> ${expected}`);
        });
    });
});

// ──────────────────────────────────────────────
// 10. API Tests
// ──────────────────────────────────────────────
runTestGroup("API Tests", () => {
    assert(typeof fetchLiveFreeModels === 'function', "API: fetchLiveFreeModels is function");
});

// ──────────────────────────────────────────────
// 12. Cross-Module Integration Tests
// ──────────────────────────────────────────────
runTestGroup("Integration Tests", () => {
    // getBestModels -> generateConfig pipeline
    const models = getBestModels('python', 'coding');
    assert(models.length > 0, "Integration: Python models available");

    const config = generateConfig("opencode", models, "standard");
    const parsed = JSON.parse(config);
    assert(parsed.provider.openrouter.options.apiKey === "YOUR_API_KEY_HERE", "Integration: OpenCode has openrouter provider");

    const hasValidModel = models.some(([id]) => {
        try {
            JSON.parse(generateConfig("opencode", [[id, MODEL_MAPPING[id]]], "standard"));
            return true;
        } catch { return false; }
    });
    assert(hasValidModel, "Integration: At least one model generates valid config");

    // All tools generate valid config with first model
    const firstModel = Object.entries(MODEL_MAPPING)[0];
    Object.keys(TOOL_TEMPLATES).forEach(toolId => {
        const result = generateConfig(toolId, [firstModel], "standard");
        assert(result && result.length > 0, `Integration: ${toolId} generates non-empty config`);
    });

    // All model IDs in mapping are unique
    const ids = Object.keys(MODEL_MAPPING);
    assert(new Set(ids).size === ids.length, "Integration: All model IDs unique");
});

// ──────────────────────────────────────────────
// 13. App Strategy Tests (BMC instead of paywall, no admin panel)
// ──────────────────────────────────────────────
runTestGroup("App Strategy Tests", () => {
    const appSrc = fs.readFileSync(new URL('../public/js/app.js', import.meta.url), 'utf-8');
    const m = appSrc.match(/const texts = \{[\s\S]*?\n\};/);
    assert(!!m, "App: texts object found in app.js");
    const texts = new Function(m[0] + '\nreturn texts;')();

    ['bundleFree', 'thanksTitle', 'thanksText', 'thanksBtn', 'thanksClose'].forEach(k => {
        assert(!!texts[k], `App: strategy key "${k}" present`);
    });

    assert(!appSrc.includes("from './i18n.js'"), "App: no i18n import in app.js");
    assert(!appSrc.includes('translations'), "App: no translations object in app.js");
    assert(!appSrc.includes('isAdmin'), "App: no admin logic in app.js");
    assert(!appSrc.includes('openCodesPanel'), "App: no codes panel in app.js");
    assert(!appSrc.includes('5€') && !appSrc.includes('20€'), "App: no price strings in app.js");
    assert(appSrc.includes("'standard'") && appSrc.includes("'full'"), "App: standard/full bundle keys");
    assert(!appSrc.includes('premium'), "App: no premium references in app.js");

    const appHtml = fs.readFileSync(new URL('../public/app.html', import.meta.url), 'utf-8');
    assert(!appHtml.includes('codes-modal'), "App: no codes modal in app.html");
    assert(!appHtml.includes('admin-badge'), "App: no admin badge in app.html");
    assert(!appHtml.includes('5€') && !appHtml.includes('20€'), "App: no price strings in app.html");
    assert(appHtml.includes('thanks-modal'), "App: thanks modal present in app.html");
    assert(appHtml.includes('data-bmc="header"'), "App: BMC header link present");
    assert(appHtml.includes('bundle-standard') && appHtml.includes('bundle-full'), "App: standard/full bundle buttons");
    assert(appHtml.includes('lang="en"'), "App: English-only lang attribute");

    const landing = fs.readFileSync(new URL('../public/landing.html', import.meta.url), 'utf-8');
    assert(!landing.includes('5€') && !landing.includes('20€'), "Landing: no price strings");
    assert(landing.includes('data-bmc="landing"'), "Landing: BMC support link present");
    assert(!landing.includes('Registrierung testen'), "Landing: admin test mode removed");
    assert(landing.includes('lang="en"'), "Landing: English-only lang attribute");

    assert(BMC_URL.includes('buymeacoffee.com'), "BMC: placeholder URL configured");
    assert(BMC_URL === 'https://www.buymeacoffee.com/DEIN-NAME', "BMC: placeholder not yet replaced");
});

// ──────────────────────────────────────────────
// 14. Installer Tests (project folder search + scope parity)
// ──────────────────────────────────────────────
runTestGroup("Installer Tests", () => {
    const read = p => fs.readFileSync(new URL(p, import.meta.url), 'utf-8');
    const node = read('../public/scripts/auto-install.js');
    const bat = read('../public/scripts/auto-install-win.bat');
    const sh = read('../public/scripts/auto-install-linux.sh');
    const mac = read('../public/scripts/auto-install-mac.command');
    const appSrc = read('../public/js/app.js');

    const installers = { node, bat, sh, mac };

    // Parity: every tool template appears as a toolkey in all four installers
    Object.keys(TOOL_TEMPLATES).forEach(id => {
        Object.entries(installers).forEach(([name, src]) => {
            assert(src.includes(`"${id}"`), `Installer ${name}: toolkey ${id} present`);
        });
    });
    Object.entries(installers).forEach(([name, src]) => {
        assert(!src.includes('amazon_q'), `Installer ${name}: amazon_q removed`);
        assert(!src.includes('DEIN_API_KEY_HERE'), `Installer ${name}: no German API placeholder`);
    });

    // Node installer: scope fields + project folder functions
    assert(node.includes("scope: 'global'") && node.includes("scope: 'project'"), "Installer node: scope global/project");
    assert(node.includes('findProjectRoots') && node.includes('chooseProjectRoot'), "Installer node: project folder functions");
    assert(node.includes('detectOS'), "Installer node: detectOS exported");
    assert(node.includes('YOUR_API_KEY_HERE'), "Installer node: English API placeholder");

    // Batch installer
    assert(bat.includes(':choose_project'), "Installer bat: choose_project subroutine");
    assert(bat.includes('set PROJECT_ROOT='), "Installer bat: PROJECT_ROOT");
    assert(bat.includes('NEED_PROJECT'), "Installer bat: NEED_PROJECT detection");
    assert(bat.includes('if /i "%~5"=="project"'), "Installer bat: scope-aware safe_copy");
    assert(bat.includes('\r\n'), "Installer bat: CRLF line endings (gitattributes eol=crlf)");

    // Shell installers (Linux + Mac)
    [['linux', sh], ['mac', mac]].forEach(([name, src]) => {
        assert(src.includes('choose_project_root'), `Installer ${name}: choose_project_root function`);
        assert(src.includes('find_project_roots'), `Installer ${name}: find_project_roots function`);
        assert(src.includes('PROJECT_ROOT='), `Installer ${name}: PROJECT_ROOT`);
        assert(src.includes('NEED_PROJECT'), `Installer ${name}: NEED_PROJECT detection`);
        assert(src.includes('"$SCOPE" = "project"'), `Installer ${name}: scope-aware try_copy`);
    });

    // Auto-install readme documents the project folder (English-only)
    assert(appSrc.includes('Project Folder'), "Installer readme: Project Folder section");
    assert(!appSrc.includes('Projektordner'), "Installer readme: no German section");
});

// Run async groups (before the summary)
for (const { name, fn } of asyncGroups) {
    console.log(`\n--- ${name} ---`);
    try { await fn(); } catch (error) { failed++; console.error(`\n${error.message}`); }
}

// ──────────────────────────────────────────────
console.log(`\n=== TEST SUMMARY ===`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed > 0) process.exit(1);
console.log("\n=== ALL TESTS PASSED ===");
