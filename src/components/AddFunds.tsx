
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Star, CreditCard, Bitcoin } from 'lucide-react';

export const AddFunds = () => {
  const [depositAmount, setDepositAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'crypto'>('credit');

  const packages = [
    {
      name: 'Starter',
      price: '$15',
      pricePerUpvote: '$0.20',
      discount: null,
      isBestValue: true,
      minAmount: 15,
      maxAmount: 99,
      features: [
        'Post upvotes',
        'Post downvotes',
        'Comment upvotes',
        'Comment downvotes'
      ]
    },
    {
      name: 'Basic',
      price: '$100',
      pricePerUpvote: '$0.10',
      discount: '20% discount',
      isBestValue: false,
      minAmount: 100,
      maxAmount: 249,
      features: [
        'Post upvotes',
        'Post downvotes',
        'Comment upvotes',
        'Comment downvotes'
      ]
    },
    {
      name: 'Standard',
      price: '$250',
      pricePerUpvote: '$0.08',
      discount: '40% discount',
      isBestValue: false,
      minAmount: 250,
      maxAmount: 749,
      features: [
        'Post upvotes',
        'Post downvotes',
        'Comment upvotes',
        'Comment downvotes'
      ]
    },
    {
      name: 'Pro',
      price: '$750',
      pricePerUpvote: '$0.06',
      discount: '60% discount',
      isBestValue: false,
      minAmount: 750,
      maxAmount: 999,
      features: [
        'Post upvotes',
        'Post downvotes',
        'Comment upvotes',
        'Comment downvotes'
      ]
    },
    {
      name: 'Elite',
      price: '$1000',
      pricePerUpvote: '$0.04',
      discount: '80% discount',
      isBestValue: false,
      minAmount: 1000,
      maxAmount: Infinity,
      features: [
        'Post upvotes',
        'Post downvotes',
        'Comment upvotes',
        'Comment downvotes'
      ]
    }
  ];

  const getApplicableTier = (amount: number) => {
    return packages.find(pkg => amount >= pkg.minAmount && amount <= pkg.maxAmount) || packages[0];
  };

  const calculateUpvotes = (amount: number) => {
    const tier = getApplicableTier(amount);
    const pricePerUpvote = parseFloat(tier.pricePerUpvote.replace('$', ''));
    return Math.floor(amount / pricePerUpvote);
  };

  const handleSelectPackage = (packageName: string) => {
    console.log(`Selected package: ${packageName}`);
    // Handle package selection here
  };

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (amount && amount >= 15) {
      const tier = getApplicableTier(amount);
      console.log(`Depositing $${amount} with ${tier.name} tier pricing using ${paymentMethod} payment`);
      // Handle deposit here
    }
  };

  const depositAmountNum = parseFloat(depositAmount) || 0;
  const applicableTier = depositAmountNum >= 15 ? getApplicableTier(depositAmountNum) : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add Funds</h1>
        <p className="text-gray-600 mt-2">Choose the perfect tier for your needs</p>
      </div>

      {/* Wallet Deposit Section */}
      <Card className="border-2 border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-center">Add to Wallet</CardTitle>
          <CardDescription className="text-center">
            Enter your deposit amount below to calculate how many upvotes it will convert into:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Method Selection */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Customize your payment below:</Label>
            <div className="flex gap-4">
              <button
                onClick={() => setPaymentMethod('credit')}
                className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                  paymentMethod === 'credit' 
                    ? 'border-orange-500 bg-orange-100 text-orange-700' 
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                Credit Card
              </button>
              <button
                onClick={() => setPaymentMethod('crypto')}
                className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                  paymentMethod === 'crypto' 
                    ? 'border-orange-500 bg-orange-100 text-orange-700' 
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <Bitcoin className="w-5 h-5" />
                Cryptocurrency
              </button>
            </div>
          </div>

          {/* Deposit Amount Input */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold">$</span>
              <Input
                type="number"
                placeholder="Deposit amount"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="text-xl font-semibold h-12"
                min="15"
              />
              <Button 
                onClick={handleDeposit}
                disabled={!depositAmount || parseFloat(depositAmount) < 15}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 h-12"
              >
                Calculate
              </Button>
            </div>
            
            {depositAmountNum >= 15 && applicableTier && (
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-center space-y-2">
                  <p className="text-lg">
                    <span className="font-semibold">${depositAmountNum}</span> will get you approximately{' '}
                    <span className="font-bold text-orange-600">{calculateUpvotes(depositAmountNum)} upvotes</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Using {applicableTier.name} tier pricing ({applicableTier.pricePerUpvote}/upvote)
                    {applicableTier.discount && (
                      <span className="text-green-600 font-medium"> • {applicableTier.discount}</span>
                    )}
                  </p>
                </div>
              </div>
            )}
            
            {depositAmount && parseFloat(depositAmount) < 15 && (
              <div className="text-red-500 text-sm text-center">
                Minimum deposit amount is $15
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pricing Tiers */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Or choose a preset package</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {packages.map((pkg) => (
            <Card 
              key={pkg.name} 
              className={`relative ${pkg.isBestValue ? 'border-2 border-orange-500 shadow-lg' : 'border border-gray-200'}`}
            >
              {pkg.isBestValue && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    Best Value
                  </div>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl font-bold">{pkg.name}</CardTitle>
                <div className="mt-2">
                  <div className="text-3xl font-bold text-gray-900">
                    {pkg.price}
                    <span className="text-lg font-normal text-gray-600"> +</span>
                  </div>
                  <div className="text-lg font-semibold text-orange-600">
                    {pkg.pricePerUpvote}/upvote
                  </div>
                  {pkg.discount && (
                    <div className="text-sm text-green-600 font-medium mt-1">
                      {pkg.discount}
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <ul className="space-y-3">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full mt-6 ${
                    pkg.isBestValue 
                      ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                  onClick={() => handleSelectPackage(pkg.name)}
                >
                  Select {pkg.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Package Information</h3>
        <p className="text-gray-600 text-sm">
          All packages include access to post upvotes, post downvotes, comment upvotes, and comment downvotes. 
          The base price covers account setup and platform access, while the per-upvote fee applies to each vote ordered.
          Deposit any amount above $15 and automatically get the best tier pricing for that range.
        </p>
      </div>
    </div>
  );
};
