import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/dbConnect";
import Property from "@/lib/models/Property";
import Occupation from "@/lib/models/Occupation";
import CompanySettings from "@/lib/models/CompanySettings";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    await dbConnect();
    try {
        const totalProperties = await Property.countDocuments();

        const now = new Date();

        // Active occupations (currently ongoing)
        const activeOccupations = await Occupation.countDocuments({
            startDate: { $lte: now },
            endDate: { $gte: now },
        });

        // Total occupations
        const totalOccupations = await Occupation.countDocuments();

        // Vacant properties count
        const occupiedPropertyIds = await Occupation.distinct("propertyId", {
            startDate: { $lte: now },
            endDate: { $gte: now },
        });
        const vacantProperties = totalProperties - occupiedPropertyIds.length;

        // Upcoming expirations (next 7 days)
        const sevenDaysLater = new Date(now);
        sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
        const upcomingExpirations = await Occupation.countDocuments({
            endDate: { $gte: now, $lte: sevenDaysLater },
        });

        // All active/upcoming occupations for calendar
        const allActiveOccupations = await Occupation.find({
            endDate: { $gte: now },
        })
            .populate("propertyId", "title")
            .sort({ startDate: 1 });

        // Recent occupations
        const recentOccupations = await Occupation.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("propertyId", "title");

        // Devise
        const settings = await CompanySettings.findOne();
        const devise = settings?.devise || "FCFA";

        return NextResponse.json({
            totalProperties,
            activeOccupations,
            totalOccupations,
            vacantProperties,
            upcomingExpirations,
            allActiveOccupations,
            recentOccupations,
            devise,
        });
    } catch (error) {
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
