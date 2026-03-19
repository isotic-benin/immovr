import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Occupation from "@/lib/models/Occupation";
import Notification from "@/lib/models/Notification";

export async function GET() {
    await dbConnect();
    try {
        const now = new Date();
        const alerts = [
            { days: 7, label: "dans 7 jours" },
            { days: 3, label: "dans 3 jours" },
            { days: 1, label: "demain" },
            { days: 0, label: "aujourd'hui" },
        ];

        let created = 0;

        for (const alert of alerts) {
            const targetDate = new Date(now);
            targetDate.setDate(targetDate.getDate() + alert.days);
            const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
            const endOfDay = new Date(startOfDay);
            endOfDay.setDate(endOfDay.getDate() + 1);

            // Find occupations ending on this target date
            const expiringOccupations = await Occupation.find({
                endDate: { $gte: startOfDay, $lt: endOfDay },
            }).populate("propertyId", "title");

            for (const occ of expiringOccupations) {
                // Check for duplicates (avoid sending same notification twice)
                const existing = await Notification.findOne({
                    type: "lease_expiry",
                    relatedId: occ._id.toString(),
                    message: { $regex: alert.label },
                });

                if (!existing) {
                    const propertyTitle = (occ.propertyId as any)?.title || "Bien inconnu";
                    await Notification.create({
                        type: "lease_expiry",
                        title: `Échéance de location — ${alert.label}`,
                        message: `L'occupation de "${propertyTitle}" par ${occ.tenantName} se termine ${alert.label} (${new Date(occ.endDate).toLocaleDateString("fr-FR")}).`,
                        relatedId: occ._id.toString(),
                    });
                    created++;
                }
            }
        }

        return NextResponse.json({ success: true, notificationsCreated: created });
    } catch (error) {
        console.error("Check expirations error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
