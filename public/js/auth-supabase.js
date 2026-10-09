import { createClient } from '@supabase/supabase-js';

let supabaseClient = null;
let initPromise = null;

export async function initSupabase() {
    if (supabaseClient) return supabaseClient;
    if (initPromise) return initPromise;

    initPromise = (async () => {
        const res = await fetch('/api/supabase-config');
        if (!res.ok) throw new Error('Supabase configuration unavailable');
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
