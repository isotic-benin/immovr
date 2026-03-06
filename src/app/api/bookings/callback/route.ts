import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Reservation from "@/lib/models/Reservation";
import Property from "@/lib/models/Property";
import CompanySettings from "@/lib/models/CompanySettings";
import { createAndSendInvoice } from "@/lib/services/emailService";

export async function GET(req: Request) {
    await dbConnect();
    try {
        const { searchParams } = new URL(req.url);
        const reservationId = searchParams.get("reservationId");
        const status = searchParams.get("status");

        // Sometimes FedaPay might send transaction 'id' instead of status in URL,
        // we fallback or assume success if FedaPay redirects here, but best to check 'status'
        const isSuccess = status === "approved" || status === "completed" || status === "successful" || !status;

        if (!reservationId) {
            return NextResponse.json({ error: "reservationId requis" }, { status: 400 });
        }

        const reservation = await Reservation.findById(reservationId);
        if (!reservation) {
            return NextResponse.json({ error: "Réservation non trouvée" }, { status: 404 });
        }

        const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

        // Prevent generating multiple invoices for the same transaction if callback is hit multiple times
        if (reservation.status === "paid") {
            return NextResponse.redirect(`${baseUrl}/confirmation?id=${reservationId}&status=success`);
        }

        if (isSuccess) {
            reservation.status = "paid";
            await reservation.save();

            // Generate and send PDF Invoice asynchronously
            try {
                const property = await Property.findById(reservation.propertyId);
                const settings = await CompanySettings.findOne();

                if (property) {
                    // We don't await this to avoid blocking the user redirect
                    createAndSendInvoice(reservation, property, settings).catch(console.error);
                }
            } catch (err) {
                console.error("Error triggering invoice generation:", err);
            }

            return NextResponse.redirect(`${baseUrl}/confirmation?id=${reservationId}&status=success`);
        } else {
            reservation.status = "cancelled";
            await reservation.save();
            return NextResponse.redirect(`${baseUrl}/confirmation?id=${reservationId}&status=failed`);
        }
    } catch (error) {
        console.error("Callback error", error);
        const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
        return NextResponse.redirect(`${baseUrl}/confirmation?status=error`);
    }
}
