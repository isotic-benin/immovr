import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import path from "path";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const files = formData.getAll("files") as File[];
        const folder = formData.get("folder") as string || "biens";

        if (!files || files.length === 0) {
            return NextResponse.json({ error: "Aucun fichier envoyé" }, { status: 400 });
        }

        const urls: string[] = [];

        for (const file of files) {
            const ext = path.extname(file.name) || ".jpg";
            const filename = `immovr/${folder}/${randomUUID()}${ext}`;

            // Upload to Vercel Blob
            const blob = await put(filename, file, {
                access: 'public',
                addRandomSuffix: false,
            });

            urls.push(blob.url);
        }

        return NextResponse.json({ urls });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Erreur lors de l'upload" }, { status: 500 });
    }
}
