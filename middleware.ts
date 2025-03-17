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

  // Check if this is a testimonial page
  const isTestimonialPage = request.nextUrl.pathname.startsWith('/testimonial/');
  
  // Force update session on testimonial pages or actual navigation
  if (session && (isTestimonialPage || !request.headers.get('purpose'))) {
    const response = NextResponse.next();
    
    // Add cache control headers to prevent caching
    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    );
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    // For testimonial pages, prefetch user data
    if (isTestimonialPage) {
      try {
        // Prefetch user data and store it in session
        const userResponse = await fetch(`${request.nextUrl.origin}/api/user`, {
          headers: {
            Cookie: request.headers.get('cookie') || '',
          },
        });
        
        if (userResponse.ok) {
          // The user data will be available in the session when the page loads
          await userResponse.json();
        }
      } catch (error) {
        console.error('Error prefetching user data:', error);
      }
    }
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, manifest.json, robots.txt (public files)
     * - notifications (exclude entire notifications section)
     * - Auth-related paths
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|robots.txt|notifications|auth).*)',
  ],
};