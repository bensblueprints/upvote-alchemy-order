import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  TrendingUp, 
  MessageSquare, 
  ClipboardList, 
  User,
  LogOut,
  Plus,
  ShieldCheck,
  ShoppingBag,
  KeyRound,
  Users,
  ChevronLeft,
  ChevronRight,
  Receipt
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useState } from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const baseMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'order-upvotes', label: 'Order Upvotes', icon: TrendingUp },
    { id: 'buy-accounts', label: 'Buy Accounts', icon: ShoppingBag },
    { id: 'my-purchases', label: 'My Purchases', icon: KeyRound },
    { id: 'order-comments', label: 'Order Comments', icon: MessageSquare },
    // { id: 'track-upvote-orders', label: 'Track Upvote Orders', icon: ClipboardList }, // Hidden - tracking now embedded in order pages
    // { id: 'track-comment-orders', label: 'Track Comment Orders', icon: ClipboardList }, // Hidden - tracking now embedded in order pages
    { id: 'add-funds', label: 'Add Funds', icon: Plus },
    { id: 'transaction-history', label: 'Transaction History', icon: Receipt },
    { id: 'account', label: 'Account', icon: User },
  ];

  const menuItems = [...baseMenuItems];

  if (profile?.is_admin) {
    menuItems.splice(1, 0, { id: 'admin-dashboard', label: 'Admin Dashboard', icon: ShieldCheck });
    menuItems.splice(4, 0, { id: 'admin-manage-accounts', label: 'Manage Accounts', icon: Users });
    menuItems.splice(3, 0, { id: 'admin-api-key', label: 'API Key', icon: KeyRound });
  }

  return (
    <div className={collapsed ? 'w-16 bg-white shadow-lg flex flex-col' : 'w-64 bg-white shadow-lg flex flex-col'}>
      <div className="p-6 border-b flex items-center justify-between">
        <div>
          <div className={collapsed ? 'hidden' : 'flex items-center'}>
            <img 
              src="/white-bg-logo.png" 
              alt="RedditTraffic.XYZ Logo" 
              className="h-18 w-auto"
            />
          </div>
        </div>
        <button onClick={() => setCollapsed((c) => !c)} className="ml-2 p-1 rounded hover:bg-gray-100">
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
      <nav className="mt-6 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                collapsed ? 'w-full flex items-center justify-center py-3 hover:bg-gray-50 transition-colors' : 'w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 transition-colors',
                activeTab === item.id 
                  ? 'bg-orange-50 text-orange-600 border-r-2 border-orange-500' 
                  : 'text-gray-700'
              )}
            >
              <Icon className="w-5 h-5 mr-0" />
              {!collapsed && <span className="ml-3">{item.label}</span>}
            </button>
          );
        })}
      </nav>
      <div className="p-6 border-t">
        <button onClick={handleSignOut} className={collapsed ? 'flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors w-full' : 'flex items-center text-gray-500 hover:text-gray-700 transition-colors w-full'}>
          <LogOut className="w-5 h-5 mr-0" />
          {!collapsed && <span className="ml-3">Sign Out</span>}
        </button>
      </div>
    </div>
  );
};
