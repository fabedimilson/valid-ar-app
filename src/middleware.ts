
import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"
import { NextResponse } from "next/server"

// Initialize NextAuth with ONLY the edge-compatible config for middleware usage
const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const isLoginPage = req.nextUrl.pathname.startsWith('/login')
    const isRootPage = req.nextUrl.pathname === '/'

    if (isLoggedIn) {
        if (isLoginPage || isRootPage) {
            return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
        }
    }

    if (!isLoggedIn) {
        if (!isLoginPage && !isRootPage) {
            return NextResponse.redirect(new URL('/login', req.nextUrl))
        }
    }

    return NextResponse.next();
})

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
