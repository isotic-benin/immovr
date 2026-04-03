"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Lock, Eye, EyeOff } from "lucide-react";

interface PasswordModalProps {
    open: boolean;
    onClose: () => void;
    adminEmail: string;
}

export default function PasswordModal({ open, onClose, adminEmail }: PasswordModalProps) {
    const [saving, setSaving] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [form, setForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (form.newPassword !== form.confirmPassword) {
            toast.error("Les deux mots de passe ne correspondent pas.");
            return;
        }

        if (form.newPassword.length < 6) {
            toast.error("Le nouveau mot de passe doit contenir au moins 6 caractères.");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch("/api/admin/password", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: adminEmail,
                    currentPassword: form.currentPassword,
                    newPassword: form.newPassword,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Mot de passe modifié avec succès !");
                setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                onClose();
            } else {
                toast.error(data.error || "Erreur lors du changement de mot de passe.");
            }
        } catch {
            toast.error("Erreur technique.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => { if (!val) { setForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); onClose(); } }}>
            <DialogContent className="w-[95vw] sm:max-w-md p-0 rounded-2xl overflow-hidden gap-0 flex flex-col">
                <DialogHeader className="p-6 pb-3 sticky top-0 bg-background z-10 border-b">
                    <DialogTitle className="text-xl flex items-center gap-2"><Lock size={20} /> Changer mot de passe</DialogTitle>
                </DialogHeader>

                <form id="password-form" onSubmit={handleSubmit} className="space-y-5 p-6 pb-2 overflow-y-auto flex-1">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                        <p>Pour votre sécurité, confirmez votre mot de passe actuel.</p>
                    </div>

                    <div className="space-y-2">
                        <Label>Mot de passe actuel</Label>
                        <div className="relative">
                            <Input
                                name="currentPassword"
                                type={showCurrent ? "text" : "password"}
                                value={form.currentPassword}
                                onChange={handleChange}
                                required
                                placeholder="••••••••"
                                className="pr-10 text-base"
                                autoComplete="current-password"
                            />
                            <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Nouveau mot de passe</Label>
                        <div className="relative">
                            <Input
                                name="newPassword"
                                type={showNew ? "text" : "password"}
                                value={form.newPassword}
                                onChange={handleChange}
                                required
                                placeholder="••••••••"
                                minLength={6}
                                className="pr-10 text-base"
                                autoComplete="new-password"
                            />
                            <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <p className="text-xs text-slate-500">Min. 6 caractères</p>
                    </div>

                    <div className="space-y-2">
                        <Label>Confirmer le nouveau mot de passe</Label>
                        <Input
                            name="confirmPassword"
                            type="password"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            required
                            placeholder="••••••••"
                            className="text-base"
                            autoComplete="new-password"
                        />
                        {form.confirmPassword && form.newPassword !== form.confirmPassword && (
                            <p className="text-xs text-red-500 mt-1">⚠ Les mots de passe ne correspondent pas.</p>
                        )}
                    </div>
                </form>

                <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent p-6 pt-4 border-t flex gap-2 flex-col-reverse sm:flex-row">
                    <Button variant="outline" onClick={onClose} className="w-full sm:w-auto rounded-lg border-slate-200">
                        Annuler
                    </Button>
                    <Button type="submit" form="password-form" disabled={saving} className="w-full sm:w-auto gap-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800">
                        <Lock size={16} /> {saving ? "Modification..." : "Modifier"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
