"use client";

import { useState, useEffect } from "react";
import { Mail, Phone, MapPin } from "lucide-react";

export default function TopBar() {
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        fetch("/api/admin/settings")
            .then(res => res.json())
            .then(data => setSettings(data))
            .catch(() => { });
    }, []);

    const contacts = [
        { icon: MapPin, text: settings?.localisation || "Cotonou" },
        { icon: Phone, text: settings?.telephone || "0196822065" },
        { icon: Mail, text: settings?.email || "isoticsarl@gmail.com" },
    ];

    return (
        <div className="bg-slate-900/95 backdrop-blur-sm text-slate-300 py-2 border-b border-white/5 relative z-[60] text-[9px] md:text-[11px] font-medium">
            <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-2">
                <div className="hidden lg:block font-medium text-slate-400 italic">
                    "Visitez votre futur chez-vous en réalité virtuelle avant même de vous déplacer"
                </div>
                <div className="flex items-center gap-4 md:gap-6">
                    {contacts.map((contact, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-default whitespace-nowrap">
                            <contact.icon size={11} className="text-primary" />
                            <span>{contact.text}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
