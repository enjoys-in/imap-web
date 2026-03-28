import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtDecode, JwtPayload } from 'jwt-decode'
import { IUser, ROLE } from './lib/types/user.interface';
import { validateTokenExpiry } from './lib/utils';
import { cookies } from 'next/headers';
const regex = /^\/u\/(.+)/;
const hPanelRegex = /^\/h-panel\/(.+)/;

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const PublicPaths = ['/'];


    // const access_token = request.cookies.get('access_token')?.value || undefined;

    // if (access_token && validateTokenExpiry(access_token) && PublicPaths.includes(pathname)) {
    //     (await cookies()).delete('access_token');
    //     return NextResponse.redirect(new URL('/u/inbox', request.nextUrl));
    // }

    // if (!access_token && pathname.startsWith('/u/')) {
    //     return NextResponse.redirect(new URL('/', request.nextUrl));
    // }
    // if (access_token && regex.test(pathname)) {
    //     return NextResponse.next();
    // }


    return NextResponse.next();
}

// Configure the middleware to match specific paths
export const config = {
    matcher: [
        '/u/:path*', '/h-panel/:path*',
        '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|service-worker.js|.js|.css|.mp3|.svg).*)'],
}
