
import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

type RedditAccount = Tables<'reddit_accounts'>;

const accountSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email address"),
  email_password: z.string().min(6, "Email password must be at least 6 characters"),
  post_karma: z.coerce.number().int().min(0),
  comment_karma: z.coerce.number().int().min(0),
  account_age_years: z.coerce.number().int().min(0),
  profile_url: z.string().url("Must be a valid Reddit profile URL").optional().or(z.literal('')),
  buy_price: z.coerce.number().min(0),
  sell_price: z.coerce.number().min(0),
});

const fetchAdminAccounts = async () => {
  const { data, error } = await supabase.from('reddit_accounts').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const AdminRedditAccounts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: accounts, isLoading } = useQuery<RedditAccount[]>({
    queryKey: ['adminRedditAccounts'],
    queryFn: fetchAdminAccounts,
    enabled: !!user,
  });

  const addAccountMutation = useMutation({
    mutationFn: async (newAccount: Omit<TablesInsert<'reddit_accounts'>, 'created_by_admin_id'>) => {
      if (!user) throw new Error("User not authenticated");
      const { error } = await supabase.from('reddit_accounts').insert({ ...newAccount, created_by_admin_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Reddit account added for sale." });
      queryClient.invalidateQueries({ queryKey: ['adminRedditAccounts'] });
      form.reset();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: `Failed to add account: ${error.message}`, variant: 'destructive' });
    }
  });

  const form = useForm<z.infer<typeof accountSchema>>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      username: "", password: "", email: "", email_password: "",
      post_karma: 0, comment_karma: 0, account_age_years: 0,
      profile_url: "", buy_price: 0, sell_price: 0,
    },
  });

  function onSubmit(values: z.infer<typeof accountSchema>) {
    addAccountMutation.mutate(values);
  }
  
  const profitStats = useMemo(() => {
    if (!accounts) return { totalRevenue: 0, totalCost: 0, totalProfit: 0, totalSold: 0 };
    const soldAccounts = accounts.filter(acc => acc.status === 'sold');
    const totalRevenue = soldAccounts.reduce((sum, acc) => sum + (acc.sell_price || 0), 0);
    const totalCost = soldAccounts.reduce((sum, acc) => sum + (acc.buy_price || 0), 0);
    return {
      totalRevenue,
      totalCost,
      totalProfit: totalRevenue - totalCost,
      totalSold: soldAccounts.length,
    }
  }, [accounts]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manage Reddit Accounts</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${profitStats.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${profitStats.totalCost.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${profitStats.totalProfit.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accounts Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profitStats.totalSold}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Reddit Account</CardTitle>
          <CardDescription>Enter the details of the account to list it for sale.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="username" render={({ field }) => ( <FormItem> <FormLabel>Username</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="password" render={({ field }) => ( <FormItem> <FormLabel>Password</FormLabel> <FormControl><Input type="password" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="email" render={({ field }) => ( <FormItem> <FormLabel>Email</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="email_password" render={({ field }) => ( <FormItem> <FormLabel>Email Password</FormLabel> <FormControl><Input type="password" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="post_karma" render={({ field }) => ( <FormItem> <FormLabel>Post Karma</FormLabel> <FormControl><Input type="number" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="comment_karma" render={({ field }) => ( <FormItem> <FormLabel>Comment Karma</FormLabel> <FormControl><Input type="number" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="account_age_years" render={({ field }) => ( <FormItem> <FormLabel>Account Age (Years)</FormLabel> <FormControl><Input type="number" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="profile_url" render={({ field }) => ( <FormItem> <FormLabel>Profile URL</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="buy_price" render={({ field }) => ( <FormItem> <FormLabel>Buy Price ($)</FormLabel> <FormControl><Input type="number" step="0.01" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="sell_price" render={({ field }) => ( <FormItem> <FormLabel>Sell Price ($)</FormLabel> <FormControl><Input type="number" step="0.01" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
              </div>
              <Button type="submit" disabled={addAccountMutation.isPending}>
                {addAccountMutation.isPending ? 'Adding Account...' : 'Add Account'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Listed Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sell Price</TableHead>
                <TableHead>Total Karma</TableHead>
                <TableHead>Added On</TableHead>
                <TableHead>Sold On</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && <TableRow><TableCell colSpan={6}>Loading accounts...</TableCell></TableRow>}
              {accounts?.map(acc => (
                <TableRow key={acc.id}>
                  <TableCell>{acc.username}</TableCell>
                  <TableCell>
                    <Badge variant={acc.status === 'sold' ? 'destructive' : 'default'}>{acc.status}</Badge>
                  </TableCell>
                  <TableCell>${acc.sell_price}</TableCell>
                  <TableCell>{acc.total_karma}</TableCell>
                  <TableCell>{format(new Date(acc.created_at), 'PP')}</TableCell>
                  <TableCell>{acc.sold_at ? format(new Date(acc.sold_at), 'PP') : 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
