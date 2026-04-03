"use client";

import React, { useState, useEffect } from "react";
import {
  format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays,
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  isSameMonth, isToday, startOfDay, addYears, subYears, eachMonthOfInterval,
  startOfYear, endOfYear
} from "date-fns";
import { fr } from "date-fns/locale";
import {
  ChevronLeft, ChevronRight, Plus, Edit, Trash2,
  CalendarDays, Home, User, Phone, Mail, StickyNote, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";

interface Occupation {
  _id: string;
  startDate: string;
  endDate: string;
  propertyId: { _id: string; title: string };
  tenantName: string;
  tenantPhone?: string;
  tenantEmail?: string;
  notes?: string;
}

interface EnhancedCalendarProps {
  occupations: Occupation[];
}

type ViewType = "day" | "week" | "month" | "year";

const ACCENT_COLORS = [
  "bg-blue-500", "bg-violet-500", "bg-emerald-500",
  "bg-rose-500", "bg-amber-500", "bg-cyan-500",
];

function getColorForId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return ACCENT_COLORS[Math.abs(hash) % ACCENT_COLORS.length];
}

function OccupationPill({ occ, onClick }: { occ: Occupation; onClick: (e: React.MouseEvent) => void }) {
  const color = getColorForId(occ._id);
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-2 py-0.5 rounded-md text-[10px] font-semibold text-white truncate",
        "transition-all duration-150 hover:opacity-80 hover:scale-[1.02] active:scale-95",
        color
      )}
      title={`${occ.tenantName} — ${occ.propertyId?.title}`}
    >
      {occ.tenantName}
    </button>
  );
}

export default function EnhancedCalendar({ occupations: initialOccupations }: EnhancedCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>("month");
  const [occupations, setOccupations] = useState<Occupation[]>(initialOccupations);
  const [properties, setProperties] = useState<any[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentOccId, setCurrentOccId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    propertyId: "",
    tenantName: "",
    tenantPhone: "",
    tenantEmail: "",
    startDate: new Date(),
    endDate: addDays(new Date(), 1),
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { setOccupations(initialOccupations); }, [initialOccupations]);

  useEffect(() => {
    fetch("/api/properties?limit=100")
      .then(res => res.json())
      .then(data => setProperties(data.properties || []));
  }, []);

  const next = () => {
    switch (view) {
      case "month": setCurrentDate(addMonths(currentDate, 1)); break;
      case "week": setCurrentDate(addWeeks(currentDate, 1)); break;
      case "day": setCurrentDate(addDays(currentDate, 1)); break;
      case "year": setCurrentDate(addYears(currentDate, 1)); break;
    }
  };

  const prev = () => {
    switch (view) {
      case "month": setCurrentDate(subMonths(currentDate, 1)); break;
      case "week": setCurrentDate(subWeeks(currentDate, 1)); break;
      case "day": setCurrentDate(subDays(currentDate, 1)); break;
      case "year": setCurrentDate(subYears(currentDate, 1)); break;
    }
  };

  const getOccupationsForDay = (day: Date) =>
    occupations.filter(occ => {
      const start = startOfDay(new Date(occ.startDate));
      const end = startOfDay(new Date(occ.endDate));
      const target = startOfDay(day);
      return target >= start && target <= end;
    });

  const openAddModal = (date?: Date) => {
    const start = date || currentDate;
    setFormData({ propertyId: "", tenantName: "", tenantPhone: "", tenantEmail: "", startDate: start, endDate: addDays(start, 1), notes: "" });
    setIsEditing(false);
    setCurrentOccId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (occ: Occupation, e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData({
      propertyId: typeof occ.propertyId === "string" ? occ.propertyId : occ.propertyId._id,
      tenantName: occ.tenantName,
      tenantPhone: occ.tenantPhone || "",
      tenantEmail: occ.tenantEmail || "",
      startDate: new Date(occ.startDate),
      endDate: new Date(occ.endDate),
      notes: occ.notes || ""
    });
    setIsEditing(true);
    setCurrentOccId(occ._id);
    setIsModalOpen(true);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!currentOccId || !window.confirm("Voulez-vous vraiment supprimer cette occupation ?")) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/occupations/${currentOccId}`, { method: "DELETE" });
      if (res.ok) {
        setOccupations(occupations.filter(o => o._id !== currentOccId));
        toast.success("Occupation supprimée");
        setIsModalOpen(false);
      } else {
        const err = await res.json();
        toast.error(err.error || "Erreur lors de la suppression");
      }
    } catch { toast.error("Erreur réseau"); }
    finally { setIsSubmitting(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const p = properties.find(prop => prop._id === formData.propertyId);
    if (!p) { toast.error("Propriété introuvable"); setIsSubmitting(false); return; }
    const payload = { ...formData, startDate: formData.startDate.toISOString(), endDate: formData.endDate.toISOString() };
    try {
      const url = isEditing ? `/api/occupations/${currentOccId}` : "/api/occupations";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) {
        const savedOcc = await res.json();
        savedOcc.propertyId = { _id: p._id, title: p.title };
        if (isEditing) setOccupations(occupations.map(o => o._id === savedOcc._id ? savedOcc : o));
        else setOccupations([...occupations, savedOcc]);
        toast.success(isEditing ? "Occupation modifiée" : "Occupation ajoutée");
        setIsModalOpen(false);
      } else {
        const err = await res.json();
        toast.error(err.error || "Erreur d'enregistrement");
      }
    } catch { toast.error("Erreur réseau"); }
    finally { setIsSubmitting(false); }
  };

  /* ─── HEADER ─── */
  const renderHeader = () => {
    const VIEWS: { key: ViewType; label: string }[] = [
      { key: "day", label: "Jour" },
      { key: "week", label: "Semaine" },
      { key: "month", label: "Mois" },
      { key: "year", label: "Année" },
    ];

    const title =
      view === "year"
        ? format(currentDate, "yyyy")
        : format(currentDate, view === "day" ? "d MMMM yyyy" : "MMMM yyyy", { locale: fr });

    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Left — navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentDate(new Date())}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary border border-primary/30 rounded-full px-4 py-1.5 hover:bg-primary/5 transition-colors"
          >
            Aujourd'hui
          </button>

          <div className="flex items-center gap-1 bg-slate-100 rounded-full p-1">
            <button
              onClick={prev}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition-all text-slate-500"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={next}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition-all text-slate-500"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <h2 className="text-xl font-bold text-slate-800 capitalize tracking-tight">
            {title}
          </h2>
        </div>

        {/* Right — view switcher + CTA */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="flex items-center gap-0.5 bg-slate-100 rounded-full p-1">
            {VIEWS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setView(key)}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-full transition-all",
                  view === key
                    ? "bg-white text-primary shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={() => openAddModal()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white text-xs font-bold tracking-wide shadow-sm hover:shadow-md hover:bg-primary/90 active:scale-95 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Nouvelle occupation</span>
          </button>
        </div>
      </div>
    );
  };

  /* ─── MONTH VIEW ─── */
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

    return (
      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        {/* Week day labels */}
        <div className="grid grid-cols-7 border-b border-slate-100">
          {weekDays.map(d => (
            <div key={d} className="py-2.5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7">
          {days.map(day => {
            const dayOccs = getOccupationsForDay(day);
            const inMonth = isSameMonth(day, monthStart);
            const today = isToday(day);

            return (
              <div
                key={day.toString()}
                onClick={() => openAddModal(day)}
                className={cn(
                  "min-h-[110px] p-2 border-r border-b border-slate-100 last:border-r-0",
                  "cursor-pointer group transition-colors duration-100 hover:bg-slate-50/70",
                  !inMonth && "bg-slate-50"
                )}
              >
                {/* Date number */}
                <div className="mb-1.5 flex items-center justify-between">
                  <span className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                    today
                      ? "bg-primary text-white"
                      : inMonth
                        ? "text-slate-700 group-hover:bg-slate-200"
                        : "text-slate-300"
                  )}>
                    {format(day, "d")}
                  </span>
                  {dayOccs.length > 0 && (
                    <span className="text-[9px] font-bold text-slate-400">
                      {dayOccs.length > 3 ? `+${dayOccs.length - 3} autres` : ""}
                    </span>
                  )}
                </div>

                {/* Occupation pills */}
                <div className="space-y-0.5">
                  {dayOccs.slice(0, 3).map(occ => (
                    <OccupationPill key={occ._id} occ={occ} onClick={e => openEditModal(occ, e)} />
                  ))}
                  {dayOccs.length > 3 && (
                    <p className="text-[9px] text-slate-400 font-medium pl-1">
                      +{dayOccs.length - 3} de plus
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /* ─── WEEK VIEW ─── */
  const renderWeekView = () => {
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: startDate, end: addDays(startDate, 6) });

    return (
      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        <div className="grid grid-cols-7 divide-x divide-slate-100 min-h-[560px]">
          {days.map(day => {
            const dayOccs = getOccupationsForDay(day);
            const today = isToday(day);

            return (
              <div key={day.toString()} className="flex flex-col" onClick={() => openAddModal(day)}>
                {/* Day header */}
                <div className={cn(
                  "py-3 text-center border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors",
                  today && "bg-primary/5"
                )}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    {format(day, "EEE", { locale: fr })}
                  </p>
                  <span className={cn(
                    "inline-flex h-8 w-8 items-center justify-center rounded-full text-base font-bold mx-auto",
                    today ? "bg-primary text-white" : "text-slate-700"
                  )}>
                    {format(day, "d")}
                  </span>
                </div>

                {/* Occupation cards */}
                <div className="flex-1 p-2 space-y-2 cursor-pointer hover:bg-slate-50/50 transition-colors">
                  {dayOccs.map(occ => {
                    const color = getColorForId(occ._id);
                    return (
                      <div
                        key={occ._id}
                        onClick={e => openEditModal(occ, e)}
                        className={cn(
                          "group rounded-xl p-2.5 shadow-sm border border-white/80 cursor-pointer",
                          "hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-150",
                          color, "bg-opacity-10"
                        )}
                      >
                        <div className={cn("h-1 w-8 rounded-full mb-2 opacity-80", color)} />
                        <p className="text-[10px] font-bold text-slate-500 truncate">{occ.propertyId?.title || "Bien supprimé"}</p>
                        <p className="text-xs font-bold text-slate-800 truncate mt-0.5">{occ.tenantName}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /* ─── DAY VIEW ─── */
  const renderDayView = () => {
    const dayOccs = getOccupationsForDay(currentDate);

    return (
      <div className="max-w-3xl mx-auto">
        {/* Day banner */}
        <div className="rounded-2xl bg-gradient-to-br from-primary/8 via-white to-blue-50 border border-primary/10 p-6 mb-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-bold text-primary/60 uppercase tracking-widest mb-1 capitalize">
              {format(currentDate, "EEEE", { locale: fr })}
            </p>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
              {format(currentDate, "d MMMM", { locale: fr })}
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              {dayOccs.length === 0
                ? "Aucune occupation"
                : `${dayOccs.length} occupation${dayOccs.length > 1 ? "s" : ""}`}
            </p>
          </div>
          <button
            onClick={() => openAddModal(currentDate)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-white text-xs font-bold shadow-sm hover:shadow-md hover:bg-primary/90 active:scale-95 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            Ajouter
          </button>
        </div>

        {/* Occupation list */}
        {dayOccs.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 py-20 text-center bg-white">
            <CalendarDays className="h-12 w-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 font-semibold text-sm">Aucune occupation planifiée</p>
            <p className="text-slate-300 text-xs mt-1">Cliquez sur "Ajouter" pour en créer une</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dayOccs.map(occ => {
              const color = getColorForId(occ._id);
              return (
                <div
                  key={occ._id}
                  onClick={e => openEditModal(occ, e)}
                  className="group flex items-center gap-4 bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-200 cursor-pointer"
                >
                  {/* Avatar */}
                  <div className={cn(
                    "h-12 w-12 shrink-0 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm",
                    color
                  )}>
                    {occ.tenantName.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 truncate">{occ.tenantName}</p>
                    <p className="text-xs text-primary font-semibold truncate">{occ.propertyId?.title || "Bien supprimé"}</p>
                    {(occ.tenantPhone || occ.tenantEmail) && (
                      <p className="text-xs text-slate-400 mt-0.5 truncate">
                        {[occ.tenantPhone, occ.tenantEmail].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>

                  {/* Edit hint */}
                  <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                      <Edit className="h-3.5 w-3.5 text-slate-500" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  /* ─── YEAR VIEW ─── */
  const renderYearView = () => {
    const months = eachMonthOfInterval({ start: startOfYear(currentDate), end: endOfYear(currentDate) });

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {months.map(month => {
          const mStart = startOfMonth(month);
          const mEnd = endOfMonth(month);
          const days = eachDayOfInterval({
            start: startOfWeek(mStart, { weekStartsOn: 1 }),
            end: endOfWeek(mEnd, { weekStartsOn: 1 }),
          });

          return (
            <div
              key={month.toString()}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition-shadow"
            >
              <h4 className="text-sm font-bold text-slate-700 mb-3 capitalize">
                {format(month, "MMMM", { locale: fr })}
              </h4>

              <div className="grid grid-cols-7 gap-px">
                {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
                  <div key={i} className="text-center text-[8px] font-bold text-slate-300 mb-1">{d}</div>
                ))}
                {days.map(day => {
                  const inMonth = isSameMonth(day, month);
                  const hasOcc = getOccupationsForDay(day).length > 0;
                  const today = isToday(day);

                  return (
                    <button
                      key={day.toString()}
                      onClick={() => { setCurrentDate(day); setView("day"); }}
                      className={cn(
                        "aspect-square flex items-center justify-center text-[9px] font-semibold rounded-md transition-all",
                        !inMonth ? "text-transparent pointer-events-none" :
                          today ? "bg-primary text-white shadow-sm" :
                            hasOcc ? "bg-blue-100 text-blue-600 font-bold hover:bg-blue-200" :
                              "text-slate-500 hover:bg-slate-100"
                      )}
                    >
                      {format(day, "d")}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  /* ─── MODAL ─── */
  const renderModal = () => (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="w-[95vw] sm:max-w-[520px] max-h-[85dvh] overflow-y-auto rounded-2xl p-0 gap-0 flex flex-col">
        {/* Modal header */}
        <div className="p-6 pb-4 border-b border-slate-100 sticky top-0 bg-background z-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              {isEditing ? <Edit className="h-4 w-4 text-primary" /> : <Sparkles className="h-4 w-4 text-primary" />}
            </div>
            <DialogTitle className="text-base font-bold text-slate-800">
              {isEditing ? "Modifier occupation" : "Nouvelle occupation"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-400 ml-11">
            Assignez un locataire pour bloquer les disponibilités.
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Property */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              <Home className="h-3.5 w-3.5 text-slate-400" /> Bien immobilier
            </Label>
            <Select required value={formData.propertyId} onValueChange={val => setFormData({ ...formData, propertyId: val })}>
              <SelectTrigger className="rounded-xl border-slate-200 text-sm h-10">
                <SelectValue placeholder="Sélectionnez un bien" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {properties.map(p => (
                  <SelectItem key={p._id} value={p._id} className="rounded-lg">{p.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-600">Date de début</Label>
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                <Calendar
                  mode="single"
                  selected={formData.startDate}
                  onSelect={d => { if (d) setFormData({ ...formData, startDate: d, endDate: d >= formData.endDate ? addDays(d, 1) : formData.endDate }); }}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-600">Date de fin</Label>
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                <Calendar
                  mode="single"
                  disableNavigation
                  disabled={d => d <= formData.startDate}
                  month={formData.startDate}
                  selected={formData.endDate}
                  onSelect={d => { if (d) setFormData({ ...formData, endDate: d }); }}
                />
              </div>
            </div>
          </div>

          {/* Tenant info */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-slate-400" /> Nom du locataire
            </Label>
            <Input
              required
              value={formData.tenantName}
              onChange={e => setFormData({ ...formData, tenantName: e.target.value })}
              placeholder="Ex : Jean Dupont"
              className="rounded-xl border-slate-200 h-10"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-slate-400" /> Téléphone
              </Label>
              <Input
                value={formData.tenantPhone}
                onChange={e => setFormData({ ...formData, tenantPhone: e.target.value })}
                placeholder="+225..."
                className="rounded-xl border-slate-200 h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" /> Email
              </Label>
              <Input
                type="email"
                value={formData.tenantEmail}
                onChange={e => setFormData({ ...formData, tenantEmail: e.target.value })}
                placeholder="jean@email.com"
                className="rounded-xl border-slate-200 h-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              <StickyNote className="h-3.5 w-3.5 text-slate-400" /> Notes
            </Label>
            <Input
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Détails supplémentaires..."
              className="rounded-xl border-slate-200 h-10"
            />
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            {isEditing ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" /> Supprimer
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="text-xs font-bold text-white bg-primary hover:bg-primary/90 px-5 py-2 rounded-xl shadow-sm hover:shadow-md active:scale-95 transition-all disabled:opacity-60"
              >
                {isSubmitting ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );

  /* ─── ROOT ─── */
  return (
    <div className="w-full">
      {renderHeader()}
      <div className="transition-all duration-300 ease-in-out">
        {view === "month" && renderMonthView()}
        {view === "week" && renderWeekView()}
        {view === "day" && renderDayView()}
        {view === "year" && renderYearView()}
      </div>
      {renderModal()}
    </div>
  );
}