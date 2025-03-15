import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  // Get the pathname
  const path = req.nextUrl.pathname;

  // Public paths that don't require authentication
  const isPublicPath = 
    path === '/' || 
    path.startsWith('/auth') || 
    path.startsWith('/api') || 
    path === '/privacy-policy' || 
    path === '/tos';

  // If it's a public path, allow the request
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Get the session token from the request
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Redirect to login if no token and requesting a protected route
  if (!token && path.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/signin', req.url));
  }

  // Otherwise, allow the request
  return NextResponse.next();
}

export const config = {
  // Only run middleware on paths that aren't static files or api routes 
  // that already handle their own authentication
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth|api/webhook).*)',
  ],
};