"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Bell, CheckCheck, MessageSquare, CalendarDays, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AdminNotifications() {
    const [page, setPage] = useState(1);
    const { data, mutate, isLoading } = useSWR(`/api/notifications?page=${page}&limit=15`, fetcher);

    const markAllRead = async () => {
        try {
            await fetch("/api/notifications", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ markAllRead: true }),
            });
            toast.success("Toutes les notifications ont été marquées comme lues");
            mutate();
        } catch {
            toast.error("Erreur");
        }
    };

    const markOneRead = async (id: string) => {
        try {
            await fetch("/api/notifications", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            mutate();
        } catch { }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "review": return <MessageSquare size={20} className="text-yellow-500" />;
            case "reservation": return <CalendarDays size={20} className="text-green-500" />;
            case "contact": return <Mail size={20} className="text-blue-500" />;
            default: return <Bell size={20} className="text-slate-500" />;
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case "review": return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-600 uppercase">Avis</span>;
            case "reservation": return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-600 uppercase">Réservation</span>;
            case "contact": return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-600 uppercase">Contact</span>;
            default: return null;
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-800">Notifications</h1>
                    <p className="text-slate-500">{data?.unreadCount || 0} notification(s) non lue(s)</p>
                </div>
                {data?.unreadCount > 0 && (
                    <Button variant="outline" className="gap-2" onClick={markAllRead}>
                        <CheckCheck size={16} /> Tout marquer comme lu
                    </Button>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center text-slate-500">Chargement...</div>
                ) : data?.notifications?.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                        <Bell size={48} className="mx-auto mb-4 text-slate-300" />
                        <p className="text-lg">Aucune notification pour le moment.</p>
                    </div>
                ) : (
                    <>
                        <div className="divide-y divide-slate-50">
                            {data?.notifications?.map((notif: any) => (
                                <div
                                    key={notif._id}
                                    className={`flex items-start gap-4 p-5 transition-colors hover:bg-slate-50 cursor-pointer ${!notif.isRead ? "bg-primary/5 border-l-4 border-l-primary" : ""}`}
                                    onClick={() => !notif.isRead && markOneRead(notif._id)}
                                >
                                    <div className="mt-1 p-2 bg-slate-100 rounded-xl shrink-0">{getIcon(notif.type)}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className={`font-bold text-sm ${!notif.isRead ? "text-slate-900" : "text-slate-600"}`}>{notif.title}</p>
                                            {getTypeBadge(notif.type)}
                                            {!notif.isRead && <span className="w-2 h-2 bg-primary rounded-full"></span>}
                                        </div>
                                        <p className="text-sm text-slate-500 line-clamp-2">{notif.message}</p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {format(new Date(notif.createdAt), "dd MMM yyyy 'à' HH:mm", { locale: fr })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {data?.totalPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
                                <span className="text-sm text-slate-500">Page {data.currentPage} sur {data.totalPages}</span>
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
