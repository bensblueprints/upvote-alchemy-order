
-- Create the reddit_accounts table
CREATE TABLE public.reddit_accounts (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    username text NOT NULL,
    password text NOT NULL,
    email text NOT NULL,
    email_password text NOT NULL,
    post_karma integer NOT NULL DEFAULT 0,
    comment_karma integer NOT NULL DEFAULT 0,
    total_karma integer GENERATED ALWAYS AS (post_karma + comment_karma) STORED,
    account_age_years integer,
    profile_url text,
    status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold')),
    buy_price numeric NOT NULL DEFAULT 0,
    sell_price numeric NOT NULL DEFAULT 0,
    created_by_admin_id uuid REFERENCES public.profiles(id),
    sold_to_user_id uuid REFERENCES public.profiles(id),
    sold_at timestamp with time zone
);

-- Enable RLS on reddit_accounts
ALTER TABLE public.reddit_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reddit_accounts
CREATE POLICY "Admins can manage all reddit accounts"
  ON public.reddit_accounts FOR ALL
  TO authenticated
  USING ( (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE )
  WITH CHECK ( (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE );

CREATE POLICY "Users can view available accounts for purchase"
  ON public.reddit_accounts FOR SELECT
  TO authenticated
  USING (status = 'available');

CREATE POLICY "Users can view their purchased accounts"
  ON public.reddit_accounts FOR SELECT
  TO authenticated
  USING (sold_to_user_id = auth.uid() AND status = 'sold');

-- Fix overly permissive transactions policy
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;

CREATE POLICY "Users can view their own transactions only"
  ON public.transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions"
  ON public.transactions FOR SELECT
  TO authenticated
  USING ( (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE );

-- Prevent users from modifying transactions directly
CREATE POLICY "Only system can insert transactions"
  ON public.transactions FOR INSERT
  TO authenticated
  WITH CHECK (FALSE); -- Transactions should only be created by functions

CREATE POLICY "No direct transaction updates"
  ON public.transactions FOR UPDATE
  TO authenticated
  USING (FALSE);

CREATE POLICY "No direct transaction deletes"
  ON public.transactions FOR DELETE
  TO authenticated
  USING (FALSE);

-- Create the purchase_reddit_account function with security checks
CREATE OR REPLACE FUNCTION public.purchase_reddit_account(account_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_user_id uuid := auth.uid();
    account_to_purchase public.reddit_accounts;
    user_balance numeric;
BEGIN
    -- Check if user is authenticated
    IF current_user_id IS NULL THEN
        RETURN 'Error: Authentication required.';
    END IF;

    -- Get account details and lock the row for update to prevent race conditions
    SELECT * INTO account_to_purchase 
    FROM public.reddit_accounts 
    WHERE id = account_id 
    FOR UPDATE;

    -- Check if account exists
    IF account_to_purchase.id IS NULL THEN
        RETURN 'Error: Account not found.';
    END IF;

    -- Check if account is available
    IF account_to_purchase.status <> 'available' THEN
        RETURN 'Error: Account is not available for purchase.';
    END IF;

    -- Get user balance with row lock to prevent concurrent balance modifications
    SELECT balance INTO user_balance 
    FROM public.profiles 
    WHERE id = current_user_id 
    FOR UPDATE;

    -- Check if user has sufficient balance
    IF user_balance IS NULL OR user_balance < account_to_purchase.sell_price THEN
        RETURN 'Error: Insufficient balance. Please add funds to your account.';
    END IF;
    
    -- Update user balance
    UPDATE public.profiles
    SET balance = balance - account_to_purchase.sell_price
    WHERE id = current_user_id;
    
    -- Update account status and assign to user
    UPDATE public.reddit_accounts
    SET 
        status = 'sold',
        sold_to_user_id = current_user_id,
        sold_at = now()
    WHERE id = account_id;

    -- Create a transaction record (this bypasses RLS due to SECURITY DEFINER)
    INSERT INTO public.transactions (user_id, type, amount, description, status)
    VALUES (
        current_user_id, 
        'reddit_account_purchase', 
        -account_to_purchase.sell_price, 
        'Purchased Reddit account: ' || account_to_purchase.username, 
        'completed'
    );

    RETURN 'Success: Account purchased successfully. You can view the credentials in "My Purchased Accounts".';
END;
$$;

-- Add password policy functions for stronger authentication
CREATE OR REPLACE FUNCTION public.validate_password_strength(password text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
    -- Check minimum length (8 characters)
    IF length(password) < 8 THEN
        RETURN FALSE;
    END IF;
    
    -- Check for at least one uppercase letter
    IF password !~ '[A-Z]' THEN
        RETURN FALSE;
    END IF;
    
    -- Check for at least one lowercase letter
    IF password !~ '[a-z]' THEN
        RETURN FALSE;
    END IF;
    
    -- Check for at least one number
    IF password !~ '[0-9]' THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$;

-- Create audit log table for sensitive operations
CREATE TABLE public.audit_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    user_id uuid REFERENCES public.profiles(id),
    action text NOT NULL,
    resource_type text NOT NULL,
    resource_id text,
    details jsonb,
    ip_address inet
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING ( (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE );

-- Function to log sensitive operations
CREATE OR REPLACE FUNCTION public.log_audit_event(
    p_action text,
    p_resource_type text,
    p_resource_id text DEFAULT NULL,
    p_details jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.audit_logs (user_id, action, resource_type, resource_id, details)
    VALUES (auth.uid(), p_action, p_resource_type, p_resource_id, p_details);
END;
$$;

-- Update the purchase function to include audit logging
CREATE OR REPLACE FUNCTION public.purchase_reddit_account(account_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_user_id uuid := auth.uid();
    account_to_purchase public.reddit_accounts;
    user_balance numeric;
    purchase_details jsonb;
BEGIN
    -- Check if user is authenticated
    IF current_user_id IS NULL THEN
        RETURN 'Error: Authentication required.';
    END IF;

    -- Get account details and lock the row for update
    SELECT * INTO account_to_purchase 
    FROM public.reddit_accounts 
    WHERE id = account_id 
    FOR UPDATE;

    -- Check if account exists
    IF account_to_purchase.id IS NULL THEN
        PERFORM public.log_audit_event('purchase_attempt_failed', 'reddit_account', account_id::text, '{"reason": "account_not_found"}'::jsonb);
        RETURN 'Error: Account not found.';
    END IF;

    -- Check if account is available
    IF account_to_purchase.status <> 'available' THEN
        PERFORM public.log_audit_event('purchase_attempt_failed', 'reddit_account', account_id::text, '{"reason": "account_not_available"}'::jsonb);
        RETURN 'Error: Account is not available for purchase.';
    END IF;

    -- Get user balance with row lock
    SELECT balance INTO user_balance 
    FROM public.profiles 
    WHERE id = current_user_id 
    FOR UPDATE;

    -- Check if user has sufficient balance
    IF user_balance IS NULL OR user_balance < account_to_purchase.sell_price THEN
        PERFORM public.log_audit_event('purchase_attempt_failed', 'reddit_account', account_id::text, '{"reason": "insufficient_balance"}'::jsonb);
        RETURN 'Error: Insufficient balance. Please add funds to your account.';
    END IF;
    
    -- Prepare audit details
    purchase_details := jsonb_build_object(
        'account_username', account_to_purchase.username,
        'purchase_price', account_to_purchase.sell_price,
        'previous_balance', user_balance,
        'new_balance', user_balance - account_to_purchase.sell_price
    );
    
    -- Update user balance
    UPDATE public.profiles
    SET balance = balance - account_to_purchase.sell_price
    WHERE id = current_user_id;
    
    -- Update account status and assign to user
    UPDATE public.reddit_accounts
    SET 
        status = 'sold',
        sold_to_user_id = current_user_id,
        sold_at = now()
    WHERE id = account_id;

    -- Create a transaction record
    INSERT INTO public.transactions (user_id, type, amount, description, status)
    VALUES (
        current_user_id, 
        'reddit_account_purchase', 
        -account_to_purchase.sell_price, 
        'Purchased Reddit account: ' || account_to_purchase.username, 
        'completed'
    );

    -- Log the successful purchase
    PERFORM public.log_audit_event('reddit_account_purchased', 'reddit_account', account_id::text, purchase_details);

    RETURN 'Success: Account purchased successfully. You can view the credentials in "My Purchased Accounts".';
END;
$$;
