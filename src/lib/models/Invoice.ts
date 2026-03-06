import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInvoice extends Document {
    invoiceNumber: string; // Unique code
    reservationId: mongoose.Types.ObjectId;
    guestName: string;
    guestEmail: string;
    totalAmount: number;
    pdfUrl?: string; // If we needed to store it (optional, we generate it on the fly)
    sentAt: Date;
    status: "sent" | "failed";
}

const InvoiceSchema = new Schema<IInvoice>(
    {
        invoiceNumber: { type: String, required: true, unique: true },
        reservationId: { type: Schema.Types.ObjectId, ref: "Reservation", required: true },
        guestName: { type: String, required: true },
        guestEmail: { type: String, required: true },
        totalAmount: { type: Number, required: true },
        pdfUrl: { type: String },
        sentAt: { type: Date, default: Date.now },
        status: { type: String, enum: ["sent", "failed"], default: "sent" },
    },
    { timestamps: true }
);

const Invoice: Model<IInvoice> = mongoose.models.Invoice || mongoose.model<IInvoice>("Invoice", InvoiceSchema);
export default Invoice;
