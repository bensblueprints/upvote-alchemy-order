
import { useProfile } from '@/hooks/useProfile';
import { Wallet, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const formatCurrency = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined) {
    return '$0.00';
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount));
};

export const Header = () => {
  const { data: profile, isLoading: isLoadingProfile } = useProfile();

  return (
    <header className="p-4 border-b bg-white flex justify-end sticky top-0 z-10">
      <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg w-fit">
        <CardContent className="p-3">
          <div className="flex items-center space-x-3">
            <Wallet className="w-6 h-6" />
            <div>
              <p className="text-orange-100 text-xs">Available Balance</p>
              {isLoadingProfile ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <p className="text-xl font-bold">{formatCurrency(profile?.balance)}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </header>
  );
};
