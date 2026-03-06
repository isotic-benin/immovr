"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Search, Settings, User, LogOut, Menu, Lock, ImageIcon } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ProfileModal from "./ProfileModal";
import SettingsModal from "./SettingsModal";
import PasswordModal from "./PasswordModal";
import HeroCarouselModal from "./HeroCarouselModal";

export default function AdminHeader({ onToggleSidebar }: { onToggleSidebar: () => void }) {
    const { data: session } = useSession();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [profileOpen, setProfileOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [passwordOpen, setPasswordOpen] = useState(false);
    const [carouselOpen, setCarouselOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000); // Refresh every 30s
            return () => clearInterval(interval);
        }
    }, [mounted]);

    const fetchNotifications = () => {
        fetch("/api/notifications?limit=5&unread=false")
            .then(res => res.json())
            .then(data => {
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            })
            .catch(() => { });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/admin/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const adminEmail = session?.user?.email || "";

    if (!mounted) {
        return (
            <header className="bg-white rounded-3xl shadow-sm border border-slate-200/60 h-16 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 shrink-0">
                <div className="flex items-center gap-3 flex-1">
                    <button onClick={onToggleSidebar} className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors">
                        <Menu size={22} className="text-slate-700" />
                    </button>
                    <form onSubmit={handleSearchSubmit} className="relative w-full max-w-sm hidden sm:block">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            type="search"
                            name="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Rechercher..."
                            className="w-full bg-slate-50 border-none pl-9 rounded-full"
                        />
                    </form>
                </div>
                <div className="flex items-center gap-4">
                    <div className="p-2"><Bell size={20} className="text-slate-600" /></div>
                </div>
            </header>
        );
    }

    return (
        <>
            <header className="bg-white rounded-3xl shadow-sm border border-slate-200/60 h-16 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 shrink-0">
                <div className="flex items-center gap-3 flex-1">
                    <button onClick={onToggleSidebar} className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors">
                        <Menu size={22} className="text-slate-700" />
                    </button>
                    <form onSubmit={handleSearchSubmit} className="relative w-full max-w-sm hidden sm:block">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            type="search"
                            name="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Rechercher..."
                            className="w-full bg-slate-50 border-none pl-9 rounded-full focus-visible:ring-1 focus-visible:ring-primary/50"
                        />
                    </form>
                </div>

                <div className="flex items-center gap-4">
                    {/* Notifications */}
                    <DropdownMenu>
                        <DropdownMenuTrigger className="relative p-2 rounded-full hover:bg-slate-100 transition-colors outline-none cursor-pointer">
                            <Bell size={20} className="text-slate-600" />
                            {unreadCount > 0 && (
                                <Badge className="absolute top-0 right-0 w-4 h-4 p-0 flex items-center justify-center bg-red-500 text-[10px] rounded-full">
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                </Badge>
                            )}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80">
                            <DropdownMenuLabel>Notifications ({unreadCount} non lues)</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-slate-400">Aucune notification</div>
                                ) : (
                                    notifications.map((notif: any) => (
                                        <DropdownMenuItem key={notif._id} className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${!notif.isRead ? "bg-primary/5" : ""}`}>
                                            <div className="flex items-center gap-2 w-full">
                                                <span className="font-semibold text-sm">{notif.title}</span>
                                                {!notif.isRead && <span className="w-2 h-2 bg-primary rounded-full ml-auto shrink-0"></span>}
                                            </div>
                                            <span className="text-xs text-slate-500 line-clamp-2">{notif.message}</span>
                                        </DropdownMenuItem>
                                    ))
                                )}
                            </div>
                            <DropdownMenuSeparator />
                            <Link href="/admin/notifications">
                                <DropdownMenuItem className="justify-center text-primary font-medium text-sm cursor-pointer">
                                    Voir tout
                                </DropdownMenuItem>
                            </Link>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="h-6 border-l border-slate-200 mx-2 hidden sm:block"></div>

                    {/* Profile Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-2 outline-none cursor-pointer group">
                            <Avatar className="h-9 w-9 border-2 border-primary/20 transition-colors group-hover:border-primary/40">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                    <User size={18} />
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-bold text-slate-700 leading-none">{adminEmail?.split("@")[0] || "Administrateur"}</p>
                                <p className="text-xs text-slate-500">Super Admin</p>
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 mt-2">
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">Connecté en tant que</p>
                                    <p className="text-xs leading-none text-slate-500">{adminEmail}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => setProfileOpen(true)}>
                                <User size={16} className="text-slate-500" /> Mon Profil
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => setSettingsOpen(true)}>
                                <Settings size={16} className="text-slate-500" /> Paramètres
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => setPasswordOpen(true)}>
                                <Lock size={16} className="text-slate-500" /> Changer Mot de passe
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => setCarouselOpen(true)}>
                                <ImageIcon size={16} className="text-slate-500" /> Carousel Hero
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="cursor-pointer gap-2 text-red-600 focus:text-red-600 focus:bg-red-50"
                                onClick={() => signOut({ callbackUrl: "/admin/login" })}
                            >
                                <LogOut size={16} /> Déconnexion
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} adminEmail={adminEmail} />
            <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
            <PasswordModal open={passwordOpen} onClose={() => setPasswordOpen(false)} adminEmail={adminEmail} />
            <HeroCarouselModal open={carouselOpen} onClose={() => setCarouselOpen(false)} />
        </>
    );
}
