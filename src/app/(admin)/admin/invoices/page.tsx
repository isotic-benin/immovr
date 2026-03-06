"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Search, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminInvoices() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [devise, setDevise] = useState("FCFA");

    // Fetch unique device
    useEffect(() => {
        fetch("/api/admin/settings")
            .then(res => res.json())
            .then(s => { if (s?.devise) setDevise(s.devise); })
            .catch(() => { });
    }, []);

    const { data, error, isLoading } = useSWR(`/api/invoices?page=${page}&limit=10&search=${search}`, fetcher);

    return (
        <div>
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 flex items-center gap-2">
                        <FileText className="text-primary" /> Factures Émises
                    </h1>
                    <p className="text-slate-500">Consultez les factures envoyées automatiquement aux clients après paiement.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input
                            placeholder="Rechercher par N° Facture (ex: INV-2026-...)"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="pl-10 bg-white"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="p-8 text-center text-slate-500">Chargement...</div>
                ) : error ? (
                    <div className="p-8 text-center text-red-500">Erreur de chargement des données.</div>
                ) : (
                    <>
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead>N° Facture</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Appartement / Dates</TableHead>
                                    <TableHead>Montant</TableHead>
                                    <TableHead>Date d&apos;envoi</TableHead>
                                    <TableHead>Statut</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.invoices?.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-500">Aucune facture trouvée.</TableCell></TableRow>
                                ) : (
                                    data?.invoices?.map((inv: any) => (
                                        <TableRow key={inv._id}>
                                            <TableCell className="font-mono text-sm font-bold text-slate-700">
                                                {inv.invoiceNumber}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-bold text-slate-800">{inv.guestName}</div>
                                                <div className="text-sm text-slate-500">{inv.guestEmail}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{inv.reservationId?.propertyId?.title || "Bien inconnu"}</div>
                                                <div className="text-xs text-slate-500">
                                                    {inv.reservationId?.startDate && inv.reservationId?.endDate ? (
                                                        <>Du {format(new Date(inv.reservationId.startDate), "dd/MM/yyyy")} au {format(new Date(inv.reservationId.endDate), "dd/MM/yyyy")}</>
                                                    ) : "-"}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-bold whitespace-nowrap">
                                                {inv.totalAmount?.toLocaleString()} {devise}
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-600">
                                                {format(new Date(inv.sentAt), "dd MMM yyyy à HH:mm", { locale: fr })}
                                            </TableCell>
                                            <TableCell>
                                                {inv.status === 'sent' ? (
                                                    <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full w-fit">
                                                        <CheckCircle2 size={14} /> Envoyée
                                                    </span>
                                                ) : (
                                                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                                                        Erreur
                                                    </span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {data?.totalPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
                                <span className="text-sm text-slate-500">Page {data.currentPage} sur {data.totalPages} ({data.total} factures)</span>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Précédent</Button>
                                    <Button variant="outline" size="sm" disabled={page === data.totalPages} onClick={() => setPage(p => p + 1)}>Suivant</Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
