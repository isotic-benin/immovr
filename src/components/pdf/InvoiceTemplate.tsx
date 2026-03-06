import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register fonts if needed, or use standard
const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Helvetica', fontSize: 11, color: '#334155' },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 20 },
    logoContainer: { width: 150 },
    logo: { width: '100%', height: 'auto', maxHeight: 80 },
    agencyInfo: { alignItems: 'flex-end', gap: 4 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 },
    text: { fontSize: 10, color: '#64748b' },
    boldText: { fontWeight: 'bold', color: '#334155' },

    invoiceDetails: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
    clientInfo: { gap: 4, flex: 1 },
    metaInfo: { alignItems: 'flex-end', gap: 4, flex: 1 },

    table: { width: '100%', marginTop: 20 },
    tableHeader: { flexDirection: 'row', backgroundColor: '#f1f5f9', padding: 8, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: '#cbd5e1' },
    tableRow: { flexDirection: 'row', padding: 8, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    col1: { width: '40%' },
    col2: { width: '20%' },
    col3: { width: '20%' },
    colRight: { width: '20%', textAlign: 'right' },

    totalsContainer: { marginTop: 20, alignItems: 'flex-end' },
    totalRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 4, width: '50%' },
    totalLabel: { width: '50%', textAlign: 'right', paddingRight: 10, color: '#64748b' },
    totalValue: { width: '50%', textAlign: 'right', fontWeight: 'bold' },
    grandTotalLabel: { width: '50%', textAlign: 'right', paddingRight: 10, fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
    grandTotalValue: { width: '50%', textAlign: 'right', fontSize: 14, fontWeight: 'bold', color: '#0ea5e9' },

    footer: { position: 'absolute', bottom: 40, left: 40, right: 40, textAlign: 'center', color: '#94a3b8', fontSize: 9, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#e2e8f0' }
});

interface InvoiceTemplateProps {
    invoiceNumber: string;
    date: string;
    client: { name: string; email: string; phone?: string };
    property: { title: string; location: string; mapUrl?: string };
    booking: { start: string; end: string; days: number };
    amount: { price: number; pricingPeriod: string; total: number; devise: string };
    agency: { name: string; email: string; phone: string; address: string; rccm?: string; ifu?: string; logo?: string };
}

export const InvoiceTemplate = ({ invoiceNumber, date, client, property, booking, amount, agency }: InvoiceTemplateProps) => (
    <Document>
        <Page size="A4" style={styles.page}>

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.logoContainer}>
                    {agency.logo ? <Image src={agency.logo} style={styles.logo} /> : <Text style={styles.title}>{agency.name}</Text>}
                </View>
                <View style={styles.agencyInfo}>
                    <Text style={styles.title}>FACTURE</Text>
                    <Text style={styles.text}>{agency.address}</Text>
                    <Text style={styles.text}>{agency.phone}</Text>
                    <Text style={styles.text}>{agency.email}</Text>
                    {(agency.rccm || agency.ifu) && <Text style={styles.text}>RCCM: {agency.rccm || '-'} | IFU: {agency.ifu || '-'}</Text>}
                </View>
            </View>

            {/* Invoice Details */}
            <View style={styles.invoiceDetails}>
                <View style={styles.clientInfo}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 }}>Facturé à :</Text>
                    <Text style={styles.boldText}>{client.name}</Text>
                    <Text style={styles.text}>{client.email}</Text>
                    {client.phone && <Text style={styles.text}>{client.phone}</Text>}
                </View>
                <View style={styles.metaInfo}>
                    <View style={{ flexDirection: 'row', width: 140, justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={styles.text}>N° Facture :</Text>
                        <Text style={styles.boldText}>{invoiceNumber}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', width: 140, justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={styles.text}>Date :</Text>
                        <Text style={styles.boldText}>{date}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', width: 140, justifyContent: 'space-between' }}>
                        <Text style={styles.text}>Statut :</Text>
                        <Text style={{ fontWeight: 'bold', color: '#10b981' }}>Payé</Text>
                    </View>
                </View>
            </View>

            {/* Table */}
            <View style={styles.table}>
                <View style={styles.tableHeader}>
                    <Text style={styles.col1}>Description</Text>
                    <Text style={styles.col2}>Dates</Text>
                    <Text style={styles.col3}>Durée</Text>
                    <Text style={styles.colRight}>Montant ({amount.devise})</Text>
                </View>
                <View style={styles.tableRow}>
                    <View style={styles.col1}>
                        <Text style={styles.boldText}>{property.title}</Text>
                        <Text style={[styles.text, { marginTop: 4 }]}>{property.location}</Text>
                        {property.mapUrl && <Text style={[styles.text, { marginTop: 4, color: '#3b82f6' }]}>{property.mapUrl}</Text>}
                    </View>
                    <View style={styles.col2}>
                        <Text style={styles.text}>Du {booking.start}</Text>
                        <Text style={styles.text}>Au {booking.end}</Text>
                    </View>
                    <View style={styles.col3}>
                        {amount.pricingPeriod === 'heure' && (
                            <>
                                <Text style={styles.text}>{booking.days} jour{booking.days > 1 ? 's' : ''}</Text>
                                <Text style={styles.text}>(soit {booking.days * 24} heures)</Text>
                            </>
                        )}
                        {amount.pricingPeriod === 'jour' && (
                            <Text style={styles.text}>{booking.days} jour{booking.days > 1 ? 's' : ''}</Text>
                        )}
                        {amount.pricingPeriod === 'semaine' && (
                            <Text style={styles.text}>{Math.ceil(booking.days / 7)} semaine{Math.ceil(booking.days / 7) > 1 ? 's' : ''}</Text>
                        )}
                        {amount.pricingPeriod === 'mois' && (
                            <Text style={styles.text}>{Math.ceil(booking.days / 30)} mois</Text>
                        )}
                    </View>
                    <Text style={styles.colRight}>{amount.total.toLocaleString()}</Text>
                </View>
            </View>

            {/* Totals */}
            <View style={styles.totalsContainer}>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Sous-total :</Text>
                    <Text style={styles.totalValue}>{amount.total.toLocaleString()} {amount.devise}</Text>
                </View>
                <View style={[styles.totalRow, { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#e2e8f0' }]}>
                    <Text style={styles.grandTotalLabel}>TOTAL PAYÉ :</Text>
                    <Text style={styles.grandTotalValue}>{amount.total.toLocaleString()} {amount.devise}</Text>
                </View>
            </View>

            {/* Footer */}
            <Text style={styles.footer}>
                Merci pour votre réservation ! Pour toute question, veuillez nous contacter à {agency.email}.
                {'\n'}Ce reçu atteste de votre réservation confirmée chez {agency.name}.
            </Text>

        </Page>
    </Document>
);
