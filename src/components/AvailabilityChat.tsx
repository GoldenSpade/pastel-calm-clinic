import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
}

interface AvailabilityChatProps {
  onSlotsCreate: (timeRanges: Array<{day: Date; startTime: Date; endTime: Date}>, sessionType: string) => void;
}

export const AvailabilityChat = ({ onSlotsCreate }: AvailabilityChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content: `Привіт! Спочатку оберіть тип сесії:
      
📋 **15-хвилинні** - короткі ознайомчі консультації
🕐 **60/90-хвилинні** - повноцінні терапевтичні сесії

Потім напишіть коли ви доступні. Наприклад: 'завтра з 14:00 до 16:00'. Тип сесії визначає для яких клієнтів будуть доступні ці слоти.`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [sessionType, setSessionType] = useState<"15min" | "60min">("60min");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const parseAvailability = async (text: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('parse-availability', {
        body: { text }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error parsing availability:', error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user", 
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const result = await parseAvailability(input);
      
      if (result.timeRanges && result.timeRanges.length > 0) {
        const timeRanges = result.timeRanges.map((range: any) => ({
          day: new Date(range.date),
          startTime: new Date(range.startTime),
          endTime: new Date(range.endTime)
        }));

        await onSlotsCreate(timeRanges, sessionType);

        const sessionTypeText = sessionType === "15min" ? "15-хвилинних ознайомчих" : "60/90-хвилинних основних";
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "bot",
          content: `✅ Створено ${timeRanges.length} слот(ів) для **${sessionTypeText}** сесій! 
          
${sessionType === "15min" ? "🟢" : "🔵"} Ці слоти тепер доступні для бронювання клієнтами.
          
Якщо в цьому діапазоні були існуючі слоти того ж типу, вони замінені новими.`,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, botMessage]);

        toast({
          title: "Успіх",
          description: `Створено ${timeRanges.length} слот(ів) для ${sessionType === "15min" ? "15хв" : "60/90хв"} сесій`
        });
      } else {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "bot",
          content: "Не вдалося розпізнати час у вашому повідомленні. Спробуйте написати більш конкретно, наприклад: 'завтра з 14:00 до 16:00'. Пам'ятайте, що максимальна тривалість одного слота - 8 годин.",
          timestamp: new Date()
        };

        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot", 
        content: "Виникла помилка при обробці вашого повідомлення. Спробуйте ще раз.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

      toast({
        variant: "destructive",
        title: "Помилка",
        description: "Не вдалося обробити повідомлення"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Асистент доступності
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Тип сесії:</span>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value as "15min" | "60min")}
              className="px-3 py-1 rounded border bg-background text-sm"
            >
              <option value="15min">🟢 15 хв (ознайомчі)</option>
              <option value="60min">🔵 60/90 хв (основні)</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="h-64 overflow-y-auto space-y-3 p-4 border rounded-lg bg-muted/20">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex gap-2 max-w-[80%] ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === "user" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-secondary text-secondary-foreground"
                  }`}>
                    {message.type === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={`rounded-lg p-3 ${
                    message.type === "user"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-background border"
                  }`}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-secondary text-secondary-foreground">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="rounded-lg p-3 bg-background border">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Аналізую...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Опишіть коли ви доступні..."
              disabled={loading}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!input.trim() || loading}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};