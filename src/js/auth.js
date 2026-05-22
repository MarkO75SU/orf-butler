export async function checkAuth() {
    const stored = localStorage.getItem('orf_auth');
    if (!stored) return false;
    
    try {
        const data = JSON.parse(stored);
        if (data.expires && Date.now() > data.expires) {
            localStorage.removeItem('orf_auth');
            return false;
        }
        return true;
    } catch {
        return false;
    }
}

export function isAuthenticated() {
    const stored = localStorage.getItem('orf_auth');
    if (!stored) return false;
    try {
        const data = JSON.parse(stored);
        if (data.expires && Date.now() > data.expires) {
            localStorage.removeItem('orf_auth');
            return false;
        }
        return true;
    } catch {
        return false;
    }
}

export async function login(username, password, remember) {
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        if (response.ok) {
            const expires = remember ? Date.now() + (30 * 24 * 60 * 60 * 1000) : null;
            localStorage.setItem('orf_auth', JSON.stringify({ 
                user: username,
                expires: expires
            }));
            return { success: true };
        }
        
        const error = await response.json();
        return { success: false, error: error.error || 'Login fehlgeschlagen' };
    } catch (e) {
        return { success: false, error: 'Verbindung zum Server fehlgeschlagen' };
    }
}

export async function loginWithCode(code) {
    const cleaned = code.trim().toUpperCase();
    
    if (cleaned === 'GENERALI') {
        const pass = prompt('Admin-Passwort eingeben:');
        if (!pass) return { success: false, error: 'Abgebrochen' };
        return await login('generali', pass, true);
    }
    
    try {
        const response = await fetch('/api/codes?action=redeem', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: cleaned })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            const expires = Date.now() + (7 * 24 * 60 * 60 * 1000);
            localStorage.setItem('orf_auth', JSON.stringify({
                user: data.anonId || 'anon',
                code: data.code,
                uses: data.uses,
                maxUses: data.maxUses,
                expires: expires
            }));
            return { success: true };
        }
        
        return { success: false, error: data.error || 'Ungültiger Code' };
    } catch (e) {
        return { success: false, error: 'Server nicht erreichbar' };
    }
}

export function logout() {
    localStorage.removeItem('orf_auth');
}

export function getUser() {
    const stored = localStorage.getItem('orf_auth');
    if (!stored) return null;
    try {
        const data = JSON.parse(stored);
        return data.user || null;
    } catch {
        return null;
    }
}
