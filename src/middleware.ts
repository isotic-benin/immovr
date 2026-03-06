import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const { pathname } = req.nextUrl;

        // Autoriser l'accès public en GET à l'API settings (pour le carrousel)
        if (pathname === "/api/admin/settings" && req.method === "GET") {
            return NextResponse.next();
        }
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const { pathname } = req.nextUrl;

                // Routes publiques ou APIs spécifiques à autoriser sans token
                if (pathname === "/api/admin/settings" && req.method === "GET") {
                    return true;
                }

                // Par défaut, nécessite un token pour tout ce qui match le config.matcher
                return !!token;
            },
        },
        pages: {
            signIn: "/admin/login",
        },
    }
);

export const config = {
    matcher: [
        "/admin/:path*",
        "/api/admin/:path*",
    ],
};
