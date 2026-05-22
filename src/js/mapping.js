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

// Models that were once free but are no longer available as free
export const MODEL_HISTORY = [
    {
        id: "openai/gpt-3.5-turbo",
        role: "Chat Completion",
        role_de: "Chat-Vervollständigung",
        context: "16k",
        desc_en: "Former flagship OpenAI chat model.",
        desc_de: "Ehemaliges Flaggschiff von OpenAI.",
        available: "2023-06 – 2024-07",
        languages: ["python", "javascript", "typescript", "go", "java"],
        reason: "moved to paid",
        reason_de: "auf Bezahlung umgestellt"
    },
    {
        id: "openai/gpt-4o-mini",
        role: "Multimodal",
        role_de: "Multimodal",
        context: "128k",
        desc_en: "Lightning-fast multimodal model.",
        desc_de: "Schnelles multimodales Modell.",
        available: "2024-05 – 2025-03",
        languages: ["python", "javascript", "typescript", "go", "java"],
        reason: "moved to paid",
        reason_de: "auf Bezahlung umgestellt"
    },
    {
        id: "anthropic/claude-3-haiku",
        role: "Fast Chat",
        role_de: "Schneller Chat",
        context: "200k",
        desc_en: "Anthropic's fastest and most compact model.",
        desc_de: "Anthropics schnellstes und kompaktestes Modell.",
        available: "2024-03 – 2025-02",
        languages: ["python", "javascript", "typescript", "go"],
        reason: "moved to paid",
        reason_de: "auf Bezahlung umgestellt"
    },
    {
        id: "google/gemini-1.5-flash",
        role: "Fast Multimodal",
        role_de: "Schnell Multimodal",
        context: "1M",
        desc_en: "Google's fastest multimodal model.",
        desc_de: "Googles schnellstes multimodales Modell.",
        available: "2024-05 – 2025-04",
        languages: ["python", "javascript", "typescript", "go", "java"],
        reason: "moved to paid",
        reason_de: "auf Bezahlung umgestellt"
    },
    {
        id: "google/gemini-1.5-pro",
        role: "Reasoning",
        role_de: "Logik",
        context: "2M",
        desc_en: "Google's most powerful reasoning model.",
        desc_de: "Googles stärkstes Logik-Modell.",
        available: "2024-02 – 2025-01",
        languages: ["python", "javascript", "typescript", "go", "java", "rust"],
        reason: "moved to paid",
        reason_de: "auf Bezahlung umgestellt"
    },
    {
        id: "mistralai/mistral-7b-instruct",
        role: "Instruct",
        role_de: "Instruktion",
        context: "32k",
        desc_en: "Mistral's original open-source model.",
        desc_de: "Mistrals ursprüngliches Open-Source-Modell.",
        available: "2023-09 – 2024-12",
        languages: ["python", "javascript", "typescript", "go", "java"],
        reason: "deprecated",
        reason_de: "eingestellt"
    },
    {
        id: "meta-llama/llama-2-70b-chat",
        role: "Chat",
        role_de: "Chat",
        context: "4k",
        desc_en: "Meta's large-scale chat model.",
        desc_de: "Metas großes Chat-Modell.",
        available: "2023-07 – 2024-09",
        languages: ["python", "javascript", "typescript", "go"],
        reason: "superseded by Llama 3",
        reason_de: "durch Llama 3 ersetzt"
    },
    {
        id: "meta-llama/llama-3-8b-instruct",
        role: "Instruct",
        role_de: "Instruktion",
        context: "8k",
        desc_en: "Metas compact Llama 3 model.",
        desc_de: "Metas kompaktes Llama-3-Modell.",
        available: "2024-04 – 2024-12",
        languages: ["python", "javascript", "typescript", "go"],
        reason: "superseded by Llama 3.1/3.2",
        reason_de: "durch Llama 3.1/3.2 ersetzt"
    },
    {
        id: "meta-llama/llama-3-70b-instruct",
        role: "Large Instruct",
        role_de: "Groß Instruktion",
        context: "8k",
        desc_en: "Metas large Llama 3 model.",
        desc_de: "Metas großes Llama-3-Modell.",
        available: "2024-04 – 2024-12",
        languages: ["python", "javascript", "typescript", "go", "java"],
        reason: "superseded by Llama 3.1",
        reason_de: "durch Llama 3.1 ersetzt"
    },
    {
        id: "cohere/command-r",
        role: "RAG",
        role_de: "RAG",
        context: "128k",
        desc_en: "Cohere's retrieval-augmented model.",
        desc_de: "Coheres Retrieval-Modell.",
        available: "2024-03 – 2025-01",
        languages: ["python", "javascript", "typescript"],
        reason: "moved to paid",
        reason_de: "auf Bezahlung umgestellt"
    },
    {
        id: "qwen/qwen-2-72b-instruct",
        role: "Large Instruct",
        role_de: "Groß Instruktion",
        context: "32k",
        desc_en: "Alibaba's large instruction model.",
        desc_de: "Alibabas großes Instruktions-Modell.",
        available: "2024-06 – 2025-03",
        languages: ["python", "javascript", "typescript", "go", "java"],
        reason: "superseded by Qwen 2.5",
        reason_de: "durch Qwen 2.5 ersetzt"
    },
    {
        id: "nousresearch/nous-hermes-2-mixtral-8x7b-dpo",
        role: "DPO",
        role_de: "DPO",
        context: "32k",
        desc_en: "Nous Research's optimized Mixtral.",
        desc_de: "Nous Researchs optimierter Mixtral.",
        available: "2024-01 – 2024-11",
        languages: ["python", "javascript", "typescript", "go"],
        reason: "superseded by Hermes 3",
        reason_de: "durch Hermes 3 ersetzt"
    }
];

