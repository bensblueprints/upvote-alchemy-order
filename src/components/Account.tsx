import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Copy, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';

export const Account = () => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey] = useState('********************');
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: profile, isLoading: isLoadingProfile } = useProfile();

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    toast({
      title: 'API Key Copied',
      description: 'Your API key has been copied to clipboard.',
    });
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) {
      return '$0.00';
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account and API configuration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" value="reddit_marketer" disabled />
            </div>
            <div className="space-y-2">
              <Label>Account Status</Label>
              <div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>Your API key for integrating with our service</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apikey">API Key</Label>
              <div className="flex space-x-2">
                <Input
                  id="apikey"
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  readOnly
                  className="font-mono"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button variant="outline" size="icon" onClick={copyApiKey}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Keep your API key secure. Don't share it publicly or commit it to version control.
            </div>
            <Button variant="outline" className="w-full">
              Generate New Key
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage Statistics</CardTitle>
            <CardDescription>Your account usage this month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">127</div>
                <div className="text-sm text-blue-600">Total Orders</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">2,450</div>
                <div className="text-sm text-green-600">Upvotes Delivered</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">45</div>
                <div className="text-sm text-orange-600">Comments Posted</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">$1,234</div>
                <div className="text-sm text-purple-600">Total Spent</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing Information</CardTitle>
            <CardDescription>Manage your billing and payments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Current Balance</span>
                {isLoadingProfile ? (
                   <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                   <span className="text-lg font-bold text-green-600">{formatCurrency(profile?.balance)}</span>
                )}
              </div>
              <div className="text-sm text-gray-600">Available for orders</div>
            </div>
            <Button className="w-full bg-orange-500 hover:bg-orange-600">
              Add Funds
            </Button>
            <Button variant="outline" className="w-full">
              View Billing History
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
