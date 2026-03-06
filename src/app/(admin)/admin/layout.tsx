"use client";

import { useState } from "react";
import { SessionProvider } from "next-auth/react";
import Link from "next/link";
import { LayoutDashboard, Home, Building, CalendarDays, LogOut, X, Bell, FileText } from "lucide-react";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import AdminHeader from "./AdminHeader";

function AdminSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const pathname = usePathname();

    return (
        <>
            {/* Overlay on mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed md:static inset-y-4 left-4 z-50
                w-64 bg-slate-900 md:h-[calc(100vh-2rem)] md:rounded-3xl shadow-2xl md:shadow-[0_8px_30px_rgb(0,0,0,0.12)] text-white p-6 flex flex-col
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0
            `}>
                <div className="mb-10 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-2xl font-black">
                        Immo<span className="text-primary">VR</span> <span className="text-sm font-normal text-slate-400">Admin</span>
                    </div>
                    <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white p-1">
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-grow space-y-2">
                    <Link href="/admin" onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${pathname === "/admin" ? "bg-primary text-white" : "hover:bg-slate-800 text-slate-300"}`}>
                        <LayoutDashboard size={20} /> Vue d&apos;ensemble
                    </Link>
                    <Link href="/admin/properties" onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${pathname.includes("/admin/properties") ? "bg-primary text-white" : "hover:bg-slate-800 text-slate-300"}`}>
                        <Building size={20} /> Biens Immobiliers
                    </Link>
                    <Link href="/admin/reservations" onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${pathname.includes("/admin/reservations") ? "bg-primary text-white" : "hover:bg-slate-800 text-slate-300"}`}>
                        <CalendarDays size={20} /> Réservations
                    </Link>
                    <Link href="/admin/notifications" onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${pathname.includes("/admin/notifications") ? "bg-primary text-white" : "hover:bg-slate-800 text-slate-300"}`}>
                        <Bell size={20} /> Notifications
                    </Link>
                    <Link href="/admin/invoices" onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${pathname.includes("/admin/invoices") ? "bg-primary text-white" : "hover:bg-slate-800 text-slate-300"}`}>
                        <FileText size={20} /> Factures
                    </Link>
                </nav>

                <div className="mt-auto space-y-2 pt-8 border-t border-slate-800">
                    <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-300 transition-colors">
                        <Home size={20} /> Retour au site
                    </Link>
                    <button onClick={() => signOut({ callbackUrl: "/admin/login" })} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-destructive/20 text-red-400 transition-colors">
                        <LogOut size={20} /> Déconnexion
                    </button>
                </div>
            </div>
        </>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/admin/login";
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <SessionProvider>
            <div className={`flex min-h-screen bg-slate-100/80 ${isLoginPage ? 'items-center justify-center p-4' : 'p-4 gap-4'}`}>
                {!isLoginPage && <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}

                {isLoginPage ? (
                    children
                ) : (
                    <div className="flex flex-col flex-1 h-[calc(100vh-2rem)] overflow-hidden gap-4">
                        <AdminHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                        <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-white rounded-3xl shadow-sm border border-slate-200/60">
                            {children}
                        </main>
                        <footer className="py-4 px-6 text-center text-sm font-medium text-slate-500 bg-white rounded-3xl shadow-sm border border-slate-200/60 shrink-0">
                            © {new Date().getFullYear()} Immo<span className="text-primary font-black">VR</span> — Tous droits réservés.
                        </footer>
                    </div>
                )}
            </div>
            <Toaster />
        </SessionProvider>
    );
}
