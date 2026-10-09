import { getSession, logoutSupabase } from './auth-supabase.js';

export async function isAuthenticated() {
    const stored = localStorage.getItem('orf_auth');
    if (stored) {
        try {
            const data = JSON.parse(stored);
            if (!data.expires || Date.now() <= data.expires) return true;
            localStorage.removeItem('orf_auth');
        } catch { localStorage.removeItem('orf_auth'); }
    }

    const session = await getSession();
    return !!session;
}

export async function login(username, password, remember) {
    const trimmedUser = (username || '').trim();
    const trimmedPass = (password || '').trim();

    if (!trimmedUser) {
        return { success: false, error: 'Bitte Benutzername eingeben.' };
    }

    if (!trimmedPass) {
        return { success: false, error: 'Bitte Passwort eingeben.' };
    }

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: trimmedUser, password: trimmedPass })
        });

        if (response.ok) {
            const expires = remember ? Date.now() + (30 * 24 * 60 * 60 * 1000) : null;
            localStorage.setItem('orf_auth', JSON.stringify({
                user: trimmedUser,
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

export async function logout() {
    localStorage.removeItem('orf_auth');
    await logoutSupabase();
    fetch('/api/logout', { method: 'POST' }).catch(() => {});
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
