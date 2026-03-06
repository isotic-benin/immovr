import { withAuth } from "next-auth/middleware";

export default withAuth(
    function middleware(req) {
        // Middleware can be empty
    },
    {
        pages: {
            signIn: "/admin/login",
        },
    }
);

export const config = {
    matcher: [
        "/admin",
        "/admin/properties/:path*",
        "/admin/reservations/:path*",
        "/admin/notifications/:path*",
        "/admin/invoices/:path*",
        "/admin/search/:path*",
        "/api/admin/:path*",
    ],
};
