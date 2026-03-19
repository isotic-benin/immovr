"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, MapPin, Eye, Image as ImageIcon, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { fr } from "date-fns/locale";

export default function Home() {
  const router = useRouter();
  const [properties, setProperties] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Search State
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  useEffect(() => {
    fetch("/api/properties?limit=6")
      .then(res => res.json())
      .then(data => {
        setProperties(data.properties || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch(`/api/admin/settings?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(() => {});
  }, []);

  // Carousel timer
  useEffect(() => {
    if (settings?.heroCarouselImages?.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % settings.heroCarouselImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [settings?.heroCarouselImages]);

  const handleSearch = () => {
      const params = new URLSearchParams();
      if (location) params.append("location", location);
      if (startDate) params.append("start", startDate.toISOString());
      if (endDate) params.append("end", endDate.toISOString());
      
      router.push(`/recherche?${params.toString()}`);
  };

  const agencyName = settings?.raisonSociale || "ImmoVR";
  const devise = settings?.devise || "FCFA";
  const carouselImages = settings?.heroCarouselImages || [];

  return (
    <div className="flex flex-col min-h-screen">

      {/* Hero Section with Carousel */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-slate-900 border-b-4 border-primary">
        <div className="absolute inset-0 z-0">
          {carouselImages.length > 0 ? (
            carouselImages.map((img: string, idx: number) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? "opacity-100" : "opacity-0"
                  }`}
              >
                <img src={img} alt={`Slide ${idx}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-900/40"></div>
              </div>
            ))
          ) : (
            <div className="absolute inset-0 bg-slate-900 opacity-20"></div>
          )}
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center pt-20 md:pt-32">
          <div className="animate-fade-in-down inline-block mb-6 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-primary text-sm font-bold uppercase tracking-wider">
            La nouvelle façon de visiter
          </div>
          <h1 className="animate-fade-in text-5xl md:text-7xl font-black text-white mb-6 drop-shadow-2xl tracking-tight leading-tight">
            L&apos;immobilier comme si vous y étiez, en <span className="text-primary tracking-tighter">Réalité Virtuelle</span>.
          </h1>
          <p className="animate-fade-in delay-200 text-lg md:text-2xl text-slate-300 mb-12 font-light max-w-2xl">
            Visitez et découvrez les meilleurs appartements grâce à la visite 360° — propulsé par <span className="font-semibold text-white">{agencyName}</span>.
          </p>

          {carouselImages.length > 1 && (
            <div className="flex gap-2 mb-8 animate-fade-in delay-300">
              {carouselImages.map((_: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? "w-8 bg-primary" : "w-2 bg-white/30 hover:bg-white/50"
                    }`}
                />
              ))}
            </div>
          )}

          {/* Premium Search Bar with Dates */}
          <div className="bg-slate-800/90 backdrop-blur-xl w-full max-w-4xl p-3 md:p-4 rounded-[2rem] flex flex-col md:flex-row gap-3 shadow-2xl border border-slate-600/50">
            <div className="flex-1 flex items-center bg-slate-900/50 rounded-2xl px-4 border border-slate-600/50 h-14 hover:border-primary/50 transition-colors">
              <MapPin className="text-primary mr-3 shrink-0" size={20} />
              <Input
                placeholder="Où cherchez-vous ?"
                className="border-none bg-transparent text-white placeholder:text-slate-400 focus-visible:ring-0 px-0 shadow-none text-base"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            
            <div className="flex-1 flex items-center bg-slate-900/50 rounded-2xl border border-slate-600/50 h-14 hover:border-primary/50 transition-colors overflow-hidden">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" className={cn("w-full h-full justify-start text-left font-normal text-white hover:bg-transparent hover:text-white px-4 rounded-none", !startDate && "text-slate-400")}>
                            <CalendarIcon size={20} className="mr-3 text-primary shrink-0"/>
                            {startDate ? format(startDate, "dd MMM yyyy", { locale: fr }) : "Début du séjour"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={startDate} onSelect={(d) => { setStartDate(d); if (endDate && d && endDate <= d) setEndDate(undefined); }} disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} initialFocus locale={fr}/>
                    </PopoverContent>
                </Popover>
            </div>
            
            <div className="flex-1 flex items-center bg-slate-900/50 rounded-2xl border border-slate-600/50 h-14 hover:border-primary/50 transition-colors overflow-hidden">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" className={cn("w-full h-full justify-start text-left font-normal text-white hover:bg-transparent hover:text-white px-4 rounded-none", !endDate && "text-slate-400")}>
                            <CalendarIcon size={20} className="mr-3 text-secondary shrink-0"/>
                            {endDate ? format(endDate, "dd MMM yyyy", { locale: fr }) : "Fin du séjour"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={endDate} onSelect={setEndDate} disabled={(date) => !startDate || date <= startDate} initialFocus locale={fr}/>
                    </PopoverContent>
                </Popover>
            </div>

            <Button onClick={handleSearch} size="lg" className="rounded-2xl h-14 px-8 text-lg font-bold shrink-0 shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-secondary text-white hover:scale-105 transition-all border-0 md:w-auto w-full">
              <Search className="mr-2" size={20} /> Rechercher
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">À découvrir en VR 360°</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">
              Explorez nos appartements les plus populaires. Cliquez sur un bien pour démarrer la visite virtuelle.
            </p>
          </div>

          {loading ? (
            <p className="text-center text-slate-500">Chargement des biens...</p>
          ) : properties.length === 0 ? (
            <p className="text-center text-slate-400 text-lg py-12">Aucun appartement disponible pour le moment. Revenez bientôt !</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property: any) => (
                <Link href={`/appartement/${property._id}`} key={property._id} className="group block h-full">
                  <div className="bg-white rounded-3xl overflow-hidden shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 border-2 border-transparent hover:border-primary/20 flex flex-col h-full hover:-translate-y-2 relative">
                    <div className="relative h-64 overflow-hidden bg-slate-100 z-10 m-2 rounded-2xl">
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent z-10 opacity-60"></div>
                      {property.panoramaImageUrls?.[0] || property.regularImageUrls?.[0] ? (
                        <img
                          src={property.panoramaImageUrls?.[0] || property.regularImageUrls?.[0]}
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <ImageIcon size={48} />
                        </div>
                      )}
                      {property.panoramaImageUrls?.[0] && (
                        <div className="absolute top-4 left-4 z-20">
                          <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-slate-900 flex items-center gap-1.5 shadow-md">
                            <Eye size={14} className="text-primary" /> Visite 360° Dispo
                          </div>
                        </div>
                      )}
                      <div className="absolute bottom-4 right-4 z-20">
                        <div className="bg-primary text-white px-4 py-2 rounded-xl font-black shadow-lg shadow-primary/30">
                          {property.price || property.pricePerHour}{devise} <span className="text-white/80 font-medium text-sm">/ {property.pricingPeriod || 'heure'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 pt-4 flex-grow flex flex-col z-10 relative">
                      <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-3">
                        <MapPin size={16} />
                        {property.location?.quartier}, {property.location?.commune}
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors">{property.title}</h3>

                      <div className="mt-auto pt-6 w-full">
                        <Button className="w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold h-12 shadow-md">Voir les détails</Button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link href="/recherche">
              <Button variant="outline" size="lg" className="rounded-full shadow-sm hover:shadow-md transition-shadow font-bold">
                Voir tous les appartements
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Features */}
      <section className="py-24 relative overflow-hidden bg-slate-900 border-t border-slate-800 text-white">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 text-center relative z-10">
          <div className="flex flex-col items-center group">
            <div className="w-24 h-24 bg-slate-800 rounded-3xl flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all duration-300">
              <Eye size={44} strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold mb-4">Visite 100% Virtuelle</h3>
            <p className="text-slate-400 leading-relaxed max-w-sm">Parcourez chaque pièce comme si vous y étiez avec notre technologie 360° immersive haute définition.</p>
          </div>
          <div className="flex flex-col items-center group mt-8 md:mt-0">
            <div className="w-24 h-24 bg-slate-800 rounded-3xl flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all duration-300">
              <Search size={44} strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold mb-4">Zéro Surprises</h3>
            <p className="text-slate-400 leading-relaxed max-w-sm">Ce que vous voyez est exactement ce que vous aurez. Finis les photos trompeuses et les mauvaises surprises.</p>
          </div>
          <div className="flex flex-col items-center group">
            <div className="w-24 h-24 bg-slate-800 rounded-3xl flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all duration-300">
              <CalendarIcon size={44} strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold mb-4">Disponibilité en Temps Réel</h3>
            <p className="text-slate-400 leading-relaxed max-w-sm">Consultez instantanément si l'appartement de vos rêves est disponible pour vos dates de séjour.</p>
          </div>
        </div>
      </section>

    </div>
  );
}
