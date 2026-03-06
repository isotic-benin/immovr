import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import Admin from "@/lib/models/Admin";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    await dbConnect();
    try {
        const { email, currentPassword, newPassword } = await req.json();

        if (!email || !currentPassword || !newPassword) {
            return NextResponse.json({ error: "Tous les champs sont requis." }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ error: "Le nouveau mot de passe doit contenir au moins 6 caractères." }, { status: 400 });
        }

        const admin = await Admin.findOne({ email }).select("+password");
        if (!admin) {
            return NextResponse.json({ error: "Administrateur non trouvé." }, { status: 404 });
        }

        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) {
            return NextResponse.json({ error: "Le mot de passe actuel est incorrect." }, { status: 401 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        admin.password = hashedPassword;
        await admin.save();

        return NextResponse.json({ success: true, message: "Mot de passe modifié avec succès." });
    } catch (error) {
        return NextResponse.json({ error: "Erreur serveur lors du changement de mot de passe." }, { status: 500 });
    }
}
