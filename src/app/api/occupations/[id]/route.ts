import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Occupation from "@/lib/models/Occupation";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    try {
        const { id } = await params;
        const body = await req.json();
        const occupation = await Occupation.findByIdAndUpdate(id, body, { new: true });
        if (!occupation) return NextResponse.json({ error: "Occupation non trouvée" }, { status: 404 });
        return NextResponse.json(occupation);
    } catch (error) {
        return NextResponse.json({ error: "Erreur serveur lors de la modification" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    try {
        const { id } = await params;
        const res = await Occupation.findByIdAndDelete(id);
        if (!res) return NextResponse.json({ error: "Occupation non trouvée" }, { status: 404 });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Erreur serveur lors de la suppression" }, { status: 500 });
    }
}
