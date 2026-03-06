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
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-2"><Lock size={20} /> Changer le mot de passe</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
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
                            />
                            <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
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
                            />
                            <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
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
                        />
                        {form.confirmPassword && form.newPassword !== form.confirmPassword && (
                            <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas.</p>
                        )}
                    </div>

                    <Button type="submit" className="w-full gap-2" disabled={saving}>
                        <Lock size={16} /> {saving ? "Modification en cours..." : "Modifier le mot de passe"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
