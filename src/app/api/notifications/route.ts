import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Notification from "@/lib/models/Notification";

export async function GET(req: Request) {
    await dbConnect();
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const unreadOnly = searchParams.get("unread") === "true";

        const filter = unreadOnly ? { isRead: false } : {};
        const skip = (page - 1) * limit;
        const total = await Notification.countDocuments(filter);
        const unreadCount = await Notification.countDocuments({ isRead: false });
        const notifications = await Notification.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return NextResponse.json({
            notifications,
            unreadCount,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    await dbConnect();
    try {
        const body = await req.json();
        if (body.markAllRead) {
            await Notification.updateMany({}, { isRead: true });
            return NextResponse.json({ success: true });
        }
        if (body.id) {
            await Notification.findByIdAndUpdate(body.id, { isRead: true });
            return NextResponse.json({ success: true });
        }
        return NextResponse.json({ error: "Action invalide" }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
