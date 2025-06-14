
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { SERVICE_OPTIONS } from '@/lib/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type UpvoteOrder = Tables<'upvote_orders'>;

const fetchAllOrders = async () => {
    const { data, error } = await supabase
        .from('upvote_orders')
        .select('*, profiles(email)')
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error(error.message);
    }
    return data;
};

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
};

const getServiceLabel = (serviceId: number) => {
    return SERVICE_OPTIONS.find(opt => opt.value === serviceId)?.label || 'Unknown Service';
};

export const AdminDashboard = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [refundOrder, setRefundOrder] = useState<UpvoteOrder | null>(null);

    const { data: orders, isLoading, error } = useQuery<any[]>({
        queryKey: ['allUpvoteOrders'],
        queryFn: fetchAllOrders,
        onError: (err: any) => {
            toast({ title: 'Error fetching orders', description: err.message, variant: 'destructive' });
        }
    });

    const updateOrderStatusMutation = useMutation({
        mutationFn: async ({ orderId, status }: { orderId: number, status: string }) => {
            const { error } = await supabase
                .from('upvote_orders')
                .update({ status })
                .eq('id', orderId);
            if (error) throw error;
        },
        onSuccess: () => {
            toast({ title: 'Success', description: 'Order status updated.' });
            queryClient.invalidateQueries({ queryKey: ['allUpvoteOrders'] });
        },
        onError: (error: any) => {
            toast({ title: 'Error', description: `Failed to update status: ${error.message}`, variant: 'destructive' });
        }
    });

    const refundOrderMutation = useMutation({
        mutationFn: async (orderId: number) => {
            const { data, error } = await supabase.rpc('refund_order', { target_order_id: orderId });
            if (error) throw error;
            if (typeof data === 'string' && data.startsWith('Error')) throw new Error(data);
            return data;
        },
        onSuccess: (data) => {
            toast({ title: 'Success', description: data as string });
            queryClient.invalidateQueries({ queryKey: ['allUpvoteOrders'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] }); // To update user balance
        },
        onError: (error: any) => {
            toast({ title: 'Error', description: `Refund failed: ${error.message}`, variant: 'destructive' });
        },
        onSettled: () => {
            setRefundOrder(null);
        }
    });
    
    const handleRefundConfirm = () => {
        if (refundOrder) {
            refundOrderMutation.mutate(refundOrder.id);
        }
    };

    if (isLoading) return <div className="text-center p-8">Loading all orders...</div>;
    if (error) return <div className="text-center p-8 text-red-600">Error loading orders.</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-2">
                <ShieldCheck className="h-8 w-8 text-green-600" />
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600 mt-1">Manage all user orders and platform activities.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Upvote Orders</CardTitle>
                    <CardDescription>View, manage, and update the status of all orders.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>User Email</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Service</TableHead>
                                <TableHead>Link</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders?.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">#{order.id}</TableCell>
                                    <TableCell className="text-xs">{order.profiles?.email || order.user_id}</TableCell>
                                    <TableCell>{format(new Date(order.created_at), 'PPp')}</TableCell>
                                    <TableCell>{getServiceLabel(order.service)}</TableCell>
                                    <TableCell>
                                        <a href={order.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate block w-32">{order.link}</a>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(order.status)}>
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuLabel className="text-xs font-normal">Set Status</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => updateOrderStatusMutation.mutate({ orderId: order.id, status: 'In Progress' })}>In Progress</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => updateOrderStatusMutation.mutate({ orderId: order.id, status: 'Completed' })}>Completed</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-700" onClick={() => setRefundOrder(order)} disabled={order.status === 'Cancelled'}>
                                                    Cancel & Refund
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <AlertDialog open={!!refundOrder} onOpenChange={(open) => !open && setRefundOrder(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to refund this order?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will cancel Order #{refundOrder?.id} and return the funds to the user's wallet. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRefundConfirm} disabled={refundOrderMutation.isPending}>
                    {refundOrderMutation.isPending ? 'Refunding...' : 'Confirm Refund'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
