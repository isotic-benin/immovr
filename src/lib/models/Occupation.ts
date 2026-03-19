import mongoose, { Schema, Document } from "mongoose";

export interface IOccupation extends Document {
    propertyId: mongoose.Types.ObjectId;
    tenantName: string;
    tenantPhone?: string;
    tenantEmail?: string;
    startDate: Date;
    endDate: Date;
    notes?: string;
}

const OccupationSchema: Schema = new Schema(
    {
        propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true },
        tenantName: { type: String, required: true },
        tenantPhone: { type: String, default: "" },
        tenantEmail: { type: String, default: "" },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        notes: { type: String, default: "" },
    },
    { timestamps: true }
);

export default mongoose.models.Occupation || mongoose.model<IOccupation>("Occupation", OccupationSchema);
