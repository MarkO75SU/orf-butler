let supabaseClient = null;
let initPromise = null;

export async function initSupabase() {
    if (supabaseClient) return supabaseClient;
    if (initPromise) return initPromise;

    initPromise = (async () => {
        if (typeof supabase === 'undefined') {
            throw new Error('Supabase SDK nicht geladen');
        }

        const res = await fetch('/api/supabase-config');
        if (!res.ok) throw new Error('Supabase-Konfiguration nicht verfügbar');
        const { url, key } = await res.json();

        supabaseClient = supabase.createClient(url, key, {
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
            emailRedirectTo: window.location.origin + '/app'
        }
    });

    if (error) return { success: false, error: error.message };
    return { success: true, user: data.user, needConfirm: true };
}

export async function loginEmail(email, password) {
    const client = await initSupabase();
    const { data, error } = await client.auth.signInWithPassword({
        email,
        password
    });

    if (error) return { success: false, error: error.message };
    return { success: true, user: data.user };
}

export async function socialLogin(provider) {
    const client = await initSupabase();
    const { data, error } = await client.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: window.location.origin + '/app'
        }
    });

    if (error) return { success: false, error: error.message };
    return { success: true, url: data.url };
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
