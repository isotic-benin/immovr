"use client";

import { useState, useEffect } from "react";
import { upload } from '@vercel/blob/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Save, Upload, X } from "lucide-react";

interface SettingsModalProps {
    open: boolean;
    onClose: () => void;
}

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string>("");
    const [form, setForm] = useState({
        raisonSociale: "",
        rccm: "",
        ifu: "",
        telephone: "",
        whatsappNumber: "",
        email: "",
        localisation: "",
        logoUrl: "",
        devise: "FCFA",
    });

    useEffect(() => {
        if (open) {
            setLoading(true);
            fetch("/api/admin/settings")
                .then(res => res.json())
                .then(data => {
                    setForm({
                        raisonSociale: data.raisonSociale || "",
                        rccm: data.rccm || "",
                        ifu: data.ifu || "",
                        telephone: data.telephone || "",
                        whatsappNumber: data.whatsappNumber || "",
                        email: data.email || "",
                        localisation: data.localisation || "",
                        logoUrl: data.logoUrl || "",
                        devise: data.devise || "FCFA",
                    });
                    setLogoPreview(data.logoUrl || "");
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [open]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);

        try {
            const newBlob = await upload(file.name, file, {
                access: 'public',
                handleUploadUrl: '/api/upload/blob',
            });

            setForm(prev => ({ ...prev, logoUrl: newBlob.url }));
            setLogoPreview(newBlob.url);
            toast.success("Logo uploadé avec succès");
        } catch (error) {
            console.error("Logo upload error:", error);
            toast.error("Erreur technique lors de l'upload");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (res.ok) {
                toast.success("Paramètres enregistrés avec succès");
                onClose();
            } else {
                toast.error("Erreur lors de la sauvegarde");
            }
        } catch {
            toast.error("Erreur technique");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl">Paramètres de l&apos;Entreprise</DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="py-8 text-center text-slate-500">Chargement...</div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Logo Upload */}
                        <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                            <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider">Logo de l&apos;entreprise</h3>
                            <div className="flex items-center gap-4">
                                {logoPreview ? (
                                    <div className="relative w-20 h-20 rounded-xl border-2 border-slate-200 overflow-hidden bg-white">
                                        <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                                        <button
                                            type="button"
                                            onClick={() => { setLogoPreview(""); setForm(prev => ({ ...prev, logoUrl: "" })); }}
                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                                        <Upload size={24} />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <label className="cursor-pointer">
                                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                                            <Upload size={16} /> {uploading ? "Upload en cours..." : "Choisir un fichier"}
                                        </span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploading} />
                                    </label>
                                    <p className="text-xs text-slate-400 mt-1">PNG, JPG. Taille max recommandée : 500x500px</p>
                                </div>
                            </div>
                        </div>

                        {/* Company Info */}
                        <div className="bg-slate-50 rounded-xl p-4 space-y-4">
                            <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider">Informations Légales</h3>

                            <div className="space-y-2">
                                <Label>Raison Sociale</Label>
                                <Input name="raisonSociale" value={form.raisonSociale} onChange={handleChange} placeholder="ImmoVR SARL" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>RCCM</Label>
                                    <Input name="rccm" value={form.rccm} onChange={handleChange} placeholder="CI-ABJ-2024-B-12345" />
                                </div>
                                <div className="space-y-2">
                                    <Label>IFU</Label>
                                    <Input name="ifu" value={form.ifu} onChange={handleChange} placeholder="2024-12345-X" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Téléphone</Label>
                                    <Input name="telephone" value={form.telephone} onChange={handleChange} placeholder="+225 07 01 02 03" />
                                </div>
                                <div className="space-y-2">
                                    <Label>WhatsApp (Format Internat.)</Label>
                                    <Input name="whatsappNumber" value={form.whatsappNumber} onChange={handleChange} placeholder="22507010203" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input name="email" type="email" value={form.email} onChange={handleChange} placeholder="contact@immovr.ci" />
                            </div>

                            <div className="space-y-2">
                                <Label>Localisation</Label>
                                <Input name="localisation" value={form.localisation} onChange={handleChange} placeholder="Abidjan, Cocody, Riviera 3" />
                            </div>

                            <div className="space-y-2">
                                <Label>Devise</Label>
                                <Input name="devise" value={form.devise} onChange={handleChange} placeholder="FCFA" />
                            </div>
                        </div>

                        <Button type="submit" className="w-full gap-2" disabled={saving}>
                            <Save size={16} /> {saving ? "Enregistrement..." : "Enregistrer les paramètres"}
                        </Button>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
