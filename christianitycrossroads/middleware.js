import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  
  // Log for debugging (check terminal)
  console.log(`[Middleware] Checking: ${pathname}`);
  
  // Only protect /admin routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Get token from cookies
  const token = req.cookies.get("token")?.value;
  
  console.log(`[Middleware] Token exists: ${!!token}`);
  
  // No token = redirect to login
  if (!token) {
    console.log("[Middleware] No token, redirecting to login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    // Verify JWT signature
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    console.log(`[Middleware] Decoded role: ${payload.role}`);
    
    // Check admin role
    if (payload.role !== "admin") {
      console.log("[Middleware] Not admin, redirecting to home");
      return NextResponse.redirect(new URL("/", req.url));
    }
    
    // Admin confirmed, proceed
    console.log("[Middleware] Admin verified, allowing access");
    return NextResponse.next();
    
  } catch (error) {
    console.log(`[Middleware] JWT Error: ${error.message}`);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*"]
};