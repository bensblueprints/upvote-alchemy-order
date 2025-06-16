
-- Create an 'orders' table to track payment information
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- user_id is nullable to support guest checkouts
  stripe_session_id TEXT UNIQUE,
  amount_total INTEGER,             -- Amount charged (in cents)
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'pending',     -- e.g., 'pending', 'succeeded', 'failed'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create a trigger to automatically update the 'updated_at' timestamp on row modification
CREATE TRIGGER handle_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_updated_at();

-- Enable Row-Level Security on the 'orders' table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Add a policy to allow users to view their own orders.
-- Backend functions will use a service role key to bypass RLS for creating and updating orders.
CREATE POLICY "select_own_orders" ON public.orders
  FOR SELECT
  USING (auth.uid() = user_id);
