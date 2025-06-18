
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, RefreshCw, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SERVICE_OPTIONS, api } from '@/lib/api';
import { usePageTitle } from '@/hooks/usePageTitle';
import { format } from 'date-fns';
import { Tables } from '@/integrations/supabase/types';

type UpvoteOrder = Tables<'upvote_orders'>;

export const OrderTracking = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<UpvoteOrder | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  usePageTitle('Order Tracking');

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

  // Mutation for updating order status
  const updateStatusMutation = useMutation({
    mutationFn: async (orderId: number) => {
      return await api.updateOrderStatus(orderId);
    },
    onSuccess: (result, orderId) => {
      if (result.updated) {
        toast({
          title: 'Status Updated',
          description: `Order #${orderId} status updated to: ${result.status}`,
        });
        queryClient.invalidateQueries({ queryKey: ['upvoteOrders', user?.id] });
        
                 // Update searched order if it matches
         if (searchedOrder && searchedOrder.id === orderId) {
           supabase
             .from('upvote_orders')
             .select('*')
             .eq('id', orderId)
             .single()
             .then(({ data, error }) => {
               if (data && !error) {
                 setSearchedOrder(data);
               }
             });
         }
      } else {
        toast({
          title: 'No Update Available',
          description: `Order #${orderId} status is already up to date or cannot be checked yet.`,
        });
      }
    },
    onError: (error: any, orderId) => {
      toast({
        title: 'Update Failed',
        description: `Failed to update status for order #${orderId}: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Bulk update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: async (orderIds: number[]) => {
      return await api.updateMultipleOrderStatuses(orderIds);
    },
    onSuccess: (result) => {
      toast({
        title: 'Bulk Update Complete',
        description: `Updated ${result.updated} orders, ${result.failed} failed`,
      });
      queryClient.invalidateQueries({ queryKey: ['upvoteOrders', user?.id] });
    },
    onError: (error: any) => {
      toast({
        title: 'Bulk Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const handleBulkStatusUpdate = () => {
    if (!pastOrders || pastOrders.length === 0) return;
    
    // Only update orders that have external_order_id and aren't completed/cancelled
    const updatableOrders = pastOrders
      .filter(order => order.external_order_id && !['Completed', 'Cancelled'].includes(order.status))
      .map(order => order.id);
    
    if (updatableOrders.length === 0) {
      toast({
        title: 'No Orders to Update',
        description: 'All your orders are either completed, cancelled, or don\'t have external tracking IDs.',
      });
      return;
    }

    bulkUpdateMutation.mutate(updatableOrders);
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
                                 {(searchedOrder as any).votes_delivered !== null && (searchedOrder as any).votes_delivered > 0 && (
                   <div>
                     <span className="text-gray-600">Delivered:</span>
                     <span className="ml-2 font-medium">{(searchedOrder as any).votes_delivered} / {searchedOrder.quantity}</span>
                   </div>
                 )}
                <div className="col-span-2">
                    <span className="text-gray-600">Link:</span>
                    <a href={searchedOrder.link} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:underline break-all">{searchedOrder.link}</a>
                </div>
                {searchedOrder.external_order_id && (
                  <div className="col-span-2 flex items-center gap-2">
                    <span className="text-gray-600">External Order ID:</span>
                    <span className="ml-2 font-mono text-sm">{searchedOrder.external_order_id}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatusMutation.mutate(searchedOrder.id)}
                      disabled={updateStatusMutation.isPending}
                    >
                      {updateStatusMutation.isPending ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3" />
                      )}
                      Update Status
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Your Past Upvote Orders</CardTitle>
            <CardDescription>A list of all your upvote orders.</CardDescription>
          </div>
          <Button
            onClick={handleBulkStatusUpdate}
            disabled={bulkUpdateMutation.isPending || !pastOrders || pastOrders.length === 0}
            variant="outline"
          >
            {bulkUpdateMutation.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Clock className="h-4 w-4 mr-2" />
                Update All Statuses
              </>
            )}
          </Button>
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
                          <TableHead>Progress</TableHead>
                          <TableHead>Link</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
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
                                {(order as any).votes_delivered !== null && (order as any).votes_delivered > 0 ? (
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm">{(order as any).votes_delivered} / {order.quantity}</span>
                                    <div className="w-16 bg-gray-200 rounded-full h-2">
                                      <div 
                                        className="bg-blue-600 h-2 rounded-full" 
                                        style={{ width: `${Math.min(((order as any).votes_delivered / order.quantity) * 100, 100)}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-sm">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <a href={order.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate block w-32">{order.link}</a>
                              </TableCell>
                              <TableCell>
                                  <Badge className={getStatusColor(order.status)}>
                                      {order.status}
                                  </Badge>
                              </TableCell>
                              <TableCell>
                                {order.external_order_id && !['Completed', 'Cancelled'].includes(order.status) && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateStatusMutation.mutate(order.id)}
                                    disabled={updateStatusMutation.isPending}
                                  >
                                    {updateStatusMutation.isPending ? (
                                      <RefreshCw className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <RefreshCw className="h-3 w-3" />
                                    )}
                                  </Button>
                                )}
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
