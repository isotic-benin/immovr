import mongoose, { Schema, Document } from "mongoose";

export interface IProperty extends Document {
    title: string;
    description: string;
    location: {
        commune: string;
        quartier: string;
        address?: string;
    };
    price: number;
    pricingPeriod: string;
    panoramaImageUrls: string[];
    regularImageUrls: string[];
    isActive: boolean;
    mapUrl?: string; // New field for Google Maps link
    category?: string;
    features: string[];
    averageRating: number;
    totalReviews: number;
}

const PropertySchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        location: {
            commune: { type: String, required: true },
            quartier: { type: String, required: true },
            address: { type: String },
        },
        price: { type: Number, required: true },
        pricingPeriod: { type: String, enum: ['heure', 'jour', 'semaine', 'mois'], default: 'heure' },
        panoramaImageUrls: { type: [String], default: [] },
        regularImageUrls: { type: [String], default: [] },
        isActive: { type: Boolean, default: true },
        mapUrl: { type: String, default: "" },
        category: { type: String, default: "" },
        features: { type: [String], default: [] },
        averageRating: { type: Number, default: 0 },
        totalReviews: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export default mongoose.models.Property || mongoose.model<IProperty>("Property", PropertySchema);
