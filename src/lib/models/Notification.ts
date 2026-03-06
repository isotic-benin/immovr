import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
    type: "review" | "reservation" | "contact";
    title: string;
    message: string;
    relatedId?: string;
    isRead: boolean;
}

const NotificationSchema = new Schema<INotification>(
    {
        type: { type: String, enum: ["review", "reservation", "contact"], required: true },
        title: { type: String, required: true },
        message: { type: String, required: true },
        relatedId: { type: String },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const Notification: Model<INotification> =
    mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);

export default Notification;
