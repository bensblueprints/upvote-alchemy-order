
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SERVICE_OPTIONS } from '@/lib/api';
import { format } from 'date-fns';
import { Tables } from '@/integrations/supabase/types';

type UpvoteOrder = Tables<'upvote_orders'>;

export const OrderTracking = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<UpvoteOrder | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchOrders = async () => {
    if (!user) return [];
    const { data, error } = await supabase
      .from('upvote_orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast({ title: 'Error fetching orders', description: error.message, variant: 'destructive' });
      throw new Error(error.message);
    }
    return data;
  };

  const { data: pastOrders, isLoading: isLoadingPastOrders } = useQuery<UpvoteOrder[]>({
    queryKey: ['upvoteOrders', user?.id],
    queryFn: fetchOrders,
    enabled: !!user,
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchedOrder(null);
    try {
      const orderId = parseInt(searchQuery.trim(), 10);
      if (isNaN(orderId)) {
        toast({
          title: 'Invalid Order ID',
          description: 'Please enter a numeric order ID.',
          variant: 'destructive',
        });
        setIsSearching(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('upvote_orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        setSearchedOrder(data);
      } else {
        toast({
          title: 'Order not found',
          description: 'No upvote order found with that ID.',
        });
      }
    } catch (error: any) {
      console.error('Error fetching order status:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch order status. Please check the order number.',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
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
  
  const getServiceLabel = (serviceId: number) => {
    return SERVICE_OPTIONS.find(opt => opt.value === serviceId)?.label || 'Unknown Service';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Master Order Dashboard</h1>
        <p className="text-gray-600 mt-2">Track and manage your upvote orders</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Upvote Order</CardTitle>
          <CardDescription>Enter an upvote order number to check its status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">Order Number</Label>
              <Input
                id="search"
                placeholder="Enter order number (e.g., 123)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>

          {searchedOrder && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <h3 className="font-semibold mb-2">Order #{searchedOrder.id}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Service:</span>
                  <span className="ml-2 font-medium">{getServiceLabel(searchedOrder.service)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <Badge className={`ml-2 ${getStatusColor(searchedOrder.status)}`}>
                    {searchedOrder.status}
                  </Badge>
                </div>
                <div>
                    <span className="text-gray-600">Quantity:</span>
                    <span className="ml-2 font-medium">{searchedOrder.quantity}</span>
                </div>
                <div>
                    <span className="text-gray-600">Date:</span>
                    <span className="ml-2 font-medium">{format(new Date(searchedOrder.created_at), 'PPp')}</span>
                </div>
                <div className="col-span-2">
                    <span className="text-gray-600">Link:</span>
                    <a href={searchedOrder.link} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:underline break-all">{searchedOrder.link}</a>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Past Upvote Orders</CardTitle>
          <CardDescription>A list of all your upvote orders.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingPastOrders ? (
              <p>Loading past orders...</p>
          ) : pastOrders && pastOrders.length > 0 ? (
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Link</TableHead>
                          <TableHead>Status</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {pastOrders.map((order) => (
                          <TableRow key={order.id}>
                              <TableCell className="font-medium">#{order.id}</TableCell>
                              <TableCell>{format(new Date(order.created_at), 'PPp')}</TableCell>
                              <TableCell>{getServiceLabel(order.service)}</TableCell>
                              <TableCell>{order.quantity}</TableCell>
                              <TableCell>
                                <a href={order.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate block w-32">{order.link}</a>
                              </TableCell>
                              <TableCell>
                                  <Badge className={getStatusColor(order.status)}>
                                      {order.status}
                                  </Badge>
                              </TableCell>
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
          ) : (
              <p className="text-center text-gray-500 py-8">No past upvote orders found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
