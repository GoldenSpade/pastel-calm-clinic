import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TelegramTestRequest {
  botToken?: string;
  chatId?: string;
}

interface TelegramNotificationRequest {
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  sessionType: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('🚀 Telegram Function Called');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const envBotToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const envChatId = Deno.env.get("TELEGRAM_CHAT_ID");
    
    console.log('Environment variables:');
    console.log('- Bot token from env:', envBotToken ? `${envBotToken.length} chars` : 'undefined');
    console.log('- Chat ID from env:', envChatId || 'undefined');

    const url = new URL(req.url);
    const isTest = url.pathname.includes('/test');
    
    if (isTest) {
      console.log('🔧 Processing test request...');
      
      // For test requests, allow credentials in request body as fallback
      const requestBody = await req.json().catch(() => ({}));
      const testRequest = requestBody as TelegramTestRequest;
      
      // Use provided credentials or fall back to environment
      const botToken = testRequest.botToken || envBotToken;
      const chatId = testRequest.chatId || envChatId;
      
      console.log('Test credentials:');
      console.log('- Bot token source:', testRequest.botToken ? 'request body' : 'environment');
      console.log('- Chat ID source:', testRequest.chatId ? 'request body' : 'environment');
      console.log('- Bot token length:', botToken?.length || 0);
      console.log('- Chat ID value:', chatId);

      if (!botToken || botToken.trim() === '') {
        return new Response(JSON.stringify({
          success: false,
          error: "No bot token available. Either set TELEGRAM_BOT_TOKEN secret or provide botToken in request body.",
          debug: {
            envTokenExists: !!envBotToken,
            envTokenLength: envBotToken?.length || 0,
            requestTokenProvided: !!testRequest.botToken,
            instructions: "For testing, you can send: {\"botToken\": \"your_bot_token\", \"chatId\": \"your_chat_id\"}"
          }
        }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }

      if (!chatId || chatId.trim() === '') {
        return new Response(JSON.stringify({
          success: false,
          error: "No chat ID available. Either set TELEGRAM_CHAT_ID secret or provide chatId in request body.",
          debug: {
            envChatIdExists: !!envChatId,
            envChatIdValue: envChatId,
            requestChatIdProvided: !!testRequest.chatId,
            instructions: "For testing, you can send: {\"botToken\": \"your_bot_token\", \"chatId\": \"your_chat_id\"}"
          }
        }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }

      console.log('✅ Credentials available, testing Telegram API...');

      try {
        // Test 1: Check bot token
        console.log('Step 1: Validating bot token...');
        const botResponse = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
        const botData = await botResponse.json();
        
        console.log('Bot validation response:', botResponse.status, botData);

        if (!botResponse.ok) {
          return new Response(JSON.stringify({
            testResult: {
              success: false,
              error: `Invalid bot token: ${botData.description}`,
              step: 'bot_validation'
            }
          }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders }
          });
        }

        console.log('✅ Bot token valid:', `@${botData.result.username}`);

        // Test 2: Send test message
        console.log('Step 2: Sending test message...');
        const testMessage = `🎉 SUCCESS!\n\nTelegram integration is working!\n\n✅ Bot: @${botData.result.username}\n✅ Chat: ${chatId}\n✅ Time: ${new Date().toLocaleString()}\n\nThis is a test message from your booking system.`;
        
        console.log('Sending message:', testMessage);
        
        const messageResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: testMessage
          })
        });

        const messageData = await messageResponse.json();
        
        console.log('Message response:', messageResponse.status, messageData);

        if (!messageResponse.ok) {
          return new Response(JSON.stringify({
            testResult: {
              success: false,
              error: `Failed to send message: ${messageData.description}`,
              step: 'message_send',
              botInfo: botData.result,
              chatIdTested: chatId
            }
          }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders }
          });
        }

        console.log('🎉 SUCCESS! Message sent successfully!');

        return new Response(JSON.stringify({
          testResult: {
            success: true,
            botInfo: botData.result,
            messageId: messageData.result.message_id,
            chatId: chatId,
            message: 'SUCCESS! Check your Telegram for the test message!'
          },
          environment: {
            botTokenSource: testRequest.botToken ? 'request_body' : 'environment',
            chatIdSource: testRequest.chatId ? 'request_body' : 'environment',
            envTokenLength: envBotToken?.length || 0,
            envChatId: envChatId
          }
        }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });

      } catch (error: any) {
        console.error('❌ API test failed:', error);
        return new Response(JSON.stringify({
          testResult: {
            success: false,
            error: `Network/API error: ${error.message}`,
            step: 'network_error'
          }
        }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }
    }

    // Handle regular booking notification
    console.log('📝 Processing booking notification...');
    
    if (!envBotToken || !envChatId || envBotToken.trim() === '' || envChatId.trim() === '') {
      return new Response(JSON.stringify({
        success: false,
        error: 'Telegram secrets not configured properly. Please set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID.'
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    const booking: TelegramNotificationRequest = await req.json();
    
    const startDate = new Date(booking.startTime);
    const endDate = new Date(booking.endTime);
    
    const message = `🔔 *Нова сесія заброньована*\n\n` +
      `👤 *Клієнт:* ${booking.clientName}\n` +
      `📧 *Email:* ${booking.clientEmail || 'Не вказано'}\n` +
      `📞 *Телефон:* ${booking.clientPhone || 'Не вказано'}\n` +
      `⏰ *Тип сесії:* ${booking.sessionType}\n` +
      `📅 *Дата і час:* ${startDate.toLocaleString('uk-UA', { timeZone: 'Europe/Kiev' })}\n` +
      `⏱️ *Завершення:* ${endDate.toLocaleString('uk-UA', { timeZone: 'Europe/Kiev' })}\n` +
      `📝 *Примітки:* ${booking.notes || 'Немає'}\n\n` +
      `💼 Перевірте адмін панель для деталей.`;

    const notificationResponse = await fetch(`https://api.telegram.org/bot${envBotToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: envChatId,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    const notificationData = await notificationResponse.json();

    if (!notificationResponse.ok) {
      console.error('❌ Notification failed:', notificationData);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to send notification',
        details: notificationData.description
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    console.log('✅ Notification sent successfully!');
    return new Response(JSON.stringify({
      success: true,
      messageId: notificationData.result.message_id
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });

  } catch (error: any) {
    console.error('❌ Unexpected error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
};

serve(handler);