"use client";

import { useState, useEffect } from "react";
import { upload } from '@vercel/blob/client';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Image as ImageIcon, X } from "lucide-react";

export default function HeroCarouselModal({ open, onClose }: { open: boolean, onClose: () => void }) {
    const [images, setImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (open) {
            fetchSettings();
        }
    }, [open]);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/settings");
            const data = await res.json();
            setImages(data.heroCarouselImages || []);
        } catch (error) {
            toast.error("Erreur lors du chargement des images");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith("image/")) {
            toast.error("Veuillez sélectionner une image valide");
            return;
        }

        setUploading(true);

        try {
            const newBlob = await upload(file.name, file, {
                access: 'public',
                handleUploadUrl: '/api/upload/blob',
            });

            setImages([...images, newBlob.url]);
            toast.success("Image téléchargée !");
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Erreur technique lors de l'upload");
        } finally {
            setUploading(false);
            // Reset input
            e.target.value = "";
        }
    };

    const handleRemoveImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ heroCarouselImages: images }),
            });

            if (res.ok) {
                toast.success("Carousel mis à jour avec succès");
                onClose();
            } else {
                toast.error("Erreur lors de la sauvegarde");
            }
        } catch (error) {
            toast.error("Erreur technique");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] sm:max-w-[600px] rounded-2xl overflow-hidden p-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <ImageIcon className="text-primary" /> Images du Carousel Hero
                    </DialogTitle>
                    <DialogDescription>
                        Téléchargez des images directement depuis votre ordinateur pour le carousel d&apos;accueil.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 px-6 py-4 overflow-y-auto max-h-[70vh]">
                    {/* File Upload Area */}
                    <div className="space-y-2">
                        <Label>Ajouter une image</Label>
                        <div className="relative">
                            <input
                                type="file"
                                id="carousel-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                                disabled={uploading}
                            />
                            <label
                                htmlFor="carousel-upload"
                                className={`flex flex-col items-center justify-center w-full min-h-[120px] p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all ${uploading
                                    ? "bg-slate-50 border-slate-200 cursor-not-allowed"
                                    : "bg-slate-50 border-slate-300 hover:bg-white hover:border-primary/50"
                                    }`}
                            >
                                {uploading ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="animate-spin text-primary" />
                                        <span className="text-sm text-slate-500">Téléchargement en cours...</span>
                                    </div>
                                ) : (
                                    <>
                                        <Plus size={24} className="text-slate-400 mb-2" />
                                        <span className="text-slate-600 font-medium tracking-tight text-center">Cliquer pour choisir un fichier</span>
                                        <span className="text-xs text-slate-400 mt-1">Images (JPG, PNG, WEBP)</span>
                                    </>
                                )}
                            </label>
                        </div>
                    </div>

                    {/* Image List */}
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {loading ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="animate-spin text-primary" />
                            </div>
                        ) : images.length === 0 ? (
                            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <p className="text-slate-400">Aucune image configurée</p>
                            </div>
                        ) : (
                            images.map((url, idx) => (
                                <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 group transition-all hover:bg-white hover:shadow-md">
                                    <div className="w-full sm:w-16 h-24 sm:h-12 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                                        <img src={url} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0 w-full">
                                        <p className="text-xs text-slate-500 truncate sm:text-sm sm:text-slate-600">{url}</p>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveImage(idx)}
                                        className="p-2 self-end sm:self-center text-slate-400 hover:text-red-500 transition-colors bg-red-50 sm:bg-transparent rounded-lg sm:rounded-none mt-2 sm:mt-0"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <DialogFooter className="p-6 pt-2 gap-2 sm:gap-2 flex-col sm:flex-row border-t bg-slate-50/50">
                    <Button variant="outline" onClick={onClose} className="rounded-lg border-slate-200 w-full sm:w-auto">
                        Annuler
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="rounded-lg bg-slate-900 text-white min-w-[120px] w-full sm:w-auto"
                    >
                        {saving ? <Loader2 size={18} className="animate-spin mr-2" /> : "Sauvegarder"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
