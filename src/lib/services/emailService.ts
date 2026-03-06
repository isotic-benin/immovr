import { Resend } from 'resend';
import { renderToBuffer } from '@react-pdf/renderer';
import { InvoiceTemplate } from '@/components/pdf/InvoiceTemplate';
import Invoice from '@/lib/models/Invoice';
import React from 'react';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function createAndSendInvoice(reservation: any, property: any, agencySettings: any) {
    try {
        // Generate unique invoice number: INV-YEAR-RANDOM
        const year = new Date().getFullYear();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        const invoiceNumber = `INV-${year}-${random}`;

        // Calculate days based on start and end
        const startDate = new Date(reservation.startDate);
        const endDate = new Date(reservation.endDate);
        const d = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const days = d > 0 ? d : 1;

        // Build template props
        const pdfProps = {
            invoiceNumber,
            date: new Date().toLocaleDateString('fr-FR'),
            client: {
                name: `${reservation.guestDetails?.firstName || ''} ${reservation.guestDetails?.lastName || ''}`.trim() || reservation.guestName,
                email: reservation.guestDetails?.email || reservation.guestEmail,
                phone: reservation.guestDetails?.phone || reservation.guestPhone,
            },
            property: {
                title: property.title,
                location: `${property.location?.quartier || ''}, ${property.location?.commune || ''}`,
                mapUrl: property.mapUrl,
            },
            booking: {
                start: startDate.toLocaleDateString('fr-FR'),
                end: endDate.toLocaleDateString('fr-FR'),
                days,
            },
            amount: {
                price: property.price || property.pricePerHour || 0,
                pricingPeriod: property.pricingPeriod || 'heure',
                total: reservation.totalPrice,
                devise: agencySettings?.devise || 'FCFA',
            },
            agency: {
                name: agencySettings?.raisonSociale || 'ImmoVR',
                email: agencySettings?.email || 'contact@immovr.com',
                phone: agencySettings?.telephone || '',
                address: agencySettings?.localisation || '',
                rccm: agencySettings?.rccm || '',
                ifu: agencySettings?.ifu || '',
                logo: agencySettings?.logoUrl || '',
            }
        };

        // Render PDF to Buffer
        const pdfBuffer = await renderToBuffer(React.createElement(InvoiceTemplate, pdfProps) as any);

        // Save invoice to database (optional, but requested for admin dashboard)
        await Invoice.create({
            invoiceNumber,
            reservationId: reservation._id,
            guestName: pdfProps.client.name,
            guestEmail: pdfProps.client.email,
            totalAmount: reservation.totalPrice,
            status: "sent"
        });

        // Send email using Resend
        if (process.env.RESEND_API_KEY) {
            const { data, error } = await resend.emails.send({
                from: `Facturation ${pdfProps.agency.name} <onboarding@resend.dev>`, // Resend requires this exact sandbox address
                to: [pdfProps.client.email],
                subject: `Facture de réservation - ${property.title} (${invoiceNumber})`,
                text: `Bonjour ${pdfProps.client.name},\n\nMerci pour votre réservation chez ${pdfProps.agency.name}. Veuillez trouver ci-joint votre facture.\n\nCordialement,\nL'équipe ${pdfProps.agency.name}`,
                attachments: [
                    {
                        filename: `Facture_${invoiceNumber}.pdf`,
                        content: pdfBuffer,
                    },
                ],
            });

            if (error) {
                console.error("Resend Error:", error);
            }
        } else {
            console.warn("RESEND_API_KEY is not defined. PDF was generated and saved to DB, but email was not sent.");
        }

        return { success: true, invoiceNumber };
    } catch (error) {
        console.error("Error creating/sending invoice:", error);
        return { success: false, error };
    }
}
