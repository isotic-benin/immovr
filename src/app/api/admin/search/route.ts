import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import Property from "@/lib/models/Property";
import Occupation from "@/lib/models/Occupation";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    try {
        await dbConnect();
        
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q");

        if (!query || query.length < 2) {
            return NextResponse.json({ properties: [], occupations: [] });
        }

        const regex = new RegExp(query, "i");

        // 1. Search Properties
        const propertiesPromise = Property.find({
            $or: [
                { title: regex },
                { description: regex },
                { "location.commune": regex },
                { "location.quartier": regex }
            ]
        }).limit(10).lean();

        // 2. Search Occupations
        const occupationsPromise = Occupation.find({
            $or: [
                { tenantName: regex },
                { tenantEmail: regex },
                { tenantPhone: regex },
                { notes: regex }
            ]
        }).populate("propertyId").limit(10).lean();

        const [properties, occupations] = await Promise.all([
            propertiesPromise,
            occupationsPromise,
        ]);

        return NextResponse.json({
            properties,
            occupations,
        });

    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json({ error: "Erreur lors de la recherche" }, { status: 500 });
    }
}
