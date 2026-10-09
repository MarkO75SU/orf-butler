import { createClient } from '@supabase/supabase-js';

let supabaseClient = null;
let initPromise = null;

export async function initSupabase() {
    if (supabaseClient) return supabaseClient;
    if (initPromise) return initPromise;

    initPromise = (async () => {
        const res = await fetch('/api/supabase-config');
        if (!res.ok) throw new Error('Supabase configuration unavailable');
        const { configured, url, key } = await res.json();
        if (!configured || !url || !key) throw new Error('Social login not configured');

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

export async function socialLogin(provider) {
    let client;
    try {
        client = await initSupabase();
    } catch {
        return { success: false, error: 'Social login is not available.' };
    }

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
    localStorage.removeItem('orf_auth');
    sessionStorage.removeItem('orf_state');
    try {
        const client = await initSupabase();
        const { error } = await client.auth.signOut();
        if (error) return { success: false, error: error.message };
    } catch {
        // Social login not configured – nothing to sign out of.
    }
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
