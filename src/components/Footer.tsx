"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Home, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        fetch("/api/admin/settings")
            .then(res => res.json())
            .then(data => setSettings(data))
            .catch(() => { });
    }, []);

    const agencyName = settings?.raisonSociale || "ImmoVR";

    return (
        <footer className="bg-slate-900 text-slate-300 pt-4 pb-4 border-t-2 border-primary relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-6 relative z-10">
                {/* Main content moved to TopBar */}

                <div className="pt-4 text-center text-sm text-slate-500 flex flex-col md:flex-row justify-between items-center">
                    <p>© {new Date().getFullYear()} {agencyName}. Tous droits réservés.</p>
                    <p className="mt-2 md:mt-0">Développé par ISOTIC SARL pour l&apos;immobilier</p>
                </div>
            </div>
        </footer>
    );
}
