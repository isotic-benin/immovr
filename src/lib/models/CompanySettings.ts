import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICompanySettings extends Document {
    raisonSociale: string;
    rccm: string;
    telephone: string;
    whatsappNumber: string;
    ifu: string;
    localisation: string;
    email: string;
    logoUrl: string;
    devise: string;
    heroCarouselImages: string[];
}

const CompanySettingsSchema = new Schema<ICompanySettings>(
    {
        raisonSociale: { type: String, default: "Mon Agence ImmoVR" },
        rccm: { type: String, default: "" },
        telephone: { type: String, default: "" },
        whatsappNumber: { type: String, default: "" },
        ifu: { type: String, default: "" },
        localisation: { type: String, default: "" },
        email: { type: String, default: "" },
        logoUrl: { type: String, default: "" },
        devise: { type: String, default: "FCFA" },
        heroCarouselImages: { type: [String], default: [] }
    },
    { timestamps: true }
);

const CompanySettings: Model<ICompanySettings> =
    mongoose.models.CompanySettings || mongoose.model("CompanySettings", CompanySettingsSchema);

export default CompanySettings;
