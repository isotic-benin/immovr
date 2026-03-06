"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Currency, Users, CalendarDays, Loader2, ArrowRight, Plus, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import AdminCalendar from "./AdminCalendar";
import EnhancedCalendar from "./EnhancedCalendar";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const { data: stats, isLoading } = useSWR("/api/admin/stats", fetcher);

    if (status === "loading") return <div className="p-8"><Loader2 className="animate-spin text-primary" /></div>;
    if (!session) redirect("/admin/login");

    const devise = stats?.devise || "FCFA";

    const overviewStats = [
        { title: "Propriétés Actives", value: stats?.totalProperties || 0, icon: Building, color: "text-blue-500" },
        { title: "Total Réservations", value: stats?.totalReservations || 0, icon: CalendarDays, color: "text-primary" },
        { title: "Revenus (Payés)", value: `${(stats?.totalRevenue || 0).toLocaleString()} ${devise}`, icon: Currency, color: "text-green-500" },
        { title: "Clients Réels", value: stats?.totalClients || 0, icon: Users, color: "text-purple-500" },
    ];

    const getClientName = (r: any) => {
        if (r.guestDetails?.firstName) return `${r.guestDetails.firstName} ${r.guestDetails.lastName || ""}`;
        return r.guestName || "Inconnu";
    };

    return (
        <div className="max-w-[1600px] mx-auto">
            <h1 className="text-3xl font-bold text-slate-800 mb-8 px-2 sm:px-0">Vue d&apos;ensemble</h1>

            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 size={48} className="animate-spin text-primary" />
                </div>
            ) : (
                <div className="space-y-12">
                    {/* Statistiques */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {overviewStats.map((stat, idx) => {
                            const Icon = stat.icon;
                            return (
                                <Card key={idx} className="border-none shadow-sm hover:shadow-md transition-all rounded-xl">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-tight">{stat.title}</CardTitle>
                                        <div className={cn("p-2 rounded-xl bg-slate-50", stat.color.replace('text-', 'bg-').replace('500', '50/10'))}>
                                            <Icon className={`h-5 w-5 ${stat.color}`} />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-black text-slate-800">{stat.value}</div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Calendrier Full Width */}
                    <section>
                        <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
                            <CardHeader className="p-8 pb-0">
                                <CardTitle className="text-2xl font-bold text-slate-800">Calendrier des Réservations</CardTitle>
                                <p className="text-slate-500">Visualisez et gérez toutes vos occupations</p>
                            </CardHeader>
                            <CardContent className="p-8">
                                <EnhancedCalendar reservations={stats?.allActiveReservations || []} />
                            </CardContent>
                        </Card>
                    </section>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Dernières Réservations */}
                        <Card className="border-none shadow-sm rounded-2xl overflow-hidden transition-all hover:shadow-md">
                            <CardHeader className="flex flex-row items-center justify-between p-8 pb-4">
                                <div>
                                    <CardTitle className="text-xl font-bold text-slate-800">Dernières Réservations</CardTitle>
                                    <p className="text-sm text-slate-500 mt-1">Activité récente</p>
                                </div>
                                <Link href="/admin/reservations" className="text-sm text-primary font-bold flex items-center gap-1 hover:underline bg-primary/5 px-3 py-1.5 rounded-full transition-colors hover:bg-primary/10">
                                    <ArrowRight size={14} />
                                </Link>
                            </CardHeader>
                            <CardContent className="px-6 pb-8">
                                <div className="space-y-3">
                                    {stats?.recentReservations?.length === 0 ? (
                                        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                            <p className="text-slate-500 font-medium">Aucune réservation.</p>
                                        </div>
                                    ) : (
                                        stats?.recentReservations?.slice(0, 4).map((res: any) => (
                                            <div key={res._id} className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100 group">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center text-primary font-bold text-sm shrink-0">
                                                        {getClientName(res)[0]}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="font-bold text-slate-800 text-sm truncate">{getClientName(res)}</span>
                                                        <span className="text-[11px] text-slate-400 font-medium truncate">
                                                            {format(new Date(res.createdAt), "dd MMM", { locale: fr })}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <div className="font-black text-sm text-primary">{res.totalPrice.toLocaleString()} {devise}</div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-8 flex flex-col">
                            {/* Actions Rapides */}
                            <Card className="border-none shadow-sm rounded-2xl overflow-hidden transition-all hover:shadow-md bg-white flex-1">
                                <CardHeader className="p-8 pb-4">
                                    <CardTitle className="text-xl font-bold">Actions Rapides</CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 pt-2 flex flex-col gap-3">
                                    <Link href="/admin/properties">
                                        <button className="w-full bg-slate-50 text-slate-700 py-3 px-4 rounded-xl font-bold hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-between group text-sm">
                                            <span>🏢 Gérer les biens</span>
                                            <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                        </button>
                                    </Link>
                                    <Link href="/admin/reservations">
                                        <button className="w-full bg-slate-50 text-slate-700 py-3 px-4 rounded-xl font-bold hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-between group text-sm">
                                            <span>📅 Réservations</span>
                                            <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                        </button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Vue Rapide */}
                        <Card className="border-none shadow-sm rounded-2xl overflow-hidden flex flex-col">
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-xl font-bold text-slate-800">Vue Rapide</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 flex justify-center flex-1 items-center">
                                <div className="scale-90 origin-center">
                                    <AdminCalendar reservations={stats?.allActiveReservations || []} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
