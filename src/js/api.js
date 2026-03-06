// src/js/api.js
export async function fetchLiveFreeModels() {
    try {
        const response = await fetch("https://openrouter.ai/api/v1/models");
        const data = await response.json();
        
        // Filter für kostenlose Modelle
        const freeModels = data.data.filter(m => m.id.endsWith(':free'));
        
        return freeModels.map(m => ({
            id: m.id,
            name: m.name,
            context: m.context_length
        }));
    } catch (error) {
        console.error("API Sync Error:", error);
        return null;
    }
}

export function verifyUpdateWindow(purchaseDateISO) {
    const purchaseDate = new Date(purchaseDateISO);
    const now = new Date();
    const fourWeeksInMs = 28 * 24 * 60 * 60 * 1000;
    
    return (now - purchaseDate) < fourWeeksInMs;
}
