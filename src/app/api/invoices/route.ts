import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Invoice from "@/lib/models/Invoice";

export async function GET(req: Request) {
    await dbConnect();
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "10", 10);
        const search = searchParams.get("search") || "";

        const query: any = {};
        if (search) {
            query.invoiceNumber = { $regex: search, $options: "i" };
        }

        const invoices = await Invoice.find(query)
            .populate({ path: "reservationId", select: "startDate endDate propertyId", populate: { path: "propertyId", select: "title" } })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Invoice.countDocuments(query);

        return NextResponse.json({
            invoices,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
        });
    } catch (error) {
        return NextResponse.json({ error: "Erreur serveur lors de la récupération des factures" }, { status: 500 });
    }
}
