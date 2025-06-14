
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, RefreshCw, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

interface OrderStatus {
  order_number: string;
  service?: string;
  status: string;
  vote_quantity?: number;
  votes_delivered?: number;
}

export const OrderTracking = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Mock data for demonstration
  const mockOrders = [
    { id: '1891780', type: 'Post upvotes', status: 'Completed', progress: '50/50', date: '2024-06-14 3:30 PM' },
    { id: '1891779', type: 'Comment upvotes', status: 'In Progress', progress: '23/40', date: '2024-06-14 2:15 PM' },
    { id: '1891778', type: 'Post downvotes', status: 'Pending', progress: '0/25', date: '2024-06-13 11:45 AM' },
    { id: '1891777', type: 'Comment reply', status: 'Completed', progress: 'Done', date: '2024-06-13 9:20 AM' },
    { id: '1891776', type: 'Post upvotes', status: 'Cancelled', progress: '5/30', date: '2024-06-12 4:10 PM' },
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await api.getUpvoteOrderStatus({ order_number: searchQuery });
      setOrderStatus(response);
    } catch (error) {
      console.error('Error fetching order status:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch order status. Please check the order number.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (orderNumber: string) => {
    try {
      const response = await api.cancelUpvoteOrder({ order_number: orderNumber });
      toast({
        title: 'Order Cancelled',
        description: response.message || 'Order has been cancelled successfully.',
      });
      // Refresh the order list in a real app
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel order. Only in-progress orders can be cancelled.',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in progress': return 'bg-orange-100 text-orange-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Order Tracking</h1>
        <p className="text-gray-600 mt-2">Track and manage your upvote and comment orders</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Order</CardTitle>
          <CardDescription>Enter order number to check status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">Order Number</Label>
              <Input
                id="search"
                placeholder="Enter order number (e.g., 1891780)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>

          {orderStatus && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <h3 className="font-semibold mb-2">Order #{orderStatus.order_number}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Service:</span>
                  <span className="ml-2">{orderStatus.service || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <Badge className={`ml-2 ${getStatusColor(orderStatus.status)}`}>
                    {orderStatus.status}
                  </Badge>
                </div>
                {orderStatus.vote_quantity && (
                  <div>
                    <span className="text-gray-600">Progress:</span>
                    <span className="ml-2">{orderStatus.votes_delivered || 0}/{orderStatus.vote_quantity}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Past Orders</CardTitle>
          <CardDescription>All your upvote and comment orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <div>
                    <p className="font-medium">Order #{order.id}</p>
                    <p className="text-sm text-gray-600">{order.type}</p>
                    <p className="text-xs text-gray-500">{order.date}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">{order.progress}</span>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                  {order.status === 'In Progress' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancel(order.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
