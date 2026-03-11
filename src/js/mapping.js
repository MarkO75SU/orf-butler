// src/js/mapping.js
// Free Model Database (only :free models)

export const MODEL_MAPPING = {
    // Qwen Free Models
    "qwen/qwen2.5-coder-32b:free": {
        role: "Code Generation",
        context: "32k",
        desc: "Specialized in code generation.",
        languages: ["javascript", "typescript", "python", "go", "rust", "java"]
    },
    "qwen/qwen2.5-coder-1.5b:free": {
        role: "Lightweight Code",
        context: "32k",
        desc: "Fast code helper for simple tasks.",
        languages: ["python", "javascript", "typescript"]
    },
    "qwen/qwen2.5-7b-instruct:free": {
        role: "Logic / Backend",
        context: "32k",
        desc: "Extremely fast and code-focused.",
        languages: ["python", "go", "rust", "javascript"]
    },
    
    // DeepSeek Free Models
    "deepseek/deepseek-coder-33b:free": {
        role: "Code Expert",
        context: "64k",
        desc: "DeepSeek's code specialist.",
        languages: ["python", "javascript", "typescript", "go", "rust"]
    },
    "deepseek/deepseek-chat:free": {
        role: "Reasoning",
        context: "64k",
        desc: "Strong in complex logic problems.",
        languages: ["python", "javascript", "go", "rust"]
    },
    
    // Meta Llama Free Models
    "meta-llama/llama-3.2-1b-instruct:free": {
        role: "Lightweight",
        context: "128k",
        desc: "Compact and efficient model.",
        languages: ["python", "javascript", "typescript"]
    },
    "meta-llama/llama-3.2-3b-instruct:free": {
        role: "Balanced",
        context: "128k",
        desc: "Balanced model for general tasks.",
        languages: ["python", "javascript", "typescript", "go"]
    },
    
    // Google Gemma Free
    "google/gemma-2-2b-it:free": {
        role: "Fast Assistant",
        context: "8k",
        desc: "Fast model for quick answers.",
        languages: ["python", "javascript", "typescript"]
    },
    "google/gemma-2-9b-it:free": {
        role: "Code Assistant",
        context: "8k",
        desc: "Strong in code tasks.",
        languages: ["python", "javascript", "typescript", "go"]
    },
    
    // Mistral Free
    "mistralai/mistral-nemo-minitron-8b-instruct:free": {
        role: "Balanced",
        context: "128k",
        desc: "Mistral's compact model.",
        languages: ["python", "javascript", "typescript", "java"]
    },
    
    // Stability AI Free
    "stabilityai/stable-code-3b:free": {
        role: "Code Generation",
        context: "16k",
        desc: "Specialized in code.",
        languages: ["python", "javascript", "typescript", "go"]
    },
    
    // Nous Research Free
    "nousresearch/hermes-3-llama-3.1-8b:free": {
        role: "Assistant",
        context: "128k",
        desc: "High-quality assistant.",
        languages: ["python", "javascript", "typescript", "go"]
    },
    
    // Cohere Free
    "cohere/aya-expanse-8b:free": {
        role: "Multilingual",
        context: "4k",
        desc: "Multilingual model.",
        languages: ["python", "javascript", "typescript"]
    },
    
    // Microsoft Phi Free
    "microsoft/phi-3-mini-128k-instruct:free": {
        role: "Lightweight",
        context: "128k",
        desc: "Compact model for quick tasks.",
        languages: ["python", "javascript", "typescript"]
    },
    "microsoft/phi-3.5-mini-instruct:free": {
        role: "Code Light",
        context: "128k",
        desc: "Fast code model.",
        languages: ["python", "javascript", "typescript", "go"]
    },
    
    // THUDM (GLM) Free
    "thudm/glm-4-9b-chat:free": {
        role: "Chat Assistant",
        context: "128k",
        desc: "Strong chat model.",
        languages: ["python", "javascript", "typescript", "java"]
    }
};
