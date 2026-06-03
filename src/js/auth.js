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
    if (!username || !password) {
        return { success: false, error: 'Bitte Benutzername und Passwort eingeben.' };
    }
    
    const cleanedUser = username.trim().toLowerCase();
    
    if (cleanedUser === 'generali') {
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username.trim(), password })
            });
            
            if (response.ok) {
                const expires = remember ? Date.now() + (30 * 24 * 60 * 60 * 1000) : null;
                localStorage.setItem('orf_auth', JSON.stringify({ 
                    user: 'generali',
                    expires: expires
                }));
                return { success: true };
            }
            
            const error = await response.json();
            return { success: false, error: error.error || 'Zugang verweigert' };
        } catch (e) {
            return { success: false, error: 'Server nicht erreichbar' };
        }
    }
    
    try {
        const response = await fetch('/api/codes?action=redeem', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: password.trim().toUpperCase() })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            const expires = remember ? Date.now() + (7 * 24 * 60 * 60 * 1000) : null;
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
