import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Homepage() {
  return (
    <div className="max-w-4xl mx-auto py-12">
      {/* Hero Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-4xl font-bold">Unlock the Power of Reddit</CardTitle>
          <CardDescription className="text-lg mt-2">Get Real Upvotes, Comments, and Results. Grow your influence, boost your posts, and dominate Reddit with our proven network.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/auth">
            <Button size="lg" className="mt-4">Get Started</Button>
          </Link>
        </CardContent>
      </Card>

      {/* Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Viral Potential</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Reddit is home to the world's largest communities. Go viral and reach millions with the right boost.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Real Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Our network delivers real upvotes and comments from real users. No bots, no fakes.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Guaranteed Delivery</CardTitle>
          </CardHeader>
          <CardContent>
            <p>We guarantee your order is delivered fast and reliably, or your money back.</p>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal ml-6 space-y-2">
            <li>Sign up and connect your Reddit post or comment.</li>
            <li>Choose your service (upvotes, comments, etc.).</li>
            <li>Watch your post rise—guaranteed delivery, real results.</li>
          </ol>
        </CardContent>
      </Card>

      {/* Story/Trust */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Our Story</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Our founder was a Reddit power user who saw the need for real, reliable growth. Now, we help thousands succeed on Reddit every month. Trusted by marketers, entrepreneurs, and influencers worldwide.</p>
        </CardContent>
      </Card>

      {/* Reviews */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent>
              <p>"I got 100 upvotes in 24 hours and my post hit the front page!"</p>
              <span className="block mt-2 font-semibold">— Sarah, r/Entrepreneur</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p>"The only service that actually works."</p>
              <span className="block mt-2 font-semibold">— Mike, r/Marketing</span>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Consultation Offer */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Free Reddit Marketing Consultation</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Want a custom Reddit marketing plan? Book a free consultation with our experts and get a strategy tailored to your goals.</p>
          <Button className="mt-4">Book a Consultation</Button>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            <li><strong>Is this safe?</strong> Yes, we use proven methods and real users to ensure your account stays safe.</li>
            <li><strong>How fast is delivery?</strong> Most orders start within minutes and complete within hours.</li>
            <li><strong>Can I target specific subreddits?</strong> Yes, just provide the link to your post or comment in any subreddit.</li>
          </ul>
        </CardContent>
      </Card>

      {/* Final CTA */}
      <div className="text-center mt-12">
        <Link to="/auth">
          <Button size="lg">Ready to Grow? Join Now</Button>
        </Link>
      </div>
    </div>
  );
} 