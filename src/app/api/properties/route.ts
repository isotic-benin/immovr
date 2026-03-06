import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Property from "@/lib/models/Property";

export async function GET(req: Request) {
    await dbConnect();

    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;
        const all = searchParams.get("all") === "true"; // if true, fetch inactive as well (for admin)

        const query: any = {};
        if (!all) {
            query.isActive = true;
        }

        const category = searchParams.get("category");
        if (category && category !== "all") {
            query.category = category;
        }

        const properties = await Property.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Property.countDocuments(query);
        const categories = await Property.distinct("category");

        return NextResponse.json({
            properties,
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
        console.log("API POST Property body:", body);
        const property = await Property.create(body);
        return NextResponse.json(property, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Erreur lors de la création du bien" }, { status: 500 });
    }
}
