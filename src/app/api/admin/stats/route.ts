import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/dbConnect";
import Property from "@/lib/models/Property";
import Reservation from "@/lib/models/Reservation";
import CompanySettings from "@/lib/models/CompanySettings";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    await dbConnect();
    try {
        const totalProperties = await Property.countDocuments();

        // Reservations stats
        const allReservations = await Reservation.find();
        const paidReservations = allReservations.filter(r => r.status === 'paid');

        const totalReservationsCount = allReservations.length;
        const totalRevenue = paidReservations.reduce((sum, r) => sum + (r.totalPrice || 0), 0);

        // Unique clients
        const uniqueClients = new Set(allReservations.map(r => r.guestDetails?.email || r.guestEmail));
        const totalClients = uniqueClients.size;

        // Recent reservations
        const recentReservations = await Reservation.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("propertyId", "title");

        // All active/upcoming reservations for calendar
        const allActiveReservations = await Reservation.find({
            status: 'paid'
        })
            .populate("propertyId", "title")
            .sort({ startDate: 1 });

        // Devise
        const settings = await CompanySettings.findOne();
        const devise = settings?.devise || "FCFA";

        return NextResponse.json({
            totalProperties,
            totalReservations: totalReservationsCount,
            totalRevenue,
            totalClients,
            recentReservations,
            allActiveReservations,
            devise
        });
    } catch (error) {
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
