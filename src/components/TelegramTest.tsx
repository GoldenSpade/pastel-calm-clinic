import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, Loader2, Settings } from 'lucide-react';

export const TelegramTest = () => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualBotToken, setManualBotToken] = useState('');
  const [manualChatId, setManualChatId] = useState('');

  const testTelegramBot = async () => {
    setTesting(true);
    setError(null);
    setTestResult(null);

    try {
      const requestBody = showManualInput ? {
        botToken: manualBotToken.trim(),
        chatId: manualChatId.trim()
      } : {};

      const { data, error } = await supabase.functions.invoke('send-telegram-notification/test', {
        body: requestBody
      });

      if (error) {
        console.error('Function invocation error:', error);
        setError(`Function error: ${error.message}`);
        return;
      }

      console.log('Test response:', data);
      setTestResult(data);

      if (!data.testResult?.success) {
        setError(data.testResult?.error || 'Test failed');
      }
    } catch (err: any) {
      console.error('Test failed:', err);
      setError(err.message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Telegram Bot Test
        </CardTitle>
        <CardDescription>
          Test if your Telegram bot is configured correctly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <Button 
            onClick={testTelegramBot} 
            disabled={testing}
            className="w-full"
          >
            {testing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              'Test Telegram Bot'
            )}
          </Button>

          <div className="flex items-center justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowManualInput(!showManualInput)}
              className="text-xs"
            >
              <Settings className="w-3 h-3 mr-1" />
              {showManualInput ? 'Use Secrets Only' : 'Manual Test (If Secrets Fail)'}
            </Button>
          </div>

          {showManualInput && (
            <>
              <Separator />
              <div className="space-y-3 p-3 bg-muted rounded-md">
                <div className="text-sm font-medium">Manual Test Credentials</div>
                <div>
                  <Label htmlFor="botToken" className="text-xs">Bot Token (from @BotFather)</Label>
                  <Input
                    id="botToken"
                    type="text"
                    placeholder="123456789:AAEhBOweik6ad9r_QXMENQjcrGbqCr4K-ac"
                    value={manualBotToken}
                    onChange={(e) => setManualBotToken(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="chatId" className="text-xs">Chat ID</Label>
                  <Input
                    id="chatId"
                    type="text"
                    placeholder="-1001234567890 or @username"
                    value={manualChatId}
                    onChange={(e) => setManualChatId(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  This will temporarily use these credentials instead of secrets for testing only.
                </div>
              </div>
            </>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {testResult && (
          <div className="space-y-3">
            <Alert variant={testResult.testResult?.success ? "default" : "destructive"}>
              {testResult.testResult?.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                {testResult.testResult?.success 
                  ? "✅ Telegram bot is working correctly!" 
                  : `❌ Test failed: ${testResult.testResult?.error || 'Unknown error'}`
                }
              </AlertDescription>
            </Alert>

            {testResult.testResult?.success && testResult.testResult.message && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  {testResult.testResult.message}
                </AlertDescription>
              </Alert>
            )}

            <div className="bg-muted p-3 rounded-md text-sm">
              <strong>🔍 Debug Information:</strong>
              <div className="mt-2 space-y-2">
                <div className="bg-white p-2 rounded border">
                  <strong>Bot Token:</strong>
                  <ul className="ml-4 text-xs">
                    <li>Exists: {testResult.debug?.environment?.botToken?.exists ? '✅' : '❌'}</li>
                    <li>Length: {testResult.debug?.environment?.botToken?.length || 0}</li>
                    <li>Preview: "{testResult.debug?.environment?.botToken?.preview || 'undefined'}"</li>
                    <li>Is Empty: {testResult.debug?.environment?.botToken?.isEmpty ? '❌ YES' : '✅ No'}</li>
                  </ul>
                </div>
                
                <div className="bg-white p-2 rounded border">
                  <strong>Chat ID:</strong>
                  <ul className="ml-4 text-xs">
                    <li>Exists: {testResult.debug?.environment?.chatId?.exists ? '✅' : '❌'}</li>
                    <li>Length: {testResult.debug?.environment?.chatId?.length || 0}</li>
                    <li>Value: "{testResult.debug?.environment?.chatId?.value || 'undefined'}"</li>
                    <li>Is Empty: {testResult.debug?.environment?.chatId?.isEmpty ? '❌ YES' : '✅ No'}</li>
                  </ul>
                </div>

                {testResult.debug?.allTelegramVars && (
                  <div className="bg-yellow-50 p-2 rounded border">
                    <strong>All Telegram Variables:</strong>
                    <ul className="ml-4 text-xs">
                      {testResult.debug.allTelegramVars.map((env: any, index: number) => (
                        <li key={index}>
                          {env.name}: "{env.value}" (length: {env.length})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {testResult.testResult?.botInfo && (
              <div className="bg-green-50 p-3 rounded-md text-sm">
                <strong>✅ Bot Info:</strong>
                <ul className="mt-2 space-y-1">
                  <li>Username: @{testResult.testResult.botInfo.username}</li>
                  <li>Name: {testResult.testResult.botInfo.first_name}</li>
                  <li>ID: {testResult.testResult.botInfo.id}</li>
                  {testResult.testResult.messageId && (
                    <li>Message ID: {testResult.testResult.messageId}</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};