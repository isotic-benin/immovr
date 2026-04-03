"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MapPin, Eye, Filter, Search, Image as ImageIcon, CalendarIcon, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

function SearchPropertiesContent() {
    const searchParams = useSearchParams();
    
    // Initialize state from URL params
    const [searchTerm, setSearchTerm] = useState(searchParams.get("location") || "");
    const [startDate, setStartDate] = useState<Date | undefined>(
        searchParams.get("start") ? new Date(searchParams.get("start") as string) : undefined
    );
    const [endDate, setEndDate] = useState<Date | undefined>(
        searchParams.get("end") ? new Date(searchParams.get("end") as string) : undefined
    );

    const [allProperties, setAllProperties] = useState<any[]>([]);
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [categories, setCategories] = useState<string[]>(["all"]);

    const fetchProperties = () => {
        setLoading(true);
        const params = new URLSearchParams();
        params.append("limit", "100");
        if (searchTerm) params.append("location", searchTerm);
        if (startDate) params.append("startDate", startDate.toISOString());
        if (endDate) params.append("endDate", endDate.toISOString());
        
        fetch(`/api/properties?${params.toString()}`)
            .then(res => res.json())
            .then(data => {
                setAllProperties(data.properties || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchProperties();

        fetch("/api/categories")
            .then(res => res.json())
            .then((cats) => {
                if (Array.isArray(cats)) {
                    setCategories(["all", ...cats.map((c: any) => c.name)]);
                }
            })
            .catch(() => { });

        fetch("/api/admin/settings")
            .then(res => res.json())
            .then(data => setSettings(data))
            .catch(() => { });
    }, [searchTerm, startDate, endDate]); // Re-fetch when search criteria change

    const devise = settings?.devise || "FCFA";

    const filteredProperties = allProperties.filter(p => {
        const propCategory = (p.category && p.category !== "Non classé") ? p.category : "";
        const matchesCategory = selectedCategory === "all" || propCategory === selectedCategory;
        return matchesCategory;
    });

    const isFilteredByAvailability = !!(startDate && endDate);

    return (
        <div className="bg-slate-50 min-h-screen pb-20 pt-28 md:pt-32">

            {/* Page Header */}
            <div className="bg-slate-950 pt-32 md:pt-40 pb-16 px-4 shadow-2xl mb-12 relative overflow-hidden">
                <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,var(--color-primary)_0%,transparent_50%),radial-gradient(ellipse_at_bottom,var(--color-secondary)_0%,transparent_50%)] opacity-10"></div>
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none animate-float-slow"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] pointer-events-none animate-float"></div>

                <div className="container mx-auto relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6 drop-shadow-xl tracking-tight">Trouvez la <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">perle rare.</span></h1>
                    <p className="text-slate-300 text-lg md:text-xl mb-10 max-w-3xl mx-auto font-light">Parcourez notre catalogue d&apos;appartements premium. Vérifiez les disponibilités en temps réel.</p>

                    <div className="flex flex-col gap-3 max-w-4xl mx-auto justify-center bg-white/10 backdrop-blur-md p-3 rounded-3xl border border-white/20">
                        <div className="flex flex-col md:flex-row gap-3">
                            <div className="flex-1 glass-dark rounded-2xl flex items-center px-4 h-14 transition-colors focus-within:bg-white/10 shadow-inner">
                                <Search className="text-primary mr-3 shrink-0" size={20} />
                                <Input
                                    placeholder="Commune, quartier ou mot clé..."
                                    className="bg-transparent border-none text-white text-base placeholder:text-slate-400 focus-visible:ring-0 px-0 shadow-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            
                            <div className="flex-1 glass-dark flex items-center rounded-2xl border-transparent h-14 transition-colors overflow-hidden px-2 shadow-inner hover:bg-white/10">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="ghost" className={cn("w-full h-full justify-start text-left font-normal text-white hover:bg-transparent hover:text-white px-2 rounded-none", !startDate && "text-slate-400")}>
                                            <CalendarIcon size={18} className="mr-3 text-primary shrink-0"/>
                                            {startDate ? format(startDate, "dd MMM yyyy", { locale: fr }) : "Séjour (Début)"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={startDate} onSelect={(d) => { setStartDate(d); if (endDate && d && endDate <= d) setEndDate(undefined); }} disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} initialFocus locale={fr}/>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="flex-1 glass-dark flex items-center rounded-2xl border-transparent h-14 transition-colors overflow-hidden px-2 shadow-inner hover:bg-white/10">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="ghost" className={cn("w-full h-full justify-start text-left font-normal text-white hover:bg-transparent hover:text-white px-2 rounded-none", !endDate && "text-slate-400")}>
                                            <CalendarIcon size={18} className="mr-3 text-secondary shrink-0"/>
                                            {endDate ? format(endDate, "dd MMM yyyy", { locale: fr }) : "Séjour (Fin)"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={endDate} onSelect={setEndDate} disabled={(date) => !startDate || date <= startDate} initialFocus locale={fr}/>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Filter */}
            <div className="container mx-auto px-4 mb-12 -mt-6 relative z-20">
                <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                    {categories.map((cat: any) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-6 py-2.5 rounded-2xl font-bold text-sm transition-all duration-300 shadow-lg ${selectedCategory === cat
                                ? "bg-primary text-white shadow-primary/30 scale-105"
                                : "bg-white text-slate-600 hover:bg-slate-50 shadow-slate-200/50"
                                }`}
                        >
                            {cat === "all" ? "Tous les biens" : cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results Grid */}
            <div className="container mx-auto px-4">
                <div className="mb-6 flex justify-between items-end flex-wrap gap-4">
                    <h2 className="text-2xl font-bold text-slate-800">Nos Appartements ({filteredProperties.length})</h2>
                    {isFilteredByAvailability && (
                        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 border border-green-200">
                            <CheckCircle2 size={16} className="text-green-600" />
                            Affichage des biens disponibles du {format(startDate, "dd/MM")} au {format(endDate, "dd/MM")}
                        </div>
                    )}
                </div>

                {loading ? (
                    <p className="text-center text-slate-500 py-16">Recherche en cours...</p>
                ) : filteredProperties.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <MapPin size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-xl font-bold text-slate-700">Aucun résultat trouvé</h3>
                        <p className="text-slate-500 mt-2">
                           {isFilteredByAvailability ? "Aucun bien n'est disponible pour ces dates et ce lieu." : "Essayez de modifier vos critères de recherche."}
                        </p>
                        <Button variant="outline" className="mt-6 rounded-xl" onClick={() => { setSearchTerm(""); setStartDate(undefined); setEndDate(undefined); }}>Réinitialiser la recherche</Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProperties.map((property: any) => (
                            <Link href={`/appartement/${property._id}`} key={property._id} className="group h-full flex">
                                <div className="bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 border border-white/60 flex flex-col w-full hover:-translate-y-2 relative">
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"></div>

                                    <div className="relative h-56 overflow-hidden bg-slate-100 z-10 m-2 rounded-2xl">
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent z-10 opacity-60"></div>
                                        {(property.coverImageUrl || property.panoramaImageUrls?.[0] || property.regularImageUrls?.[0]) ? (
                                            <img
                                                src={property.coverImageUrl || property.panoramaImageUrls?.[0] || property.regularImageUrls?.[0]}
                                                alt={property.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <ImageIcon size={48} />
                                            </div>
                                        )}
                                        {property.panoramaImageUrls?.[0] && (
                                            <div className="absolute top-3 left-3 z-20">
                                                <div className="glass px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-md">
                                                    <Eye size={14} className="text-primary" /> VR 360°
                                                </div>
                                            </div>
                                        )}
                                        {isFilteredByAvailability && (
                                            <div className="absolute top-3 right-3 z-20">
                                                <div className="bg-green-500 text-white px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider shadow-md">
                                                    Disponible
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-5 pt-3 flex-grow flex flex-col z-10 relative">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-bold text-slate-800 line-clamp-2 leading-tight pr-4 group-hover:text-primary transition-colors">{property.title}</h3>
                                            <div className="bg-slate-900 text-white px-3 py-1.5 rounded-xl font-bold text-sm shrink-0 whitespace-nowrap shadow-md shadow-slate-900/20">
                                                {property.price || property.pricePerHour}{devise} <span className="text-white/80 font-medium text-xs">/ {property.pricingPeriod || 'heure'}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-primary font-semibold text-sm mt-auto pt-4">
                                            <MapPin size={16} className="shrink-0" />
                                            <span className="truncate">{property.location?.quartier}, {property.location?.commune}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SearchProperties() {
    return (
        <Suspense fallback={<div className="min-h-screen pt-32 text-center text-slate-500">Chargement...</div>}>
            <SearchPropertiesContent />
        </Suspense>
    );
}
