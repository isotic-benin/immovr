import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Property from "@/lib/models/Property";
import Occupation from "@/lib/models/Occupation";

export async function GET(req: Request) {
    await dbConnect();

    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;
        const all = searchParams.get("all") === "true";

        const locationParam = searchParams.get("location");
        const startDateParam = searchParams.get("startDate");
        const endDateParam = searchParams.get("endDate");
        const category = searchParams.get("category");

        const query: any = {};
        if (!all) {
            query.isActive = true;
        }

        if (category && category !== "all") {
            query.category = category;
        }

        if (locationParam) {
            query.$or = [
                { "location.commune": { $regex: locationParam, $options: "i" } },
                { "location.quartier": { $regex: locationParam, $options: "i" } },
                { title: { $regex: locationParam, $options: "i" } }
            ];
        }

        let properties = await Property.find(query).sort({ createdAt: -1 });

        // Filter by availability if dates are provided
        if (startDateParam && endDateParam) {
            const startDate = new Date(startDateParam);
            const endDate = new Date(endDateParam);

            // Find properties that ARE occupied during this period
            const overlappingOccupations = await Occupation.find({
                startDate: { $lte: endDate },
                endDate: { $gte: startDate }
            });

            const occupiedPropertyIds = overlappingOccupations.map(occ => occ.propertyId.toString());

            // Filter out occupied properties
            properties = properties.filter(p => !occupiedPropertyIds.includes(p._id.toString()));
        }

        const total = properties.length;
        const paginatedProperties = properties.slice(skip, skip + limit);
        const categories = await Property.distinct("category");

        return NextResponse.json({
            properties: paginatedProperties,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total,
            categories: categories.filter(Boolean)
        });
    } catch (error) {
        return NextResponse.json({ error: "Erreur lors de la récupération des biens" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    await dbConnect();

    try {
        const body = await req.json();
        const property = await Property.create(body);
        return NextResponse.json(property, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Erreur lors de la création du bien" }, { status: 500 });
    }
}
