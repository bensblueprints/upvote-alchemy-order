
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  TrendingUp, 
  MessageSquare, 
  ClipboardList, 
  User,
  LogOut,
  Plus
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'order-upvotes', label: 'Order Upvotes', icon: TrendingUp },
    { id: 'order-comments', label: 'Order Comments', icon: MessageSquare },
    { id: 'order-tracking', label: 'Order Tracking', icon: ClipboardList },
    { id: 'add-funds', label: 'Add Funds', icon: Plus },
    { id: 'account', label: 'Account', icon: User },
  ];

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-orange-500">RedditTraffic.XYZ</h1>
        <p className="text-sm text-gray-500 mt-1">Reddit Marketing Platform</p>
      </div>
      
      <nav className="mt-6 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 transition-colors',
                activeTab === item.id 
                  ? 'bg-orange-50 text-orange-600 border-r-2 border-orange-500' 
                  : 'text-gray-700'
              )}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-6 border-t">
        <button onClick={handleSignOut} className="flex items-center text-gray-500 hover:text-gray-700 transition-colors w-full">
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  );
};
