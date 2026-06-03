export default function middleware(req) {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // Simple cookie check without Vercel-specific API
    const cookie = req.headers.get('cookie');
    const hasSession = cookie && cookie.includes('orf_session=');

    if (pathname === '/app' && !hasSession) {
        return Response.redirect('https://orfb.vercel.app/', 302);
    }

    // Continue for all other paths
}
