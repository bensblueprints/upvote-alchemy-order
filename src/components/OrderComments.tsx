
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { usePageTitle } from '@/hooks/usePageTitle';
import { api } from '@/lib/api';

export const OrderComments = () => {
  const [formData, setFormData] = useState({
    link: '',
    content: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  usePageTitle('Order Comments');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await api.submitCommentOrder({
        link: formData.link,
        content: formData.content,
      });

      if (response.success && response.data?.order_number) {
        toast({
          title: 'Comment Order Submitted!',
          description: `Order #${response.data.order_number} has been created.`,
        });
        setFormData({ link: '', content: '' });
      } else {
        throw new Error(response.message || 'Failed to submit comment order');
      }
    } catch (error) {
      console.error('Comment order submission error:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit comment order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Order Comments</h1>
        <p className="text-gray-600 mt-2">Submit custom comment orders for Reddit posts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Submit Comment Order</CardTitle>
            <CardDescription>
              Create a custom comment or reply on Reddit posts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="link">Reddit Link</Label>
                <Textarea
                  id="link"
                  placeholder="https://www.reddit.com/r/example/comments/..."
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="min-h-[80px]"
                  required
                />
                <p className="text-sm text-gray-500">
                  Link to the Reddit post or comment where you want to add a comment
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Comment Content</Label>
                <Textarea
                  id="content"
                  placeholder="Enter your comment text here..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="min-h-[150px]"
                  required
                />
                <div className="text-sm text-gray-500 space-y-1">
                  <p>• Use [newline] to create line breaks</p>
                  <p>• Use [link text](https://yourlink.com) to add links</p>
                  <p>• Keep content relevant and follow Reddit's community guidelines</p>
                </div>
              </div>

              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Comment Order'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comment Guidelines</CardTitle>
            <CardDescription>Best practices for effective comments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">✓ Do</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Write natural, engaging comments</li>
                <li>• Follow subreddit rules</li>
                <li>• Add value to discussions</li>
                <li>• Use proper grammar</li>
              </ul>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">✗ Don't</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Post spam or promotional content</li>
                <li>• Use offensive language</li>
                <li>• Violate Reddit's terms</li>
                <li>• Create duplicate comments</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800">Pricing</h4>
              <p className="text-sm text-blue-600">$2.50 per comment</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
