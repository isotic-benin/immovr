"use client";

import { useState, useEffect, use } from "react";
import dynamic from "next/dynamic";
const PanoramaViewer = dynamic(() => import("@/components/PanoramaViewer"), { ssr: false });
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
    MapPin, Star, Mail, Phone, Calendar as CalendarIcon, CheckCircle2,
    Image as ImageIcon, ChevronLeft, ChevronRight, Send, Loader2, ThumbsUp, Eye, X
} from "lucide-react";

export default function PropertyDetails({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const [property, setProperty] = useState<any>(null);
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activePanorama, setActivePanorama] = useState(0);
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Reviews state
    const [reviews, setReviews] = useState<any[]>([]);
    const [reviewsTotal, setReviewsTotal] = useState(0);
    const [reviewsPage, setReviewsPage] = useState(1);
    const [reviewsTotalPages, setReviewsTotalPages] = useState(1);
    const [reviewForm, setReviewForm] = useState({ guestName: "", guestEmail: "", rating: 5, comment: "" });
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [likedReviews, setLikedReviews] = useState<string[]>([]);

    useEffect(() => {
        const savedLikes = localStorage.getItem("immovr_liked_reviews");
        if (savedLikes) {
            setLikedReviews(JSON.parse(savedLikes));
        }
    }, []);

    useEffect(() => {
        fetch(`/api/properties/${resolvedParams.id}`)
            .then(res => res.json())
            .then(data => { setProperty(data); setLoading(false); })
            .catch(() => setLoading(false));

        fetch("/api/admin/settings")
            .then(res => res.json())
            .then(data => setSettings(data))
            .catch(() => { });
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

    // Calculate number of days and total
    const numberOfDays = startDate && endDate
        ? Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
        : 0;

    // Dynamic price calculation
    let totalPrice = 0;
    let calculationText = "";
    const pPrice = property?.price || property?.pricePerHour || 0;
    const pPeriod = property?.pricingPeriod || "heure";

    if (pPeriod === "heure") {
        totalPrice = pPrice * (numberOfDays * 24);
        calculationText = `${numberOfDays}j × 24h × ${pPrice}`;
    } else if (pPeriod === "jour") {
        totalPrice = pPrice * numberOfDays;
        calculationText = `${numberOfDays}j × ${pPrice}`;
    } else if (pPeriod === "semaine") {
        const weeks = Math.ceil(numberOfDays / 7);
        totalPrice = pPrice * weeks;
        calculationText = `${weeks} sem. × ${pPrice}`;
    } else if (pPeriod === "mois") {
        const months = Math.ceil(numberOfDays / 30);
        totalPrice = pPrice * months;
        calculationText = `${months} mois × ${pPrice}`;
    }

    const devise = settings?.devise || "FCFA";

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

    const handleLike = async (reviewId: string) => {
        const isLiked = likedReviews.includes(reviewId);
        const action = isLiked ? "unlike" : "like";

        try {
            const res = await fetch(`/api/reviews/${reviewId}/like`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });

            if (res.ok) {
                const data = await res.json();
                setReviews(prev => prev.map(r =>
                    r._id === reviewId ? { ...r, likes: data.likes } : r
                ));

                const newLikedReviews = isLiked
                    ? likedReviews.filter(id => id !== reviewId)
                    : [...likedReviews, reviewId];

                setLikedReviews(newLikedReviews);
                localStorage.setItem("immovr_liked_reviews", JSON.stringify(newLikedReviews));

                if (!isLiked) toast.success("Vous avez aimé cet avis !");
            }
        } catch (error) {
            console.error("Like error:", error);
        }
    };

    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!startDate || !endDate) {
            toast.error("Veuillez sélectionner une date d'arrivée et une date de départ.");
            return;
        }
        if (endDate <= startDate) {
            toast.error("La date de départ doit être après la date d'arrivée.");
            return;
        }

        setBookingLoading(true);
        const formData = new FormData(e.target as HTMLFormElement);

        try {
            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    propertyId: resolvedParams.id,
                    guestDetails: {
                        firstName: formData.get("firstName"),
                        lastName: formData.get("lastName"),
                        email: formData.get("email"),
                        phone: formData.get("phone"),
                    },
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                    totalPrice,
                }),
            });
            const data = await res.json();
            if (res.ok && data.paymentUrl) {
                window.location.href = data.paymentUrl;
            } else {
                toast.error(data.error || "Erreur lors de la réservation");
            }
        } catch {
            toast.error("Erreur technique");
        } finally {
            setBookingLoading(false);
        }
    };

    const nextImage = () => {
        if (!property?.regularImageUrls) return;
        setCurrentImageIndex((prev) => (prev + 1) % property.regularImageUrls.length);
    };

    const prevImage = () => {
        if (!property?.regularImageUrls) return;
        setCurrentImageIndex((prev) => (prev - 1 + property.regularImageUrls.length) % property.regularImageUrls.length);
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

    return (
        <div className="container mx-auto px-4 pt-32 md:pt-40 pb-20 min-h-screen">
            <Toaster />
            {/* Property Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/50 p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-3 tracking-tight">{property.title}</h1>
                    <div className="flex items-center gap-5 text-slate-500 font-medium flex-wrap">
                        <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full text-slate-700"><MapPin size={16} className="text-primary" /> {property.location?.quartier}, {property.location?.commune}</span>
                        <span className="flex items-center gap-1.5"><Star size={18} className="text-yellow-400 fill-yellow-400" /> <span className="font-bold text-slate-700">{property.averageRating || 0}</span> ({property.totalReviews || 0} avis)</span>
                        {property.mapUrl && (
                            <a href={property.mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-500 hover:text-blue-600 transition-colors bg-blue-50 px-3 py-1 rounded-full">
                                <MapPin size={16} /> Voir sur la carte
                            </a>
                        )}

                    </div>
                </div>
                <div className="text-right relative z-10 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-xl shadow-slate-900/20">
                    <p className="text-3xl font-black">{property.price || property.pricePerHour} {devise} <span className="text-sm text-slate-400 font-medium">/ {property.pricingPeriod || 'heure'}</span></p>
                </div>
            </div>

            {/* VR Viewer (Cinematic) */}
            {panoramas.length > 0 ? (
                <div className="mb-14 relative group">
                    {/* Glowing backlight */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-primary rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>

                    <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl bg-slate-950 p-2 md:p-3">
                        <div className="rounded-2xl overflow-hidden border border-white/10">
                            <PanoramaViewer imageUrl={panoramas[activePanorama]} height="650px" />
                        </div>
                    </div>

                    {panoramas.length > 1 && (
                        <div className="flex justify-center gap-3 mt-6 overflow-x-auto pb-2 px-2">
                            {panoramas.map((url: string, idx: number) => (
                                <button key={idx} onClick={() => setActivePanorama(idx)}
                                    className={`relative w-28 h-20 rounded-xl overflow-hidden shrink-0 transition-all duration-300 ${idx === activePanorama ? "ring-4 ring-primary ring-offset-2 scale-110 shadow-xl z-10" : "ring-1 ring-slate-200 opacity-60 hover:opacity-100 hover:scale-105"}`}>
                                    <img src={url} alt={`Vue ${idx + 1}`} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                    <span className="absolute bottom-1 right-2 text-white font-bold text-xs drop-shadow-md">{idx + 1}/{panoramas.length}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {regularImages.length > 0 && (
                        <div className="flex justify-center mt-6">
                            <Button
                                onClick={() => { setCurrentImageIndex(0); setIsImageModalOpen(true); }}
                                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full px-6 py-2.5 backdrop-blur-md transition-all flex items-center gap-2 group shadow-lg"
                            >
                                <Eye size={18} className="group-hover:scale-110 transition-transform" />
                                <span className="font-semibold">Voir les {regularImages.length} photos standards</span>
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="w-full h-[500px] rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-14 shadow-inner">
                    <div className="text-center text-slate-400">
                        <div className="bg-white p-6 rounded-full inline-block mb-4 shadow-sm">
                            <ImageIcon size={48} className="text-slate-300" />
                        </div>
                        <p className="font-medium text-lg">Aucune visite 360° disponible</p>
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
                                        <p className="text-slate-600 mb-4">&quot;{review.comment}&quot;</p>
                                        <div className="flex items-center justify-end">
                                            <button
                                                onClick={() => handleLike(review._id)}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 ${likedReviews.includes(review._id)
                                                    ? "bg-primary/10 text-primary"
                                                    : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                                                    }`}
                                            >
                                                <ThumbsUp size={16} className={likedReviews.includes(review._id) ? "fill-primary" : ""} />
                                                <span className="text-sm font-bold">{review.likes || 0}</span>
                                            </button>
                                        </div>
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

                {/* Right Col: Booking Widget */}
                <div>
                    <div className="sticky top-28 before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/80 before:to-white/40 before:backdrop-blur-xl before:rounded-[2rem] before:-z-10 shadow-2xl shadow-slate-200/50 border border-white p-8 rounded-[2rem] relative z-0">
                        <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-[20px] -z-10"></div>

                        <h3 className="text-2xl font-bold mb-6 text-slate-900 border-b border-slate-100 pb-4">Réserver votre créneau</h3>

                        <form onSubmit={handleBookingSubmit} className="space-y-6">
                            {/* Date d'arrivée */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-slate-700 font-semibold"><CalendarIcon size={16} className="text-primary" /> Date d&apos;arrivée</Label>
                                <div className="border border-slate-200/60 rounded-2xl p-2 bg-white/70 flex justify-center shadow-inner mt-2 transition-all hover:bg-white focus-within:ring-2 focus-within:ring-primary/20">
                                    <Calendar mode="single" selected={startDate} onSelect={(d) => { setStartDate(d); if (endDate && d && endDate <= d) setEndDate(undefined); }}
                                        className="rounded-xl border-none" disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))} />
                                </div>
                                {startDate && (
                                    <p className="text-sm text-primary font-bold bg-primary/5 px-3 py-2 rounded-lg mt-2 inline-block">📅 Arrivée : {startDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
                                )}
                            </div>

                            {/* Date de départ */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-slate-700 font-semibold"><CalendarIcon size={16} className="text-secondary" /> Date de départ</Label>
                                <div className="border border-slate-200/60 rounded-2xl p-2 bg-white/70 flex justify-center shadow-inner mt-2 transition-all hover:bg-white focus-within:ring-2 focus-within:ring-secondary/20">
                                    <Calendar mode="single" selected={endDate} onSelect={setEndDate}
                                        className="rounded-xl border-none" disabled={(d) => !startDate || d <= startDate} />
                                </div>
                                {endDate && (
                                    <p className="text-sm text-secondary font-bold bg-secondary/5 px-3 py-2 rounded-lg mt-2 inline-block">📅 Départ : {endDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
                                )}
                            </div>

                            {/* Durée résumé */}
                            {numberOfDays > 0 && (
                                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-4 text-center border border-white/50 shadow-sm animate-fade-in-up">
                                    <p className="text-slate-700 font-medium">Durée du séjour : <span className="font-black text-xl text-primary block mt-1">{numberOfDays} jour{numberOfDays > 1 ? "s" : ""}</span></p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName" className="font-medium text-slate-700">Prénom</Label>
                                    <Input id="firstName" name="firstName" placeholder="Jean" required className="bg-white/60 border-slate-200 focus-visible:ring-primary h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName" className="font-medium text-slate-700">Nom</Label>
                                    <Input id="lastName" name="lastName" placeholder="Dupont" required className="bg-white/60 border-slate-200 focus-visible:ring-primary h-12 rounded-xl" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="flex items-center gap-2 font-medium text-slate-700"><Mail size={16} className="text-slate-400" /> Email</Label>
                                <Input id="email" name="email" type="email" placeholder="jean.dupont@email.com" required className="bg-white/60 border-slate-200 focus-visible:ring-primary h-12 rounded-xl" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone" className="flex items-center gap-2 font-medium text-slate-700"><Phone size={16} className="text-slate-400" /> Téléphone</Label>
                                <Input id="phone" name="phone" type="tel" placeholder="+225 01 02 03 04" required className="bg-white/60 border-slate-200 focus-visible:ring-primary h-12 rounded-xl" />
                            </div>

                            <div className="pt-6 mt-6 border-t border-slate-200">
                                {numberOfDays > 0 ? (
                                    <>
                                        <div className="flex justify-between mb-3 text-slate-600 font-medium bg-slate-50 p-3 rounded-lg">
                                            <span>{calculationText} {devise}/{pPeriod}</span>
                                            <span className="text-slate-900">{totalPrice.toLocaleString()} {devise}</span>
                                        </div>
                                        <div className="flex justify-between items-end mb-6">
                                            <span className="text-slate-500 font-bold uppercase tracking-wider text-sm">Total à payer</span>
                                            <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{totalPrice.toLocaleString()} <span className="text-2xl">{devise}</span></span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl mb-6 flex items-start gap-3">
                                        <div className="text-yellow-500 mt-0.5">⚠️</div>
                                        <p className="text-sm text-slate-500 leading-tight">Veuillez sélectionner vos dates d&apos;arrivée et de départ pour calculer le montant total de votre séjour.</p>
                                    </div>
                                )}

                                <Button type="submit" size="lg" className="w-full rounded-2xl text-lg h-16 shadow-xl shadow-primary/30 gap-2 bg-gradient-to-r from-primary to-secondary hover:scale-[1.02] transition-all duration-300 border-0" disabled={bookingLoading || numberOfDays === 0}>
                                    {bookingLoading ? <><Loader2 size={24} className="animate-spin" /> Traitement en cours...</> : `Procéder au paiement sécurisé`}
                                </Button>
                                <p className="text-center text-sm font-medium text-slate-500 mt-4 flex items-center justify-center gap-2">
                                    <CheckCircle2 size={16} className="text-green-500" /> Paiement chiffré et sécurisé via FedaPay
                                </p>
                            </div>
                        </form>
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

            {/* Standard Images Fullscreen Modal */}
            {isImageModalOpen && regularImages.length > 0 && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
                    <button
                        onClick={() => setIsImageModalOpen(false)}
                        className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors p-2 bg-white/10 rounded-full hover:bg-white/20"
                    >
                        <X size={24} />
                    </button>

                    <div className="absolute top-6 left-6 text-white/70 font-medium bg-black/50 px-4 py-1.5 rounded-full text-sm">
                        {currentImageIndex + 1} / {regularImages.length}
                    </div>

                    <div className="relative w-full h-full max-w-6xl max-h-[85vh] flex items-center justify-center p-4">
                        <img
                            src={regularImages[currentImageIndex]}
                            alt={`Photo ${currentImageIndex + 1}`}
                            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-300"
                        />

                        {regularImages.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                    className="absolute left-4 md:left-10 text-white/70 hover:text-white transition-colors p-3 bg-black/50 hover:bg-black/80 rounded-full"
                                >
                                    <ChevronLeft size={32} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                    className="absolute right-4 md:right-10 text-white/70 hover:text-white transition-colors p-3 bg-black/50 hover:bg-black/80 rounded-full"
                                >
                                    <ChevronRight size={32} />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Thumbnail navigation for modal */}
                    {regularImages.length > 1 && (
                        <div className="absolute bottom-6 max-w-4xl w-full px-4 flex gap-2 overflow-x-auto justify-center">
                            {regularImages.map((url: string, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    className={`relative w-16 h-12 rounded-lg overflow-hidden shrink-0 transition-all ${idx === currentImageIndex ? 'ring-2 ring-white scale-110' : 'opacity-40 hover:opacity-100'}`}
                                >
                                    <img src={url} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
