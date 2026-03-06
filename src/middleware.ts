import { withAuth } from "next-auth/middleware";

export default withAuth(
    function middleware(req) {
        // Ce middleware s'exécute après que withAuth a vérifié le token
    },
    {
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
