import mongoose, { Schema, Document } from "mongoose";

export interface IReservation extends Document {
    propertyId: mongoose.Types.ObjectId;
    guestDetails: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
    };
    startDate: Date;
    endDate: Date;
    status: "pending" | "paid" | "cancelled";
    totalPrice: number;
}

const ReservationSchema: Schema = new Schema(
    {
        propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true },
        guestDetails: {
            firstName: { type: String, required: true },
            lastName: { type: String, required: true },
            email: { type: String, required: true },
            phone: { type: String, required: true },
        },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        status: { type: String, enum: ["pending", "paid", "cancelled"], default: "pending" },
        totalPrice: { type: Number, required: true },
    },
    { timestamps: true }
);

export default mongoose.models.Reservation || mongoose.model<IReservation>("Reservation", ReservationSchema);
