import { useState, useEffect } from "react";
import { format, addDays, startOfWeek, eachDayOfInterval, isSameDay, startOfDay, setHours, setMinutes, addMinutes } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";

interface Appointment {
  id: string;
  time_slot_id: string;
  session_type: string;
  created_at: string;
  time_slot: {
    start_time: string;
    end_time: string;
  };
}
interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  is_available: boolean;
  session_type?: string;
}

interface CalendarViewProps {
  timeSlots: TimeSlot[];
  selectedDuration: 15 | 60 | 90;
  onSlotSelect: (startTime: Date) => void;
  selectedSlot?: Date;
}

export const CalendarView = ({ timeSlots, selectedDuration, onSlotSelect, selectedSlot }: CalendarViewProps) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [currentDay, setCurrentDay] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const isMobile = useIsMobile();
  
  // Determine session type based on duration
  const getSessionType = (duration: number): string => {
    if (duration === 15) return "15min";
    return "60min"; // Both 60 and 90 minute sessions use 60min slots
  };
  
  const sessionType = getSessionType(selectedDuration);
  
  // Fetch appointments to check for conflicts
  useEffect(() => {
    const fetchAppointments = async () => {
      console.log("Fetching appointments...");
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id, 
          time_slot_id, 
          session_type, 
          created_at,
          time_slots:time_slot_id (
            start_time,
            end_time
          )
        `)
        .eq("status", "confirmed");
      
      console.log("Appointments query result:", { data, error });
      
      if (data) {
        const formattedAppointments = data.map(apt => ({
          id: apt.id,
          time_slot_id: apt.time_slot_id,
          session_type: apt.session_type,
          created_at: apt.created_at,
          time_slot: apt.time_slots as { start_time: string; end_time: string }
        }));
        console.log("Formatted appointments:", formattedAppointments);
        setAppointments(formattedAppointments);
      }
    };
    
    fetchAppointments();
  }, []);
  
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: addDays(weekStart, 6)
  });

  // Generate all time slots for a specific day (available and booked)
  const getAllSlotsForDay = (day: Date): { time: Date; isAvailable: boolean; appointment?: Appointment }[] => {
    const allSlots: { time: Date; isAvailable: boolean; appointment?: Appointment }[] = [];
    
    // Filter time slots by session type
    const daySlots = timeSlots.filter(slot => {
      const slotStart = new Date(slot.start_time);
      const isCorrectSessionType = slot.session_type === sessionType;
      return isSameDay(slotStart, day) && slot.is_available && isCorrectSessionType;
    });

    daySlots.forEach(slot => {
      const rangeStart = new Date(slot.start_time);
      const rangeEnd = new Date(slot.end_time);
      
      // Generate all possible slots within this range
      let currentSlot = new Date(rangeStart);
      
      while (currentSlot.getTime() + selectedDuration * 60000 <= rangeEnd.getTime()) {
        const slotEnd = addMinutes(currentSlot, selectedDuration);
        
        // Only include slots during business hours
        if (currentSlot.getHours() >= 8 && slotEnd.getHours() <= 20) {
          const bookingInfo = isSlotBooked(currentSlot);
          allSlots.push({
            time: new Date(currentSlot),
            isAvailable: !bookingInfo.isBooked,
            appointment: bookingInfo.appointment
          });
        }
        
        // Move to next increment based on session duration
        const increment = selectedDuration >= 60 ? 30 : 15;
        currentSlot = addMinutes(currentSlot, increment);
      }
    });

    return allSlots.sort((a, b) => a.time.getTime() - b.time.getTime());
  };

  // Generate only available time slots for a specific day and duration
  const getAvailableSlotsForDay = (day: Date): Date[] => {
    return getAllSlotsForDay(day)
      .filter(slot => slot.isAvailable)
      .map(slot => slot.time);
  };

  // Find first available day for mobile initial state (excluding today)
  const findFirstAvailableDay = (): Date => {
    const tomorrow = addDays(new Date(), 1); // Start from tomorrow
    for (let i = 0; i < 30; i++) { // Check next 30 days
      const checkDay = addDays(tomorrow, i);
      const slots = getAvailableSlotsForDay(checkDay);
      if (slots.length > 0) {
        return checkDay;
      }
    }
    return tomorrow; // Fallback to tomorrow if no slots found
  };

  // Set initial day to first available day on mobile
  useEffect(() => {
    if (isMobile && timeSlots.length > 0) {
      const firstAvailable = findFirstAvailableDay();
      setCurrentDay(firstAvailable);
    }
  }, [timeSlots, isMobile]);

  const isSlotSelected = (slotTime: Date): boolean => {
    if (!selectedSlot) return false;
    return slotTime.getTime() === selectedSlot.getTime();
  };

  const isSlotBooked = (slotTime: Date): { isBooked: boolean; appointment?: Appointment } => {
    const slotEnd = addMinutes(slotTime, selectedDuration);
    
    console.log(`Checking if slot ${format(slotTime, 'yyyy-MM-dd HH:mm')} is booked. Total appointments: ${appointments.length}`);
    
    for (const appointment of appointments) {
      if (!appointment.time_slot) {
        console.log(`Appointment ${appointment.id} has no time_slot`);
        continue;
      }
      
      const appointmentStart = new Date(appointment.time_slot.start_time);
      const appointmentEnd = new Date(appointment.time_slot.end_time);
      
      console.log(`Appointment ${appointment.id}: ${format(appointmentStart, 'yyyy-MM-dd HH:mm')} - ${format(appointmentEnd, 'yyyy-MM-dd HH:mm')}`);
      
      // Check if the slot overlaps with this appointment
      const hasOverlap = (
        (slotTime >= appointmentStart && slotTime < appointmentEnd) ||
        (slotEnd > appointmentStart && slotEnd <= appointmentEnd) ||
        (slotTime <= appointmentStart && slotEnd >= appointmentEnd)
      );
      
      if (hasOverlap) {
        console.log(`Slot ${format(slotTime, 'yyyy-MM-dd HH:mm')} overlaps with appointment ${appointment.id}`);
        return { isBooked: true, appointment };
      }
    }
    
    return { isBooked: false };
  };

  const formatTimeSlot = (time: Date): string => {
    return format(time, "HH:mm");
  };

  const goToPreviousWeek = () => {
    setCurrentWeek(addDays(currentWeek, -7));
  };

  const goToNextWeek = () => {
    setCurrentWeek(addDays(currentWeek, 7));
  };

  const goToPreviousDay = () => {
    // Find previous day with available slots (excluding today)
    let prevDay = addDays(currentDay, -1);
    const tomorrow = addDays(new Date(), 1); // Don't go before tomorrow
    for (let i = 0; i < 30; i++) {
      const checkDay = addDays(prevDay, -i);
      if (checkDay < tomorrow) continue; // Skip today and earlier dates
      const slots = getAvailableSlotsForDay(checkDay);
      if (slots.length > 0) {
        setCurrentDay(checkDay);
        return;
      }
    }
  };

  const goToNextDay = () => {
    // Find next day with available slots
    let nextDay = addDays(currentDay, 1);
    for (let i = 0; i < 30; i++) {
      const checkDay = addDays(nextDay, i);
      const slots = getAvailableSlotsForDay(checkDay);
      if (slots.length > 0) {
        setCurrentDay(checkDay);
        return;
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          {isMobile ? (
            <div className="flex items-center justify-center w-full gap-2">
              <Button variant="outline" size="sm" onClick={goToPreviousDay}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-40 text-center font-medium">
                {format(currentDay, "dd MMM yyyy")}
              </span>
              <Button variant="outline" size="sm" onClick={goToNextDay}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-48 text-center font-medium">
                {format(weekStart, "d MMM")} - {format(addDays(weekStart, 6), "d MMM yyyy")}
              </span>
              <Button variant="outline" size="sm" onClick={goToNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Сесія триватиме {selectedDuration} хвилин • Тип: {sessionType === "15min" ? "15-хвилинні" : "60/90-хвилинні"} • Часовий пояс: {timezone}
        </p>
      </CardHeader>

      <CardContent>
        {isMobile ? (
          <div className="w-full max-w-sm mx-auto">
            {(() => {
              const allSlots = getAllSlotsForDay(currentDay);
              const isToday = isSameDay(currentDay, new Date());
              const isPastOrToday = currentDay <= startOfDay(new Date()); // Block today and past dates
              
              return (
                <div className="space-y-4">
                  <div className="text-center py-4 border-b">
                    <div className="text-sm text-muted-foreground">
                      {format(currentDay, "EEEE")}
                    </div>
                    <div className={`text-2xl font-bold ${isToday ? 'text-primary' : ''}`}>
                      {format(currentDay, "d")}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(currentDay, "MMMM yyyy")}
                    </div>
                  </div>
                  
                  <ScrollArea className="h-80">
                     <div className="space-y-2 px-2">
                       {isPastOrToday ? (
                         <div className="text-center py-8">
                           <p className="text-muted-foreground">
                             {isToday ? "Бронювання на сьогодні недоступне" : "Минулі дні"}
                           </p>
                         </div>
                      ) : allSlots.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">Немає слотів на цей день</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {allSlots.map((slot, index) => (
                            <Button
                              key={index}
                              variant={
                                !slot.isAvailable 
                                  ? "secondary" 
                                  : isSlotSelected(slot.time) 
                                    ? "default" 
                                    : "outline"
                              }
                              size="sm"
                              className={`text-sm min-h-[44px] touch-manipulation ${
                                !slot.isAvailable 
                                  ? "opacity-50 cursor-not-allowed" 
                                  : ""
                              }`}
                              onClick={() => slot.isAvailable && onSlotSelect(slot.time)}
                              disabled={!slot.isAvailable}
                              title={slot.appointment ? `Заброньовано: ${slot.appointment.session_type}` : undefined}
                            >
                              {formatTimeSlot(slot.time)}
                              {!slot.isAvailable && (
                                <span className="block text-xs text-muted-foreground mt-1">
                                  Заброньовано
                                </span>
                              )}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-4">
             {weekDays.map(day => {
               const allSlots = getAllSlotsForDay(day);
               const isToday = isSameDay(day, new Date());
               const isPastOrToday = day <= startOfDay(new Date()); // Block today and past dates
               
               return (
                <div key={day.toISOString()} className="space-y-3">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">
                      {format(day, "EEE")}
                    </div>
                    <div className={`text-lg font-medium ${isToday ? 'text-primary' : ''}`}>
                      {format(day, "d")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(day, "MMM")}
                    </div>
                  </div>
                  
                  <ScrollArea className="h-80">
                     <div className="space-y-2 pr-2">
                       {isPastOrToday ? (
                         <div className="text-xs text-muted-foreground text-center py-4">
                           {isToday ? "Недоступно" : "Минулі дні"}
                         </div>
                      ) : allSlots.length === 0 ? (
                        <div className="text-xs text-muted-foreground text-center py-4">
                          Немає слотів
                        </div>
                      ) : (
                        allSlots.map((slot, index) => (
                          <Button
                            key={index}
                            variant={
                              !slot.isAvailable 
                                ? "secondary" 
                                : isSlotSelected(slot.time) 
                                  ? "default" 
                                  : "outline"
                            }
                            size="sm"
                            className={`w-full text-xs ${
                              !slot.isAvailable 
                                ? "opacity-50 cursor-not-allowed" 
                                : ""
                            }`}
                            onClick={() => slot.isAvailable && onSlotSelect(slot.time)}
                            disabled={!slot.isAvailable}
                            title={slot.appointment ? `Заброньовано: ${slot.appointment.session_type}` : undefined}
                          >
                            <div className="flex flex-col items-center">
                              {formatTimeSlot(slot.time)}
                              {!slot.isAvailable && (
                                <span className="text-xs opacity-70 mt-0.5">
                                  Зайнято
                                </span>
                              )}
                            </div>
                          </Button>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};