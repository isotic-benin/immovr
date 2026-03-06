"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Home } from "lucide-react";
import { Button } from "./ui/button";
import TopBar from "./TopBar";

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        fetch("/api/admin/settings")
            .then(res => res.json())
            .then(data => setSettings(data))
            .catch(() => { });
    }, []);

    const agencyName = settings?.raisonSociale || "ImmoVR";

    return (
        <header
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? "glass shadow-md shadow-slate-200/50" : "bg-white/80 backdrop-blur-sm border-b border-slate-100"
                }`}
        >
            <TopBar />
            <div className={`container mx-auto px-4 md:px-6 flex items-center justify-between transition-all duration-300 ${isScrolled ? "py-3" : "py-4 md:py-5"}`}>
                <Link href="/" className="flex items-center gap-2 group shrink-0">
                    {settings?.logoUrl ? (
                        <img src={settings.logoUrl} alt={agencyName} className="w-10 h-10 rounded-xl object-contain drop-shadow-md group-hover:scale-105 transition-transform" />
                    ) : (
                        <div className="bg-primary text-white p-2.5 rounded-xl shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
                            <Home size={22} />
                        </div>
                    )}
                    <span className={`text-xl md:text-2xl font-black tracking-tighter transition-colors duration-300 ${isScrolled ? "text-primary" : "text-slate-800"}`}>
                        {agencyName.length > 15 ? agencyName.substring(0, 15) : agencyName}
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    <Link href="/" className={`font-bold transition-all duration-300 hover:text-primary ${isScrolled ? "text-slate-700" : "text-slate-900"}`}>Accueil</Link>
                    <Link href="/recherche" className={`font-bold transition-all duration-300 hover:text-primary ${isScrolled ? "text-slate-700" : "text-slate-900"}`}>Appartements</Link>
                    <Link href="/contact" className={`font-bold transition-all duration-300 hover:text-primary ${isScrolled ? "text-slate-700" : "text-slate-900"}`}>Contact</Link>
                    <Link href="/admin">
                        <Button className="rounded-full shadow-lg shadow-primary/40 hover:bg-slate-900 hover:shadow-slate-900/20 hover:-translate-y-0.5 transition-all duration-300 bg-primary text-white border-0 font-bold px-6">
                            Espace Admin
                        </Button>
                    </Link>
                </nav>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-slate-800 p-2"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full glass flex flex-col items-center py-6 gap-6 shadow-2xl border-t border-white/20">
                    <Link href="/" className="text-lg font-semibold" onClick={() => setMobileMenuOpen(false)}>Accueil</Link>
                    <Link href="/recherche" className="text-lg font-semibold" onClick={() => setMobileMenuOpen(false)}>Appartements</Link>
                    <Link href="/contact" className="text-lg font-semibold" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
                    <Link href="/admin" className="w-4/5">
                        <Button className="w-full rounded-full" onClick={() => setMobileMenuOpen(false)}>Espace Admin</Button>
                    </Link>
                </div>
            )}
        </header>
    );
}
