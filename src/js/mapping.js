// src/js/mapping.js

export const MODEL_MAPPING = {
    "meta-llama/llama-3.1-8b-instruct": {
        role: "Frontend / UI",
        context: "32k",
        desc: "Der Allrounder mit dem besten Reasoning.",
        languages: ["javascript", "typescript", "html", "css"]
    },
    "qwen/qwen-2.5-7b-instruct": {
        role: "Logic / Backend",
        context: "32k",
        desc: "Extrem schnell und Code-fokussiert.",
        languages: ["python", "go", "rust", "javascript"]
    },
    "google/gemini-flash-1.5-8b": {
        role: "Speed / Context",
        context: "1M",
        desc: "Der König der langen Kontexte.",
        languages: ["javascript", "python", "java"]
    },
    "mistralai/mistral-7b-instruct": {
        role: "Balanced",
        context: "8k",
        desc: "Solide Choice für lokale Tests.",
        languages: ["python", "javascript"]
    },
    "deepseek/deepseek-chat": {
        role: "Reasoning",
        context: "64k",
        desc: "Stark bei komplexen Logik-Problemen.",
        languages: ["python", "javascript", "go"]
    },
    "qwen/qwen2.5-coder-32b:free": {
        role: "Code Generation",
        context: "32k",
        desc: "Spezialisiert auf Code.",
        languages: ["javascript", "typescript", "python", "go", "rust"]
    }
};

export function getBestModels(lang, category) {
    const models = Object.entries(MODEL_MAPPING);
    if (lang === 'python') {
        return models.filter(([id, d]) => d.role.includes('Logic') || d.role.includes('Backend'));
    }
    return models.slice(0, 3);
}
