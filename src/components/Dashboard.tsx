import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, MessageSquare, Clock, DollarSign } from 'lucide-react';

export const Dashboard = () => {
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

  const recentOrders = [
    { id: '1891780', type: 'Post upvotes', status: 'Completed', votes: '50/50', date: '2024-06-14' },
    { id: '1891779', type: 'Comment upvotes', status: 'In Progress', votes: '23/40', date: '2024-06-14' },
    { id: '1891778', type: 'Post downvotes', status: 'Pending', votes: '0/25', date: '2024-06-13' },
    { id: '1891777', type: 'Comment reply', status: 'Completed', votes: '-', date: '2024-06-13' },
  ];

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
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <div>
                    <p className="font-medium">Order #{order.id}</p>
                    <p className="text-sm text-gray-600">{order.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">{order.votes}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'In Progress' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                    <span className="text-sm text-gray-500">{order.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
