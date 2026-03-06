import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/dbConnect";
import CompanySettings from "@/lib/models/CompanySettings";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
    await dbConnect();
    try {
        let settings = await CompanySettings.findOne();
        if (!settings) {
            settings = await CompanySettings.create({});
        }
        console.log("GET Settings - heroCarouselImages count:", settings.heroCarouselImages?.length || 0);
        return NextResponse.json(settings);
    } catch (error) {
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    await dbConnect();
    try {
        const body = await req.json();
        console.log("PUT Settings - incoming data keys:", Object.keys(body));

        let settings = await CompanySettings.findOne();
        if (!settings) {
            settings = await CompanySettings.create(body);
        } else {
            // Explicitly update fields to ensure Mongoose treats them as modified
            if (body.heroCarouselImages) {
                settings.heroCarouselImages = body.heroCarouselImages;
                settings.markModified("heroCarouselImages");
            }

            // Clean up body from heroCarouselImages to use Object.assign for others safely
            const { heroCarouselImages, ...otherFields } = body;
            Object.assign(settings, otherFields);

            await settings.save();
        }
        console.log("PUT Settings - saved successfully. Count now:", settings.heroCarouselImages?.length || 0);
        return NextResponse.json(settings);
    } catch (error) {
        console.error("PUT Settings error:", error);
        return NextResponse.json({ error: "Erreur lors de la sauvegarde" }, { status: 500 });
    }
}
