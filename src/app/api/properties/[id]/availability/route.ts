import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Reservation from "@/lib/models/Reservation";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();

    try {
        const { id } = await params;
        // Fetch all active or pending reservations for this property
        const reservations = await Reservation.find({
            propertyId: id,
            status: { $in: ["pending", "paid"] },
            endDate: { $gte: new Date() }, // Only future bookings
        }).select("startDate endDate");

        return NextResponse.json(reservations);
    } catch (error) {
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
