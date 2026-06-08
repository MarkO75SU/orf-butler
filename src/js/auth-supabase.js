import { createClient } from '@supabase/supabase-js';

let supabaseClient = null;
let initPromise = null;

async function setSessionCookie() {
    try { await fetch('/api/confirm-session', { method: 'POST' }); } catch {}
}

export async function initSupabase() {
    if (supabaseClient) return supabaseClient;
    if (initPromise) return initPromise;

    initPromise = (async () => {
        const res = await fetch('/api/supabase-config');
        if (!res.ok) throw new Error('Supabase-Konfiguration nicht verfügbar');
        const { url, key } = await res.json();

        supabaseClient = createClient(url, key, {
            auth: {
                flowType: 'pkce',
                detectSessionInUrl: true,
                persistSession: true,
                autoRefreshToken: true
            }
        });

        return supabaseClient;
    })();

    return initPromise;
}

export async function register(email, password) {
    const client = await initSupabase();
    const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: window.location.origin + '/'
        }
    });

    if (error) return { success: false, error: error.message };

    // User per Supabase Admin API automatisch bestätigen
    const confirmRes = await fetch('/api/auto-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: data.user.id })
    });
    if (!confirmRes.ok) {
        const err = await confirmRes.json().catch(() => ({}));
        console.warn('Auto-confirm warning:', err.error || confirmRes.status);
    }

    const hasSession = !!data.session;
    if (hasSession) {
        await setSessionCookie();
    }
    return { success: true, user: data.user, needConfirm: !hasSession, autoLogin: hasSession };
}

export async function loginEmail(email, password) {
    const client = await initSupabase();
    const { data, error } = await client.auth.signInWithPassword({
        email,
        password
    });

    if (error) return { success: false, error: error.message };
    await setSessionCookie();
    return { success: true, user: data.user };
}

export async function socialLogin(provider) {
    const client = await initSupabase();
    const { data, error } = await client.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: window.location.origin + '/'
        }
    });

    if (error) return { success: false, error: error.message };
    if (data.url) window.location.href = data.url;
    return { success: true };
}

export async function logoutSupabase() {
    const client = await initSupabase();
    const { error } = await client.auth.signOut();
    localStorage.removeItem('orf_auth');
    sessionStorage.removeItem('orf_state');
    if (error) return { success: false, error: error.message };
    return { success: true };
}

export async function getSession() {
    try {
        const client = await initSupabase();
        const { data, error } = await client.auth.getSession();
        if (error || !data.session) return null;
        return data.session;
    } catch {
        return null;
    }
}

export async function getUser() {
    const session = await getSession();
    if (!session) return null;
    return session.user;
}

export async function sendPasswordReset(email) {
    const client = await initSupabase();
    const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/app'
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
}

export async function resendConfirmation(email) {
    const client = await initSupabase();
    const { error } = await client.auth.resend({
        type: 'signup',
        email
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
}
