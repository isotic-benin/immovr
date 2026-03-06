import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Property from "@/lib/models/Property";
import Reservation from "@/lib/models/Reservation";
import Invoice from "@/lib/models/Invoice";

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const q = searchParams.get("q") || "";

        if (!q.trim()) {
            return NextResponse.json({ properties: [], reservations: [], invoices: [] });
        }

        const regex = new RegExp(q, "i");

        // 1. Search Properties
        const propertiesPromise = Property.find({
            $or: [
                { title: regex },
                { description: regex },
                { category: regex },
                { "location.commune": regex },
                { "location.quartier": regex },
                { features: regex },
            ]
        }).limit(10).lean();

        // 2. Search Reservations
        const reservationsPromise = Reservation.find({
            $or: [
                { guestName: regex },
                { guestEmail: regex },
                { guestPhone: regex },
                { "guestDetails.firstName": regex },
                { "guestDetails.lastName": regex },
                { "guestDetails.email": regex },
                { "guestDetails.phone": regex },
            ]
        }).populate("propertyId", "title").limit(10).lean();

        // 3. Search Invoices
        const invoicesPromise = Invoice.find({
            $or: [
                { invoiceNumber: regex },
                { guestName: regex },
                { guestEmail: regex },
            ]
        }).populate("reservationId").limit(10).lean();

        const [properties, reservations, invoices] = await Promise.all([
            propertiesPromise,
            reservationsPromise,
            invoicesPromise
        ]);

        return NextResponse.json({
            properties,
            reservations,
            invoices
        });

    } catch (error: any) {
        console.error("Erreur api/admin/search:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
