import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Reservation from "@/lib/models/Reservation";
import Property from "@/lib/models/Property"; // Required for population

export async function GET(req: Request) {
    await dbConnect();
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        const reservations = await Reservation.find()
            .populate("propertyId", "title")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Reservation.countDocuments();

        return NextResponse.json({
            reservations,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error: any) {
        return NextResponse.json({ error: "Erreur lors de la récupération des réservations" }, { status: 500 });
    }
}
