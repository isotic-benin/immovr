"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Eye, Image as ImageIcon } from "lucide-react";

export default function Home() {
  const [properties, setProperties] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

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
      .then(data => {
        console.log("DEBUG: Settings loaded on Home:", data);
        console.log("DEBUG: heroCarouselImages property exists:", !!data.heroCarouselImages);
        console.log("DEBUG: heroCarouselImages content:", data.heroCarouselImages);
        setSettings(data);
      })
      .catch((err) => console.error("DEBUG: Settings fetch error:", err));
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

  const agencyName = settings?.raisonSociale || "ImmoVR";
  const devise = settings?.devise || "FCFA";
  const carouselImages = settings?.heroCarouselImages || [];

  return (
    <div className="flex flex-col min-h-screen">

      {/* Hero Section with Carousel */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-slate-900 border-b-4 border-primary">
        {/* Carousel Background Images */}
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
            Visitez, réservez et séjournez dans les meilleurs appartements grâce à la visite 360° — propulsé par <span className="font-semibold text-white">{agencyName}</span>.
          </p>

          {/* Carousel Indicators (if more than 1 image) */}
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

          {/* Premium Search Bar */}
          <div className="bg-slate-800/80 backdrop-blur-xl w-full max-w-2xl p-2 md:p-3 rounded-3xl md:rounded-full flex flex-col md:flex-row gap-3 items-center shadow-2xl border border-slate-700">
            <div className="flex-grow flex items-center bg-slate-900/50 rounded-2xl md:rounded-full px-5 border border-slate-700 w-full h-14 transition-colors focus-within:border-primary/50">
              <MapPin className="text-primary mr-3 shrink-0" size={22} />
              <Input
                placeholder="Où cherchez-vous ?"
                className="border-none bg-transparent text-white placeholder:text-slate-400 focus-visible:ring-0 px-0 h-10 text-lg shadow-none w-full"
              />
            </div>
            <Link href="/recherche" className="w-full md:w-auto">
              <Button size="lg" className="rounded-2xl md:rounded-full h-14 px-8 text-lg font-bold w-full shrink-0 shadow-lg shadow-primary/20 bg-primary text-white hover:bg-primary/90 transition-all border-0">
                <Search className="mr-2" size={20} /> Rechercher
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">À découvrir en VR 360°</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">
              Explorez nos appartements les plus populaires. Cliquez sur un bien pour démarrer la visite virtuelle et réserver instantanément.
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
                  <div className="bg-white rounded-3xl overflow-hidden shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 border-2 border-transparent hover:border-primary/20 flex flex-col h-full hover:-translate-y-2 relative group">
                    <div className="relative h-64 overflow-hidden bg-slate-100 z-10 m-2 rounded-2xl">
                      {/* Img Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent z-10 opacity-60"></div>

                      {property.panoramaImageUrls?.[0] ? (
                        <img
                          src={property.panoramaImageUrls[0]}
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <ImageIcon size={48} />
                        </div>
                      )}

                      {/* Floating Badges */}
                      <div className="absolute top-4 left-4 z-20">
                        <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-slate-900 flex items-center gap-1.5 shadow-md">
                          <Eye size={14} className="text-primary" /> Visite 360° Dispo
                        </div>
                      </div>

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

                      <div className="mt-auto pt-6 flex gap-3 w-full">
                        <Button variant="outline" className="w-full rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 font-semibold h-12">Détails</Button>
                        <Button className="w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-semibold h-12">Réserver</Button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link href="/recherche">
              <Button variant="outline" size="lg" className="rounded-full shadow-sm hover:shadow-md transition-shadow">
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
              <MapPin size={44} strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold mb-4">Réservation Instantanée</h3>
            <p className="text-slate-400 leading-relaxed max-w-sm">Consultez les disponibilités en temps réel et réservez votre séjour en quelques clics via un paiement sécurisé.</p>
          </div>
        </div>
      </section>

    </div>
  );
}
