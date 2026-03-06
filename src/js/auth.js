// src/js/auth.js
// Credentials verified server-side via API

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
            return true;
        }
        
        const error = await response.json();
        alert(error.error || 'Login fehlgeschlagen');
        return false;
    } catch (e) {
        alert('Verbindung zum Server fehlgeschlagen');
        return false;
    }
}

export function logout() {
    localStorage.removeItem('orf_auth');
}
