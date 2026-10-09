import { TRANSLATIONS, setLanguage, getLang, t } from '../js/i18n.js';
import { DAILY_PROMPTS, getPromptOfDay, generateRSS } from '../js/prompts.js';
import { MODEL_MAPPING, getBestModels, MODEL_HISTORY } from '../js/mapping.js';
import { TOOL_TEMPLATES, generateConfig } from '../js/templates.js';
import { generateInstallMD, CLI_COMMANDS, OS_PATHS } from '../js/docs.js';
import { isAuthenticated, login, logout, getUser } from '../js/auth.js';
import { fetchLiveFreeModels, verifyUpdateWindow } from '../js/api.js';
import { BMC_URL } from '../js/config.js';
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

    // Tägliches Model-Update tauscht IDs aus – Struktur statt Hardcoded-IDs prüfen
    Object.entries(MODEL_MAPPING).forEach(([id, m]) => {
        assert(m.role, `Mapping: ${id} has role`);
        assert(m.role_de, `Mapping: ${id} has role_de`);
        assert(m.desc_en, `Mapping: ${id} has desc_en`);
        assert(m.desc_de, `Mapping: ${id} has desc_de`);
        assert(m.context, `Mapping: ${id} has context`);
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
    assert(Array.isArray(rustModels), "getBestModels: Returns array for Rust");

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
    const allTools = ["opencode", "continue", "zed", "aider", "antigravity",
                      "cursor", "windsurf", "claude_code", "github_copilot", "cline", "codeium"];
    allTools.forEach(id => assert(TOOL_TEMPLATES[id], `Templates: ${id} exists`));

    Object.entries(TOOL_TEMPLATES).forEach(([id, tool]) => {
        assert(tool.name, `Templates: ${id} has name`);
        assert(tool.config_file, `Templates: ${id} has config_file`);
        assert(tool.type, `Templates: ${id} has type`);
        assert(tool.status, `Templates: ${id} has status`);
        assert(tool.desc, `Templates: ${id} has desc`);
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
// 7. Config Generation Tests
// ──────────────────────────────────────────────
runTestGroup("Config Generation Tests", () => {
    const [testId, testData] = Object.entries(MODEL_MAPPING)[0];
    const testModels = [[testId, testData]];

    // JSON type (continue)
    const jsonConfig = generateConfig("continue", testModels, "basic");
    const parsedJson = JSON.parse(jsonConfig);
    assert(parsedJson.models[0].model === testId, "generateConfig: JSON model correct");
    assert(parsedJson.models[0].provider === "openrouter", "generateConfig: JSON provider correct");
    assert(!parsedJson.models[0].system_prompt, "generateConfig: Basic no system_prompt");

    // OpenCode type
    const opencodeConfig = generateConfig("opencode", testModels, "basic");
    const parsedOpencode = JSON.parse(opencodeConfig);
    assert(parsedOpencode.provider.openrouter.options.apiKey === "DEIN_API_KEY_HERE", "generateConfig: OpenCode has apiKey");
    assert(parsedOpencode.model === testId, "generateConfig: OpenCode model");

    // Premium JSON
    const pm = [{ ...testData, premium_prompt: "You are an expert." }];
    const premConfig = generateConfig("continue", [["test/model", pm[0]]], "premium");
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
    assert(CLI_COMMANDS["opencode"].install.linux === "npm install -g opencode-ai", "CLI: OpenCode Linux install");
    assert(CLI_COMMANDS["claude_code"].install.win32 === "winget install Anthropic.ClaudeCode", "CLI: Claude Code install");
    assert(CLI_COMMANDS["cline"].install.darwin === "npm install -g cline", "CLI: Cline Mac install");
});

// ──────────────────────────────────────────────
// 9. InstallMD Tests
// ──────────────────────────────────────────────
runTestGroup("InstallMD Tests", () => {
    const md = generateInstallMD({ id: "opencode", name: "OpenCode", config_file: ".opencode.json" }, "win32", "basic", "C:\\test");
    assert(md.includes("Setup-Anleitung"), "InstallMD: Title");
    assert(md.includes("npm install -g opencode-ai"), "InstallMD: Win install command");
    assert(md.includes("DEIN_API_KEY_HERE"), "InstallMD: API placeholder");
    assert(md.includes("C:\\test"), "InstallMD: Win path in body");

    const mdMac = generateInstallMD({ id: "opencode", name: "OpenCode", config_file: ".opencode.json" }, "darwin", "basic", "~/.config");
    assert(mdMac.includes("npm install -g opencode-ai"), "InstallMD: Mac install command");
    assert(mdMac.includes("~/.config"), "InstallMD: Mac path in body");

    const mdClaude = generateInstallMD({ id: "claude_code", name: "Claude Code", config_file: "CLAUDE.md" }, "darwin", "basic", "~/CLAUDE.md");
    assert(mdClaude.includes("Claude Code"), "InstallMD: Claude Code title");
    assert(mdClaude.includes("curl -fsSL https://claude.ai/install.sh | bash"), "InstallMD: Claude Code install command");
});

// ──────────────────────────────────────────────
// 10. OS Paths Tests
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

    // Kein Drift: config_file (Zielname) muss zum OS-Pfad-Namen passen
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
// 11. Auth Tests
// ──────────────────────────────────────────────
runTestGroup("Auth Tests", () => {
    assert(typeof isAuthenticated === 'function', "Auth: isAuthenticated is function");
    assert(typeof login === 'function', "Auth: login is function");
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
    assert(parsed.provider.openrouter.options.apiKey === "DEIN_API_KEY_HERE", "Integration: OpenCode has openrouter provider");

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
// 14. App-Strategie Tests (BMC statt Paywall, kein Admin-Panel)
// ──────────────────────────────────────────────
runTestGroup("App Strategy Tests", () => {
    const appSrc = fs.readFileSync(new URL('../js/app.js', import.meta.url), 'utf-8');
    const m = appSrc.match(/const translations = \{[\s\S]*?\n\};/);
    assert(!!m, "App: translations object found in app.js");
    const translations = new Function(m[0] + '\nreturn translations;')();

    const deKeys = Object.keys(translations.de).sort();
    const enKeys = Object.keys(translations.en).sort();
    assert(deKeys.length === enKeys.length, `App i18n: DE/EN key count equal (${deKeys.length})`);
    assert(JSON.stringify(deKeys) === JSON.stringify(enKeys), "App i18n: DE/EN keys identical");

    ['adminBadge', 'codesTitle', 'codesGenerate', 'codesThUser', 'promptAdminPassword', 'confirmRevoke', 'confirmReset']
        .forEach(k => {
            assert(!(k in translations.de) && !(k in translations.en), `App i18n: removed key "${k}" gone`);
        });

    ['bundleFree', 'thanksTitle', 'thanksText', 'thanksBtn', 'thanksClose'].forEach(k => {
        assert(!!translations.de[k] && !!translations.en[k], `App i18n: strategy key "${k}" present DE+EN`);
    });

    assert(!appSrc.includes('isAdmin'), "App: no admin logic in app.js");
    assert(!appSrc.includes('openCodesPanel'), "App: no codes panel in app.js");
    assert(!appSrc.includes('5€') && !appSrc.includes('20€'), "App: no price strings in app.js");

    const appHtml = fs.readFileSync(new URL('../../app.html', import.meta.url), 'utf-8');
    assert(!appHtml.includes('codes-modal'), "App: no codes modal in app.html");
    assert(!appHtml.includes('admin-badge'), "App: no admin badge in app.html");
    assert(!appHtml.includes('5€') && !appHtml.includes('20€'), "App: no price strings in app.html");
    assert(appHtml.includes('thanks-modal'), "App: thanks modal present in app.html");
    assert(appHtml.includes('data-bmc="header"'), "App: BMC header link present");

    const landing = fs.readFileSync(new URL('../../landing.html', import.meta.url), 'utf-8');
    assert(!landing.includes('5€') && !landing.includes('20€'), "Landing: no price strings");
    assert(landing.includes('data-bmc="landing"'), "Landing: BMC support link present");
    assert(!landing.includes('Registrierung testen'), "Landing: admin test mode removed");

    assert(BMC_URL.includes('buymeacoffee.com'), "BMC: placeholder URL configured");
    assert(BMC_URL === 'https://www.buymeacoffee.com/DEIN-NAME', "BMC: placeholder not yet replaced");
});

// ──────────────────────────────────────────────
// 15. Installer Tests (Projektordner-Suche + Scope-Parität)
// ──────────────────────────────────────────────
runTestGroup("Installer Tests", () => {
    const read = p => fs.readFileSync(new URL(p, import.meta.url), 'utf-8');
    const node = read('../../scripts/auto-install.js');
    const bat = read('../../scripts/auto-install-win.bat');
    const sh = read('../../scripts/auto-install-linux.sh');
    const mac = read('../../scripts/auto-install-mac.command');
    const appSrc = read('../js/app.js');

    const installers = { node, bat, sh, mac };

    // Parität: jedes Tool-Template kommt als Toolkey in allen vier Installern vor
    Object.keys(TOOL_TEMPLATES).forEach(id => {
        Object.entries(installers).forEach(([name, src]) => {
            assert(src.includes(`"${id}"`), `Installer ${name}: toolkey ${id} present`);
        });
    });
    Object.entries(installers).forEach(([name, src]) => {
        assert(!src.includes('amazon_q'), `Installer ${name}: amazon_q removed`);
    });

    // Node-Installer: Scope-Felder + Projektordner-Funktionen
    assert(node.includes("scope: 'global'") && node.includes("scope: 'project'"), "Installer node: scope global/project");
    assert(node.includes('findProjectRoots') && node.includes('chooseProjectRoot'), "Installer node: project folder functions");
    assert(node.includes('detectOS'), "Installer node: detectOS exported");

    // Batch-Installer
    assert(bat.includes(':choose_project'), "Installer bat: choose_project subroutine");
    assert(bat.includes('set PROJECT_ROOT='), "Installer bat: PROJECT_ROOT");
    assert(bat.includes('NEED_PROJECT'), "Installer bat: NEED_PROJECT detection");
    assert(bat.includes('if /i "%~5"=="project"'), "Installer bat: scope-aware safe_copy");
    assert(bat.includes('\r\n'), "Installer bat: CRLF line endings (gitattributes eol=crlf)");

    // Shell-Installer (Linux + Mac)
    [['linux', sh], ['mac', mac]].forEach(([name, src]) => {
        assert(src.includes('choose_project_root'), `Installer ${name}: choose_project_root function`);
        assert(src.includes('find_project_roots'), `Installer ${name}: find_project_roots function`);
        assert(src.includes('PROJECT_ROOT='), `Installer ${name}: PROJECT_ROOT`);
        assert(src.includes('NEED_PROJECT'), `Installer ${name}: NEED_PROJECT detection`);
        assert(src.includes('"$SCOPE" = "project"'), `Installer ${name}: scope-aware try_copy`);
    });

    // README-AUTOINSTALL (DE/EN) dokumentiert den Projektordner
    assert(appSrc.includes('Projektordner'), "Installer readme: DE Projektordner section");
    assert(appSrc.includes('Project Folder'), "Installer readme: EN Project Folder section");
});

// ──────────────────────────────────────────────
// HTTP + Store + Codes-API Tests (async)
// ──────────────────────────────────────────────
runAsyncTestGroup("HTTP Helper Tests", async () => {
    const { applyCors, handlePreflight, methodGuard, clientIp } = await import('../../lib/http.js');

    const headers = {};
    applyCors({ setHeader: (k, v) => { headers[k] = v; } });
    assert(headers['Access-Control-Allow-Origin'] === '*', "http: applyCors sets wildcard origin");

    let ended = false, statusCode = null;
    const resOpt = {
        status: (c) => { statusCode = c; return { end: () => { ended = true; }, json: () => {} }; },
        end: () => { ended = true; }
    };
    assert(handlePreflight({ method: 'OPTIONS' }, resOpt) === true, "http: preflight handles OPTIONS");
    assert(ended && statusCode === 200, "http: preflight ends 200");

    let jsonBody = null;
    const res405 = { status: (c) => ({ json: (b) => { statusCode = c; jsonBody = b; } }) };
    assert(methodGuard({ method: 'GET' }, res405, 'POST') === true, "http: methodGuard blocks wrong method");
    assert(statusCode === 405 && jsonBody && jsonBody.error, "http: methodGuard returns 405");
    assert(methodGuard({ method: 'POST' }, res405, 'POST') === false, "http: methodGuard allows correct method");

    assert(clientIp({ headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' } }) === '1.2.3.4', "http: clientIp parses x-forwarded-for");
    assert(clientIp({ headers: {}, socket: { remoteAddress: '9.9.9.9' } }) === '9.9.9.9', "http: clientIp falls back to socket");
});

// Async-Gruppen ausführen (vor der Zusammenfassung)
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
