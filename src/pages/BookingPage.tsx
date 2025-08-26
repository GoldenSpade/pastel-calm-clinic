import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, User, Instagram, Phone, ArrowLeft, CheckCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { format, addMinutes } from "date-fns";
import { CalendarView } from "@/components/CalendarView";

interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  is_available: boolean;
  session_type?: string;
}

type SessionType = 15 | 60 | 90;

const BookingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<SessionType>(60);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [currentStep, setCurrentStep] = useState<"duration" | "time" | "details" | "confirmation">("duration");
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    phone: "",
    notes: ""
  });
  const [loading, setLoading] = useState(false);

  // Check if coming from "Запис на знайомство" button
  useEffect(() => {
    const bookingType = searchParams.get('type');
    if (bookingType === 'consultation') {
      setSelectedDuration(15);
      setCurrentStep("time");
    }
  }, [searchParams]);

  useEffect(() => {
    if (currentStep === "time") {
      fetchAvailableSlots();
    }
  }, [currentStep, selectedDuration]);

  const getSessionType = (duration: number): string => {
    if (duration === 15) return "15min";
    return "60min"; // Both 60 and 90 minute sessions use 60min slots
  };

  const fetchAvailableSlots = async () => {
    const sessionType = getSessionType(selectedDuration);
    console.log("Fetching slots for session type:", sessionType);
    
    const { data, error } = await supabase
      .from("time_slots")
      .select("*")
      .eq("is_available", true)
      .eq("session_type", sessionType)
      .gte("start_time", new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()) // Tomorrow onwards only
      .order("start_time");

    if (error) {
      console.error("Error fetching slots:", error);
      toast({
        variant: "destructive",
        title: "Помилка",
        description: "Не вдалося завантажити доступні слоти"
      });
    } else {
      console.log("Fetched booking slots:", data);
      setTimeSlots(data || []);
    }
  };

  const handleDurationSelect = (duration: SessionType) => {
    setSelectedDuration(duration);
    setSelectedSlot(null);
    setCurrentStep("time");
  };

  const handleSlotSelect = (slotTime: Date) => {
    setSelectedSlot(slotTime);
    setCurrentStep("details");
  };

  const handleBooking = async () => {
    if (!selectedSlot) return;
    if (!formData.name || (!formData.contact && !formData.phone)) {
      toast({
        variant: "destructive",
        title: "Помилка",
        description: "Будь ласка, заповніть всі обов'язкові поля"
      });
      return;
    }

    setLoading(true);
    
    try {
      const slotEnd = addMinutes(selectedSlot, selectedDuration);

      // Find the time slot range that contains our selected time
      const containingSlot = timeSlots.find(slot => {
        const rangeStart = new Date(slot.start_time);
        const rangeEnd = new Date(slot.end_time);
        return selectedSlot >= rangeStart && slotEnd <= rangeEnd;
      });

      if (!containingSlot) {
        throw new Error("Selected time slot is no longer available");
      }

      // Create appointment
      const { error: appointmentError } = await supabase
        .from("appointments")
        .insert({
          time_slot_id: containingSlot.id,
          client_name: formData.name,
          client_email: formData.contact || null,
          client_phone: formData.phone || null,
          session_type: selectedDuration === 15 ? "consultation_15" : 
                       selectedDuration === 60 ? "session_60" : "session_90",
          notes: formData.notes || null
        });

      if (appointmentError) throw appointmentError;

      // Don't mark the entire slot as unavailable - let the calendar logic handle conflicts
      // The CalendarView already filters out conflicting appointments when generating available slots

      // Send Telegram notification
      try {
        await supabase.functions.invoke('send-telegram-notification', {
          body: {
            clientName: formData.name,
            clientEmail: formData.contact || null,
            clientPhone: formData.phone || null,
            sessionType: getDurationLabel(selectedDuration),
            startTime: selectedSlot.toISOString(),
            endTime: slotEnd.toISOString(),
            notes: formData.notes || null
          }
        });
        console.log('Telegram notification sent');
      } catch (telegramError) {
        console.error('Failed to send Telegram notification:', telegramError);
        // Don't fail the booking if Telegram notification fails
      }

      setCurrentStep("confirmation");
      
      // Refresh available slots
      fetchAvailableSlots();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Помилка",
        description: error.message || "Не вдалося забронювати слот"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetBooking = () => {
    setCurrentStep("duration");
    setSelectedSlot(null);
    setFormData({ name: "", contact: "", phone: "", notes: "" });
  };

  const getDurationLabel = (duration: SessionType) => {
    const labels = {
      15: "Безкоштовна консультація",
      60: "Стандартна сесія",
      90: "Розширена сесія"
    };
    return labels[duration];
  };

  const getDurationDescription = (duration: SessionType) => {
    const descriptions = {
      15: "Короткий вступ та обговорення вашої ситуації",
      60: "Повноцінна терапевтична сесія з глибоким аналізом", 
      90: "Розширена сесія для складних випадків"
    };
    return descriptions[duration];
  };

  if (currentStep === "confirmation") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-foreground mb-2">Успішно заброньовано!</h1>
              <p className="text-muted-foreground">Ваша консультація успішно заброньована</p>
            </div>

            <Card className="text-left">
              <CardHeader>
                <CardTitle>Деталі бронювання</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Тип сесії</Label>
                  <p className="font-medium">{getDurationLabel(selectedDuration)} ({selectedDuration} хв)</p>
                </div>
                
                <div>
                  <Label className="text-muted-foreground">Дата та час</Label>
                  <p className="font-medium">
                    {selectedSlot && format(selectedSlot, "dd MMMM yyyy 'о' HH:mm")} - 
                    {selectedSlot && format(addMinutes(selectedSlot, selectedDuration), "HH:mm")}
                    <span className="text-sm text-muted-foreground ml-2">
                      ({Intl.DateTimeFormat().resolvedOptions().timeZone})
                    </span>
                  </p>
                </div>

                <div>
                  <Label className="text-muted-foreground">Додати до Google Calendar</Label>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      if (selectedSlot) {
                        const startTime = selectedSlot.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                        const endTime = addMinutes(selectedSlot, selectedDuration).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                        const title = encodeURIComponent(`${getDurationLabel(selectedDuration)} - Психологічна консультація`);
                        const details = encodeURIComponent(`Сесія з ${formData.name}\nТип: ${getDurationLabel(selectedDuration)}\nТривалість: ${selectedDuration} хвилин${formData.notes ? `\nПримітки: ${formData.notes}` : ''}`);
                        
                        const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${details}`;
                        window.open(googleUrl, '_blank');
                      }
                    }}
                    className="w-full mt-2"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Додати до календаря
                  </Button>
                </div>

                <div>
                  <Label className="text-muted-foreground">Контактна особа</Label>
                  <p className="font-medium">{formData.name}</p>
                  {formData.contact && <p className="text-sm text-muted-foreground">{formData.contact}</p>}
                  {formData.phone && <p className="text-sm text-muted-foreground">{formData.phone}</p>}
                </div>

                {formData.notes && (
                  <div>
                    <Label className="text-muted-foreground">Додаткові пояснення</Label>
                    <p className="text-sm">{formData.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-4 mt-8 justify-center">
              <Button variant="outline" onClick={() => navigate("/")}>
                На головну
              </Button>
              <Button onClick={resetBooking}>
                Забронювати ще одну сесію
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => {
              const bookingType = searchParams.get('type');
              if (currentStep === "duration") {
                navigate("/");
              } else if (currentStep === "time") {
                // If came from consultation button, go back to homepage
                if (bookingType === 'consultation') {
                  navigate("/");
                } else {
                  setCurrentStep("duration");
                }
              } else if (currentStep === "details") {
                setCurrentStep("time");
              }
            }}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span className={currentStep === "duration" ? "text-primary font-medium" : ""}>
              1. Тривалість
            </span>
            <span>→</span>
            <span className={currentStep === "time" ? "text-primary font-medium" : ""}>
              2. Час
            </span>
            <span>→</span>
            <span className={currentStep === "details" ? "text-primary font-medium" : ""}>
              3. Дані
            </span>
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {currentStep === "duration" && "Оберіть тривалість сесії"}
            {currentStep === "time" && "Оберіть зручний час"}
            {currentStep === "details" && "Контактні дані"}
          </h1>
        </div>

        {currentStep === "duration" && (
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              {([15, 60, 90] as SessionType[]).map((duration) => (
                <Card 
                  key={duration} 
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/50 flex flex-col h-full"
                  onClick={() => handleDurationSelect(duration)}
                >
                  <CardHeader className="flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      <CardTitle>{duration} хвилин</CardTitle>
                    </div>
                    <div className="min-h-[3.5rem] flex items-start">
                      <p className="text-lg font-semibold text-primary">
                        {getDurationLabel(duration)}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-grow">
                    <div className="text-muted-foreground flex-grow mb-4 min-h-[3rem] flex items-start">
                      <p>
                        {getDurationDescription(duration)}
                      </p>
                    </div>
                    <Button className="w-full mt-auto" variant="outline">
                      Обрати
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {currentStep === "time" && (
          <div className="max-w-6xl mx-auto">
            <CalendarView
              timeSlots={timeSlots}
              selectedDuration={selectedDuration}
              onSlotSelect={handleSlotSelect}
              selectedSlot={selectedSlot}
            />
          </div>
        )}

        {currentStep === "details" && selectedSlot && (
          <div className="max-w-2xl mx-auto">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Підтвердження часу</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-primary/10 p-4 rounded-lg">
                  <p className="font-medium">{getDurationLabel(selectedDuration)} ({selectedDuration} хв)</p>
                  <p className="text-muted-foreground">
                    {format(selectedSlot, "dd MMMM yyyy 'о' HH:mm")} - 
                    {format(addMinutes(selectedSlot, selectedDuration), "HH:mm")}
                    <span className="text-sm ml-2">
                      ({Intl.DateTimeFormat().resolvedOptions().timeZone})
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Контактні дані
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Ім'я та прізвище *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Введіть ваше ім'я"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact">Instagram/Telegram</Label>
                    <div className="relative">
                      <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="contact"
                        value={formData.contact}
                        onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                        placeholder="@username або @nickname"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Телефон</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+380..."
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Додаткові пояснення (необов'язково)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Розкажіть коротко про вашу ситуацію..."
                    rows={3}
                  />
                </div>

                <p className="text-sm text-muted-foreground">
                  * Вкажіть принаймні Instagram/Telegram або телефон для зв'язку
                </p>

                <Button 
                  onClick={handleBooking} 
                  disabled={loading || !formData.name || (!formData.contact && !formData.phone)}
                  className="w-full"
                  size="lg"
                >
                  {loading ? "Бронювання..." : "Забронювати"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;