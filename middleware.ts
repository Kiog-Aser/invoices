import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Don't refresh on API routes or static files
  if (
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/js') ||
    request.nextUrl.pathname.includes('.') // This catches other static files
  ) {
    return NextResponse.next();
  }

  // Check if this is a page refresh or navigation
  const isRefresh = request.headers.get('purpose') === 'prefetch' || 
                   request.headers.get('sec-fetch-mode') === 'navigate';

  // Only force update session on actual navigation, not on refreshes
  if (!isRefresh && session) {
    const response = NextResponse.next();
    
    // Add cache control headers to prevent caching
    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    );
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  // Only run middleware on paths that aren't static files or api routes 
  // that already handle their own authentication
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth|api/webhook).*)',
  ],
};