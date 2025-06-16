
-- Create a 'transactions' table to log all deposits and purchases
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- e.g., 'deposit', 'purchase'
  amount NUMERIC(10, 2) NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row-Level Security on the 'transactions' table
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow users to view their own transactions
CREATE POLICY "select_own_transactions" ON public.transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create a policy to allow server-side functions to insert transactions
CREATE POLICY "insert_transactions_service" ON public.transactions
  FOR INSERT
  WITH CHECK (true);
