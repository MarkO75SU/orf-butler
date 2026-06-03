export default function middleware(req) {
    const url = new URL(req.url);
    const { pathname } = url;

    const session = req.cookies.get('orf_session');

    if (pathname === '/app' || pathname === '/app.html') {
        if (!session) {
            return Response.redirect(new URL('/', req.url));
        }
    }

    if ((pathname === '/' || pathname === '/index.html') && session) {
        return Response.redirect(new URL('/landing', req.url));
    }

    return Response.next();
}

export const config = {
    matcher: ['/', '/app', '/app.html', '/index.html', '/landing']
};
