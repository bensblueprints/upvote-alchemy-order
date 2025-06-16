import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export const ApiTest = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const { toast } = useToast();

  const runTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await api.testApiConnection();
      setTestResult(result);

      if (result.success) {
        toast({
          title: 'API Test Successful',
          description: 'Successfully connected to the BuyUpvotes API',
        });
      } else {
        toast({
          title: 'API Test Failed',
          description: result.error || 'Failed to connect to the API',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      setTestResult({ success: false, error: error.message });
      toast({
        title: 'API Test Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>API Integration Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runTest} 
          disabled={isTesting}
          className="w-full"
        >
          {isTesting ? 'Testing...' : 'Test API Connection'}
        </Button>

        {testResult && (
          <div className="mt-4 p-4 rounded-lg bg-gray-50">
            <h3 className="font-semibold mb-2">Test Results:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 