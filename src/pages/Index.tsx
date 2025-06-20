import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { OrderUpvotes } from '@/components/OrderUpvotes';
import { OrderComments, CommentOrderTracking } from '@/components/OrderComments';
import { OrderTracking } from '@/components/OrderTracking';
import { AddFunds } from '@/components/AddFunds';
import { Account } from '@/components/Account';
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { useProfile } from '@/hooks/useProfile';
import { AdminDashboard } from '@/components/AdminDashboard';
import { BuyRedditAccounts } from '@/components/BuyRedditAccounts';
import { AdminRedditAccounts } from '@/components/AdminRedditAccounts';
import { MyPurchasedAccounts } from '@/components/MyPurchasedAccounts';
import { ApiKeySettings } from '@/components/ApiKeySettings';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: profile } = useProfile();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    
    // Handle payment status first
    if (query.get('payment_status') === 'success') {
      const amount = query.get('amount');
      toast({
        title: "Payment Successful!",
        description: amount 
          ? `$${amount} has been successfully added to your balance.`
          : "Your funds have been added and should reflect in your balance shortly.",
      });
      // Set dashboard tab immediately and clean up URL
      setActiveTab('dashboard');
      navigate('/dashboard', { replace: true });
      return; // Exit early to prevent other tab logic
    }

    if (query.get('payment_status') === 'cancelled') {
      toast({
        title: "Payment Cancelled",
        description: "Your payment was cancelled. You have not been charged.",
        variant: "destructive"
      });
      // Clean up URL
      navigate('/dashboard', { replace: true });
      return; // Exit early
    }

    // Only handle tab parameter if not a payment status redirect
    const tab = query.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.search, navigate, toast]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'admin-dashboard':
        return profile?.is_admin ? <AdminDashboard /> : <Dashboard />;
      case 'admin-manage-accounts':
        return profile?.is_admin ? <AdminRedditAccounts /> : <Dashboard />;
      case 'buy-accounts':
        return <BuyRedditAccounts />;
      case 'my-purchases':
        return <MyPurchasedAccounts />;
      case 'order-upvotes':
        return <OrderUpvotes />;
      case 'order-comments':
        return <OrderComments />;
      case 'track-upvote-orders':
        return <OrderTracking />;
      case 'track-comment-orders':
        return <CommentOrderTracking />;
      case 'order-tracking':
        return <OrderTracking />;
      case 'add-funds':
        return <AddFunds />;
      case 'account':
        return <Account />;
      case 'admin-api-key':
        return profile?.is_admin ? <ApiKeySettings /> : <Dashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
      <Toaster />
    </div>
  );
};

export default Index;
