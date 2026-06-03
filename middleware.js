export const config = {
    matcher: ['/app']
};

export default function middleware(req) {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // Check for session cookie
    const cookie = req.headers.get('cookie');
    const hasSession = cookie && cookie.includes('orf_session=');

    // Redirect to login if accessing /app without session
    if (pathname === '/app' && !hasSession) {
        return Response.redirect(new URL('/', url), 302);
    }

    // No return = continue to next middleware/page
}
