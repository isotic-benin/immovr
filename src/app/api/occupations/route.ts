import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Occupation from "@/lib/models/Occupation";
import Property from "@/lib/models/Property";

export async function GET(req: Request) {
    await dbConnect();
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "50");
        const skip = (page - 1) * limit;
        const propertyId = searchParams.get("propertyId");

        const query: any = {};
        if (propertyId) {
            query.propertyId = propertyId;
        }

        const occupations = await Occupation.find(query)
            .populate("propertyId", "title")
            .skip(skip)
            .limit(limit)
            .sort({ startDate: -1 });

        const total = await Occupation.countDocuments(query);

        return NextResponse.json({
            occupations,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total,
        });
    } catch (error: any) {
        return NextResponse.json({ error: "Erreur lors de la récupération des occupations" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    await dbConnect();
    try {
        const body = await req.json();
        const { propertyId, tenantName, tenantPhone, tenantEmail, startDate, endDate, notes } = body;

        // Validate property
        const property = await Property.findById(propertyId);
        if (!property) {
            return NextResponse.json({ error: "Bien non trouvé" }, { status: 400 });
        }

        // Check overlapping dates
        const overlap = await Occupation.findOne({
            propertyId,
            startDate: { $lte: new Date(endDate) },
            endDate: { $gte: new Date(startDate) },
        });
        if (overlap) {
            return NextResponse.json({ error: "Ces dates chevauchent une occupation existante" }, { status: 409 });
        }

        const occupation = await Occupation.create({
            propertyId,
            tenantName,
            tenantPhone: tenantPhone || "",
            tenantEmail: tenantEmail || "",
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            notes: notes || "",
        });

        return NextResponse.json(occupation, { status: 201 });
    } catch (error: any) {
        console.error("Occupation creation error:", error?.message || error);
        return NextResponse.json({ error: error?.message || "Erreur lors de la création de l'occupation" }, { status: 500 });
    }
}
