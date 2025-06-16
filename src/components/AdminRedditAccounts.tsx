
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, PlusCircle } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

// Use the generated type from Supabase
type RedditAccount = Tables<'reddit_accounts'>;

const accountSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  email_password: z.string().min(1, 'Email password is required'),
  post_karma: z.coerce.number().int().min(0),
  comment_karma: z.coerce.number().int().min(0),
  account_age_years: z.coerce.number().min(0).nullable(),
  profile_url: z.string().url().or(z.literal('')).nullable(),
  buy_price: z.coerce.number().min(0),
  sell_price: z.coerce.number().min(0),
});

async function fetchAccounts(): Promise<RedditAccount[]> {
  const { data, error } = await supabase
    .from('reddit_accounts')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw new Error(error.message);
  return data || [];
}

export const AdminRedditAccounts = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: accounts, isLoading } = useQuery<RedditAccount[]>({ 
    queryKey: ['reddit_accounts'], 
    queryFn: fetchAccounts 
  });
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof accountSchema>>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      username: '',
      password: '',
      email: '',
      email_password: '',
      post_karma: 0,
      comment_karma: 0,
      account_age_years: 0,
      profile_url: '',
      buy_price: 0,
      sell_price: 0,
    },
  });

  const addAccountMutation = useMutation({
    mutationFn: async (values: z.infer<typeof accountSchema>) => {
      if (!user) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('reddit_accounts')
        .insert({ ...values, created_by_admin_id: user.id })
        .select();
      
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reddit_accounts'] });
      toast({ title: 'Success', description: 'Reddit account added successfully.' });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const onSubmit = (values: z.infer<typeof accountSchema>) => {
    addAccountMutation.mutate(values);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Reddit Accounts</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Reddit Account</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-2">
                <FormField control={form.control} name="username" render={({ field }) => ( <FormItem><FormLabel>Username</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="password" render={({ field }) => ( <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="email_password" render={({ field }) => ( <FormItem><FormLabel>Email Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="post_karma" render={({ field }) => ( <FormItem><FormLabel>Post Karma</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="comment_karma" render={({ field }) => ( <FormItem><FormLabel>Comment Karma</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )} />
                </div>
                <FormField control={form.control} name="profile_url" render={({ field }) => ( <FormItem><FormLabel>Profile URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                 <FormField control={form.control} name="account_age_years" render={({ field }) => ( <FormItem><FormLabel>Account Age (Years)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="buy_price" render={({ field }) => ( <FormItem><FormLabel>Buy Price ($)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="sell_price" render={({ field }) => ( <FormItem><FormLabel>Sell Price ($)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem> )} />
                </div>
                <DialogFooter className="pt-4">
                  <Button type="submit" disabled={addAccountMutation.isPending}>
                    {addAccountMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add Account
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Total Karma</TableHead>
              <TableHead>Sell Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
            ) : accounts?.map((account) => (
              <TableRow key={account.id}>
                <TableCell>{account.username}</TableCell>
                <TableCell>{account.total_karma}</TableCell>
                <TableCell>${account.sell_price}</TableCell>
                <TableCell><span className={`px-2 py-1 rounded-full text-xs font-medium ${account.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{account.status}</span></TableCell>
                <TableCell>{new Date(account.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
