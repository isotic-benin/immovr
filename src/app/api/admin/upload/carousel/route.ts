import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { put } from "@vercel/blob";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "Aucun fichier n'a été fourni" }, { status: 400 });
        }

        const filename = `immovr/carousel/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

        // Upload to Vercel Blob
        const blob = await put(filename, file, {
            access: 'public',
            addRandomSuffix: false,
        });

        return NextResponse.json({ url: blob.url });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Erreur lors de l'upload du fichier" }, { status: 500 });
    }
}
