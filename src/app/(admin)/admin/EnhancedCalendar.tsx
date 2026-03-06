"use client";

import React, { useState, useMemo } from "react";
import {
  format,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  startOfDay,
  addYears,
  subYears,
  eachMonthOfInterval,
  startOfYear,
  endOfYear
} from "date-fns";
import { fr } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  ChevronDown,
  MoreVertical,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Reservation {
  _id: string;
  startDate: string;
  endDate: string;
  propertyId: { title: string };
  guestDetails: { firstName: string; lastName: string };
  status?: string;
}

interface EnhancedCalendarProps {
  reservations: Reservation[];
}

type ViewType = "day" | "week" | "month" | "year";

export default function EnhancedCalendar({ reservations }: EnhancedCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>("month");

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

  const resetToToday = () => setCurrentDate(new Date());

  const getReservationsForDay = (day: Date) => {
    return reservations.filter((res) => {
      const start = startOfDay(new Date(res.startDate));
      const end = startOfDay(new Date(res.endDate));
      const target = startOfDay(day);
      return target >= start && target <= end;
    });
  };

  const renderHeader = () => {
    const title = view === "year"
      ? format(currentDate, "yyyy")
      : format(currentDate, view === "day" ? "d MMMM yyyy" : "MMMM yyyy", { locale: fr });

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={resetToToday} className="font-semibold px-4 rounded-lg hidden sm:flex">
            Aujourd'hui
          </Button>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={prev} className="rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={next} className="rounded-full">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          <h2 className="text-xl font-bold text-slate-800 capitalize">{title}</h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex">
            {(["day", "week", "month", "year"] as ViewType[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-lg transition-all capitalize",
                  view === v
                    ? "bg-white text-primary shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                {v === "day" ? "Jour" : v === "week" ? "Semaine" : v === "month" ? "Mois" : "Année"}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-100">
          {weekDays.map((day) => (
            <div key={day} className="py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const dayReservations = getReservationsForDay(day);
            const isCurrentMonth = isSameMonth(day, monthStart);

            return (
              <div
                key={day.toString()}
                className={cn(
                  "min-h-[120px] p-2 border-r border-b border-slate-50 last:border-r-0 relative group transition-colors",
                  !isCurrentMonth && "bg-slate-50/50"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={cn(
                    "inline-flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full",
                    isToday(day) ? "bg-primary text-white" : isCurrentMonth ? "text-slate-700" : "text-slate-300"
                  )}>
                    {format(day, "d")}
                  </span>
                </div>

                <div className="space-y-1">
                  {dayReservations.slice(0, 3).map((res) => (
                    <div
                      key={res._id}
                      className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-100 text-blue-700 truncate cursor-pointer hover:bg-blue-200 transition-colors"
                      title={`${res.guestDetails.firstName} - ${res.propertyId?.title || 'Bien supprimé'}`}
                    >
                      {res.guestDetails.firstName}
                    </div>
                  ))}
                  {dayReservations.length > 3 && (
                    <div className="text-[10px] text-slate-400 font-medium pl-1">
                      + {dayReservations.length - 3} autres
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({
      start: startDate,
      end: addDays(startDate, 6)
    });

    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="grid grid-cols-7 divide-x divide-slate-100 min-h-[600px]">
          {days.map((day) => {
            const dayReservations = getReservationsForDay(day);
            return (
              <div key={day.toString()} className="flex flex-col">
                <div className="p-4 text-center border-b border-slate-100">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">
                    {format(day, "EEE", { locale: fr })}
                  </div>
                  <div className={cn(
                    "inline-flex items-center justify-center w-10 h-10 text-lg font-bold rounded-full mx-auto",
                    isToday(day) ? "bg-primary text-white" : "text-slate-700"
                  )}>
                    {format(day, "d")}
                  </div>
                </div>
                <div className="flex-1 p-2 space-y-2 bg-slate-50/30">
                  {dayReservations.map((res) => (
                    <div
                      key={res._id}
                      className="p-3 rounded-lg bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="text-xs font-bold text-blue-600 mb-1">{res.propertyId?.title || 'Bien supprimé'}</div>
                      <div className="text-sm font-semibold text-slate-800">
                        {res.guestDetails.firstName} {res.guestDetails.lastName}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const dayReservations = getReservationsForDay(currentDate);

    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden max-w-4xl mx-auto w-full">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="text-lg font-medium text-slate-500 mb-1 capitalize">
            {format(currentDate, "EEEE", { locale: fr })}
          </div>
          <h3 className="text-4xl font-black text-slate-800">
            {format(currentDate, "d MMMM", { locale: fr })}
          </h3>
        </div>
        <div className="p-8">
          {dayReservations.length === 0 ? (
            <div className="py-20 text-center">
              <CalendarIcon className="h-16 w-16 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-medium">Aucune réservation pour ce jour.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dayReservations.map((res) => (
                <div key={res._id} className="group p-6 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-between transition-all hover:shadow-lg hover:shadow-blue-500/10 active:scale-[0.98]">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                      {res.guestDetails.firstName[0]}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-800">
                        {res.guestDetails.firstName} {res.guestDetails.lastName}
                      </h4>
                      <p className="text-blue-600 font-semibold">{res.propertyId?.title || 'Bien supprimé'}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="h-5 w-5 text-slate-400" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderYearView = () => {
    const yearStart = startOfYear(currentDate);
    const months = eachMonthOfInterval({
      start: yearStart,
      end: endOfYear(currentDate)
    });

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {months.map((month) => {
          const monthStart = startOfMonth(month);
          const monthEnd = endOfMonth(month);
          const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
          const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
          const days = eachDayOfInterval({ start: startDate, end: endDate });

          return (
            <div key={month.toString()} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
              <h4 className="text-lg font-bold text-slate-800 mb-4 capitalize px-2">
                {format(month, "MMMM", { locale: fr })}
              </h4>
              <div className="grid grid-cols-7 gap-1">
                {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
                  <div key={i} className="text-[10px] font-bold text-slate-300 text-center mb-1">{d}</div>
                ))}
                {days.map((day) => {
                  const dayReservations = getReservationsForDay(day);
                  const isCurrentMonth = isSameMonth(day, month);
                  const hasReservation = dayReservations.length > 0;

                  return (
                    <div
                      key={day.toString()}
                      onClick={() => {
                        setCurrentDate(day);
                        setView("day");
                      }}
                      className={cn(
                        "aspect-square flex items-center justify-center text-[10px] font-medium rounded-md cursor-pointer transition-all",
                        !isCurrentMonth ? "text-transparent" :
                          isToday(day) ? "bg-primary text-white" :
                            hasReservation ? "bg-blue-100 text-blue-600 font-bold" : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {format(day, "d")}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full">
      {renderHeader()}
      <div className="transition-all duration-300 ease-in-out">
        {view === "month" && renderMonthView()}
        {view === "week" && renderWeekView()}
        {view === "day" && renderDayView()}
        {view === "year" && renderYearView()}
      </div>
    </div>
  );
}
