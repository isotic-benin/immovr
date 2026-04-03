"use client";

import { useState, useEffect, use } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
const PanoramaViewer = dynamic(() => import("@/components/PanoramaViewer"), { ssr: false });
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
    MapPin, Star, CheckCircle2,
    Image as ImageIcon, ChevronLeft, ChevronRight, Send, Loader2
} from "lucide-react";

export default function PropertyDetails({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const [property, setProperty] = useState<any>(null);
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activePanorama, setActivePanorama] = useState(0);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Similar properties state
    const [similarProperties, setSimilarProperties] = useState<any[]>([]);
    const [similarPage, setSimilarPage] = useState(1);
    const SIMILAR_PER_PAGE = 4;

    // Reviews state
    const [reviews, setReviews] = useState<any[]>([]);
    const [reviewsTotal, setReviewsTotal] = useState(0);
    const [reviewsPage, setReviewsPage] = useState(1);
    const [reviewsTotalPages, setReviewsTotalPages] = useState(1);
    const [reviewForm, setReviewForm] = useState({ guestName: "", guestEmail: "", rating: 5, comment: "" });
    const [reviewSubmitting, setReviewSubmitting] = useState(false);

    useEffect(() => {
        Promise.all([
            fetch(`/api/properties/${resolvedParams.id}`).then(res => res.json()),
            fetch("/api/admin/settings").then(res => res.json())
        ]).then(([propData, settData]) => {
            setProperty(propData);
            setSettings(settData);
            if (propData?.category) {
                fetch(`/api/properties?category=${encodeURIComponent(propData.category)}&limit=20`)
                    .then(res => res.json())
                    .then(simData => {
                        if (simData.properties) setSimilarProperties(simData.properties.filter((p: any) => p._id !== resolvedParams.id));
                    }).catch(() => { });
            }
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [resolvedParams.id]);

    useEffect(() => {
        if (resolvedParams.id) {
            fetch(`/api/reviews?propertyId=${resolvedParams.id}&page=${reviewsPage}&limit=5`)
                .then(res => res.json())
                .then(data => {
                    setReviews(data.reviews || []);
                    setReviewsTotal(data.total || 0);
                    setReviewsTotalPages(data.totalPages || 1);
                })
                .catch(() => { });
        }
    }, [resolvedParams.id, reviewsPage]);

    const devise = settings?.devise || "FCFA";
    const totalSimilarPages = Math.ceil(similarProperties.length / SIMILAR_PER_PAGE);
    const paginatedSimilar = similarProperties.slice((similarPage - 1) * SIMILAR_PER_PAGE, similarPage * SIMILAR_PER_PAGE);

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setReviewSubmitting(true);
        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...reviewForm, propertyId: resolvedParams.id }),
            });
            if (res.ok) {
                toast.success("Merci pour votre avis !");
                setReviewForm({ guestName: "", guestEmail: "", rating: 5, comment: "" });
                setReviewsPage(1);
                const [revRes, propRes] = await Promise.all([
                    fetch(`/api/reviews?propertyId=${resolvedParams.id}&page=1&limit=5`),
                    fetch(`/api/properties/${resolvedParams.id}`)
                ]);
                const revData = await revRes.json();
                const propData = await propRes.json();
                setReviews(revData.reviews || []);
                setReviewsTotal(revData.total || 0);
                setReviewsTotalPages(revData.totalPages || 1);
                setProperty(propData);
            } else {
                const data = await res.json();
                toast.error(data.error || "Erreur lors de l'envoi");
            }
        } catch {
            toast.error("Erreur technique");
        } finally {
            setReviewSubmitting(false);
        }
    };



    if (loading) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <Loader2 size={40} className="animate-spin text-primary mx-auto mb-3" />
                <p className="text-slate-500 text-lg">Chargement du bien...</p>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-2xl font-bold text-slate-800">Bien non trouvé</h1>
                <p className="text-slate-500 mt-2">Ce bien n&apos;existe pas ou a été supprimé.</p>
            </div>
        );
    }

    const panoramas = property.panoramaImageUrls || [];
    const regularImages = property.regularImageUrls || [];
    const coverImage = property.coverImageUrl || "";

    return (
        <div className="container mx-auto px-4 pt-28 pb-8">
            <Toaster />
            {/* Property Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-2">{property.title}</h1>
                    <div className="flex items-center gap-4 text-slate-500 font-medium flex-wrap">
                        <span className="flex items-center gap-1.5"><MapPin size={18} className="text-primary" /> {property.location?.quartier}, {property.location?.commune}</span>
                        <span className="flex items-center gap-1.5"><Star size={18} className="text-yellow-400 fill-yellow-400" /> {property.averageRating || 0} ({property.totalReviews || 0} avis)</span>
                        {property.mapUrl && (
                            <a href={property.mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-500 hover:underline">
                                <MapPin size={18} /> Voir sur la carte
                            </a>
                        )}

                    </div>
                </div>
                <div className="text-right">
                    <p className="text-3xl font-bold text-primary">{property.price} {devise} <span className="text-base text-slate-500 font-normal">/ {property.pricingPeriod || 'heure'}</span></p>
                </div>
            </div>

            {/* VR Viewer or Cover Image */}
            {coverImage ? (
                <div className="mb-12 relative">
                    <div className="w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                        <img src={coverImage} alt={property.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/10" />
                    </div>
                    {(panoramas.length > 0 || regularImages.length > 0) && (
                        <div className="absolute top-4 right-4">
                            <span className="inline-flex items-center gap-1 px-3 py-2 bg-emerald-600/90 text-white text-xs font-bold rounded-full">Image de couverture</span>
                        </div>
                    )}
                    {panoramas.length > 0 && (
                        <button onClick={() => setActivePanorama(0)} className="mt-3 flex items-center gap-2 text-primary font-semibold text-sm">
                            <ImageIcon size={16} /> Voir la visite 360°
                        </button>
                    )}
                    {regularImages.length > 0 && (
                        <button onClick={() => { const i = regularImages.indexOf(coverImage); setCurrentImageIndex(i >= 0 ? i : 0); setIsImageModalOpen(true); }} className="mt-3 ml-4 flex items-center gap-2 text-primary font-semibold text-sm">
                            <ImageIcon size={16} /> Voir toutes les photos ({regularImages.length})
                        </button>
                    )}
                </div>
            ) : panoramas.length > 0 ? (
                <div className="mb-12">
                    <div className="w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                        <PanoramaViewer imageUrl={panoramas[activePanorama]} height="600px" />
                    </div>
                    {panoramas.length > 1 && (
                        <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                            {panoramas.map((url: string, idx: number) => (
                                <button key={idx} onClick={() => setActivePanorama(idx)}
                                    className={`relative w-24 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${idx === activePanorama ? "border-primary shadow-lg scale-105" : "border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100"}`}>
                                    <img src={url} alt={`Vue 360° #${idx + 1}`} className="w-full h-full object-cover" />
                                    <span className="absolute bottom-0.5 left-1 bg-black/60 text-white text-[9px] px-1 rounded">#{idx + 1}</span>
                                </button>
                            ))}
                        </div>
                    )}
                    {regularImages.length > 0 && (
                        <button onClick={() => { setCurrentImageIndex(0); setIsImageModalOpen(true); }}
                            className="mt-4 flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors">
                            <ImageIcon size={16} /> Voir les photos ({regularImages.length})
                        </button>
                    )}
                </div>
            ) : regularImages.length > 0 ? (
                <div 
                    onClick={() => { setCurrentImageIndex(0); setIsImageModalOpen(true); }}
                    className="mb-12 relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white cursor-pointer group"
                >
                    <img src={regularImages[0]} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-500" />
                    <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-white/95 hover:bg-white text-slate-800 px-5 py-2.5 rounded-xl font-bold shadow-lg transition-all transform group-hover:-translate-y-1">
                        <ImageIcon size={18} /> Voir toutes les photos ({regularImages.length})
                    </div>
                </div>
            ) : (
                <div className="w-full h-[400px] rounded-2xl bg-slate-100 flex items-center justify-center mb-12 border-2 border-dashed border-slate-200">
                    <div className="text-center text-slate-400">
                        <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                        <p className="font-medium">Aucune image disponible</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Col */}
                <div className="lg:col-span-2 space-y-10">
                    <section>
                        <h2 className="text-2xl font-bold mb-4">À propos de ce logement</h2>
                        <p className="text-slate-600 leading-relaxed text-lg">{property.description}</p>
                    </section>

                    {property.features?.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Équipements</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {property.features.map((feature: string, idx: number) => (
                                    <div key={idx} className="flex items-center gap-2 text-slate-700 bg-slate-100 px-4 py-3 rounded-xl font-medium">
                                        <CheckCircle2 size={18} className="text-green-500" /> {feature}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Reviews Section */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Star className="text-yellow-400 fill-yellow-400" /> Avis Clients ({reviewsTotal})
                        </h2>
                        {reviews.length === 0 ? (
                            <p className="text-slate-400 italic py-4">Aucun avis pour le moment. Soyez le premier à donner votre avis !</p>
                        ) : (
                            <div className="space-y-4">
                                {reviews.map((review: any) => (
                                    <div key={review._id} className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
                                        <div className="flex items-center gap-4 mb-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                                {review.guestName?.charAt(0).toUpperCase() || "?"}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold">{review.guestName}</p>
                                                <p className="text-sm text-slate-500">
                                                    {new Date(review.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                                                </p>
                                            </div>
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <Star key={s} size={16} className={s <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200"} />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-slate-600">&quot;{review.comment}&quot;</p>
                                    </div>
                                ))}
                                {reviewsTotalPages > 1 && (
                                    <div className="flex items-center justify-between pt-4">
                                        <span className="text-sm text-slate-500">Page {reviewsPage} / {reviewsTotalPages}</span>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" disabled={reviewsPage === 1} onClick={() => setReviewsPage(p => p - 1)}>
                                                <ChevronLeft size={16} /> Précédent
                                            </Button>
                                            <Button variant="outline" size="sm" disabled={reviewsPage === reviewsTotalPages} onClick={() => setReviewsPage(p => p + 1)}>
                                                Suivant <ChevronRight size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>

                    {/* Review Form */}
                    <section className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-xl font-bold mb-4">Laisser un avis</h3>
                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Votre nom</Label>
                                    <Input required value={reviewForm.guestName} onChange={e => setReviewForm({ ...reviewForm, guestName: e.target.value })} placeholder="Jean Kouamé" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Votre email</Label>
                                    <Input type="email" required value={reviewForm.guestEmail} onChange={e => setReviewForm({ ...reviewForm, guestEmail: e.target.value })} placeholder="jean@email.com" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Note</Label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <button key={s} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: s })} className="transition-transform hover:scale-110">
                                            <Star size={28} className={`${s <= reviewForm.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200"} cursor-pointer`} />
                                        </button>
                                    ))}
                                    <span className="text-sm text-slate-500 ml-2 self-center">{reviewForm.rating}/5</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Votre commentaire</Label>
                                <Textarea required value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })} placeholder="Partagez votre expérience..." className="min-h-[100px]" />
                            </div>
                            <Button type="submit" className="gap-2" disabled={reviewSubmitting}>
                                <Send size={16} /> {reviewSubmitting ? "Envoi en cours..." : "Publier mon avis"}
                            </Button>
                        </form>
                    </section>
                </div>

                {/* Right Col: Similar Properties */}
                <div>
                    <div className="sticky top-24 glass rounded-3xl p-6 shadow-2xl">
                        <h3 className="text-2xl font-bold mb-6">Biens similaires</h3>

                        {similarProperties.length === 0 ? (
                            <p className="text-slate-400 italic text-sm">Aucun bien similaire trouvé.</p>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    {paginatedSimilar.map((prop: any) => (
                                        <Link href={`/appartement/${prop._id}`} key={prop._id} className="block group">
                                            <div className="flex gap-3 p-3 rounded-xl border border-slate-100 hover:border-primary/30 hover:shadow-md transition-all bg-white">
                                                <div className="w-24 h-20 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                                                    {(prop.panoramaImageUrls?.[0] || prop.regularImageUrls?.[0]) ? (
                                                        <img src={prop.panoramaImageUrls?.[0] || prop.regularImageUrls?.[0]} alt={prop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={20} /></div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-sm text-slate-800 truncate group-hover:text-primary transition-colors">{prop.title}</h4>
                                                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1"><MapPin size={11} /> {prop.location?.quartier}, {prop.location?.commune}</p>
                                                    <p className="text-sm font-bold text-primary mt-1">{prop.price} {devise}<span className="text-xs text-slate-400 font-normal"> / {prop.pricingPeriod || 'heure'}</span></p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                {totalSimilarPages > 1 && (
                                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                                        <span className="text-xs text-slate-500">{similarPage}/{totalSimilarPages}</span>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" disabled={similarPage === 1} onClick={() => setSimilarPage(p => p - 1)}>
                                                <ChevronLeft size={14} />
                                            </Button>
                                            <Button variant="outline" size="sm" disabled={similarPage === totalSimilarPages} onClick={() => setSimilarPage(p => p + 1)}>
                                                <ChevronRight size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Floating WhatsApp Button */}
            {settings?.whatsappNumber && (
                <a
                    href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour, je suis intéressé(e) par l'appartement "${property.title}" situé à ${property.location?.quartier}, ${property.location?.commune}. Pouvez-vous me donner plus d'informations ?`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#25D366] hover:bg-[#1ebe57] text-white px-5 py-3.5 rounded-full shadow-2xl shadow-green-500/40 transition-all duration-300 hover:scale-105 hover:shadow-green-500/60 group"
                    title="Discuter sur WhatsApp"
                >
                    <svg viewBox="0 0 32 32" className="w-7 h-7 fill-white shrink-0">
                        <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16.004c0 3.5 1.128 6.744 3.046 9.378L1.054 31.29l6.118-1.958A15.906 15.906 0 0016.004 32C24.826 32 32 24.826 32 16.004 32 7.176 24.826 0 16.004 0zm9.306 22.614c-.39 1.1-1.932 2.014-3.174 2.282-.852.18-1.962.324-5.702-1.226-4.786-1.984-7.862-6.834-8.1-7.152-.228-.318-1.916-2.55-1.916-4.864 0-2.314 1.212-3.45 1.644-3.924.39-.428 1.026-.642 1.636-.642.198 0 .376.01.536.018.432.018.648.042.936.726.36.852 1.236 3.018 1.344 3.24.108.222.216.522.066.84-.138.318-.258.516-.48.792-.222.276-.462.618-.66.828-.222.24-.456.498-.198.966.258.462 1.152 1.902 2.478 3.084 1.704 1.518 3.084 2.01 3.588 2.22.36.15.786.114 1.056-.174.336-.366.756-.972 1.176-1.572.3-.426.678-.48 1.074-.33.402.15 2.556 1.206 2.994 1.426.438.222.732.33.84.516.108.186.108 1.074-.282 2.172z" />
                    </svg>
                    <span className="text-sm font-bold hidden sm:inline">Discuter sur WhatsApp</span>
                </a>
            )}
            {/* Image Modal */}
            {isImageModalOpen && regularImages.length > 0 && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center" onClick={() => setIsImageModalOpen(false)}>
                    <button onClick={() => setIsImageModalOpen(false)} className="absolute top-4 right-4 text-white/60 hover:text-white text-3xl font-bold z-10">&times;</button>
                    <div className="absolute top-4 left-4 text-white/60 font-semibold bg-white/10 px-4 py-1.5 rounded-full text-sm">{currentImageIndex + 1} / {regularImages.length}</div>

                    <div className="relative w-full h-full max-w-5xl max-h-[80vh] flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
                        <img src={regularImages[currentImageIndex]} alt={`Photo ${currentImageIndex + 1}`} className="max-w-full max-h-full object-contain rounded-lg" />
                        {regularImages.length > 1 && (
                            <>
                                <button onClick={() => setCurrentImageIndex(prev => (prev - 1 + regularImages.length) % regularImages.length)}
                                    className="absolute left-2 md:left-6 text-white/60 hover:text-white p-3 bg-black/50 hover:bg-black/80 rounded-full transition-all">
                                    <ChevronLeft size={24} />
                                </button>
                                <button onClick={() => setCurrentImageIndex(prev => (prev + 1) % regularImages.length)}
                                    className="absolute right-2 md:right-6 text-white/60 hover:text-white p-3 bg-black/50 hover:bg-black/80 rounded-full transition-all">
                                    <ChevronRight size={24} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
