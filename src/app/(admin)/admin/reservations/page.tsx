"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Trash2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminReservations() {
    const [page, setPage] = useState(1);
    const [devise, setDevise] = useState("FCFA");
    const { data, error, mutate, isLoading } = useSWR(`/api/reservations?page=${page}&limit=10`, fetcher);

    useEffect(() => {
        fetch("/api/admin/settings")
            .then(res => res.json())
            .then(s => { if (s?.devise) setDevise(s.devise); })
            .catch(() => { });
    }, []);

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/reservations/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                toast.success(`Statut mis à jour : ${newStatus}`);
                mutate();
            } else {
                toast.error("Erreur lors de la mise à jour");
            }
        } catch {
            toast.error("Erreur technique");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/reservations/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Réservation supprimée définitivement");
                mutate();
                if (data?.reservations?.length === 1 && page > 1) setPage(page - 1);
            } else {
                toast.error("Erreur lors de la suppression");
            }
        } catch {
            toast.error("Erreur technique");
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid': return <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Confirmée</span>;
            case 'pending': return <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">En attente</span>;
            case 'cancelled': return <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">Annulée</span>;
            default: return <span className="px-2 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
        }
    };

    const getClientName = (r: any) => {
        if (r.guestDetails?.firstName) return `${r.guestDetails.firstName} ${r.guestDetails.lastName || ""}`;
        return r.guestName || "Inconnu";
    };

    const getClientEmail = (r: any) => r.guestDetails?.email || r.guestEmail || "";
    const getClientPhone = (r: any) => r.guestDetails?.phone || r.guestPhone || "";

    const getDays = (start: string, end: string) => {
        const d = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24));
        return d > 0 ? d : 1;
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-800">Réservations</h1>
                <p className="text-slate-500">Suivez et gérez les réservations de vos clients.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center text-slate-500">Chargement...</div>
                ) : error ? (
                    <div className="p-8 text-center text-red-500">Erreur de chargement des données.</div>
                ) : (
                    <>
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Appartement</TableHead>
                                    <TableHead>Dates</TableHead>
                                    <TableHead>Durée</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.reservations?.length === 0 ? (
                                    <TableRow><TableCell colSpan={7} className="text-center py-4 text-slate-500">Aucune réservation trouvée.</TableCell></TableRow>
                                ) : (
                                    data?.reservations?.map((res: any) => (
                                        <TableRow key={res._id}>
                                            <TableCell>
                                                <div className="font-bold text-slate-800">{getClientName(res)}</div>
                                                <div className="text-sm text-slate-500">{getClientEmail(res)}</div>
                                                <div className="text-xs text-slate-400">{getClientPhone(res)}</div>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {res.propertyId?.title || <span className="text-red-400 italic">Bien supprimé</span>}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {format(new Date(res.startDate), "dd MMM yyyy", { locale: fr })}
                                                </div>
                                                <div className="text-sm text-slate-500">
                                                    au {format(new Date(res.endDate), "dd MMM yyyy", { locale: fr })}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm font-medium">{getDays(res.startDate, res.endDate)} jour(s)</span>
                                            </TableCell>
                                            <TableCell className="font-bold">{res.totalPrice?.toLocaleString()} {devise}</TableCell>
                                            <TableCell>{getStatusBadge(res.status)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {res.status !== 'cancelled' ? (
                                                        <Button variant="outline" size="icon" onClick={() => updateStatus(res._id, 'cancelled')} title="Annuler">
                                                            <XCircle size={16} className="text-orange-500" />
                                                        </Button>
                                                    ) : (
                                                        <Button variant="outline" size="icon" onClick={() => updateStatus(res._id, 'paid')} title="Marquer comme payé">
                                                            <CheckCircle2 size={16} className="text-green-500" />
                                                        </Button>
                                                    )}
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="outline" size="icon" className="hover:bg-red-50 hover:text-red-500 hover:border-red-200">
                                                                <Trash2 size={16} />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Supprimer la réservation</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Êtes-vous sûr de vouloir supprimer la réservation de {getClientName(res)} ? Cette action est irréversible.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                                <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={() => handleDelete(res._id)}>
                                                                    Supprimer
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {data?.totalPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
                                <span className="text-sm text-slate-500">Page {data.currentPage} sur {data.totalPages} ({data.total} résa)</span>
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
