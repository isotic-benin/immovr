"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Home, Calendar, FileText, ChevronRight, AlertCircle, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

function SearchResults() {
    const searchParams = useSearchParams();
    const q = searchParams.get("q") || "";

    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState<{
        properties: any[];
        reservations: any[];
        invoices: any[];
    }>({ properties: [], reservations: [], invoices: [] });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!q.trim()) {
            setResults({ properties: [], reservations: [], invoices: [] });
            setLoading(false);
            return;
        }

        setLoading(true);
        fetch(`/api/admin/search?q=${encodeURIComponent(q)}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) throw new Error(data.error);
                setResults({
                    properties: data.properties || [],
                    reservations: data.reservations || [],
                    invoices: data.invoices || []
                });
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [q]);

    const totalResults = results.properties.length + results.reservations.length + results.invoices.length;

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/60 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="relative z-10">
                    <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <Search className="text-primary" size={32} />
                        Résultats de recherche
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">
                        Pour la requête : <span className="font-bold text-slate-800">&quot;{q}&quot;</span>
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-sm border border-slate-100 min-h-[400px]">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-500 font-medium">Recherche en cours...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-6 flex items-center gap-3">
                    <AlertCircle size={24} />
                    <p className="font-semibold">{error}</p>
                </div>
            ) : totalResults === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
                    <Search size={48} className="text-slate-200 mb-4" />
                    <h3 className="text-xl font-bold text-slate-700 mb-2">Aucun résultat trouvé</h3>
                    <p className="text-slate-500 max-w-sm mx-auto">
                        Nous n&apos;avons trouvé aucun bien, aucune réservation ni aucune facture correspondant à <span className="font-bold">&quot;{q}&quot;</span>.
                    </p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Properties Results */}
                    {results.properties.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                                <Home className="text-primary" size={20} />
                                <h2 className="font-bold text-lg text-slate-800">Biens Immobiliers ({results.properties.length})</h2>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {results.properties.map((property) => (
                                    <div key={property._id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg object-cover bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                                                {property.panoramaImageUrls?.[0] ? (
                                                    <img src={property.panoramaImageUrls[0]} alt={property.title} className="w-full h-full object-cover" />
                                                ) : <ImageIcon size={20} className="text-slate-400" />}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 line-clamp-1">{property.title}</h3>
                                                <p className="text-sm text-slate-500 line-clamp-1">
                                                    {property.location?.quartier}, {property.location?.commune} • {property.price || property.pricePerHour} FCFA / {property.pricingPeriod || 'heure'}
                                                </p>
                                            </div>
                                        </div>
                                        <Link href={"/admin/properties"}>
                                            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">Gérer <ChevronRight size={16} /></Button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Reservations Results */}
                    {results.reservations.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                                <Calendar className="text-primary" size={20} />
                                <h2 className="font-bold text-lg text-slate-800">Réservations ({results.reservations.length})</h2>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {results.reservations.map((res) => (
                                    <div key={res._id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div>
                                            <h3 className="font-bold text-slate-800">
                                                {res.guestDetails?.firstName} {res.guestDetails?.lastName}
                                            </h3>
                                            <p className="text-sm text-slate-500">
                                                Bien : {res.propertyId?.title || "N/A"} • Du {new Date(res.startDate).toLocaleDateString()} au {new Date(res.endDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <Link href={"/admin/reservations"}>
                                            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">Voir <ChevronRight size={16} /></Button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Invoices Results */}
                    {results.invoices.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                                <FileText className="text-primary" size={20} />
                                <h2 className="font-bold text-lg text-slate-800">Factures ({results.invoices.length})</h2>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {results.invoices.map((inv) => (
                                    <div key={inv._id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div>
                                            <h3 className="font-bold text-slate-800">{inv.invoiceNumber}</h3>
                                            <p className="text-sm text-slate-500">
                                                Client : {inv.guestName} • Montant : {inv.totalAmount?.toLocaleString()} FCFA
                                            </p>
                                        </div>
                                        <Link href={"/admin/invoices"}>
                                            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">Détails <ChevronRight size={16} /></Button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function AdminSearchPage() {
    return (
        <Suspense fallback={<div className="p-12 text-center text-slate-500">Chargement de la page de recherche...</div>}>
            <SearchResults />
        </Suspense>
    );
}
