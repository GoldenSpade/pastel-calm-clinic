import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY не налаштовано');
    }

    const currentDate = new Date();
    const prompt = `
Ви - експерт з розпізнавання часу та дат. Проаналізуйте наступний текст українською мовою та витягніть інформацію про доступність.

Текст: "${text}"

Сьогодні: ${currentDate.toISOString().split('T')[0]} (${currentDate.toLocaleDateString('uk-UA', { weekday: 'long' })})

ВАЖЛИВО: Максимальна тривалість одного слота - 8 годин (480 хвилин). Якщо користувач вказує більший діапазон, розбийте його на кілька слотів по 8 годин або менше.

Поверніть JSON у такому форматі:
{
  "timeRanges": [
    {
      "date": "YYYY-MM-DD",
      "startTime": "YYYY-MM-DDTHH:MM:00.000Z", 
      "endTime": "YYYY-MM-DDTHH:MM:00.000Z"
    }
  ]
}

Правила:
- "завтра" = наступний день після сьогодні
- "вчора" = попередній день
- "понеділок", "вівторок" тощо = найближчий такий день тижня
- Час завжди у форматі 24 години
- Якщо часовий пояс не вказано, використовуйте Europe/Kiev
- Якщо не вказано конкретну дату, використовуйте найближчу відповідну дату
- МАКСИМАЛЬНА ТРИВАЛІСТЬ ОДНОГО СЛОТА: 8 годин (480 хвилин)
- Мінімальна тривалість: 15 хвилин, кратна 15
- Для "весь день" або великих діапазонів створюйте слоти тільки в робочі години: 09:00-18:00 (9 годин, розбийте на 09:00-17:00 та 17:00-18:00)
- "завтра весь день" повинно створити слот з 09:00 до 18:00, розбитий на частини якщо потрібно
- Якщо текст незрозумілий, поверніть порожній масив timeRanges

Приклади:
- "завтра з 14:00 до 16:00" → один слот з 14:00 до 16:00
- "понеділок з 9 до 17" → один слот з 09:00 до 17:00 (8 годин)
- "завтра весь день" → слоти з 09:00-17:00 та 17:00-18:00 (робочі години)
- "вівторок і середа з 10:30 до 15:45" → по одному слоту на кожен день
- "з 3 до 6" → з 15:00 до 18:00 (якщо не вказано AM/PM, то це після обіду)
- "з 14 до 17" → з 14:00 до 17:00

Поверніть тільки валідний JSON без додаткового тексту.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: text }
        ],
        temperature: 0.1,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    console.log('OpenAI response:', content);
    
    // Try to parse the JSON response
    let parsedResult;
    try {
      parsedResult = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse JSON:', content);
      parsedResult = { timeRanges: [] };
    }

    return new Response(JSON.stringify(parsedResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in parse-availability function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      timeRanges: [] 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});