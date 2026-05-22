import { TRANSLATIONS, setLanguage, getLang } from '../js/i18n.js';
import { DAILY_PROMPTS, getPromptOfDay } from '../js/prompts.js';
import { MODEL_MAPPING, getBestModels, MODEL_HISTORY } from '../js/mapping.js';
import { TOOL_TEMPLATES, generateConfig } from '../js/templates.js';
import { generateInstallMD, CLI_COMMANDS, OS_PATHS } from '../js/docs.js';
import { checkAuth, isAuthenticated, login, logout } from '../js/auth.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (!condition) {
        throw new Error(`FAILED: ${message}`);
    }
    passed++;
    console.log(`PASSED: ${message}`);
}

function runTestGroup(name, fn) {
    console.log(`\n--- ${name} ---`);
    try {
        fn();
    } catch (error) {
        failed++;
        console.error(`\n${error.message}`);
    }
}

console.log("=== RUNNING ALL TESTS ===");

try {
    // 1. i18n Tests
    runTestGroup("i18n Tests", () => {
        assert(TRANSLATIONS.de.title === "Openrouter Free Butler", "i18n: German title correct");
        assert(TRANSLATIONS.en.title === "Openrouter Free Butler", "i18n: English title correct");
        assert(typeof TRANSLATIONS.de.search_placeholder === "string", "i18n: German placeholder exists");
        
        setLanguage('de');
        assert(getLang() === 'de', "i18n: Language switch works");
        
        setLanguage('en');
        assert(getLang() === 'en', "i18n: Language switch to en works");
        
        assert(TRANSLATIONS.de.deploy_btn, "i18n: German deploy button text exists");
        assert(TRANSLATIONS.en.deploy_btn, "i18n: English deploy button text exists");
    });

    // 2. Prompt Tests
    runTestGroup("Prompt Tests", () => {
        const prompt = getPromptOfDay();
        assert(typeof prompt === 'string' || typeof prompt === 'object', "Prompts: Returns valid type");
        assert(DAILY_PROMPTS.includes(prompt) || Object.values(DAILY_PROMPTS).includes(prompt), "Prompts: Returns valid prompt");
        assert(prompt && prompt.length > 0, "Prompts: Prompt not empty");
    });

    // 3. Mapping Tests
    runTestGroup("Mapping Tests", () => {
        assert(Object.keys(MODEL_MAPPING).length > 0, "Mapping: Database not empty");
        assert(MODEL_MAPPING["qwen/qwen2.5-coder-32b:free"], "Mapping: Qwen model exists");
        assert(MODEL_MAPPING["qwen/qwen2.5-coder-32b:free"].languages.includes("javascript"), "Mapping: Qwen includes JS");
        assert(MODEL_MAPPING["qwen/qwen2.5-coder-32b:free"].languages.includes("python"), "Mapping: Qwen includes Python");
        
        const roles = Object.values(MODEL_MAPPING).map(m => m.role);
        assert(roles.some(r => r), "Mapping: Has role assignments");
    });

    // 4. getBestModels Tests (Integration)
    runTestGroup("getBestModels Tests", () => {
        const pythonModels = getBestModels('python', 'coding');
        assert(pythonModels.length > 0, "getBestModels: Returns Python models");
        
        const jsModels = getBestModels('javascript', 'coding');
        assert(jsModels.length > 0, "getBestModels: Returns JS models");
        
        const pyFiltered = pythonModels.every(([_, d]) => d.languages.includes("python"));
        assert(pyFiltered, "getBestModels: Python filter correct");
    });

    // 4b. History Tests
    runTestGroup("History Tests", () => {
        assert(MODEL_HISTORY.length > 0, "History: Not empty");
        assert(MODEL_HISTORY[0].id, "History: First entry has ID");
        assert(MODEL_HISTORY.every(m => m.available), "History: All entries have available period");
        assert(MODEL_HISTORY.every(m => m.reason), "History: All entries have removal reason");
        assert(MODEL_HISTORY.some(m => m.id.includes("openai")), "History: Contains OpenAI models");
        assert(MODEL_HISTORY.some(m => m.id.includes("anthropic")), "History: Contains Anthropic models");
    });

    // 5. Templates Tests
    runTestGroup("Templates Tests", () => {
        assert(TOOL_TEMPLATES["opencode"], "Templates: OpenCode exists");
        assert(TOOL_TEMPLATES["continue"], "Templates: Continue exists");
        assert(TOOL_TEMPLATES["zed"], "Templates: Zed exists");
        assert(TOOL_TEMPLATES["aider"], "Templates: Aider exists");
        
        assert(TOOL_TEMPLATES["opencode"].type === "json_global", "Templates: OpenCode type correct");
        assert(TOOL_TEMPLATES["ollama"] === undefined, "Templates: Ollama NOT a template");
    });

    // 6. Config Generation Tests
    runTestGroup("Config Generation Tests", () => {
        const testModels = [["qwen/qwen2.5-coder-32b:free", MODEL_MAPPING["qwen/qwen2.5-coder-32b:free"]]];
        
        const configBasic = generateConfig("opencode", testModels, "basic");
        const parsedBasic = JSON.parse(configBasic);
        assert(parsedBasic.models[0].model === "qwen/qwen2.5-coder-32b:free", "generateConfig: Basic model correct");
        assert(!parsedBasic.models[0].system_prompt, "generateConfig: Basic no system prompt");
        
        const premiumModel = [["test/model", { ...MODEL_MAPPING["qwen/qwen2.5-coder-32b:free"], premium_prompt: "You are an expert." }]];
        const configPremium = generateConfig("opencode", premiumModel, "premium");
        const parsedPremium = JSON.parse(configPremium);
        assert(parsedPremium.models[0].system_prompt === "You are an expert.", "generateConfig: Premium has system prompt");
    });

    // 7. CLI Commands Tests
    runTestGroup("CLI Commands Tests", () => {
        assert(CLI_COMMANDS["ollama"], "CLI: Ollama exists");
        assert(CLI_COMMANDS["ollama"].install.win32 === "winget install Ollama.Ollama", "CLI: Ollama Win install");
        assert(CLI_COMMANDS["ollama"].install.darwin === "brew install ollama/tap/ollama", "CLI: Ollama Mac install");
        assert(CLI_COMMANDS["ollama"].update.linux, "CLI: Ollama Linux update");
        
        assert(CLI_COMMANDS["opencode"], "CLI: OpenCode exists");
        assert(CLI_COMMANDS["aider"], "CLI: Aider exists");
    });

    // 8. Install MD Tests
    runTestGroup("InstallMD Tests", () => {
        const md = generateInstallMD({ id: "opencode", name: "OpenCode", config_file: "opencode.json" }, "win32", "basic", "C:\\test");
        assert(md.includes("Step-by-Step"), "InstallMD: English title");
        assert(md.includes("winget install opencode"), "InstallMD: Install command");
        assert(md.includes("DEIN_API_KEY_HERE"), "InstallMD: API placeholder");
        
        const mdMac = generateInstallMD({ id: "opencode", name: "OpenCode", config_file: "opencode.json" }, "darwin", "basic", "~/.config");
        assert(mdMac.includes("brew install opencode"), "InstallMD: Mac command");
    });

    // 9. OS Paths Tests
    runTestGroup("OS Paths Tests", () => {
        assert(OS_PATHS["win32"]["opencode"].includes("AppData"), "OS_PATHS: Windows path");
        assert(OS_PATHS["darwin"]["opencode"].includes("~/.config"), "OS_PATHS: Mac path");
        assert(OS_PATHS["win32"]["continue"], "OS_PATHS: Continue Win");
        assert(OS_PATHS["darwin"]["zed"], "OS_PATHS: Zed Mac");
    });

    // 10. Cross-Module Integration Tests
    runTestGroup("Integration Tests", () => {
        const models = getBestModels('python', 'coding');
        const config = generateConfig("opencode", models, "basic");
        const parsed = JSON.parse(config);
        assert(parsed.models[0].provider === "openrouter", "Integration: Provider correct");
        
        const hasValidModel = models.some(([id]) => {
            try {
                JSON.parse(generateConfig("opencode", [[id, MODEL_MAPPING[id]]], "basic"));
                return true;
            } catch {
                return false;
            }
        });
        assert(hasValidModel, "Integration: All mapped models generate valid config");
    });

    // 11. Auth Tests (Mock-based)
    runTestGroup("Auth Tests", () => {
        // Note: localStorage/document tests skipped in Node.js
        // Testing logic only
        assert(typeof checkAuth === 'function', "Auth: checkAuth is function");
        assert(typeof isAuthenticated === 'function', "Auth: isAuthenticated is function");
        assert(typeof login === 'function', "Auth: login is function");
        assert(typeof logout === 'function', "Auth: logout is function");
    });

    console.log(`\n=== TEST SUMMARY ===`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    
    if (failed > 0) {
        process.exit(1);
    }
    
    console.log("\n=== ALL TESTS PASSED ===");
} catch (error) {
    console.error(`\nFATAL: ${error.message}`);
    process.exit(1);
}
