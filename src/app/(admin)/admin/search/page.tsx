"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, MapPin, Building, Calendar, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

function SearchResultsContent() {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get("q") || "";
    
    const [query, setQuery] = useState(initialQuery);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<{
        properties: any[];
        occupations: any[];
    }>({ properties: [], occupations: [] });

    useEffect(() => {
        if (query.length >= 2) {
            const timer = setTimeout(() => {
                performSearch(query);
            }, 300);
            return () => clearTimeout(timer);
        } else {
            setResults({ properties: [], occupations: [] });
        }
    }, [query]);

    const performSearch = async (searchQuery: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/search?q=${encodeURIComponent(searchQuery)}`);
            if (res.ok) {
                const data = await res.json();
                setResults({
                    properties: data.properties || [],
                    occupations: data.occupations || [],
                });
            }
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setLoading(false);
        }
    };

    const totalResults = results.properties.length + results.occupations.length;

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Recherche Globale</h1>
                <p className="text-slate-500">Recherchez parmi les biens et les occupations.</p>
            </div>

            <div className="max-w-3xl mb-10">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <Input 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Titre, locataire, commune, id..."
                        className="pl-12 h-14 bg-white border-slate-200 text-lg rounded-2xl shadow-sm"
                        autoFocus
                    />
                    {loading && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <Loader2 className="animate-spin text-primary" size={20} />
                        </div>
                    )}
                </div>
            </div>

            {query.length >= 2 && !loading && totalResults === 0 && (
                <div className="bg-white p-12 text-center rounded-3xl border border-slate-100 shadow-sm">
                    <Search className="mx-auto text-slate-300 mb-4" size={48} />
                    <h2 className="text-xl font-bold text-slate-700">Aucun résultat trouvé</h2>
                    <p className="text-slate-500 mt-2">Nous n'avons rien trouvé pour "{query}". Essayez d'autres mots-clés.</p>
                </div>
            )}

            {totalResults > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Properties Results */}
                    {results.properties.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
                                <Building className="text-primary" size={20} />
                                <h2 className="font-bold text-lg text-slate-800">Biens ({results.properties.length})</h2>
                            </div>
                            
                            {results.properties.map((prop) => (
                                <div key={prop._id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-primary/30 hover:shadow-md transition-all">
                                    <div className="flex items-start gap-4">
                                        {prop.panoramaImageUrls?.[0] ? (
                                            <img src={prop.panoramaImageUrls[0]} alt={prop.title} className="w-16 h-16 rounded-lg object-cover" />
                                        ) : (
                                            <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center">
                                                <Building className="text-slate-300" size={24} />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <h3 className="font-bold text-slate-800 line-clamp-1">{prop.title}</h3>
                                            <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
                                                <MapPin size={14} />
                                                <span>{prop.location?.quartier}, {prop.location?.commune}</span>
                                            </div>
                                        </div>
                                        <Link href={`/admin/properties`} className="shrink-0 text-sm font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20">
                                            Gérer
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Occupations Results */}
                    {results.occupations.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
                                <Calendar className="text-green-500" size={20} />
                                <h2 className="font-bold text-lg text-slate-800">Occupations ({results.occupations.length})</h2>
                            </div>
                            
                            {results.occupations.map((occ) => (
                                <div key={occ._id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-green-500/30 hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-slate-800">{occ.tenantName}</h3>
                                            <p className="text-sm text-slate-500">{occ.propertyId?.title || "Bien supprimé"}</p>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700`}>
                                            Occupé
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-slate-500 mt-3 bg-slate-50 p-2 rounded-lg">
                                        <div>Du {new Date(occ.startDate).toLocaleDateString("fr-FR")}</div>
                                        <div>Au {new Date(occ.endDate).toLocaleDateString("fr-FR")}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function GlobalSearch() {
    return (
       <Suspense fallback={<div className="p-8"><Loader2 className="animate-spin text-primary" size={32}/></div>}>
           <SearchResultsContent />
       </Suspense>
    );
}
