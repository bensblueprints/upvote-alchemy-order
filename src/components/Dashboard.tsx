
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, MessageSquare, Clock, DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Tables } from '@/integrations/supabase/types';
import { SERVICE_OPTIONS } from '@/lib/api';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

type UpvoteOrder = Tables<'upvote_orders'>;

export const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  usePageTitle('Home');

  const stats = [
    {
      title: 'Total Orders',
      value: '127',
      change: '+12%',
      icon: TrendingUp,
      color: 'text-blue-600',
    },
    {
      title: 'Active Orders',
      value: '8',
      change: '+2',
      icon: Clock,
      color: 'text-orange-600',
    },
    {
      title: 'Comments Posted',
      value: '45',
      change: '+8%',
      icon: MessageSquare,
      color: 'text-green-600',
    },
    {
      title: 'Total Spent',
      value: '$1,234',
      change: '+15%',
      icon: DollarSign,
      color: 'text-purple-600',
    },
  ];

  const fetchRecentOrders = async () => {
    if (!user) return [];
    const { data, error } = await supabase
      .from('upvote_orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(4);
    if (error) {
      toast({ title: 'Error fetching recent orders', description: error.message, variant: 'destructive' });
      throw new Error(error.message);
    }
    return data;
  };

  const { data: recentOrders, isLoading: isLoadingOrders } = useQuery<UpvoteOrder[]>({
    queryKey: ['recentUpvoteOrders', user?.id],
    queryFn: fetchRecentOrders,
    enabled: !!user,
  });

  const getServiceLabel = (serviceId: number) => {
    return SERVICE_OPTIONS.find(opt => opt.value === serviceId)?.label || 'Unknown Service';
  };

  const getStatusDotColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-500';
      case 'in progress': return 'bg-orange-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  const getStatusBadgeColor = (status: string) => {
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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor your Reddit marketing campaigns</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-green-600 mt-1">{stat.change} from last month</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Your latest upvote and comment orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoadingOrders ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="w-2 h-2 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              ))
            ) : recentOrders && recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full ${getStatusDotColor(order.status)}`}></div>
                    <div>
                      <p className="font-medium">Order #{order.id}</p>
                      <p className="text-sm text-gray-600">{getServiceLabel(order.service)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">{order.quantity} votes</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeColor(order.status)}`}>
                        {order.status}
                      </span>
                      <span className="text-sm text-gray-500">{format(new Date(order.created_at), 'yyyy-MM-dd')}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No recent orders found.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
