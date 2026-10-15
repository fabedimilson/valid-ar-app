
import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"
import { NextResponse } from "next/server"

// Initialize NextAuth with ONLY the edge-compatible config for middleware usage
const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const isLoginPage = req.nextUrl.pathname.startsWith('/login')
    const isRootPage = req.nextUrl.pathname === '/'

    const role = (req.auth?.user as any)?.role?.toLowerCase()
    const pathname = req.nextUrl.pathname

    if (isLoggedIn) {
        if (isLoginPage || isRootPage) {
            return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
        }

        // RBAC: Rotas de fiscalização e atesto de setor (/server/*)
        if (pathname.startsWith('/server')) {
            const isAuthorized = role === 'server' || role === 'admin' || role === 'fiscal_contrato'
            if (!isAuthorized) {
                return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
            }
        }

        // RBAC: Rotas técnicas (/technician/*)
        if (pathname.startsWith('/technician')) {
            const isAuthorized = role === 'technician' || role === 'admin' || role === 'fiscal_contrato'
            if (!isAuthorized) {
                return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
            }
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
