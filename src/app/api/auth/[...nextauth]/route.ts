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
                console.log("[AUTH] Début tentative de connexion:", credentials?.email);
                try {
                    await dbConnect();
                    console.log("[AUTH] Connexion DB OK");

                    if (!credentials?.email || !credentials.password) {
                        console.warn("[AUTH] Email ou mot de passe manquant");
                        throw new Error("Veuillez fournir un email et un mot de passe.");
                    }

                    const admin = await Admin.findOne({ email: credentials.email }).select("+password");
                    console.log("[AUTH] Recherche Admin terminée, trouvé:", !!admin);

                    if (!admin) {
                        throw new Error("Identifiants incorrects.");
                    }

                    console.log("[AUTH] Comparaison mot de passe...");
                    const isMatch = await bcrypt.compare(credentials.password, admin.password);
                    console.log("[AUTH] Match mot de passe:", isMatch);

                    if (!isMatch) {
                        throw new Error("Mot de passe incorrect.");
                    }

                    return { id: admin._id.toString(), email: admin.email, role: "admin" };
                } catch (error: any) {
                    console.error("[AUTH] Erreur critique pendant l'autorisation:", error.message);
                    throw error;
                }
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
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
