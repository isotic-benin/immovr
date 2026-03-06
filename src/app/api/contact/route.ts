import { NextResponse } from "next/server";
import { Resend } from "resend";
import dbConnect from "@/lib/dbConnect";
import CompanySettings from "@/lib/models/CompanySettings";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { name, email, subject, message } = await req.json();

        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: "Tous les champs sont requis." },
                { status: 400 }
            );
        }

        // Fetch company settings to get the destination email
        const settings = await CompanySettings.findOne();

        // Use the configured contact email or fallback to a default
        const destinationEmail = settings?.email || "contact@immovr.ci";

        console.log(`[CONTACT] Attempting to send email via Resend to ${destinationEmail}`);

        const data = await resend.emails.send({
            from: "Nouveau Message <onboarding@resend.dev>", // Using Resend's dev email domain for Sandbox testing
            to: destinationEmail,
            subject: `[Site Web] ${subject}`,
            html: `
                <h2>Nouveau message depuis le formulaire de contact</h2>
                <p><strong>De:</strong> ${name} (${email})</p>
                <p><strong>Sujet:</strong> ${subject}</p>
                <hr />
                <div>
                    <p><strong>Message:</strong></p>
                    <p>${message.replace(/\n/g, '<br/>')}</p>
                </div>
            `,
            replyTo: email
        });

        if (data.error) {
            console.error("[CONTACT ERROR]", data.error);
            return NextResponse.json(
                { error: "Erreur lors de l'envoi de l'email." },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, message: "Email envoyé avec succès." }, { status: 200 });
    } catch (error) {
        console.error("[CONTACT EXCEPTION]", error);
        return NextResponse.json(
            { error: "Erreur serveur." },
            { status: 500 }
        );
    }
}
