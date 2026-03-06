import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Review from "@/lib/models/Review";
import Property from "@/lib/models/Property";
import Notification from "@/lib/models/Notification";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    await dbConnect();
    try {
        const { id } = await params;
        const body = await req.json();
        const { action } = body; // "like" or "unlike"

        if (!id) {
            return NextResponse.json({ error: "ID de l'avis requis" }, { status: 400 });
        }

        const increment = action === "unlike" ? -1 : 1;

        const review = await Review.findByIdAndUpdate(
            id,
            { $inc: { likes: increment } },
            { new: true }
        ).populate("propertyId");

        if (!review) {
            return NextResponse.json({ error: "Avis non trouvé" }, { status: 404 });
        }

        // Only create notification on "like"
        if (action !== "unlike") {
            const property = review.propertyId;
            await Notification.create({
                type: "review",
                title: "Nouveau Like sur un avis",
                message: `Quelqu'un a aimé l'avis de ${review.guestName} sur le bien "${property?.title || 'un bien'}".`,
                relatedId: property?._id?.toString(),
            });
        }

        return NextResponse.json({ likes: review.likes });
    } catch (error) {
        console.error("Like error:", error);
        return NextResponse.json({ error: "Erreur lors de la mise à jour des likes" }, { status: 500 });
    }
}
