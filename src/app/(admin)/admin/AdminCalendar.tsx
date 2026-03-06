import React, { useMemo, useState } from "react";
import { format, isWithinInterval, startOfDay, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MapPin, User, Clock } from "lucide-react";

interface Reservation {
    _id: string;
    startDate: string;
    endDate: string;
    propertyId: { title: string };
    guestDetails: { firstName: string; lastName: string };
}

interface AdminCalendarProps {
    reservations: Reservation[];
}

interface CalendarDayProps {
    props: any;
    getReservationForDay: (day: Date) => Reservation | null | undefined;
}

function CalendarDay({ props, getReservationForDay }: CalendarDayProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dayDate = props.day.date;
    const reservation = getReservationForDay(dayDate);
    const isBooked = !!reservation;

    if (!isBooked) {
        return <CalendarDayButton {...props} />;
    }

    const today = startOfDay(new Date());
    const checkIn = startOfDay(new Date(reservation.startDate));
    const checkOut = startOfDay(new Date(reservation.endDate));
    const daysTotal = differenceInDays(checkOut, checkIn);
    const daysRemaining = differenceInDays(checkOut, today);

    let statusText = "À venir";
    let statusColor = "bg-blue-100 text-blue-700";

    if (today >= checkIn && today <= checkOut) {
        statusText = "En cours";
        statusColor = "bg-green-100 text-green-700";
    } else if (today > checkOut) {
        statusText = "Terminé";
        statusColor = "bg-slate-100 text-slate-700";
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <div
                    className="relative w-full h-full"
                    onMouseEnter={() => setIsOpen(true)}
                    onMouseLeave={() => setIsOpen(false)}
                >
                    <CalendarDayButton {...props} />
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full pointer-events-none"></div>
                </div>
            </PopoverTrigger>
            <PopoverContent
                side="top"
                align="center"
                className="w-80 p-0 rounded-2xl overflow-hidden shadow-2xl border-none z-50 pointer-events-none"
            >
                <div className="bg-primary p-4 text-white">
                    <h4 className="font-bold text-lg flex items-center gap-2">
                        <MapPin size={18} /> {reservation.propertyId?.title || "Appartement"}
                    </h4>
                    <div className="text-primary-foreground/80 text-sm mt-1">
                        {format(new Date(reservation.startDate), "dd MMM")} - {format(new Date(reservation.endDate), "dd MMM yyyy", { locale: fr })}
                    </div>
                </div>
                <div className="p-4 bg-white space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-700 font-medium">
                            <User size={16} className="text-slate-400" />
                            {reservation.guestDetails?.firstName} {reservation.guestDetails?.lastName}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${statusColor}`}>
                            {statusText}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <Clock size={16} className="text-primary" />
                        <div>
                            <p><span className="font-bold text-slate-700">{daysTotal}</span> jours au total</p>
                            {statusText === "En cours" && (
                                <p className="text-xs mt-0.5">Libération dans <span className="font-bold text-primary">{Math.max(0, daysRemaining)}</span> jours</p>
                            )}
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}

export default function AdminCalendar({ reservations }: AdminCalendarProps) {
    const [date, setDate] = useState<Date | undefined>(new Date());

    // Process reservations to find booked dates
    const bookedDates = useMemo(() => {
        return reservations?.map(res => ({
            from: new Date(res.startDate),
            to: new Date(res.endDate)
        })) || [];
    }, [reservations]);

    const getReservationForDay = (day: Date) => {
        if (!reservations) return null;
        return reservations.find(res => {
            return isWithinInterval(startOfDay(day), {
                start: startOfDay(new Date(res.startDate)),
                end: startOfDay(new Date(res.endDate))
            });
        });
    };

    return (
        <div className="flex flex-col items-center">
            <style>{`
                .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover {
                    background-color: var(--color-primary);
                    color: white;
                }
                .booked-day {
                    background-color: hsl(15, 100%, 90%);
                    color: var(--color-primary);
                    font-weight: bold;
                    border-radius: 0.5rem;
                }
            `}</style>

            <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                locale={fr}
                className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100"
                modifiers={{
                    booked: bookedDates
                }}
                modifiersClassNames={{
                    booked: "booked-day"
                }}
                components={{
                    DayButton: (props) => (
                        <CalendarDay props={props} getReservationForDay={getReservationForDay} />
                    )
                }}
            />
        </div>
    );
}
