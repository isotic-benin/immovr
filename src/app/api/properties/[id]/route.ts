import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Property from "@/lib/models/Property";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();

    try {
        const { id } = await params;
        const property = await Property.findById(id);
        if (!property) return NextResponse.json({ error: "Bien non trouvé" }, { status: 404 });
        return NextResponse.json(property);
    } catch (error) {
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    try {
        const { id } = await params;
        const body = await req.json();
        console.log("API PUT Property body:", body);
        const property = await Property.findByIdAndUpdate(id, body, { new: true });
        if (!property) return NextResponse.json({ error: "Bien non trouvé" }, { status: 404 });
        return NextResponse.json(property);
    } catch (error) {
        return NextResponse.json({ error: "Erreur serveur lors de la modification" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    try {
        const { id } = await params;
        const property = await Property.findByIdAndDelete(id);
        if (!property) return NextResponse.json({ error: "Bien non trouvé" }, { status: 404 });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Erreur serveur lors de la suppression" }, { status: 500 });
    }
}
