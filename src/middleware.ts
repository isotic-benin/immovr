import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/admin/login",
    },
});

export const config = {
    matcher: [
        // Protéger toutes les pages admin sauf /admin/login
        "/admin",
        "/admin/properties",
        "/admin/reservations",
        "/admin/notifications",
        "/admin/invoices",
        // Protéger les API admin
        "/api/admin/stats",
    ],
};
