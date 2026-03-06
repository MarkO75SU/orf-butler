import { TRANSLATIONS } from '../js/i18n.js';
import { DAILY_PROMPTS, getPromptOfDay } from '../js/prompts.js';
import { MODEL_MAPPING, getBestModels } from '../js/mapping.js';
import { TOOL_TEMPLATES, generateConfig } from '../js/templates.js';
import { generateInstallMD, CLI_COMMANDS, OS_PATHS } from '../js/docs.js';

function assert(condition, message) {
    if (!condition) {
        throw new Error(`FAILED: ${message}`);
    }
    console.log(`PASSED: ${message}`);
}

console.log("--- RUNNING CORE LOGIC TESTS ---");

try {
    // 1. i18n Tests
    assert(TRANSLATIONS.de.title === "Openrouter Free Butler", "i18n: German translation exists");
    assert(TRANSLATIONS.en.title === "Openrouter Free Butler", "i18n: English translation exists");
    assert(typeof TRANSLATIONS.de.search_placeholder === "string", "i18n: German search placeholder exists");

    // 2. Prompt Tests
    const prompt = getPromptOfDay();
    assert(DAILY_PROMPTS.includes(prompt), "Prompts: Returns a valid prompt from the list");

    // 3. Mapping Tests
    assert(Object.keys(MODEL_MAPPING).length > 0, "Mapping: Model database is not empty");
    assert(MODEL_MAPPING["qwen/qwen2.5-coder-32b:free"].languages.includes("javascript"), "Mapping: Qwen-Coder includes JS");
    assert(MODEL_MAPPING["qwen/qwen2.5-coder-32b:free"].languages.includes("python"), "Mapping: Qwen-Coder includes Python");

    // 4. getBestModels Tests
    const pythonModels = getBestModels('python', 'coding');
    assert(pythonModels.length > 0, "getBestModels: Returns models for Python");
    assert(pythonModels.every(([_, d]) => d.languages.includes("python")), "getBestModels: Filtered models support Python");

    const jsModels = getBestModels('javascript', 'coding');
    assert(jsModels.length > 0, "getBestModels: Returns models for JavaScript");

    // 5. Templates Tests
    assert(TOOL_TEMPLATES["opencode"], "Templates: OpenCode config exists");
    assert(TOOL_TEMPLATES["ollama"] === undefined, "Templates: Ollama is NOT a template (it's a CLI)");

    // 6. Config Generation Tests
    const testModels = [["qwen/qwen2.5-coder-32b:free", MODEL_MAPPING["qwen/qwen2.5-coder-32b:free"]]];
    const config = generateConfig("opencode", testModels, "basic");
    const configParsed = JSON.parse(config);
    assert(configParsed.models[0].model === "qwen/qwen2.5-coder-32b:free", "generateConfig: Correct model in config");
    assert(configParsed.models[0].provider === "openrouter", "generateConfig: Correct provider in config");

    // 7. CLI Commands Tests
    assert(CLI_COMMANDS["ollama"], "CLI: Ollama commands exist");
    assert(CLI_COMMANDS["ollama"].install.win32 === "winget install Ollama.Ollama", "CLI: Ollama Windows install correct");
    assert(CLI_COMMANDS["ollama"].install.darwin === "brew install ollama/tap/ollama", "CLI: Ollama Mac install correct");
    assert(CLI_COMMANDS["opencode"], "CLI: OpenCode commands exist");
    assert(CLI_COMMANDS["aider"], "CLI: Aider commands exist");

    // 8. Install MD Generation Tests
    const installMD = generateInstallMD({ id: "opencode", name: "OpenCode CLI", config_file: "opencode.json" }, "win32", "basic", "C:\\Users\\Test\\AppData\\Roaming\\opencode\\opencode.json");
    assert(installMD.includes("Schritt-für-Schritt Anleitung für OpenCode CLI"), "InstallMD: Contains title");
    assert(installMD.includes("winget install opencode"), "InstallMD: Contains install command");
    assert(installMD.includes("DEIN_API_KEY_HIER"), "InstallMD: Contains placeholder for API key");

    // 9. OS Paths Tests
    assert(OS_PATHS["win32"]["opencode"].includes("AppData"), "OS_PATHS: Windows path correct");
    assert(OS_PATHS["darwin"]["opencode"].includes("~/.config"), "OS_PATHS: Mac path correct");

    console.log("\n--- ALL CORE TESTS PASSED ---");
} catch (error) {
    console.error(`\n${error.message}`);
    process.exit(1);
}
