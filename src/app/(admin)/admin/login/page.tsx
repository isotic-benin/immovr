"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, ArrowLeft } from "lucide-react";

export default function AdminLogin() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Créer une promesse avec timeout
            const signInPromise = signIn("credentials", {
                redirect: false,
                email,
                password,
            });

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("TIMEOUT")), 15000)
            );

            // Attendre le premier des deux
            const res: any = await Promise.race([signInPromise, timeoutPromise]);

            if (res?.error) {
                setError(res.error === "CredentialsSignin" ? "Identifiants incorrects." : res.error);
                setLoading(false);
            } else {
                router.push("/admin");
            }
        } catch (err: any) {
            setLoading(false);
            if (err.message === "TIMEOUT") {
                setError("La connexion prend trop de temps. Vérifiez votre connexion internet ou réessayez. La base de données est peut-être en cours de démarrage.");
            } else {
                setError("Une erreur technique est survenue. Veuillez réessayer.");
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 absolute inset-0 z-50">
            <div className="w-full max-w-md p-8 bg-white rounded-3xl shadow-2xl border border-slate-100">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4">
                        <Lock size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Espace Administrateur</h1>
                    <p className="text-slate-500 text-sm mt-1">Connectez-vous pour gérer ImmoVR</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-100 text-center">
                        {error}
                        {error.includes("temps") && (
                            <div className="mt-2 pt-2 border-t border-red-100">
                                <a href="/api/diag" target="_blank" className="underline font-bold">
                                    Tester la connexion à la base de données ↗
                                </a>
                            </div>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="email">Adresse Email</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@immovr.com"
                            className="h-12 bg-slate-50"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Mot de passe</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="h-12 bg-slate-50"
                        />
                    </div>

                    <Button type="submit" className="w-full rounded-xl h-12 text-lg shadow-lg shadow-primary/30" disabled={loading}>
                        {loading ? "Connexion..." : "Se connecter"}
                    </Button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center">
                    <Link href="/" className="text-sm text-slate-500 hover:text-primary transition-colors flex items-center gap-2">
                        <ArrowLeft size={16} />
                        Retour au site web
                    </Link>
                </div>
            </div>
        </div>
    );
}
