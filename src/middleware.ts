import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        // Le middleware s'exécute pour les routes qui matchent le config.matcher
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
        pages: {
            signIn: "/admin/login",
        },
    }
);

// On exclut explicitement /admin/login de la protection du middleware
export const config = {
    matcher: [
        "/admin",
        "/admin/properties/:path*",
        "/admin/users/:path*",
        "/admin/settings/:path*",
        "/admin/reviews/:path*",
        "/admin/notifications/:path*"
    ],
};
