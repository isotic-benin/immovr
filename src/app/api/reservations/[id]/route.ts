import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Reservation from "@/lib/models/Reservation";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    try {
        const { id } = await params;
        const body = await req.json();
        const reservation = await Reservation.findByIdAndUpdate(id, body, { new: true });
        if (!reservation) return NextResponse.json({ error: "Réservation non trouvée" }, { status: 404 });
        return NextResponse.json(reservation);
    } catch (error) {
        return NextResponse.json({ error: "Erreur serveur lors de la modification" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    try {
        const { id } = await params;
        const res = await Reservation.findByIdAndDelete(id);
        if (!res) return NextResponse.json({ error: "Réservation non trouvée" }, { status: 404 });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Erreur serveur lors de la suppression" }, { status: 500 });
    }
}
