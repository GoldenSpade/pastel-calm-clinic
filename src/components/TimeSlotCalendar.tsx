import { useState, useCallback, useRef } from "react";
import { format, addDays, startOfWeek, eachDayOfInterval, isSameMinute } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Clock, Edit, Trash2 } from "lucide-react";

interface TimeRange {
  day: Date;
  startTime: Date;
  endTime: Date;
}

interface TimeSlotCalendarProps {
  onSlotsCreate: (slots: TimeRange[], sessionType: string) => void;
  onSlotDelete: (slotId: string) => void;
  onSlotUpdate: (originalSlots: string[], newSlot: TimeRange) => void;
  existingSlots: Array<{ start_time: string; end_time: string; id: string; session_type?: string }>;
  appointments?: Array<{ 
    time_slot: { start_time: string; end_time: string }; 
    session_type: string;
  }>;
}

interface MergedSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  day: Date;
  duration: number;
  sessionType: string;
  originalSlots: Array<{ start_time: string; end_time: string; id: string; session_type?: string }>;
}

export const TimeSlotCalendar = ({ onSlotsCreate, onSlotDelete, onSlotUpdate, existingSlots, appointments = [] }: TimeSlotCalendarProps) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedRanges, setSelectedRanges] = useState<TimeRange[]>([]);
  const [slotDuration, setSlotDuration] = useState<"15" | "30" | "60">("60");
  const [sessionType, setSessionType] = useState<"15min" | "60min">("60min");
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ day: Date; hour: number; minute: number } | null>(null);
  const [currentSelection, setCurrentSelection] = useState<TimeRange | null>(null);
  const [editingSlot, setEditingSlot] = useState<MergedSlot | null>(null);
  const [editDuration, setEditDuration] = useState<number>(60);
  
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: addDays(weekStart, 6)
  });

  // Generate time slots based on selected duration
  const generateTimeSlots = () => {
    const slots = [];
    const intervalMinutes = parseInt(slotDuration);
    
    for (let hour = 8; hour <= 20; hour++) {
      if (intervalMinutes === 60) {
        if (hour < 20) {
          slots.push({ hour, minute: 0, displayTime: `${hour}:00` });
        }
      } else if (intervalMinutes === 30) {
        if (hour < 20 || (hour === 20 && 0 === 0)) {
          slots.push({ hour, minute: 0, displayTime: `${hour}:00` });
        }
        if (hour < 19 || (hour === 19 && 30 < 60)) {
          slots.push({ hour, minute: 30, displayTime: `${hour}:30` });
        }
      } else { // 15 minutes
        for (let minute = 0; minute < 60; minute += 15) {
          if (hour === 20 && minute > 0) break;
          slots.push({ hour, minute, displayTime: `${hour}:${minute.toString().padStart(2, '0')}` });
        }
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const createTimeSlot = (day: Date, hour: number, minute: number = 0) => {
    const time = new Date(day);
    time.setHours(hour, minute, 0, 0);
    return time;
  };

  // Show all existing slots but group them properly by session type
  const getMergedSlots = useCallback(() => {
    const mergedSlots: MergedSlot[] = [];
    
    weekDays.forEach(day => {
      const daySlots = existingSlots
        .filter(slot => {
          const slotDate = new Date(slot.start_time);
          const matchesDay = format(day, "yyyy-MM-dd") === format(slotDate, "yyyy-MM-dd");
          return matchesDay; // Show all slots regardless of session type
        })
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

      let currentGroup: Array<{ start_time: string; end_time: string; id: string; session_type?: string }> = [];
      
      daySlots.forEach(slot => {
        if (currentGroup.length === 0) {
          currentGroup = [slot];
        } else {
          const lastSlot = currentGroup[currentGroup.length - 1];
          const lastEnd = new Date(lastSlot.end_time);
          const currentStart = new Date(slot.start_time);
          
          // Only merge slots of the same session type that are adjacent
          const isSameSessionType = lastSlot.session_type === slot.session_type;
          const isAdjacent = Math.abs(lastEnd.getTime() - currentStart.getTime()) <= 60000;
          
          if (isSameSessionType && isAdjacent) {
            currentGroup.push(slot);
          } else {
            // Create merged slot from current group
            if (currentGroup.length > 0) {
              const firstSlot = currentGroup[0];
              const lastSlot = currentGroup[currentGroup.length - 1];
              const startTime = new Date(firstSlot.start_time);
              const endTime = new Date(lastSlot.end_time);
              
              mergedSlots.push({
                id: currentGroup.map(s => s.id).join('-'),
                startTime,
                endTime,
                day,
                duration: (endTime.getTime() - startTime.getTime()) / (1000 * 60),
                sessionType: firstSlot.session_type || '60min',
                originalSlots: [...currentGroup]
              });
            }
            currentGroup = [slot];
          }
        }
      });
      
      // Don't forget the last group
      if (currentGroup.length > 0) {
        const firstSlot = currentGroup[0];
        const lastSlot = currentGroup[currentGroup.length - 1];
        const startTime = new Date(firstSlot.start_time);
        const endTime = new Date(lastSlot.end_time);
        
        mergedSlots.push({
          id: currentGroup.map(s => s.id).join('-'),
          startTime,
          endTime,
          day,
          duration: (endTime.getTime() - startTime.getTime()) / (1000 * 60),
          sessionType: firstSlot.session_type || '60min',
          originalSlots: [...currentGroup]
        });
      }
    });
    
    return mergedSlots;
  }, [existingSlots, weekDays]);

  const mergedSlots = getMergedSlots();

  const isSlotTaken = (day: Date, hour: number, minute: number = 0) => {
    const slotTime = createTimeSlot(day, hour, minute);
    const endTime = new Date(slotTime.getTime() + parseInt(slotDuration) * 60000);
    
    return existingSlots.some(slot => {
      const existingStart = new Date(slot.start_time);
      const existingEnd = new Date(slot.end_time);
      // Only check overlap regardless of session type for visual feedback
      return (slotTime < existingEnd && endTime > existingStart);
    });
  };

  const isSlotBooked = (day: Date, hour: number, minute: number = 0) => {
    const slotTime = createTimeSlot(day, hour, minute);
    
    return appointments.find(appointment => {
      const apptStart = new Date(appointment.time_slot.start_time);
      const apptEnd = new Date(appointment.time_slot.end_time);
      return slotTime >= apptStart && slotTime < apptEnd;
    });
  };

  const isSlotInCurrentSelection = (day: Date, hour: number, minute: number = 0) => {
    if (!currentSelection) return false;
    
    const slotTime = createTimeSlot(day, hour, minute);
    const sameDay = format(day, "yyyy-MM-dd") === format(currentSelection.day, "yyyy-MM-dd");
    
    return sameDay && slotTime >= currentSelection.startTime && slotTime < currentSelection.endTime;
  };

  const isSlotSelected = (day: Date, hour: number, minute: number = 0) => {
    const slotTime = createTimeSlot(day, hour, minute);
    return selectedRanges.some(range => {
      const sameDay = format(day, "yyyy-MM-dd") === format(range.day, "yyyy-MM-dd");
      return sameDay && slotTime >= range.startTime && slotTime < range.endTime;
    });
  };

  const isSlotInMergedSlot = (day: Date, hour: number, minute: number = 0) => {
    const slotTime = createTimeSlot(day, hour, minute);
    
    return mergedSlots.find(mergedSlot => {
      const sameDay = format(day, "yyyy-MM-dd") === format(mergedSlot.day, "yyyy-MM-dd");
      return sameDay && slotTime >= mergedSlot.startTime && slotTime < mergedSlot.endTime;
    });
  };

  const handleMouseDown = (day: Date, hour: number, minute: number = 0) => {
    if (isSlotTaken(day, hour, minute)) return;
    
    const slotTime = createTimeSlot(day, hour, minute);
    
    // Check if clicking on already selected slot to deselect
    const existingRangeIndex = selectedRanges.findIndex(range => {
      const sameDay = format(day, "yyyy-MM-dd") === format(range.day, "yyyy-MM-dd");
      return sameDay && slotTime >= range.startTime && slotTime < range.endTime;
    });
    
    if (existingRangeIndex !== -1) {
      setSelectedRanges(prev => prev.filter((_, i) => i !== existingRangeIndex));
      return;
    }
    
    // Start drag selection
    setIsSelecting(true);
    setSelectionStart({ day, hour, minute });
    
    const startTime = slotTime;
    const endTime = new Date(startTime.getTime() + parseInt(slotDuration) * 60000);
    
    setCurrentSelection({
      day,
      startTime,
      endTime
    });
  };

  const handleMouseEnter = (day: Date, hour: number, minute: number = 0) => {
    if (!isSelecting || !selectionStart) return;
    if (format(day, "yyyy-MM-dd") !== format(selectionStart.day, "yyyy-MM-dd")) return;
    
    const currentTime = createTimeSlot(day, hour, minute);
    const startTime = createTimeSlot(selectionStart.day, selectionStart.hour, selectionStart.minute);
    
    let actualStart = startTime;
    let actualEnd = new Date(currentTime.getTime() + parseInt(slotDuration) * 60000);
    
    if (currentTime < startTime) {
      actualStart = currentTime;
      actualEnd = new Date(startTime.getTime() + parseInt(slotDuration) * 60000);
    }
    
    setCurrentSelection({
      day: selectionStart.day,
      startTime: actualStart,
      endTime: actualEnd
    });
  };

  const handleMouseUp = () => {
    if (currentSelection && isSelecting) {
      setSelectedRanges(prev => [...prev, currentSelection]);
    }
    
    setIsSelecting(false);
    setSelectionStart(null);
    setCurrentSelection(null);
  };

  const handleEditSlot = (mergedSlot: MergedSlot) => {
    setEditingSlot(mergedSlot);
    setEditDuration(mergedSlot.duration);
  };

  const handleUpdateSlot = async () => {
    if (!editingSlot) return;
    
    const newEndTime = new Date(editingSlot.startTime.getTime() + editDuration * 60000);
    
    // Use the onSlotUpdate callback
    const originalSlotIds = editingSlot.originalSlots.map(slot => slot.id);
    const newSlot: TimeRange = {
      day: editingSlot.day,
      startTime: editingSlot.startTime,
      endTime: newEndTime
    };
    
    onSlotUpdate(originalSlotIds, newSlot);
    setEditingSlot(null);
  };

  const handleDeleteSlot = async (mergedSlot: MergedSlot) => {
    for (const slot of mergedSlot.originalSlots) {
      onSlotDelete(slot.id);
    }
    setEditingSlot(null);
  };

  const clearSelection = () => {
    setSelectedRanges([]);
  };

  const saveSlots = () => {
    if (selectedRanges.length === 0) return;
    
    // Merge adjacent selected ranges into consolidated slots
    const mergedRanges = mergeAdjacentRanges(selectedRanges);
    onSlotsCreate(mergedRanges, sessionType);
    setSelectedRanges([]);
  };

  // Function to merge adjacent time ranges into consolidated slots
  const mergeAdjacentRanges = (ranges: TimeRange[]): TimeRange[] => {
    if (ranges.length === 0) return [];
    
    // Group ranges by day first
    const rangesByDay: { [dayKey: string]: TimeRange[] } = {};
    
    ranges.forEach(range => {
      const dayKey = format(range.day, "yyyy-MM-dd");
      if (!rangesByDay[dayKey]) {
        rangesByDay[dayKey] = [];
      }
      rangesByDay[dayKey].push(range);
    });
    
    const mergedRanges: TimeRange[] = [];
    
    // Process each day separately
    Object.keys(rangesByDay).forEach(dayKey => {
      const dayRanges = rangesByDay[dayKey].sort((a, b) => 
        a.startTime.getTime() - b.startTime.getTime()
      );
      
      let currentMerged: TimeRange | null = null;
      
      dayRanges.forEach(range => {
        if (!currentMerged) {
          currentMerged = { ...range };
        } else {
          // Check if ranges are adjacent (within 1 minute tolerance)
          if (Math.abs(currentMerged.endTime.getTime() - range.startTime.getTime()) <= 60000) {
            // Merge ranges by extending the end time
            currentMerged.endTime = range.endTime;
          } else {
            // Not adjacent, save current merged range and start a new one
            mergedRanges.push(currentMerged);
            currentMerged = { ...range };
          }
        }
      });
      
      // Don't forget the last merged range
      if (currentMerged) {
        mergedRanges.push(currentMerged);
      }
    });
    
    return mergedRanges;
  };

  const removeRange = (index: number) => {
    setSelectedRanges(prev => prev.filter((_, i) => i !== index));
  };

  const getRowHeight = () => {
    if (slotDuration === "15") return "h-8";
    if (slotDuration === "30") return "h-10";
    return "h-12";
  };

  const getMergedSlotHeight = (mergedSlot: MergedSlot, hour: number, minute: number) => {
    const slotTime = createTimeSlot(mergedSlot.day, hour, minute);
    
    if (isSameMinute(slotTime, mergedSlot.startTime)) {
      const durationInSlots = mergedSlot.duration / parseInt(slotDuration);
      return Math.max(1, Math.round(durationInSlots));
    }
    return 0; // Hidden slots (part of merged slot)
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Налаштування діапазонів доступності</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Часовий пояс: {timezone}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <h3 className="text-lg font-medium">
              {format(weekStart, "d MMM")} - {format(addDays(weekStart, 6), "d MMM yyyy")}
            </h3>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Тип сесії:</span>
              <Select value={sessionType} onValueChange={(value: "15min" | "60min") => setSessionType(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15min">15 хвилинні</SelectItem>
                  <SelectItem value="60min">60/90 хвилинні</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Сітка:</span>
              <Select value={slotDuration} onValueChange={(value: "15" | "30" | "60") => setSlotDuration(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 хв</SelectItem>
                  <SelectItem value="30">30 хв</SelectItem>
                  <SelectItem value="60">1 год</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-sm text-muted-foreground">
            Клікніть та протягніть для вибору кількох слотів. Натисніть на існуючий слот для редагування.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-emerald-400 rounded-sm"></div>
              <span className="text-muted-foreground">15-хвилинні сесії</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-400 rounded-sm"></div>
              <span className="text-muted-foreground">60/90-хвилинні сесії</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-8 gap-px bg-border" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
          {/* Header row */}
          <div className="bg-background p-2"></div>
          {weekDays.map(day => (
            <div key={day.toISOString()} className="bg-background text-center font-medium p-2">
              <div className="text-sm text-muted-foreground">
                {format(day, "EEE")}
              </div>
              <div className="text-lg">
                {format(day, "d")}
              </div>
            </div>
          ))}
          
          {/* Time slots */}
          {timeSlots.map(({ hour, minute, displayTime }) => {
            return (
              <div key={`${hour}-${minute}`} className="contents">
                <div className={`bg-background text-sm text-muted-foreground p-2 text-right border-r flex items-center justify-end ${getRowHeight()}`}>
                  {displayTime}
                </div>
                
                {weekDays.map(day => {
                  const isTaken = isSlotTaken(day, hour, minute);
                  const isInCurrentSelection = isSlotInCurrentSelection(day, hour, minute);
                  const isSelected = isSlotSelected(day, hour, minute);
                  const isPast = new Date() > createTimeSlot(day, hour, minute);
                  const mergedSlot = isSlotInMergedSlot(day, hour, minute);
                  const mergedHeight = mergedSlot ? getMergedSlotHeight(mergedSlot, hour, minute) : 1;
                  
                  // Don't render if this slot is part of a merged slot but not the starting slot
                  if (mergedSlot && mergedHeight === 0) {
                    return null;
                  }
                  
                  const bookedAppointment = isSlotBooked(day, hour, minute);
                  
                  return (
                    <button
                      key={`${day.toISOString()}-${hour}-${minute}`}
                      onMouseDown={() => !mergedSlot && handleMouseDown(day, hour, minute)}
                      onMouseEnter={() => !mergedSlot && handleMouseEnter(day, hour, minute)}
                      disabled={isPast}
                      style={mergedSlot ? { gridRowEnd: `span ${mergedHeight}` } : {}}
                        className={`
                           ${getRowHeight()} w-full text-sm transition-colors select-none relative ${mergedSlot || bookedAppointment ? '' : 'border-t'}
                           ${isPast ? 'bg-muted/50 cursor-not-allowed' :
                             mergedSlot ? 
                               mergedSlot.sessionType === "15min"
                                 ? 'bg-emerald-500 text-white cursor-pointer'
                                 : 'bg-blue-500 text-white cursor-pointer'
                               :
                             isSelected || isInCurrentSelection ? 
                               sessionType === "15min"
                                 ? 'bg-emerald-400 text-white cursor-pointer'
                                 : 'bg-blue-400 text-white cursor-pointer'
                               :
                             bookedAppointment ? 
                               // Determine session type from the appointment and show full color
                               bookedAppointment.session_type === 'consultation_15' 
                                 ? 'bg-emerald-500 text-white cursor-not-allowed'
                                 : 'bg-blue-500 text-white cursor-not-allowed'
                               :
                             'bg-background hover:bg-muted/50 cursor-pointer border border-border'}
                         `}
                       title={
                         mergedSlot ? `Слот ${formatInTimeZone(mergedSlot.startTime, timezone, "HH:mm")}-${formatInTimeZone(mergedSlot.endTime, timezone, "HH:mm")} (${mergedSlot.sessionType === "15min" ? "15хв сесії" : "60/90хв сесії"}) - натисніть для редагування` :
                         bookedAppointment ? 'Заброньована сесія' :
                         isPast ? 'Минулий час' :
                         isSelected ? 'Клікніть, щоб скасувати вибір' : 
                         `Клікніть та протягніть для вибору слотів`
                       }
                      onClick={() => mergedSlot && handleEditSlot(mergedSlot)}
                    >
                      {mergedSlot ? (
                        <div className={`flex flex-col h-full justify-center items-center p-1 text-white`}>
                          <div className="text-xs font-semibold">
                            {formatInTimeZone(mergedSlot.startTime, timezone, "HH:mm")} - 
                            {formatInTimeZone(mergedSlot.endTime, timezone, "HH:mm")}
                          </div>
                          <div className="flex gap-1 items-center mt-1">
                            <Edit className="h-3 w-3" />
                            <span className="text-xs">({mergedSlot.duration} хв)</span>
                          </div>
                        </div>
                       ) : bookedAppointment ? (
                         <div className="flex items-center justify-center h-full text-white">
                           <span className="text-xs font-medium">Заброньовано</span>
                         </div>
                       ) : null}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Selected ranges display */}
        {selectedRanges.length > 0 && (
          <div className="mt-6 space-y-4">
            <h4 className="font-medium">Обрані часові проміжки:</h4>
            
            <div className="space-y-2">
              {selectedRanges.map((range, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <span className="font-medium">
                      {format(range.day, "EEE, d MMM")}
                    </span>
                    <span className="text-sm">
                      {formatInTimeZone(range.startTime, timezone, "HH:mm")} - {formatInTimeZone(range.endTime, timezone, "HH:mm")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({Math.round((range.endTime.getTime() - range.startTime.getTime()) / (1000 * 60))} хв)
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRange(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={clearSelection}>
                Очистити все
              </Button>
              <Button onClick={saveSlots}>
                Зберегти слоти ({selectedRanges.length})
              </Button>
            </div>
          </div>
        )}

        {/* Edit Slot Dialog */}
        <Dialog open={!!editingSlot} onOpenChange={(open) => !open && setEditingSlot(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Редагувати слот</DialogTitle>
            </DialogHeader>
            {editingSlot && (
              <div className="space-y-4">
                <div>
                  <Label>Дата і час</Label>
                  <div className="text-sm text-muted-foreground">
                    {format(editingSlot.day, "EEEE, dd MMMM yyyy")} о{" "}
                    {formatInTimeZone(editingSlot.startTime, timezone, "HH:mm")}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="duration">Тривалість (хвилини)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="15"
                    max="480"
                    step="15"
                    value={editDuration}
                    onChange={(e) => setEditDuration(parseInt(e.target.value) || 60)}
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    Закінчення: {formatInTimeZone(
                      new Date(editingSlot.startTime.getTime() + editDuration * 60000), 
                      timezone, 
                      "HH:mm"
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setEditingSlot(null)}>
                    Скасувати
                  </Button>
                  <Button onClick={handleUpdateSlot}>
                    Зберегти зміни
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleDeleteSlot(editingSlot)}
                  >
                    Видалити слот
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};