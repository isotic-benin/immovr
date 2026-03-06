"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

function ConfirmationContent() {
    const searchParams = useSearchParams();
    const status = searchParams.get("status");
    const id = searchParams.get("id");

    if (status === "success") {
        return (
            <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={56} className="text-green-500" />
                </div>
                <h1 className="text-4xl font-black text-slate-800">Réservation Confirmée !</h1>
                <p className="text-slate-500 text-lg max-w-md mx-auto">
                    Votre paiement a été accepté et votre réservation est confirmée. Un email de confirmation vous sera envoyé sous peu.
                </p>
                {id && (
                    <p className="text-sm text-slate-400">Référence : <span className="font-mono">{id}</span></p>
                )}
                <div className="flex gap-4 justify-center pt-4">
                    <Link href="/"><Button variant="outline" className="rounded-xl">Retour à l&apos;accueil</Button></Link>
                    <Link href="/recherche"><Button className="rounded-xl">Voir d&apos;autres biens</Button></Link>
                </div>
            </div>
        );
    }

    if (status === "failed") {
        return (
            <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <XCircle size={56} className="text-red-500" />
                </div>
                <h1 className="text-4xl font-black text-slate-800">Paiement Échoué</h1>
                <p className="text-slate-500 text-lg max-w-md mx-auto">
                    Le paiement n&apos;a pas abouti. Votre réservation n&apos;a pas été confirmée. Veuillez réessayer.
                </p>
                <Link href="/recherche"><Button className="rounded-xl">Réessayer</Button></Link>
            </div>
        );
    }

    return (
        <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle size={56} className="text-yellow-500" />
            </div>
            <h1 className="text-4xl font-black text-slate-800">Erreur</h1>
            <p className="text-slate-500 text-lg">Une erreur est survenue. Veuillez réessayer.</p>
            <Link href="/"><Button className="rounded-xl">Retour à l&apos;accueil</Button></Link>
        </div>
    );
}

export default function ConfirmationPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 pt-32 md:pt-40">
            <Suspense fallback={<div className="text-slate-500">Chargement...</div>}>
                <ConfirmationContent />
            </Suspense>
        </div>
    );
}
