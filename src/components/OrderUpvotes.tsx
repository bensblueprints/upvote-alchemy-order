
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SPEED_OPTIONS, SERVICE_OPTIONS } from '@/lib/api';

export const OrderUpvotes = () => {
  const [formData, setFormData] = useState({
    link: '',
    quantity: '',
    service: '',
    speed: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.rpc('place_upvote_order', {
        order_link: formData.link,
        order_quantity: parseInt(formData.quantity),
        order_service: parseInt(formData.service),
        order_speed: parseFloat(formData.speed),
      });

      if (error) throw error;

      const result = data?.[0];

      if (result?.error_message) {
        throw new Error(result.error_message);
      }

      if (result?.order_id) {
        toast({
          title: 'Order Submitted Successfully!',
          description: `Order #${result.order_id} has been created.`,
        });
        setFormData({ link: '', quantity: '', service: '', speed: '' });
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      } else {
        throw new Error('Failed to submit order. Unknown error.');
      }
    } catch (error: any) {
      console.error('Order submission error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit order. Please check your inputs and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Order Upvotes</h1>
        <p className="text-gray-600 mt-2">Submit upvote or downvote orders for Reddit posts and comments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Submit New Order</CardTitle>
            <CardDescription>
              Enter the Reddit link and configure your upvote/downvote order
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="link">Reddit Link</Label>
                <Textarea
                  id="link"
                  placeholder="https://www.reddit.com/r/example/comments/..."
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="min-h-[80px]"
                  required
                />
                <p className="text-sm text-gray-500">
                  Must be a Reddit link copied from desktop (no mobile links)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max="500"
                    placeholder="1-500"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service">Service Type</Label>
                  <Select value={formData.service} onValueChange={(value) => setFormData({ ...formData, service: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="speed">Delivery Speed</Label>
                <Select value={formData.speed} onValueChange={(value) => setFormData({ ...formData, speed: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select delivery speed" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPEED_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Order'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing Information</CardTitle>
            <CardDescription>Current rates for upvote services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-semibold text-orange-800">Post Upvotes</h4>
              <p className="text-sm text-orange-600">$0.10 per upvote</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <h4 className="font-semibold text-red-800">Post Downvotes</h4>
              <p className="text-sm text-red-600">$0.10 per downvote</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800">Comment Votes</h4>
              <p className="text-sm text-blue-600">$0.08 per vote</p>
            </div>
            <div className="text-xs text-gray-500 mt-4">
              * Prices are estimates. Actual pricing may vary based on complexity and demand.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
