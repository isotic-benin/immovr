"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Building, User, Mail, MapPin, Phone, Hash, Banknote } from "lucide-react";

interface ProfileModalProps {
    open: boolean;
    onClose: () => void;
    adminEmail: string;
}

export default function ProfileModal({ open, onClose, adminEmail }: ProfileModalProps) {
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (open) {
            setLoading(true);
            fetch("/api/admin/settings")
                .then(res => res.json())
                .then(data => { setSettings(data); setLoading(false); })
                .catch(() => setLoading(false));
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] sm:max-w-md p-0 rounded-2xl overflow-hidden gap-0 flex flex-col max-h-[85dvh]">
                <DialogHeader className="p-6 pb-3 sticky top-0 bg-background z-10 border-b">
                    <DialogTitle className="text-xl">Mon Profil</DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="py-12 text-center text-slate-500 flex-1">Chargement...</div>
                ) : (
                    <div className="space-y-6 p-6 overflow-y-auto flex-1">
                        {/* Admin Info */}
                        <div className="bg-gradient-to-r from-primary/10 to-blue-50 rounded-2xl p-5">
                            <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-3">Administrateur</h3>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xl font-black shrink-0">
                                    {adminEmail?.charAt(0).toUpperCase() || "A"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-lg text-slate-800 truncate">{adminEmail?.split("@")[0]}</p>
                                    <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1"><Mail size={14} /> <span className="truncate">{adminEmail}</span></p>
                                    <span className="mt-2 inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">Super Admin</span>
                                </div>
                            </div>
                        </div>

                        {/* Company Info */}
                        <div className="bg-slate-50 rounded-2xl p-5">
                            <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-3">Informations de l&apos;Agence</h3>
                            {!settings?.raisonSociale ? (
                                <p className="text-slate-400 text-sm italic">Aucune information configurée. Allez aux Paramètres.</p>
                            ) : (
                                <div className="space-y-3">
                                    <InfoRow icon={<Building size={16} />} label="Raison Sociale" value={settings.raisonSociale} />
                                    <InfoRow icon={<Hash size={16} />} label="RCCM" value={settings.rccm} />
                                    <InfoRow icon={<Hash size={16} />} label="IFU" value={settings.ifu} />
                                    <InfoRow icon={<Phone size={16} />} label="Téléphone" value={settings.telephone} />
                                    <InfoRow icon={<Phone size={16} />} label="WhatsApp" value={settings.whatsappNumber} />
                                    <InfoRow icon={<Mail size={16} />} label="Email" value={settings.email} />
                                    <InfoRow icon={<MapPin size={16} />} label="Localisation" value={settings.localisation} />
                                    <InfoRow icon={<Banknote size={16} />} label="Devise" value={settings.devise} />
                                    {settings.logoUrl && (
                                        <div className="flex items-center gap-3 pt-2">
                                            <img src={settings.logoUrl} alt="Logo" className="w-12 h-12 rounded-xl object-contain border border-slate-200" />
                                            <span className="text-sm text-slate-500">Logo</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="text-slate-400">{icon}</div>
            <div>
                <p className="text-xs text-slate-400">{label}</p>
                <p className="text-sm font-medium text-slate-700">{value || "—"}</p>
            </div>
        </div>
    );
}
