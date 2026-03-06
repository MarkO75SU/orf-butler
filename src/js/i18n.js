// src/js/i18n.js
export const TRANSLATIONS = {
    de: {
        title: "Openrouter Free Butler",
        subtitle: "Universal AI Deployment Configurator",
        mission_title: "Kern-Mission",
        mission_text: "Der Openrouter Free Butler synthetisiert hochpräzise Konfigurations-Assets, um die Brücke zwischen den <span class='text-white'>kostenlosen LLMs von OpenRouter</span> und professionellen Entwicklungsumgebungen zu schlagen.",
        search_placeholder: "Profianwendungen suchen...",
        recommendations: "Empfohlene Umgebungen",
        roster_title: "Integrierte Free-LLM Engine",
        potd_title: "Prompt des Tages",
        potd_rss: "RSS Feed abonnieren",
        step_stack: "Ziel-Stack auswählen",
        step_tier: "Service-Level wählen",
        step_finish: "Konfiguration synthetisiert",
        deploy_btn: "Assets bereitstellen",
        basic_tier: "Standard Asset Bundle",
        premium_tier: "Premium Expert Engine"
    },
    en: {
        title: "Openrouter Free Butler",
        subtitle: "Universal AI Deployment Configurator",
        mission_title: "Core Mission",
        mission_text: "Openrouter Free Butler synthesizes high-precision configuration assets to bridge the gap between <span class='text-white'>OpenRouter's free-tier LLMs</span> and professional development environments.",
        search_placeholder: "Search professional tools...",
        recommendations: "Professional Recommendations",
        roster_title: "Integrated Free-LLM Engine",
        potd_title: "Prompt of the Day",
        potd_rss: "Subscribe RSS Feed",
        step_stack: "Select Target Stack",
        step_tier: "Select Service Level",
        step_finish: "Configuration Synthesized",
        deploy_btn: "Deploy Assets",
        basic_tier: "Standard Asset Bundle",
        premium_tier: "Premium Expert Engine"
    }
};

let currentLang = 'de';

export function setLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
}

export function t(key) {
    return TRANSLATIONS[currentLang][key] || key;
}

export function getLang() { return currentLang; }
