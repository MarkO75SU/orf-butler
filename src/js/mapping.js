// src/js/mapping.js
// Free Model Database (only :free models)

export const MODEL_MAPPING = {
    // Qwen Free Models
    "qwen/qwen2.5-coder-32b:free": {
        role: "Code Generation",
        role_de: "Code-Generierung",
        context: "32k",
        desc_en: "Specialized in code generation.",
        desc_de: "Spezialisiert auf Code-Generierung.",
        languages: ["javascript", "typescript", "python", "go", "rust", "java"],
        uptime: "99.8%",
        latency: "1.2s",
        status: "online"
    },
    "qwen/qwen2.5-coder-1.5b:free": {
        role: "Lightweight Code",
        role_de: "Leichtgewichtiger Code",
        context: "32k",
        desc_en: "Fast code helper for simple tasks.",
        desc_de: "Schneller Code-Helfer für einfache Aufgaben.",
        languages: ["python", "javascript", "typescript"],
        uptime: "99.9%",
        latency: "0.4s",
        status: "online"
    },
    "qwen/qwen2.5-7b-instruct:free": {
        role: "Logic / Backend",
        role_de: "Logik / Backend",
        context: "32k",
        desc_en: "Extremely fast and code-focused.",
        desc_de: "Extrem schnell und Code-fokussiert.",
        languages: ["python", "go", "rust", "javascript"],
        uptime: "99.7%",
        latency: "0.8s",
        status: "online"
    },
    
    // DeepSeek Free Models
    "deepseek/deepseek-coder-33b:free": {
        role: "Code Expert",
        role_de: "Code-Experte",
        context: "64k",
        desc_en: "DeepSeek's code specialist.",
        desc_de: "DeepSeek's Code-Spezialist.",
        languages: ["python", "javascript", "typescript", "go", "rust"],
        uptime: "99.5%",
        latency: "2.1s",
        status: "online"
    },
    "deepseek/deepseek-chat:free": {
        role: "Reasoning",
        role_de: "Logik",
        context: "64k",
        desc_en: "Strong in complex logic problems.",
        desc_de: "Stark bei komplexen Logik-Problemen.",
        languages: ["python", "javascript", "go", "rust"],
        uptime: "99.6%",
        latency: "1.8s",
        status: "online"
    },
    
    // Meta Llama Free Models
    "meta-llama/llama-3.2-1b-instruct:free": {
        role: "Lightweight",
        role_de: "Leichtgewicht",
        context: "128k",
        desc_en: "Compact and efficient model.",
        desc_de: "Kompaktes und effizientes Modell.",
        languages: ["python", "javascript", "typescript"],
        uptime: "99.9%",
        latency: "0.3s",
        status: "online"
    },
    "meta-llama/llama-3.2-3b-instruct:free": {
        role: "Balanced",
        role_de: "Ausgewogen",
        context: "128k",
        desc_en: "Balanced model for general tasks.",
        desc_de: "Ausgewogenes Modell für allgemeine Aufgaben.",
        languages: ["python", "javascript", "typescript", "go"],
        uptime: "99.8%",
        latency: "0.6s",
        status: "online"
    },
    
    // Google Gemma Free
    "google/gemma-2-2b-it:free": {
        role: "Fast Assistant",
        role_de: "Schneller Assistent",
        context: "8k",
        desc_en: "Fast model for quick answers.",
        desc_de: "Schnelles Modell für schnelle Antworten.",
        languages: ["python", "javascript", "typescript"],
        uptime: "99.4%",
        latency: "0.5s",
        status: "online"
    },
    "google/gemma-2-9b-it:free": {
        role: "Code Assistant",
        role_de: "Code-Assistent",
        context: "8k",
        desc_en: "Strong in code tasks.",
        desc_de: "Stark bei Code-Aufgaben.",
        languages: ["python", "javascript", "typescript", "go"],
        uptime: "99.3%",
        latency: "1.0s",
        status: "online"
    },
    
    // Mistral Free
    "mistralai/mistral-nemo-minitron-8b-instruct:free": {
        role: "Balanced",
        role_de: "Ausgewogen",
        context: "128k",
        desc_en: "Mistral's compact model.",
        desc_de: "Mistral's kompaktes Modell.",
        languages: ["python", "javascript", "typescript", "java"],
        uptime: "99.7%",
        latency: "0.9s",
        status: "online"
    },
    
    // Stability AI Free
    "stabilityai/stable-code-3b:free": {
        role: "Code Generation",
        role_de: "Code-Generierung",
        context: "16k",
        desc_en: "Specialized in code.",
        desc_de: "Spezialisiert auf Code.",
        languages: ["python", "javascript", "typescript", "go"],
        uptime: "99.2%",
        latency: "1.5s",
        status: "degraded"
    },
    
    // Nous Research Free
    "nousresearch/hermes-3-llama-3.1-8b:free": {
        role: "Assistant",
        role_de: "Assistent",
        context: "128k",
        desc_en: "High-quality assistant.",
        desc_de: "Hochwertiger Assistent.",
        languages: ["python", "javascript", "typescript", "go"],
        uptime: "99.6%",
        latency: "1.1s",
        status: "online"
    },
    
    // Cohere Free
    "cohere/aya-expanse-8b:free": {
        role: "Multilingual",
        role_de: "Mehrsprachig",
        context: "4k",
        desc_en: "Multilingual model.",
        desc_de: "Mehrsprachiges Modell.",
        languages: ["python", "javascript", "typescript"],
        uptime: "99.1%",
        latency: "1.7s",
        status: "online"
    },
    
    // Microsoft Phi Free
    "microsoft/phi-3-mini-128k-instruct:free": {
        role: "Lightweight",
        role_de: "Leichtgewicht",
        context: "128k",
        desc_en: "Compact model for quick tasks.",
        desc_de: "Kompaktes Modell für schnelle Aufgaben.",
        languages: ["python", "javascript", "typescript"],
        uptime: "99.5%",
        latency: "0.7s",
        status: "online"
    },
    "microsoft/phi-3.5-mini-instruct:free": {
        role: "Code Light",
        role_de: "Leicht-Code",
        context: "128k",
        desc_en: "Fast code model.",
        desc_de: "Schnelles Code-Modell.",
        languages: ["python", "javascript", "typescript", "go"],
        uptime: "99.4%",
        latency: "0.6s",
        status: "online"
    },
    
    // THUDM (GLM) Free
    "thudm/glm-4-9b-chat:free": {
        role: "Chat Assistant",
        role_de: "Chat-Assistent",
        context: "128k",
        desc_en: "Strong chat model.",
        desc_de: "Starkes Chat-Modell.",
        languages: ["python", "javascript", "typescript", "java"],
        uptime: "99.0%",
        latency: "2.3s",
        status: "online"
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
