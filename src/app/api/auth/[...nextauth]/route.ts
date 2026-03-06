import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import Admin from "@/lib/models/Admin";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Admin Login",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                await dbConnect();

                if (!credentials?.email || !credentials.password) {
                    throw new Error("Veuillez fournir un email et un mot de passe.");
                }

                const admin = await Admin.findOne({ email: credentials.email }).select("+password");

                if (!admin) {
                    throw new Error("Identifiants incorrects.");
                }

                const isMatch = await bcrypt.compare(credentials.password, admin.password);

                if (!isMatch) {
                    throw new Error("Mot de passe incorrect.");
                }

                return { id: admin._id.toString(), email: admin.email, role: "admin" };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }: { token: any, user: any }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }: { session: any, token: any }) {
            if (token && session.user) {
                session.user.role = token.role;
                session.user.id = token.id;
            }
            return session;
        },
    },
    pages: {
        signIn: "/admin/login",
    },
    session: {
        strategy: "jwt" as const,
        maxAge: 6 * 60 * 60, // 6 hours
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
