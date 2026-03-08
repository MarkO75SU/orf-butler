// src/js/mapping.js
// Kostenlose Model-Mapping-Datenbank (nur :free Modelle)

export const MODEL_MAPPING = {
    // Qwen Free Models
    "qwen/qwen2.5-coder-32b:free": {
        role: "Code Generation",
        context: "32k",
        desc: "Spezialisiert auf Code-Generierung.",
        languages: ["javascript", "typescript", "python", "go", "rust", "java"]
    },
    "qwen/qwen2.5-coder-1.5b:free": {
        role: "Lightweight Code",
        context: "32k",
        desc: "Schneller Code-Helfer für einfache Aufgaben.",
        languages: ["python", "javascript", "typescript"]
    },
    "qwen/qwen2.5-7b-instruct:free": {
        role: "Logic / Backend",
        context: "32k",
        desc: "Extrem schnell und Code-fokussiert.",
        languages: ["python", "go", "rust", "javascript"]
    },
    
    // DeepSeek Free Models
    "deepseek/deepseek-coder-33b:free": {
        role: "Code Expert",
        context: "64k",
        desc: "DeepSeek's Code-Spezialist.",
        languages: ["python", "javascript", "typescript", "go", "rust"]
    },
    "deepseek/deepseek-chat:free": {
        role: "Reasoning",
        context: "64k",
        desc: "Stark bei komplexen Logik-Problemen.",
        languages: ["python", "javascript", "go", "rust"]
    },
    
    // Meta Llama Free Models
    "meta-llama/llama-3.2-1b-instruct:free": {
        role: "Lightweight",
        context: "128k",
        desc: "Kompaktes und effizientes Modell.",
        languages: ["python", "javascript", "typescript"]
    },
    "meta-llama/llama-3.2-3b-instruct:free": {
        role: "Balanced",
        context: "128k",
        desc: "Ausgewogenes Modell für allgemeine Aufgaben.",
        languages: ["python", "javascript", "typescript", "go"]
    },
    
    // Google Gemini Free
    "google/gemma-2-2b-it:free": {
        role: "Fast Assistant",
        context: "8k",
        desc: "Schnelles Modell für schnelle Antworten.",
        languages: ["python", "javascript", "typescript"]
    },
    "google/gemma-2-9b-it:free": {
        role: "Code Assistant",
        context: "8k",
        desc: "Stark bei Code-Aufgaben.",
        languages: ["python", "javascript", "typescript", "go"]
    },
    
    // Mistral Free
    "mistralai/mistral-nemo-minitron-8b-instruct:free": {
        role: "Balanced",
        context: "128k",
        desc: "Mistral's kompaktes Modell.",
        languages: ["python", "javascript", "typescript", "java"]
    },
    
    // Stability AI Free
    "stabilityai/stable-code-3b:free": {
        role: "Code Generation",
        context: "16k",
        desc: "Spezialisiert auf Code.",
        languages: ["python", "javascript", "typescript", "go"]
    },
    
    // Nous Research Free
    "nousresearch/hermes-3-llama-3.1-8b:free": {
        role: "Assistant",
        context: "128k",
        desc: "Hochwertiger Assistent.",
        languages: ["python", "javascript", "typescript", "go"]
    },
    
    // Cohere Free
    "cohere/aya-expanse-8b:free": {
        role: "Multilingual",
        context: "4k",
        desc: "Mehrsprachiges Modell.",
        languages: ["python", "javascript", "typescript"]
    },
    
    // Microsoft Phi Free
    "microsoft/phi-3-mini-128k-instruct:free": {
        role: "Lightweight",
        context: "128k",
        desc: "Kompaktes Modell für schnelle Aufgaben.",
        languages: ["python", "javascript", "typescript"]
    },
    "microsoft/phi-3.5-mini-instruct:free": {
        role: "Code Light",
        context: "128k",
        desc: "Schnelles Code-Modell.",
        languages: ["python", "javascript", "typescript", "go"]
    },
    
    // THUDM (GLM) Free
    "thudm/glm-4-9b-chat:free": {
        role: "Chat Assistant",
        context: "128k",
        desc: "Starkes Chat-Modell.",
        languages: ["python", "javascript", "typescript", "java"]
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
