
import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { OrderUpvotes } from '@/components/OrderUpvotes';
import { OrderComments } from '@/components/OrderComments';
import { OrderTracking } from '@/components/OrderTracking';
import { Account } from '@/components/Account';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

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
    </div>
  );
};

export default Index;
