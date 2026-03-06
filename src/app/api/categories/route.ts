import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Category from "@/lib/models/Category";

export async function GET() {
    await dbConnect();
    try {
        const categories = await Category.find().sort({ name: 1 });
        return NextResponse.json(categories);
    } catch (error) {
        return NextResponse.json({ error: "Erreur lors de la récupération des catégories" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    await dbConnect();
    try {
        const { name } = await req.json();
        if (!name || !name.trim()) {
            return NextResponse.json({ error: "Le nom de la catégorie est requis" }, { status: 400 });
        }

        const existing = await Category.findOne({ name: name.trim() });
        if (existing) {
            return NextResponse.json({ error: "Cette catégorie existe déjà" }, { status: 409 });
        }

        const category = await Category.create({ name: name.trim() });
        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Erreur lors de la création de la catégorie" }, { status: 500 });
    }
}
