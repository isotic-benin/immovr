import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
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

        const uploadDir = path.join(process.cwd(), "public", "images", folder);
        await mkdir(uploadDir, { recursive: true });

        const urls: string[] = [];

        for (const file of files) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const ext = path.extname(file.name) || ".jpg";
            const filename = `${randomUUID()}${ext}`;
            const filepath = path.join(uploadDir, filename);

            await writeFile(filepath, buffer);
            urls.push(`/images/${folder}/${filename}`);
        }

        return NextResponse.json({ urls });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Erreur lors de l'upload" }, { status: 500 });
    }
}
