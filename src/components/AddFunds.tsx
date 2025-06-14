
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Star } from 'lucide-react';

export const AddFunds = () => {
  const packages = [
    {
      name: 'Starter',
      price: '$15',
      pricePerUpvote: '$0.06',
      discount: null,
      isBestValue: true,
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
      pricePerUpvote: '$0.05',
      discount: '20% discount',
      isBestValue: false,
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
      pricePerUpvote: '$0.04',
      discount: '40% discount',
      isBestValue: false,
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
      pricePerUpvote: '$0.03',
      discount: '60% discount',
      isBestValue: false,
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
      pricePerUpvote: '$0.02',
      discount: '80% discount',
      isBestValue: false,
      features: [
        'Post upvotes',
        'Post downvotes',
        'Comment upvotes',
        'Comment downvotes'
      ]
    }
  ];

  const handleSelectPackage = (packageName: string) => {
    console.log(`Selected package: ${packageName}`);
    // Handle package selection here
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add Funds</h1>
        <p className="text-gray-600 mt-2">Choose the perfect tier for your needs</p>
      </div>

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

      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Package Information</h3>
        <p className="text-gray-600 text-sm">
          All packages include access to post upvotes, post downvotes, comment upvotes, and comment downvotes. 
          The base price covers account setup and platform access, while the per-upvote fee applies to each vote ordered.
        </p>
      </div>
    </div>
  );
};
