import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Admin from "@/lib/models/Admin";

export async function GET() {
    console.log("[DIAG] Lancement du diagnostic...");
    try {
        const startTime = Date.now();
        await dbConnect();
        const dbTime = Date.now() - startTime;
        console.log(`[DIAG] Connexion DB réussie en ${dbTime}ms`);

        const adminCount = await Admin.countDocuments();
        console.log(`[DIAG] Nombre d'admins en base : ${adminCount}`);

        const envVars = {
            MONGODB_URI: process.env.MONGODB_URI ? "Défini (masqué)" : "NON DÉFINI",
            NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "Défini (masqué)" : "NON DÉFINI",
            NEXTAUTH_URL: process.env.NEXTAUTH_URL || "Non défini (Vercel utilisera l'URL actuelle)",
            DEFAULT_ADMIN_EMAIL: process.env.DEFAULT_ADMIN_EMAIL || "Non défini",
        };

        return NextResponse.json({
            status: "OK",
            database: "Connecté",
            dbTime: `${dbTime}ms`,
            adminCount,
            envVars
        });
    } catch (error: any) {
        console.error("[DIAG] Erreur lors du diagnostic :", error);
        return NextResponse.json({
            status: "ERREUR",
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
