// src/js/mapping.js
// Ausführliche Model-Mapping-Datenbank

export const MODEL_MAPPING = {
    // Meta Llama Serie
    "meta-llama/llama-3.1-8b-instruct": {
        role: "Frontend / UI",
        context: "128k",
        desc: "Der Allrounder mit dem besten Reasoning.",
        languages: ["javascript", "typescript", "html", "css", "python"],
        strengths: ["code generation", "reasoning", "multilingual"]
    },
    "meta-llama/llama-3.1-70b-instruct": {
        role: "Reasoning / Complex",
        context: "128k",
        desc: "Top-Level Reasoning für komplexe Aufgaben.",
        languages: ["python", "javascript", "go", "rust", "java"],
        strengths: ["complex logic", "architecture", "debugging"]
    },
    "meta-llama/llama-3.3-70b-instruct": {
        role: "Premium Reasoning",
        context: "128k",
        desc: "Neueste Llama Version mit verbessertem Reasoning.",
        languages: ["python", "javascript", "typescript", "go"],
        strengths: ["code generation", "explanation", "refactoring"]
    },
    
    // Qwen Serie
    "qwen/qwen-2.5-7b-instruct": {
        role: "Logic / Backend",
        context: "32k",
        desc: "Extrem schnell und Code-fokussiert.",
        languages: ["python", "go", "rust", "javascript", "java"],
        strengths: ["fast inference", "code completion", "backend"]
    },
    "qwen/qwen-2.5-14b-instruct": {
        role: "Code Expert",
        context: "32k",
        desc: "Starke Code-Fähigkeiten in kompakter Größe.",
        languages: ["python", "javascript", "typescript", "go", "rust", "c++"],
        strengths: ["code generation", "refactoring", "testing"]
    },
    "qwen/qwen-2.5-72b-instruct": {
        role: "Premium Code",
        context: "32k",
        desc: "Qwen Flaggschiff für anspruchsvolle Aufgaben.",
        languages: ["python", "javascript", "typescript", "go", "rust", "java", "c++"],
        strengths: ["complex code", "architecture", "performance"]
    },
    "qwen/qwen2.5-coder-32b:free": {
        role: "Code Generation",
        context: "32k",
        desc: "Spezialisiert auf Code-Generierung.",
        languages: ["javascript", "typescript", "python", "go", "rust", "c++", "java"],
        strengths: ["code completion", "bug fixing", "refactoring"]
    },
    "qwen/qwen2.5-coder-1.5b:free": {
        role: "Lightweight Code",
        context: "32k",
        desc: "Schneller Code-Helfer für einfache Aufgaben.",
        languages: ["python", "javascript", "typescript"],
        strengths: ["fast", "simple tasks", "learning"]
    },
    
    // Google Gemini
    "google/gemini-flash-1.5-8b": {
        role: "Speed / Context",
        context: "1M",
        desc: "Der König der langen Kontexte.",
        languages: ["javascript", "python", "java", "go", "rust"],
        strengths: ["long context", "fast", "multimodal"]
    },
    "google/gemini-flash-2.0": {
        role: "Latest Flash",
        context: "1M",
        desc: "Neueste Flash Version mit verbesserter Performance.",
        languages: ["javascript", "python", "typescript", "go"],
        strengths: ["speed", "context", "reasoning"]
    },
    "google/gemini-pro-1.5": {
        role: "Premium Multimodal",
        context: "2M",
        desc: "Google's Top-Modell für komplexe Aufgaben.",
        languages: ["python", "javascript", "typescript", "go", "rust", "java"],
        strengths: ["reasoning", "multimodal", "long context"]
    },
    
    // Mistral Serie
    "mistralai/mistral-7b-instruct": {
        role: "Balanced",
        context: "8k",
        desc: "Solide Choice für lokale Tests.",
        languages: ["python", "javascript", "java", "go"],
        strengths: ["balanced", "open source", "fast"]
    },
    "mistralai/mistral-large-2411": {
        role: "Premium Reasoning",
        context: "128k",
        desc: "Mistral's Top-Modell für anspruchsvolle Aufgaben.",
        languages: ["python", "javascript", "typescript", "go", "rust", "java"],
        strengths: ["reasoning", "coding", "instruction following"]
    },
    "mistralai/codestral-2501": {
        role: "Code Expert",
        context: "256k",
        desc: "Spezialisiert auf Code-Generierung.",
        languages: ["python", "javascript", "typescript", "go", "rust", "c++", "java"],
        strengths: ["code generation", "completion", "refactoring"]
    },
    
    // DeepSeek
    "deepseek/deepseek-chat": {
        role: "Reasoning",
        context: "64k",
        desc: "Stark bei komplexen Logik-Problemen.",
        languages: ["python", "javascript", "go", "rust", "java"],
        strengths: ["logic", "reasoning", "math"]
    },
    "deepseek/deepseek-coder-33b-instruct": {
        role: "Code Generation",
        context: "64k",
        desc: "DeepSeek's Code-Spezialist.",
        languages: ["python", "javascript", "typescript", "go", "rust", "c++", "java"],
        strengths: ["code generation", "debugging", "optimization"]
    },
    
    // Anthropic Claude (via OpenRouter)
    "anthropic/claude-3-haiku": {
        role: "Fast / Efficient",
        context: "200k",
        desc: "Schnell und effizient.",
        languages: ["python", "javascript", "typescript", "go", "rust"],
        strengths: ["speed", "efficiency", "reasoning"]
    },
    "anthropic/claude-3.5-sonnet": {
        role: "Premium Reasoning",
        context: "200k",
        desc: "Claude's Top-Performer für anspruchsvolle Aufgaben.",
        languages: ["python", "javascript", "typescript", "go", "rust", "java", "c++"],
        strengths: ["reasoning", "code generation", "explanation"]
    },
    
    // Microsoft Phi
    "microsoft/phi-3-mini-128k-instruct": {
        role: "Lightweight",
        context: "128k",
        desc: "Kompaktes Modell für schnelle Aufgaben.",
        languages: ["python", "javascript", "typescript"],
        strengths: ["fast", "lightweight", "efficient"]
    },
    
    // Stability AI
    "stabilityai/stable-code-3b": {
        role: "Code Generation",
        context: "16k",
        desc: "Spezialisiert auf Code.",
        languages: ["python", "javascript", "typescript", "go", "rust", "c++"],
        strengths: ["code", "completion", "infilling"]
    },
    
    // Nous Research
    "nousresearch/hermes-3-llama-3.1-70b-instruct": {
        role: "Premium Assistant",
        context: "128k",
        desc: "Hochwertiger Assistent für komplexe Aufgaben.",
        languages: ["python", "javascript", "typescript", "go", "rust"],
        strengths: ["instruction following", "reasoning", "coding"]
    },
    
    // Cohere
    "cohere/command-r-plus": {
        role: "Enterprise",
        context: "200k",
        desc: "Enterprise-taugliches Modell.",
        languages: ["python", "javascript", "typescript", "java", "go"],
        strengths: ["enterprise", "reasoning", "coding"]
    }
};

export function getBestModels(lang, category) {
    const models = Object.entries(MODEL_MAPPING);
    if (lang === 'python') {
        return models.filter(([id, d]) => d.languages.includes('python'));
    }
    if (lang === 'javascript') {
        return models.filter(([id, d]) => d.languages.includes('javascript'));
    }
    return models.slice(0, 10);
}
