export const config = {
    matcher: ['/app', '/landing']
};

export default function middleware(req) {
    const url = new URL(req.url);
    const pathname = url.pathname;

    const cookie = req.headers.get('cookie');
    const hasSession = cookie && cookie.includes('orf_session=');

    if (pathname === '/app' && !hasSession) {
        return Response.redirect(new URL('/', url), 302);
    }

    if (pathname === '/landing' && !hasSession) {
        return Response.redirect(new URL('/', url), 302);
    }
}
