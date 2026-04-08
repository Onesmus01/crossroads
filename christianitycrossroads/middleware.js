import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

// ✅ Encode the string to Uint8Array
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
console.log("ENV CHECK:", process.env.JWT_SECRET ? "FOUND" : "MISSING");
console.log("VALUE:", process.env.JWT_SECRET);

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  
  console.log(`[Middleware] Checking: ${pathname}`);
  
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;
  
  console.log(`[Middleware] Token exists: ${!!token}`);
  
  if (!token) {
    console.log("[Middleware] No token, redirecting to login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    console.log(`[Middleware] Decoded role: ${payload.role}`);
    
    // ✅ Check role (case-insensitive to be safe)
    if (payload.role?.toLowerCase() !== "admin") {
      console.log("[Middleware] Not admin, redirecting to home");
      return NextResponse.redirect(new URL("/", req.url));
    }
    
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