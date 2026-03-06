import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Review from "@/lib/models/Review";
import Property from "@/lib/models/Property";
import Notification from "@/lib/models/Notification";

export async function GET(req: Request) {
    await dbConnect();
    try {
        const { searchParams } = new URL(req.url);
        const propertyId = searchParams.get("propertyId");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "5");

        if (!propertyId) {
            return NextResponse.json({ error: "propertyId requis" }, { status: 400 });
        }

        const skip = (page - 1) * limit;
        const total = await Review.countDocuments({ propertyId });
        const reviews = await Review.find({ propertyId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return NextResponse.json({
            reviews,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    await dbConnect();
    try {
        const body = await req.json();
        const { propertyId, guestName, guestEmail, rating, comment } = body;

        if (!propertyId || !guestName || !guestEmail || !rating || !comment) {
            return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 });
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json({ error: "La note doit être entre 1 et 5" }, { status: 400 });
        }

        const review = await Review.create({
            propertyId,
            guestName,
            guestEmail,
            rating,
            comment,
        });

        // Update property average rating
        const allReviews = await Review.find({ propertyId });
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        await Property.findByIdAndUpdate(propertyId, {
            averageRating: Math.round(avgRating * 10) / 10,
            totalReviews: allReviews.length,
        });

        // Get property title for notification
        const property = await Property.findById(propertyId);

        // Create notification
        await Notification.create({
            type: "review",
            title: `Nouvel avis - ${rating}/5 ⭐`,
            message: `${guestName} a laissé un avis sur "${property?.title || 'un bien'}": "${comment.substring(0, 80)}${comment.length > 80 ? '...' : ''}"`,
            relatedId: propertyId,
        });

        return NextResponse.json(review, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Erreur lors de la création de l'avis" }, { status: 500 });
    }
}
