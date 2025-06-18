import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  ChevronDown, 
  Users, 
  Rocket, 
  Headphones, 
  ShoppingCart, 
  ArrowRight, 
  Menu, 
  X,
  ArrowDown,
  Plane,
  Info,
  Send
} from 'lucide-react';

export default function Homepage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openFaqItems, setOpenFaqItems] = useState<number[]>([]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleFaqItem = (index: number) => {
    setOpenFaqItems(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index)
        : [...prev, index]
    );
  };

  const faqItems = [
    {
      question: "How does RedditTraffic.XYZ ensure authentic engagement?",
      answer: "We utilize a network of real, established Reddit users to provide upvotes and comments. This ensures the engagement appears natural and organic, crucial for maintaining your post's integrity on Reddit."
    },
    {
      question: "What is your delivery timeframe?",
      answer: "Delivery typically begins within minutes of your order confirmation and is completed within a few hours, depending on the volume purchased. Our goal is to provide rapid results."
    },
    {
      question: "Can I purchase upvotes for any subreddit?",
      answer: "Yes, you can purchase upvotes for posts in any public subreddit. We recommend ensuring your content adheres to the specific subreddit's rules for optimal results."
    },
    {
      question: "Is my Reddit account safe when using your services?",
      answer: "Your account's safety is our top priority. We do not require your login credentials, only the public link to your post. Our methods are designed to be discreet and minimize any risk."
    },
    {
      question: "What types of comments can I receive?",
      answer: "For comments, you can specify themes or keywords, and our network will provide natural-sounding, relevant comments to enhance discussion and authenticity on your post."
    },
    {
      question: "Do you offer a money-back guarantee?",
      answer: "We do not offer direct refunds. However, if upvotes are not delivered as promised, the equivalent value will be credited to your wallet for future use on our services."
    },
    {
      question: "What's included in a custom strategy consultation?",
      answer: "Our consultations provide a personalized Reddit marketing strategy, including content creation tips, timing optimization, subreddit targeting, and long-term engagement tactics tailored to your objectives."
    },
    {
      question: "How can I contact customer support?",
      answer: "Our customer support team is available 24/7 via email at reddittrafficxyz@gmail.com, or you can reach out to @rootaccessagency for specific inquiries."
    }
  ];

  const pricingPackages = [
    { price: "$10", perUpvote: "$0.10", upvotes: "100", description: "for 100 Upvotes" },
    { price: "$25", perUpvote: "$0.08", upvotes: "275", description: "for 275 Upvotes" },
    { price: "$50", perUpvote: "$0.07", upvotes: "625", description: "for 625 Upvotes", popular: true },
    { price: "$100", perUpvote: "$0.065", upvotes: "1333", description: "for 1333 Upvotes" },
    { price: "$200", perUpvote: "$0.06", upvotes: "2857", description: "for 2857 Upvotes" },
    { price: "$500", perUpvote: "$0.05", upvotes: "8333", description: "for 8333 Upvotes", consultation: true },
    { price: "$1000", perUpvote: "$0.04", upvotes: "20000", description: "for 20000 Upvotes", consultation: true },
    { price: "$3000", perUpvote: "$0.035", upvotes: "75000", description: "for 75000 Upvotes", consultation: true }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black text-white p-4 shadow-lg sticky top-0 z-50">
        <nav className="container mx-auto flex justify-between items-center py-2">
          <div className="flex items-center space-x-3">
            <img src="/reddit-logo.png" alt="RedditTraffic.XYZ Logo" className="h-10 w-auto rounded-full" />
          </div>
          <div className="hidden md:flex space-x-4 items-center">
            <Link to="/auth" className="bg-blue-600 text-white py-2 px-6 rounded-full font-semibold hover:bg-blue-700 transition duration-300 shadow-md">
              Upvote Panel
            </Link>
            <a href="#contact" className="bg-orange-500 text-white py-2 px-6 rounded-full font-semibold hover:bg-orange-600 transition duration-300 shadow-md">
              Book A Consultation
            </a>
          </div>
          <button className="md:hidden text-white focus:outline-none" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-black px-4 py-2 rounded-lg shadow-inner mt-2">
            <Link 
              to="/auth" 
              className="block bg-blue-600 text-white text-center py-2 px-6 rounded-full font-semibold hover:bg-blue-700 transition duration-300 mt-4"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Upvote Panel
            </Link>
            <a 
              href="#contact" 
              className="block bg-orange-500 text-white text-center py-2 px-6 rounded-full font-semibold hover:bg-orange-600 transition duration-300 mt-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Book A Consultation
            </a>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="bg-black text-white py-24 md:py-36 flex items-center justify-center min-h-screen">
        <div className="container mx-auto text-center px-4 max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            Instantly Boost Your Reddit Presence
          </h1>
          <p className="text-lg md:text-xl mb-10 opacity-90">
            Get real Reddit upvotes and comments delivered fast. Elevate your posts, increase visibility, and go viral.
          </p>
          <Link to="/auth" className="inline-flex items-center bg-orange-500 text-white font-bold py-5 px-10 rounded-full shadow-lg hover:bg-orange-600 transition duration-300 transform hover:scale-105 text-2xl">
            View Our Services <ArrowDown className="ml-3 w-6 h-6" />
          </Link>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-12 text-black">Our Powerful Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Reddit Upvotes */}
            <Card className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center text-center transition duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-2xl">
              <div className="text-orange-500 text-6xl mb-6">
                <ChevronDown className="w-16 h-16 rotate-180" />
              </div>
              <CardTitle className="text-2xl font-bold mb-4">Reddit Upvotes</CardTitle>
              <CardContent className="p-0">
                <p className="text-gray-600 mb-6">Increase your post's visibility and ranking instantly with high-quality upvotes from real users.</p>
                <Link to="/auth" className="inline-flex items-center bg-orange-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-orange-600 transition duration-300 transform hover:scale-105">
                  Buy Upvotes <ShoppingCart className="ml-2 w-4 h-4" />
                </Link>
              </CardContent>
            </Card>

            {/* Reddit Comments */}
            <Card className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center text-center transition duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-2xl">
              <div className="text-blue-600 text-6xl mb-6">
                <Send className="w-16 h-16" />
              </div>
              <CardTitle className="text-2xl font-bold mb-4">Reddit Comments</CardTitle>
              <CardContent className="p-0">
                <p className="text-gray-600 mb-6">Drive engaging discussions and add authenticity to your posts with genuine comments.</p>
                <Link to="/auth" className="inline-flex items-center bg-orange-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-orange-600 transition duration-300 transform hover:scale-105">
                  Buy Comments <ShoppingCart className="ml-2 w-4 h-4" />
                </Link>
              </CardContent>
            </Card>

            {/* Aged Reddit Accounts */}
            <Card className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center text-center transition duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-2xl">
              <div className="text-blue-600 text-6xl mb-6">
                <Users className="w-16 h-16" />
              </div>
              <CardTitle className="text-2xl font-bold mb-4">Aged Reddit Accounts</CardTitle>
              <CardContent className="p-0">
                <p className="text-gray-600 mb-6">Access high-karma, aged Reddit accounts for various marketing needs and community engagement.</p>
                                 <Link to="/auth" className="inline-flex items-center bg-blue-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105">
                   Inquire Now <Info className="ml-2 w-4 h-4" />
                 </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-black text-white" id="pricing">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-12">Flexible Pricing for Upvotes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pricingPackages.map((pkg, index) => (
              <Card key={index} className={`p-8 rounded-2xl shadow-xl flex flex-col items-center transition duration-300 transform hover:scale-105 relative ${pkg.popular ? 'bg-orange-500 text-white border-b-8 border-white' : 'bg-white text-black border-t-8 border-orange-500'}`}>
                {pkg.popular && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </span>
                )}
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-2xl font-bold">{pkg.price} Package</CardTitle>
                </CardHeader>
                <CardContent className="p-0 text-center">
                  <p className="text-4xl font-extrabold mb-2">{pkg.perUpvote}/Upvote</p>
                  <p className="text-lg mb-6">{pkg.description}</p>
                  {pkg.consultation && (
                    <p className="text-md font-semibold text-green-600 mt-4">Includes 30-min Reddit Consultation</p>
                  )}
                  <Link to="/auth" className={`w-full inline-block text-center py-3 px-6 rounded-full font-bold transition duration-300 mt-auto ${pkg.popular ? 'bg-white text-orange-500 hover:bg-gray-100' : 'bg-orange-500 text-white hover:bg-orange-600'}`}>
                    Order Now
                  </Link>
                </CardContent>
              </Card>
            ))}

            {/* Enterprise Package */}
            <Card className="bg-blue-600 text-white p-8 rounded-2xl shadow-xl flex flex-col items-center border-b-8 border-white transition duration-300 transform hover:scale-105 relative col-span-full lg:col-span-4">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-3xl font-bold">Enterprise Package</CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-center">
                <p className="text-5xl font-extrabold mb-2">$5000+</p>
                <p className="text-lg mb-6">Custom solutions for large-scale needs.</p>
                <p className="text-md font-semibold text-white mt-4">Includes dedicated strategy and support.</p>
                <a href="https://t.me/rootaccessagency" className="w-full max-w-md mx-auto inline-flex items-center justify-center bg-white text-blue-600 font-bold py-3 px-6 rounded-full shadow-lg hover:bg-gray-100 transition duration-300 mt-4">
                  Let's Talk <Send className="ml-2 w-4 h-4" />
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Aged Reddit Accounts Section */}
      <section className="py-16 bg-white" id="aged-accounts">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-12 text-black">
            🔥 Aged Reddit Accounts for Sale — Starting at Just $12
          </h2>
          <p className="text-lg md:text-xl mb-10 text-gray-600 max-w-3xl mx-auto">
            Looking to skip the warm-up phase and hit the ground running on Reddit? We've got aged accounts ready to go — from 6 months to 15+ years old.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
            <Card className="bg-gray-100 p-8 rounded-2xl shadow-md transition duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-2xl">
              <div className="text-orange-500 text-5xl mb-4 flex justify-center">
                <Rocket className="w-12 h-12" />
              </div>
              <CardTitle className="text-2xl font-bold mb-4">Instant Access – Best Price, Limited Selection</CardTitle>
              <CardContent className="p-0">
                <p className="text-gray-600 mb-6">
                  Get aged accounts at the best possible price from our live feed. The selection rotates fast, so act quick. Just pick from the list, and we'll handle the rest.
                </p>
                <Link to="/auth" className="inline-flex items-center bg-orange-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-orange-600 transition duration-300">
                  Check Live Stock <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </CardContent>
            </Card>
            <Card className="bg-gray-100 p-8 rounded-2xl shadow-md transition duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-2xl">
              <div className="text-blue-600 text-5xl mb-4 flex justify-center">
                <Users className="w-12 h-12" />
              </div>
              <CardTitle className="text-2xl font-bold mb-4">Custom Request – Tell Us What You Want</CardTitle>
              <CardContent className="p-0">
                <p className="text-gray-600 mb-6">
                  Need something specific? Username style, karma range, age bracket — tell us your vibe. We'll shop the underground Reddit streets for you.
                </p>
                <a href="https://t.me/rootaccessagency" className="inline-flex items-center bg-blue-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-blue-700 transition duration-300">
                  Make a Custom Request <Send className="ml-2 w-4 h-4" />
                </a>
              </CardContent>
            </Card>
          </div>
          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-4 text-black">🧠 How to Order:</h3>
            <p className="text-lg text-gray-600 mb-8">
              Just message us on <a href="https://t.me/rootaccessagency" className="text-blue-600 hover:underline font-semibold">Telegram</a>. We'll walk you through it.
            </p>
            <p className="text-gray-500 text-sm italic">
              💬 Trusted by hundreds of stealthy marketers, spinners, and shillers.
            </p>
          </div>
        </div>
      </section>

      {/* Custom Comments Section */}
      <section className="py-16 bg-gray-50" id="custom-comments">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-12 text-black">
            💬 Buy Custom Reddit Comments — From Just $5
          </h2>
          <p className="text-lg md:text-xl mb-10 text-gray-600 max-w-3xl mx-auto">
            Need comments that blend in and boost engagement? You can purchase custom Reddit comments directly from our panel.
          </p>
          <div className="max-w-4xl mx-auto text-left space-y-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-black">🧠 Why Go Custom?</h3>
              <p className="text-gray-600">
                Generic bots are easy to spot. Our comments are handwritten, aged, and tailored to your niche or post — which gives them way more weight in Reddit's algorithm.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-4 text-black">🔒 Want aged accounts to post your comments?</h3>
              <p className="text-gray-600">
                We got those too. Comments posted from aged sockpuppets = max credibility + staying power.
              </p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-orange-500 mb-6">Pricing starts at just $5 per comment. Bulk deals available.</p>
              <a href="https://t.me/rootaccessagency" className="inline-flex items-center bg-orange-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-orange-600 transition duration-300">
                DM us on Telegram to get started <Send className="ml-2 w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-12 text-black">Why Choose RedditTraffic.XYZ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg text-center">
              <Users className="text-orange-500 w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Real & Authentic Engagement</h3>
              <p className="text-gray-600">Our network consists of real, active Reddit users, ensuring genuine engagement that looks natural.</p>
            </div>
            <div className="p-6 rounded-lg text-center">
              <Rocket className="text-blue-600 w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Blazing Fast Delivery</h3>
              <p className="text-gray-600">Receive your upvotes and comments swiftly, helping your posts gain traction when it matters most.</p>
            </div>
            <div className="p-6 rounded-lg text-center">
              <Headphones className="text-green-500 w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">24/7 Customer Support</h3>
              <p className="text-gray-600">Our dedicated support team is always available to assist you with any questions or issues.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-12 text-black">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="flex flex-col items-center">
              <div className="bg-orange-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-3xl font-bold mb-4 shadow-lg">1</div>
              <h3 className="text-xl font-semibold mb-2">Select Your Service</h3>
              <p className="text-gray-600">Choose the upvote or comment package that fits your needs from our offerings.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-3xl font-bold mb-4 shadow-lg">2</div>
              <h3 className="text-xl font-semibold mb-2">Provide Your Link</h3>
              <p className="text-gray-600">Simply give us the URL to your Reddit post or comment you wish to boost.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-black text-white rounded-full w-16 h-16 flex items-center justify-center text-3xl font-bold mb-4 shadow-lg">3</div>
              <h3 className="text-xl font-semibold mb-2">Watch Your Post Rise</h3>
              <p className="text-gray-600">See your content gain traction and rise in visibility within minutes!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-extrabold text-center mb-12 text-black">What Our Customers Are Saying</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="bg-white p-8 rounded-2xl shadow-md">
              <CardContent className="p-0">
                <p className="text-lg italic text-gray-700 mb-4">"Absolutely incredible! My post reached the front page in hours, something I never thought possible. RedditTraffic.XYZ is the real deal."</p>
                <p className="font-semibold text-orange-500">— Jessica L., Small Business Owner</p>
              </CardContent>
            </Card>
            <Card className="bg-white p-8 rounded-2xl shadow-md">
              <CardContent className="p-0">
                <p className="text-lg italic text-gray-700 mb-4">"I've tried other services, but the quality of engagement here is unmatched. Real comments and a noticeable boost. Highly recommend!"</p>
                <p className="font-semibold text-orange-500">— Mark T., Digital Marketer</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-extrabold text-center mb-12 text-black">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 max-w-5xl mx-auto">
            {faqItems.map((item, index) => (
              <div key={index} className="bg-gray-100 rounded-lg shadow-sm">
                <button
                  onClick={() => toggleFaqItem(index)}
                  className="flex justify-between items-center p-5 w-full text-left cursor-pointer text-lg font-semibold text-black hover:bg-gray-200 transition duration-200 rounded-lg"
                >
                  {item.question}
                  <ChevronDown className={`w-5 h-5 transform transition-transform duration-300 ${openFaqItems.includes(index) ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaqItems.includes(index) ? 'max-h-screen' : 'max-h-0'}`}>
                  <div className="p-5 pt-0 text-gray-600">
                    <div className="pt-2 border-t border-gray-200">
                      {item.answer}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-orange-500 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6">Ready to Dominate Reddit?</h2>
          <p className="text-xl mb-10">Contact us today for a free consultation or to discuss your specific needs.</p>
                     <Link to="/auth" className="inline-flex items-center bg-white text-orange-500 font-bold py-4 px-10 rounded-full shadow-lg hover:bg-gray-100 transition duration-300 transform hover:scale-105 text-xl">
             Get Started Now <Plane className="ml-2 w-5 h-5" />
           </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4 space-x-4">
            <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
            <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
            <a href="#" className="text-blue-600 hover:underline">Refund Policy</a>
          </div>
          <p className="text-gray-400">&copy; 2025 RedditTraffic.XYZ. All rights reserved. Not affiliated with Reddit Inc.</p>
        </div>
      </footer>
    </div>
  );
} 