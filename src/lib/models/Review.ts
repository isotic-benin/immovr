import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
    propertyId: mongoose.Types.ObjectId;
    guestName: string;
    guestEmail: string;
    rating: number;
    comment: string;
    likes: number;
}

const ReviewSchema: Schema = new Schema(
    {
        propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true },
        guestName: { type: String, required: true },
        guestEmail: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
        likes: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export default mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);
