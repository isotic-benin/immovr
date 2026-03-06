import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Reservation from "@/lib/models/Reservation";
import Property from "@/lib/models/Property";
import Notification from "@/lib/models/Notification";
import { FedaPay, Transaction } from "fedapay";

export async function POST(req: Request) {
    await dbConnect();
    try {
        const body = await req.json();
        const { propertyId, guestDetails, startDate, endDate, totalPrice } = body;

        // Validate property
        const property = await Property.findById(propertyId);
        if (!property || !property.isActive) {
            return NextResponse.json({ error: "Bien non disponible" }, { status: 400 });
        }

        // Check overlapping dates
        const overlap = await Reservation.findOne({
            propertyId,
            status: { $ne: "cancelled" },
            startDate: { $lte: new Date(endDate) },
            endDate: { $gte: new Date(startDate) },
        });
        if (overlap) {
            return NextResponse.json({ error: "Ces dates sont déjà réservées" }, { status: 409 });
        }

        // Create reservation with pending status
        const reservation = await Reservation.create({
            propertyId,
            guestDetails,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            status: "pending",
            totalPrice,
        });

        // Init FedaPay
        FedaPay.setApiKey(process.env.FEDAPAY_SECRET_KEY!);
        FedaPay.setEnvironment((process.env.FEDAPAY_ENV as "sandbox" | "live") || "sandbox");

        // Create FedaPay transaction
        const transaction = await Transaction.create({
            description: `Réservation - ${property.title}`,
            amount: totalPrice,
            currency: { iso: "XOF" },
            callback_url: `${process.env.NEXTAUTH_URL}/api/bookings/callback?reservationId=${reservation._id}`,
            customer: {
                firstname: guestDetails.firstName,
                lastname: guestDetails.lastName,
                email: guestDetails.email,
                phone_number: { number: guestDetails.phone, country: "bj" },
            },
        });

        // Generate payment token/URL
        const token = await transaction.generateToken();

        // Create notification
        await Notification.create({
            type: "reservation",
            title: "Nouvelle réservation en attente",
            message: `${guestDetails.firstName} ${guestDetails.lastName} souhaite réserver "${property.title}" du ${new Date(startDate).toLocaleDateString("fr-FR")} au ${new Date(endDate).toLocaleDateString("fr-FR")} pour ${totalPrice} FCFA.`,
            relatedId: reservation._id.toString(),
        });

        return NextResponse.json({
            reservationId: reservation._id,
            paymentUrl: token.url,
        });
    } catch (error: any) {
        console.error("Booking error:", error?.message || error);
        return NextResponse.json({ error: error?.message || "Erreur lors de la réservation" }, { status: 500 });
    }
}
