"use client";
import { compressImage } from "@/lib/image-utils";

import { useState, useEffect } from "react";
import { upload } from '@vercel/blob/client';
import useSWR from "swr";
import { Plus, Edit, Trash2, Power, PowerOff, Image as ImageIcon, Upload, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminProperties() {
    const [page, setPage] = useState(1);
    const { data, error, mutate, isLoading } = useSWR(`/api/properties?page=${page}&limit=5&all=true`, fetcher);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [currentProperty, setCurrentProperty] = useState<any>(null);
    const [uploading, setUploading] = useState(false);
    const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [savingCategory, setSavingCategory] = useState(false);
    const [categoryList, setCategoryList] = useState<string[]>([]);

    // Fetch categories from dedicated API
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/categories");
            const cats = await res.json();
            if (Array.isArray(cats)) {
                setCategoryList(cats.map((c: any) => c.name));
            }
        } catch { }
    };

    const handleSaveNewCategory = async () => {
        const name = newCategoryName.trim();
        if (!name) {
            toast.error("Veuillez saisir un nom de catégorie");
            return;
        }
        setSavingCategory(true);
        try {
            const res = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            });
            if (res.ok) {
                toast.success(`Catégorie "${name}" créée !`);
                await fetchCategories();
                // Use functional update to avoid stale closure
                setFormData(prev => ({ ...prev, category: name }));
                setNewCategoryName("");
                setIsAddingNewCategory(false);
            } else {
                const err = await res.json();
                toast.error(err.error || "Erreur lors de la création");
            }
        } catch {
            toast.error("Erreur technique");
        } finally {
            setSavingCategory(false);
        }
    };

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        price: 0,
        pricingPeriod: "heure",
        commune: "",
        quartier: "",
        features: "",
        mapUrl: ""
    });
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const [uploadedRegularImages, setUploadedRegularImages] = useState<string[]>([]);
    const [selectedCoverImage, setSelectedCoverImage] = useState<string>("");
    const [uploadingRegular, setUploadingRegular] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        const newUrls: string[] = [];

        try {
            for (let i = 0; i < files.length; i++) {
                let file = files[i];
                // Compress 360° image (can be larger, so using higher maxWidth)
                if (file.type.startsWith('image/')) {
                    const { file: processedFile, wasCompressed } = await compressImage(file, 4096, 0.85);
                    file = processedFile;
                    if (wasCompressed) {
                        console.log(`360° image ${i + 1} compressée`);
                    }
                }
                const blob = await upload(`immovr/biens/${Date.now()}-${file.name}`, file, {
                    access: 'public',
                    handleUploadUrl: '/api/upload/blob',
                });
                newUrls.push(blob.url);
            }

            if (newUrls.length > 0) {
                setUploadedImages(prev => {
                    const next = [...prev, ...newUrls];
                    return next;
                });
                setSelectedCoverImage(prev => prev || newUrls[0]);
                toast.success(`${newUrls.length} image(s) 360° uploadée(s)`);
            }
        } catch (error) {
            console.error("360 upload error:", error);
            toast.error("Erreur technique lors de l'upload des images 360°");
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    const handleRegularImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploadingRegular(true);
        const newUrls: string[] = [];

        try {
            for (let i = 0; i < files.length; i++) {
                let file = files[i];
                // Compress standard image
                if (file.type.startsWith('image/')) {
                    const { file: processedFile, wasCompressed } = await compressImage(file, 2048, 0.8);
                    file = processedFile;
                    if (wasCompressed) {
                        console.log(`Image standard ${i + 1} compressée`);
                    }
                }
                const blob = await upload(`immovr/biens_standards/${Date.now()}-${file.name}`, file, {
                    access: 'public',
                    handleUploadUrl: '/api/upload/blob',
                });
                newUrls.push(blob.url);
            }

            if (newUrls.length > 0) {
                setUploadedRegularImages(prev => {
                    const next = [...prev, ...newUrls];
                    return next;
                });
                setSelectedCoverImage(prev => prev || newUrls[0]);
                toast.success(`${newUrls.length} photo(s) standard uploadée(s)`);
            }
        } catch (error) {
            console.error("Regular upload error:", error);
            toast.error("Erreur technique lors de l'upload des photos standards");
        } finally {
            setUploadingRegular(false);
            e.target.value = "";
        }
    };

    const removeImage = (index: number) => {
        setUploadedImages(prev => {
            const newList = prev.filter((_, i) => i !== index);
            if (selectedCoverImage && selectedCoverImage === prev[index]) {
                const fallback = newList[0] || uploadedRegularImages[0] || "";
                setSelectedCoverImage(fallback);
            }
            return newList;
        });
    };

    const removeRegularImage = (index: number) => {
        setUploadedRegularImages(prev => {
            const newList = prev.filter((_, i) => i !== index);
            if (selectedCoverImage && selectedCoverImage === prev[index]) {
                const fallback = uploadedImages[0] || newList[0] || "";
                setSelectedCoverImage(fallback);
            }
            return newList;
        });
    };

    const resetForm = () => {
        setFormData({ title: "", description: "", category: "", price: 0, pricingPeriod: "heure", commune: "", quartier: "", features: "", mapUrl: "" });
        setUploadedImages([]);
        setUploadedRegularImages([]);
        setSelectedCoverImage("");
        setIsAddingNewCategory(false);
    };

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (uploadedImages.length === 0 && uploadedRegularImages.length === 0) {
            toast.error("Veuillez ajouter au moins une image (360° ou standard)");
            return;
        }

        const normalizedCoverImage = selectedCoverImage || uploadedRegularImages[0] || uploadedImages[0] || "";

        const payload = {
            title: formData.title,
            description: formData.description,
            category: formData.category,
            price: Number(formData.price),
            pricingPeriod: formData.pricingPeriod,
            location: { commune: formData.commune, quartier: formData.quartier },
            features: formData.features.split(",").map((f) => f.trim()).filter((f) => f),
            mapUrl: formData.mapUrl,
            panoramaImageUrls: uploadedImages,
            regularImageUrls: uploadedRegularImages,
            coverImageUrl: normalizedCoverImage,
        };

        console.log("POST Property Payload:", payload);

        try {
            const res = await fetch("/api/properties", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                toast.success("Bien immobilier ajouté avec succès");
                setIsAddOpen(false);
                resetForm();
                mutate();
            } else {
                toast.error("Erreur lors de l'ajout");
            }
        } catch {
            toast.error("Erreur technique");
        }
    };

    const handleEditOpen = (property: any) => {
        setCurrentProperty(property);
        // Only keep the stored category if it exists in the category list
        const storedCat = property.category || "";
        const validCategory = categoryList.includes(storedCat) ? storedCat : "";
        setFormData({
            title: property.title,
            description: property.description || "",
            category: validCategory,
            price: property.price || property.pricePerHour, // fallback
            pricingPeriod: property.pricingPeriod || "heure",
            commune: property.location?.commune || "",
            quartier: property.location?.quartier || "",
            features: property.features?.join(", ") || "",
            mapUrl: property.mapUrl || ""
        });
        setUploadedImages(property.panoramaImageUrls || []);
        setUploadedRegularImages(property.regularImageUrls || []);
        setSelectedCoverImage(property.coverImageUrl || property.regularImageUrls?.[0] || property.panoramaImageUrls?.[0] || "");
        setIsAddingNewCategory(false);
        setIsEditOpen(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentProperty) return;
        if (uploadedImages.length === 0 && uploadedRegularImages.length === 0) {
            toast.error("Veuillez ajouter au moins une image (360° ou standard)");
            return;
        }

        const normalizedCoverImage = selectedCoverImage || uploadedRegularImages[0] || uploadedImages[0] || "";

        const payload = {
            title: formData.title,
            description: formData.description,
            category: formData.category,
            price: Number(formData.price),
            pricingPeriod: formData.pricingPeriod,
            location: { commune: formData.commune, quartier: formData.quartier },
            features: formData.features.split(",").map((f) => f.trim()).filter((f) => f),
            mapUrl: formData.mapUrl,
            panoramaImageUrls: uploadedImages,
            regularImageUrls: uploadedRegularImages,
            coverImageUrl: normalizedCoverImage,
        };

        console.log("PUT Property Payload:", payload);

        try {
            const res = await fetch(`/api/properties/${currentProperty._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                toast.success("Bien modifié avec succès");
                setIsEditOpen(false);
                mutate();
            } else {
                toast.error("Erreur lors de la modification");
            }
        } catch {
            toast.error("Erreur technique");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/properties/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Bien supprimé avec succès");
                mutate();
                if (data?.properties?.length === 1 && page > 1) setPage(page - 1);
            } else {
                toast.error("Erreur lors de la suppression");
            }
        } catch {
            toast.error("Erreur technique");
        }
    };

    const toggleStatus = async (property: any) => {
        try {
            const res = await fetch(`/api/properties/${property._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !property.isActive })
            });
            if (res.ok) {
                toast.success(`Le bien est désormais ${!property.isActive ? 'Actif' : 'Inactif'}`);
                mutate();
            } else {
                toast.error("Erreur lors de la mise à jour");
            }
        } catch {
            toast.error("Erreur technique");
        }
    };



    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-800">Biens Immobiliers</h1>
                    <p className="text-slate-500">Gérez votre catalogue d&apos;appartements VR.</p>
                </div>

                <Dialog open={isAddOpen} onOpenChange={(val) => { setIsAddOpen(val); if (!val) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button className="gap-2"><Plus size={18} /> Ajouter un bien</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Ajouter un nouvel appartement</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Titre de l&apos;annonce</Label>
                                <Input name="title" value={formData.title} onChange={handleInputChange} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Commune</Label>
                                    <Input name="commune" value={formData.commune} onChange={handleInputChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Quartier</Label>
                                    <Input name="quartier" value={formData.quartier} onChange={handleInputChange} required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Prix</Label>
                                    <div className="flex gap-2">
                                        <Input name="price" type="number" value={formData.price} onChange={handleInputChange} required min={1} className="flex-grow" />
                                        <Select value={formData.pricingPeriod} onValueChange={(val) => setFormData({ ...formData, pricingPeriod: val })}>
                                            <SelectTrigger className="w-[140px]">
                                                <SelectValue placeholder="Période" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="heure">/ heure</SelectItem>
                                                <SelectItem value="jour">/ jour</SelectItem>
                                                <SelectItem value="nuitée">/ nuitée</SelectItem>
                                                <SelectItem value="semaine">/ semaine</SelectItem>
                                                <SelectItem value="mois">/ mois</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Catégorie</Label>
                                    {isAddingNewCategory ? (
                                        <div className="flex gap-2">
                                            <Input
                                                value={newCategoryName}
                                                onChange={(e) => setNewCategoryName(e.target.value)}
                                                placeholder="Nom de la catégorie..."
                                                autoFocus
                                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSaveNewCategory(); } }}
                                            />
                                            <Button
                                                type="button"
                                                variant="default"
                                                size="icon"
                                                onClick={handleSaveNewCategory}
                                                disabled={savingCategory}
                                                title="Enregistrer la catégorie"
                                                className="shrink-0 bg-green-600 hover:bg-green-700"
                                            >
                                                {savingCategory ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() => { setIsAddingNewCategory(false); setNewCategoryName(""); }}
                                                title="Annuler"
                                                className="shrink-0"
                                            >
                                                <X size={16} />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Select
                                                value={formData.category || undefined}
                                                onValueChange={(val) => setFormData({ ...formData, category: val })}
                                            >
                                                <SelectTrigger className="flex-grow">
                                                    <SelectValue placeholder="Choisir une catégorie..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categoryList.length > 0 ? (
                                                        categoryList.map((cat: string) => (
                                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                        ))
                                                    ) : (
                                                        <div className="p-2 text-xs text-slate-500 italic">Aucune catégorie existante</div>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() => setIsAddingNewCategory(true)}
                                                className="shrink-0"
                                                title="Ajouter une nouvelle catégorie"
                                            >
                                                <Plus size={16} />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea name="description" value={formData.description} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label>Lien du plan (Google Maps, etc.)</Label>
                                <Input name="mapUrl" type="url" value={formData.mapUrl} onChange={handleInputChange} placeholder="https://maps.google.com/..." />
                            </div>
                            <div className="space-y-2">
                                <Label>Équipements (séparés par des virgules)</Label>
                                <Input name="features" value={formData.features} onChange={handleInputChange} placeholder="Wi-Fi, Piscine, TV 4K..." />
                            </div>

                            {/* Image Upload Section */}
                            <div className="space-y-3 bg-slate-50 rounded-xl p-4">
                                <Label className="flex items-center gap-2"><ImageIcon size={16} /> Images 360° de l&apos;appartement (Optionnel)</Label>
                            {selectedCoverImage ? (
                                <div className="text-xs text-emerald-700 font-medium">Image de couverture : <span className="underline break-words">{selectedCoverImage}</span></div>
                            ) : (
                                <div className="text-xs text-slate-500">Aucune image de couverture sélectionnée pour l'instant.</div>
                            )}

                                {/* Preview Grid */}
                                {uploadedImages.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2">
                                        {uploadedImages.map((url, idx) => (
                                            <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 group">
                                                <img src={url} alt={`360° #${idx + 1}`} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(idx)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X size={12} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedCoverImage(url)}
                                                    className={`absolute top-1 left-1 text-xs px-2 py-1 rounded ${selectedCoverImage === url ? 'bg-emerald-600 text-white' : 'bg-black/60 text-white'} hover:opacity-90`}
                                                >
                                                    {selectedCoverImage === url ? 'Couverture' : 'Définir couverture'}
                                                </button>
                                                <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">#{idx + 1}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <label className="cursor-pointer block">
                                    <span className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-dashed border-slate-300 rounded-xl text-sm font-medium text-slate-600 hover:border-primary hover:text-primary transition-colors w-full justify-center">
                                        <Upload size={18} /> {uploading ? "Upload en cours..." : "Ajouter des images 360°"}
                                    </span>
                                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
                                </label>
                                <p className="text-xs text-slate-400">Vous pouvez sélectionner plusieurs images à la fois. Formats : JPG, PNG, WEBP</p>
                            </div>

                            {/* Standard Image Upload Section */}
                            <div className="space-y-3 bg-slate-50 rounded-xl p-4">
                                <Label className="flex items-center gap-2"><ImageIcon size={16} /> Photos standards (2D)</Label>

                                {/* Preview Grid */}
                                {uploadedRegularImages.length > 0 && (
                                    <div className="grid grid-cols-4 gap-2">
                                        {uploadedRegularImages.map((url, idx) => (
                                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group">
                                                <img src={url} alt={`Photo #${idx + 1}`} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeRegularImage(idx)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <label className="cursor-pointer block">
                                    <span className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-dashed border-slate-300 rounded-xl text-sm font-medium text-slate-600 hover:border-primary hover:text-primary transition-colors w-full justify-center">
                                        <Upload size={18} /> {uploadingRegular ? "Upload en cours..." : "Ajouter des photos standards"}
                                    </span>
                                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleRegularImageUpload} disabled={uploadingRegular} />
                                </label>
                                <p className="text-xs text-slate-400">Photos classiques du bien. Formats : JPG, PNG, WEBP</p>
                            </div>

                            <Button type="submit" className="w-full">Valider et Ajouter</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center text-slate-500">Chargement...</div>
                ) : error ? (
                    <div className="p-8 text-center text-red-500">Erreur de chargement des données.</div>
                ) : (
                    <>
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="w-[80px]">Image</TableHead>
                                    <TableHead>Titre & Localisation</TableHead>
                                    <TableHead>Prix / Période</TableHead>
                                    <TableHead>Catégorie</TableHead>
                                    <TableHead>Images</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.properties?.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} className="text-center py-4 text-slate-500">Aucun bien trouvé.</TableCell></TableRow>
                                ) : (
                                    data?.properties?.map((property: any) => (
                                        <TableRow key={property._id}>
                                            <TableCell>
                                                <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                                                    {property.coverImageUrl || property.panoramaImageUrls?.[0] || property.regularImageUrls?.[0] ? (
                                                        <img src={property.coverImageUrl || property.panoramaImageUrls?.[0] || property.regularImageUrls?.[0]} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ImageIcon size={20} className="text-slate-400" />
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-bold text-slate-800">{property.title}</div>
                                                <div className="text-sm text-slate-500">{property.location?.quartier}, {property.location?.commune}</div>
                                            </TableCell>
                                            <TableCell className="font-semibold text-primary">
                                                {property.price || property.pricePerHour} <span className="text-xs text-slate-500 font-normal">/ {property.pricingPeriod || 'heure'}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">{property.category && property.category !== "Non classé" ? property.category : "Non classé"}</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-xs text-slate-500">
                                                    <span title="Images 360°">{property.panoramaImageUrls?.length || 0} 🌐</span>
                                                    <span title="Photos standards">{property.regularImageUrls?.length || 0} 📷</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${property.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                                    {property.isActive ? 'En ligne' : 'Inactif'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="icon" onClick={() => toggleStatus(property)} title={property.isActive ? "Désactiver" : "Activer"}>
                                                        {property.isActive ? <PowerOff size={16} className="text-slate-400" /> : <Power size={16} className="text-green-500" />}
                                                    </Button>
                                                    <Button variant="outline" size="icon" onClick={() => handleEditOpen(property)}>
                                                        <Edit size={16} className="text-slate-600" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="outline" size="icon" className="hover:bg-red-50 hover:text-red-500 hover:border-red-200">
                                                                <Trash2 size={16} />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Êtes-vous sûr de vouloir supprimer &quot;{property.title}&quot; ? Cette action est irréversible.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                                <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={() => handleDelete(property._id)}>
                                                                    Supprimer
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {data?.totalPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
                                <span className="text-sm text-slate-500">Page {data.currentPage} sur {data.totalPages} ({data.total} biens)</span>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Précédent</Button>
                                    <Button variant="outline" size="sm" disabled={page === data.totalPages} onClick={() => setPage(p => p + 1)}>Suivant</Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Modifier l&apos;appartement</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Titre de l&apos;annonce</Label>
                            <Input name="title" value={formData.title} onChange={handleInputChange} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Commune</Label>
                                <Input name="commune" value={formData.commune} onChange={handleInputChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Quartier</Label>
                                <Input name="quartier" value={formData.quartier} onChange={handleInputChange} required />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Prix</Label>
                                <div className="flex gap-2">
                                    <Input name="price" type="number" value={formData.price} onChange={handleInputChange} required min={1} className="flex-grow" />
                                    <Select value={formData.pricingPeriod} onValueChange={(val) => setFormData({ ...formData, pricingPeriod: val })}>
                                        <SelectTrigger className="w-[140px]">
                                            <SelectValue placeholder="Période" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="heure">/ heure</SelectItem>
                                            <SelectItem value="jour">/ jour</SelectItem>
                                            <SelectItem value="nuitée">/ nuitée</SelectItem>
                                            <SelectItem value="semaine">/ semaine</SelectItem>
                                            <SelectItem value="mois">/ mois</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Catégorie</Label>
                                {isAddingNewCategory ? (
                                    <div className="flex gap-2">
                                        <Input
                                            value={newCategoryName}
                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                            placeholder="Nom de la catégorie..."
                                            autoFocus
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSaveNewCategory(); } }}
                                        />
                                        <Button
                                            type="button"
                                            variant="default"
                                            size="icon"
                                            onClick={handleSaveNewCategory}
                                            disabled={savingCategory}
                                            title="Enregistrer la catégorie"
                                            className="shrink-0 bg-green-600 hover:bg-green-700"
                                        >
                                            {savingCategory ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => { setIsAddingNewCategory(false); setNewCategoryName(""); }}
                                            title="Annuler"
                                            className="shrink-0"
                                        >
                                            <X size={16} />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <Select
                                            value={formData.category || undefined}
                                            onValueChange={(val) => setFormData({ ...formData, category: val })}
                                        >
                                            <SelectTrigger className="flex-grow">
                                                <SelectValue placeholder="Choisir une catégorie..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categoryList.length > 0 ? (
                                                    categoryList.map((cat: string) => (
                                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                    ))
                                                ) : (
                                                    <div className="p-2 text-xs text-slate-500 italic">Aucune catégorie existante</div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setIsAddingNewCategory(true)}
                                            className="shrink-0"
                                            title="Ajouter une nouvelle catégorie"
                                        >
                                            <Plus size={16} />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea name="description" value={formData.description} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label>Lien du plan (Google Maps, etc.)</Label>
                            <Input name="mapUrl" type="url" value={formData.mapUrl} onChange={handleInputChange} placeholder="https://maps.google.com/..." />
                        </div>
                        <div className="space-y-2">
                            <Label>Équipements (séparés par des virgules)</Label>
                            <Input name="features" value={formData.features} onChange={handleInputChange} placeholder="Wi-Fi, Piscine, TV 4K..." />
                        </div>

                        {/* Image Upload Section */}
                        <div className="space-y-3 bg-slate-50 rounded-xl p-4">
                            <Label className="flex items-center gap-2"><ImageIcon size={16} /> Images 360° de l&apos;appartement (Optionnel)</Label>
                            {selectedCoverImage ? (
                                <div className="text-xs text-emerald-700 font-medium">Image de couverture : <span className="underline break-words">{selectedCoverImage}</span></div>
                            ) : (
                                <div className="text-xs text-slate-500">Aucune image de couverture sélectionnée pour l'instant.</div>
                            )}

                            {/* Preview Grid */}
                            {uploadedImages.length > 0 && (
                                <div className="grid grid-cols-3 gap-2">
                                    {uploadedImages.map((url, idx) => (
                                        <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 group">
                                            <img src={url} alt={`360° #${idx + 1}`} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={12} />
                                            </button>
                                            <label className="absolute top-1 left-1 flex items-center gap-1 bg-black/60 text-white px-1.5 py-1 rounded cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="coverImage"
                                                    checked={selectedCoverImage === url}
                                                    onChange={() => setSelectedCoverImage(url)}
                                                    className="w-3 h-3 accent-emerald-400"
                                                />
                                                <span className="text-[10px]">{selectedCoverImage === url ? 'Couverture' : 'Choisir'}</span>
                                            </label>
                                            <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">#{idx + 1}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <label className="cursor-pointer block">
                                <span className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-dashed border-slate-300 rounded-xl text-sm font-medium text-slate-600 hover:border-primary hover:text-primary transition-colors w-full justify-center">
                                    <Upload size={18} /> {uploading ? "Upload en cours..." : "Ajouter des images 360°"}
                                </span>
                                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
                            </label>
                            <p className="text-xs text-slate-400">Vous pouvez sélectionner plusieurs images à la fois. Formats : JPG, PNG, WEBP</p>
                        </div>

                        {/* Standard Image Upload Section */}
                        <div className="space-y-3 bg-slate-50 rounded-xl p-4">
                            <Label className="flex items-center gap-2"><ImageIcon size={16} /> Photos standards (2D)</Label>

                            {/* Preview Grid */}
                            {uploadedRegularImages.length > 0 && (
                                <div className="grid grid-cols-4 gap-2">
                                    {uploadedRegularImages.map((url, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group">
                                            <img src={url} alt={`Photo #${idx + 1}`} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeRegularImage(idx)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={12} />
                                            </button>
                                            <label className="absolute top-1 left-1 flex items-center gap-1 bg-black/60 text-white px-1.5 py-1 rounded cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="coverImage"
                                                    checked={selectedCoverImage === url}
                                                    onChange={() => setSelectedCoverImage(url)}
                                                    className="w-3 h-3 accent-emerald-400"
                                                />
                                                <span className="text-[10px]">{selectedCoverImage === url ? 'Couverture' : 'Choisir'}</span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <label className="cursor-pointer block">
                                <span className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-dashed border-slate-300 rounded-xl text-sm font-medium text-slate-600 hover:border-primary hover:text-primary transition-colors w-full justify-center">
                                    <Upload size={18} /> {uploadingRegular ? "Upload en cours..." : "Ajouter des photos standards"}
                                </span>
                                <input type="file" accept="image/*" multiple className="hidden" onChange={handleRegularImageUpload} disabled={uploadingRegular} />
                            </label>
                            <p className="text-xs text-slate-400">Photos classiques du bien. Formats : JPG, PNG, WEBP</p>
                        </div>

                        <Button type="submit" className="w-full">Enregistrer les modifications</Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
