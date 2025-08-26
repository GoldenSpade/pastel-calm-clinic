import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Calendar, Clock, Trash2, Users, ArrowLeft, RotateCcw, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { TimeSlotCalendar } from "@/components/TimeSlotCalendar";
import { AdminAuth } from "@/components/AdminAuth";
import { TelegramTest } from "@/components/TelegramTest";
import { AvailabilityChat } from "@/components/AvailabilityChat";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  is_available: boolean;
  session_type?: string;
}

interface Appointment {
  id: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  session_type: string;
  notes?: string;
  status: string;
  time_slot: any; // Will be parsed from JSON
}

const AdminPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    fetchTimeSlots();
    fetchAppointments();
  }, []);

  const fetchTimeSlots = async () => {
    const { data, error } = await supabase
      .rpc("get_admin_time_slots");

    if (error) {
      toast({
        variant: "destructive",
        title: "Помилка",
        description: "Не вдалося завантажити слоти"
      });
    } else {
      setTimeSlots(data || []);
    }
  };

  const fetchAppointments = async () => {
    const { data, error } = await supabase
      .rpc("get_admin_appointments");

    if (error) {
      toast({
        variant: "destructive",
        title: "Помилка", 
        description: "Не вдалося завантажити записи"
      });
    } else {
      // Parse the JSON time_slot data
      const parsedAppointments = (data || []).map(appointment => ({
        ...appointment,
        time_slot: typeof appointment.time_slot === 'string' 
          ? JSON.parse(appointment.time_slot) 
          : appointment.time_slot
      }));
      setAppointments(parsedAppointments);
    }
  };

  const createAvailabilitySlots = async (timeRanges: Array<{day: Date; startTime: Date; endTime: Date}>, sessionType: string) => {
    setLoading(true);

    // First, delete any overlapping slots
    await deleteOverlappingSlots(timeRanges, sessionType);

    const slots = timeRanges.map(range => {
      const duration = Math.round((range.endTime.getTime() - range.startTime.getTime()) / (1000 * 60));
      
      // Ensure duration is at least 15 minutes and max 480 minutes
      if (duration < 15) {
        console.warn("Duration too short:", duration, "minutes");
        return null;
      }
      
      if (duration > 480) {
        console.warn("Duration too long:", duration, "minutes, max is 480");
        return null;
      }
      
      return {
        start_time: range.startTime.toISOString(),
        end_time: range.endTime.toISOString(),
        duration_minutes: duration,
        session_type: sessionType
      };
    }).filter(slot => slot !== null);

    if (slots.length === 0) {
      toast({
        variant: "destructive",
        title: "Помилка",
        description: "Всі слоти некоректні (мінімум 15 хвилин, максимум 8 годин)"
      });
      setLoading(false);
      return;
    }

    console.log("Creating slots:", slots);

    const { error } = await supabase
      .from("time_slots")
      .insert(slots);

    if (error) {
      console.error("Supabase error:", error);
      toast({
        variant: "destructive",
        title: "Помилка",
        description: `Не вдалося створити слоти: ${error.message}`
      });
      } else {
        toast({
          title: "Успіх",
          description: `Створено ${slots.length} слот(ів)`
        });
        fetchTimeSlots();
      }
    
    setLoading(false);
  };

  const deleteOverlappingSlots = async (newTimeRanges: Array<{day: Date; startTime: Date; endTime: Date}>, sessionType: string) => {
    // For each new time range, delete existing slots that overlap
    for (const range of newTimeRanges) {
      const startDate = range.startTime.toISOString();
      const endDate = range.endTime.toISOString();
      
      console.log(`Deleting overlapping slots between ${startDate} and ${endDate} for session type ${sessionType}`);
      
      // Delete slots that overlap with the new range and match session type
      // A slot overlaps if: (existing_start < new_end) AND (existing_end > new_start)
      const { error } = await supabase
        .from("time_slots")
        .delete()
        .lt("start_time", endDate)     // existing start < new end
        .gt("end_time", startDate)     // existing end > new start
        .eq("session_type", sessionType);
        
      if (error) {
        console.error("Error deleting overlapping slots:", error);
      }
    }
  };

  const handleSlotDelete = async (slotId: string) => {
    const { error } = await supabase
      .from("time_slots")
      .delete()
      .eq("id", slotId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Помилка",
        description: "Не вдалося видалити слот"
      });
    } else {
      toast({
        title: "Успіх",
        description: "Слот видалено"
      });
      fetchTimeSlots();
      fetchAppointments();
    }
  };

  const handleSlotUpdate = async (originalSlotIds: string[], newSlot: {day: Date; startTime: Date; endTime: Date}) => {
    setLoading(true);

    try {
      // First delete original slots
      for (const slotId of originalSlotIds) {
        await supabase
          .from("time_slots")
          .delete()
          .eq("id", slotId);
      }

      // Delete any overlapping slots with the new slot
      const startDate = newSlot.startTime.toISOString();
      const endDate = newSlot.endTime.toISOString();
      
      await supabase
        .from("time_slots")
        .delete()
        .lt("start_time", endDate)
        .gt("end_time", startDate);

      // Create new slot
      const duration = Math.round((newSlot.endTime.getTime() - newSlot.startTime.getTime()) / (1000 * 60));
      
      const { error } = await supabase
        .from("time_slots")
        .insert({
          start_time: newSlot.startTime.toISOString(),
          end_time: newSlot.endTime.toISOString(),
          duration_minutes: duration,
          session_type: "60min" // Default to 60min when updating slots
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Успіх", 
        description: "Слот оновлено"
      });
      
      fetchTimeSlots();
      fetchAppointments();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Помилка",
        description: `Не вдалося оновити слот: ${error.message}`
      });
    }

    setLoading(false);
  };

  const deleteTimeSlot = async (id: string) => {
    const { error } = await supabase
      .from("time_slots")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Помилка",
        description: "Не вдалося видалити слот"
      });
    } else {
      toast({
        title: "Успіх",
        description: "Слот видалено"
      });
      fetchTimeSlots();
      fetchAppointments();
    }
  };

  const deleteAppointment = async (id: string) => {
    console.log("🔥 Attempting to delete appointment with id:", id);
    
    try {
      const { data, error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", id)
        .select();

      console.log("🔥 Delete result:", { data, error, id });

      if (error) {
        console.error("🔥 Delete error:", error);
        toast({
          variant: "destructive",
          title: "Помилка",
          description: `Не вдалося видалити запис: ${error.message}`
        });
      } else {
        console.log("🔥 Delete successful, deleted rows:", data?.length || 0);
        if (data && data.length > 0) {
          toast({
            title: "Успіх",
            description: "Запис видалено"
          });
          fetchAppointments();
          fetchTimeSlots();
        } else {
          console.log("🔥 No rows deleted - appointment may not exist");
          toast({
            variant: "destructive",
            title: "Попередження",
            description: "Запис не знайдено або вже видалено"
          });
        }
      }
    } catch (err) {
      console.error("🔥 Exception during delete:", err);
      toast({
        variant: "destructive",
        title: "Помилка",
        description: "Виникла помилка при видаленні"
      });
    }
  };


  const resetAppointments = async () => {
    setLoading(true);
    
    try {
      console.log("Starting to delete all appointments...");
      
      const { error } = await supabase
        .from("appointments")
        .delete()
        .not('id', 'is', null); // Delete all records (id is never null)
      
      if (error) {
        throw error;
      }

      console.log("All appointments deleted successfully");

      toast({
        title: "Успіх",
        description: "Всі записи очищено"
      });
      
      fetchAppointments();
      fetchTimeSlots(); // Refresh to show updated availability
    } catch (error: any) {
      console.error("Error clearing appointments:", error);
      toast({
        variant: "destructive",
        title: "Помилка",
        description: `Не вдалося очистити записи: ${error.message}`
      });
    }
    
    setLoading(false);
  };

  const resetTimeSlots = async () => {
    setLoading(true);
    
    try {
      console.log("Starting to delete all time slots...");
      
      const { error } = await supabase
        .from("time_slots")
        .delete()
        .not('id', 'is', null); // Delete all records (id is never null)
      
      if (error) {
        throw error;
      }

      console.log("All time slots deleted successfully");

      toast({
        title: "Успіх",
        description: "Всі слоти очищено"
      });
      
      fetchTimeSlots();
    } catch (error: any) {
      console.error("Error clearing time slots:", error);
      toast({
        variant: "destructive",
        title: "Помилка",
        description: `Не вдалося очистити слоти: ${error.message}`
      });
    }
    
    setLoading(false);
  };

  const sessionTypeLabels = {
    consultation_15: "Консультація 15 хв",
    session_60: "Сесія 60 хв",
    session_90: "Сесія 90 хв"
  };

  return (
    <AdminAuth>
      {({ handleLogout }) => (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate("/")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Назад
                </Button>
                
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Налаштування Telegram"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="end">
                      <TelegramTest />
                    </PopoverContent>
                  </Popover>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleLogout}
                  >
                    Вийти
                  </Button>
                </div>
              </div>
              
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Управління доступністю</h1>
                <p className="text-muted-foreground">Налаштуйте ваші доступні години. Клієнти зможуть бронювати слоти в цих діапазонах.</p>
              </div>
            </div>

            <AvailabilityChat onSlotsCreate={createAvailabilitySlots} />

        <TimeSlotCalendar
          onSlotsCreate={createAvailabilitySlots}
          onSlotDelete={handleSlotDelete}
          onSlotUpdate={handleSlotUpdate}
          existingSlots={timeSlots}
          appointments={appointments}
        />

        <div className="grid lg:grid-cols-2 gap-8 mt-8">
          {/* Availability Ranges - Split by session type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Діапазони доступності
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={loading}
                      className="h-8 w-8 p-0 hover:bg-destructive/10"
                      title="Очистити всі діапазони"
                    >
                      <RotateCcw className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Очистити діапазони
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Це видалить ВСІ діапазони доступності. 
                        Дану дію неможливо скасувати. Ви впевнені?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Скасувати</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={resetTimeSlots}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Так, очистити діапазони
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {timeSlots.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Немає налаштованих слотів</p>
              ) : (
                <div className="space-y-6">
                  {/* 15-minute sessions section */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-4 h-4 bg-emerald-400 rounded-sm"></div>
                      <h3 className="font-medium">15-хвилинні сесії (Ознайомчі)</h3>
                      <span className="text-xs text-muted-foreground">
                        ({timeSlots.filter(slot => slot.session_type === "15min").length})
                      </span>
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {timeSlots
                        .filter(slot => slot.session_type === "15min")
                        .map((slot) => (
                          <div key={slot.id} className="flex justify-between items-center p-2 bg-emerald-50 border border-emerald-200 rounded">
                            <div className="text-sm">
                              <div className="font-medium">
                                {formatInTimeZone(new Date(slot.start_time), timezone, "EEE, d MMM")}
                              </div>
                              <div className="text-muted-foreground text-xs">
                                {formatInTimeZone(new Date(slot.start_time), timezone, "HH:mm")} - 
                                {formatInTimeZone(new Date(slot.end_time), timezone, "HH:mm")} 
                                ({slot.duration_minutes} хв)
                              </div>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteTimeSlot(slot.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))
                      }
                      {timeSlots.filter(slot => slot.session_type === "15min").length === 0 && (
                        <p className="text-muted-foreground text-sm">Немає 15-хвилинних слотів</p>
                      )}
                    </div>
                  </div>

                  {/* 60/90-minute sessions section */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-4 h-4 bg-blue-400 rounded-sm"></div>
                      <h3 className="font-medium">60/90-хвилинні сесії (Основні)</h3>
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {timeSlots
                        .filter(slot => slot.session_type === "60min" || !slot.session_type)
                        .map((slot) => (
                          <div key={slot.id} className="flex justify-between items-center p-2 bg-blue-50 border border-blue-200 rounded">
                            <div className="text-sm">
                              <div className="font-medium">
                                {formatInTimeZone(new Date(slot.start_time), timezone, "EEE, d MMM")}
                              </div>
                              <div className="text-muted-foreground text-xs">
                                {formatInTimeZone(new Date(slot.start_time), timezone, "HH:mm")} - 
                                {formatInTimeZone(new Date(slot.end_time), timezone, "HH:mm")} 
                                ({slot.duration_minutes} хв)
                              </div>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteTimeSlot(slot.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))
                      }
                      {timeSlots.filter(slot => slot.session_type === "60min" || !slot.session_type).length === 0 && (
                        <p className="text-muted-foreground text-sm">Немає 60/90-хвилинних слотів</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Заброньовані сесії
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={loading}
                      className="h-8 w-8 p-0 hover:bg-destructive/10"
                      title="Очистити всі записи"
                    >
                      <RotateCcw className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Очистити записи
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Це видалить ВСІ заброньовані сесії. 
                        Дану дію неможливо скасувати. Ви впевнені?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Скасувати</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={resetAppointments}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Так, очистити записи
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Немає бронювань</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{appointment.client_name}</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                {sessionTypeLabels[appointment.session_type as keyof typeof sessionTypeLabels]}
                              </span>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteAppointment(appointment.id)}
                                title="Видалити запис"
                                className="h-6 w-6 p-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            📅 {formatInTimeZone(parseISO(appointment.time_slot.start_time), timezone, "dd.MM.yyyy HH:mm")}
                          </p>
                          {appointment.client_email && (
                            <p className="text-sm text-muted-foreground">✉️ {appointment.client_email}</p>
                          )}
                          {appointment.client_phone && (
                            <p className="text-sm text-muted-foreground">📞 {appointment.client_phone}</p>
                          )}
                          {appointment.notes && (
                            <p className="text-sm text-muted-foreground mt-1">💬 {appointment.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
          </div>
        </div>
      )}
    </AdminAuth>
  );
};

export default AdminPage;