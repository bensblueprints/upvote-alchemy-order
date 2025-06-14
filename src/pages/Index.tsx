
import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { OrderUpvotes } from '@/components/OrderUpvotes';
import { OrderComments } from '@/components/OrderComments';
import { OrderTracking } from '@/components/OrderTracking';
import { AddFunds } from '@/components/AddFunds';
import { Account } from '@/components/Account';
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { toast } = useToast();

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get('payment_status') === 'success') {
      toast({
        title: "Payment Successful!",
        description: "Your funds have been added and should reflect in your balance shortly.",
      });
      // Clean up URL
      window.history.replaceState(null, '', window.location.pathname);
    }

    if (query.get('payment_status') === 'cancelled') {
      toast({
        title: "Payment Cancelled",
        description: "Your payment was cancelled. You have not been charged.",
        variant: "destructive"
      });
       // Clean up URL
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [toast]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'order-upvotes':
        return <OrderUpvotes />;
      case 'order-comments':
        return <OrderComments />;
      case 'order-tracking':
        return <OrderTracking />;
      case 'add-funds':
        return <AddFunds />;
      case 'account':
        return <Account />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 p-6">
        {renderContent()}
      </main>
      <Toaster />
    </div>
  );
};

export default Index;
