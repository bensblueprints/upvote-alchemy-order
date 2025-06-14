
-- Step 1: Add a column to transactions to link them to upvote orders for refunds
ALTER TABLE public.transactions
ADD COLUMN upvote_order_id BIGINT,
ADD CONSTRAINT fk_upvote_order
  FOREIGN KEY (upvote_order_id)
  REFERENCES public.upvote_orders(id)
  ON DELETE SET NULL;

-- Step 2: Update the order placement function to link the new transaction
CREATE OR REPLACE FUNCTION public.place_upvote_order(
    order_link text,
    order_quantity int,
    order_service int,
    order_speed numeric
)
RETURNS TABLE (order_id bigint, error_message text)
LANGUAGE plpgsql
AS $$
DECLARE
    current_user_id uuid := auth.uid();
    cost numeric;
    user_balance numeric;
    new_order_id bigint;
    service_description text;
    post_vote_price numeric;
    comment_vote_price numeric;
BEGIN
    -- Get user balance
    SELECT balance INTO user_balance FROM public.profiles WHERE id = current_user_id;

    -- Determine pricing tier based on user's balance
    IF user_balance >= 1000 THEN -- Elite
        post_vote_price := 0.04;
    ELSIF user_balance >= 750 THEN -- Pro
        post_vote_price := 0.06;
    ELSIF user_balance >= 250 THEN -- Standard
        post_vote_price := 0.08;
    ELSIF user_balance >= 100 THEN -- Basic
        post_vote_price := 0.10;
    ELSIF user_balance >= 15 THEN -- Starter
        post_vote_price := 0.20;
    ELSE -- Default for balances < $15
        post_vote_price := 0.20;
    END IF;

    -- Comment votes are 80% of post vote price
    comment_vote_price := post_vote_price * 0.8;

    -- Calculate cost and description based on service type
    IF order_service = 1 THEN cost := order_quantity * post_vote_price; service_description := 'Post upvotes';
    ELSIF order_service = 2 THEN cost := order_quantity * post_vote_price; service_description := 'Post downvotes';
    ELSIF order_service = 3 THEN cost := order_quantity * comment_vote_price; service_description := 'Comment upvotes';
    ELSIF order_service = 4 THEN cost := order_quantity * comment_vote_price; service_description := 'Comment downvotes';
    ELSE
        RETURN QUERY SELECT null::bigint, 'Invalid service type.'::text;
        RETURN;
    END IF;

    -- Check user balance
    IF user_balance IS NULL OR user_balance < cost THEN
        RETURN QUERY SELECT null::bigint, 'Insufficient balance. Please add funds.'::text;
        RETURN;
    END IF;

    -- Insert new order
    INSERT INTO public.upvote_orders (user_id, link, quantity, service, speed)
    VALUES (current_user_id, order_link, order_quantity, order_service, order_speed)
    RETURNING id INTO new_order_id;

    -- Insert transaction and link it to the order
    INSERT INTO public.transactions (user_id, type, amount, description, status, upvote_order_id)
    VALUES (current_user_id, 'purchase', -cost, 'Purchase: ' || order_quantity || ' ' || service_description || ' for order #' || new_order_id, 'completed', new_order_id);

    -- Update user balance
    UPDATE public.profiles
    SET balance = balance - cost
    WHERE id = current_user_id;
    
    RETURN QUERY SELECT new_order_id, null::text;
END;
$$;

-- Step 3: Create a secure function for admins to refund an order
CREATE OR REPLACE FUNCTION public.refund_order(target_order_id bigint)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    order_to_refund public.upvote_orders;
    purchase_transaction public.transactions;
    is_caller_admin boolean;
BEGIN
    -- Check if the caller is an admin
    SELECT is_admin INTO is_caller_admin FROM public.profiles WHERE id = auth.uid();
    IF is_caller_admin IS NOT TRUE THEN
        RETURN 'Error: Only admins can perform refunds.';
    END IF;

    -- Get the order details
    SELECT * INTO order_to_refund FROM public.upvote_orders WHERE id = target_order_id;
    IF order_to_refund.id IS NULL THEN
        RETURN 'Error: Order not found.';
    END IF;

    -- Find the original purchase transaction
    SELECT * INTO purchase_transaction FROM public.transactions
    WHERE upvote_order_id = target_order_id AND type = 'purchase' LIMIT 1;
    IF purchase_transaction.id IS NULL THEN
        RETURN 'Error: Original purchase transaction not found for this order.';
    END IF;
    
    -- Check if already refunded
    IF EXISTS (SELECT 1 FROM public.transactions WHERE upvote_order_id = target_order_id AND type = 'refund') THEN
        RETURN 'Error: This order has already been refunded.';
    END IF;

    -- Update user's balance (amount is negative for purchase, so we subtract it)
    UPDATE public.profiles
    SET balance = balance - purchase_transaction.amount
    WHERE id = order_to_refund.user_id;

    -- Create a refund transaction
    INSERT INTO public.transactions (user_id, type, amount, description, status, upvote_order_id)
    VALUES (order_to_refund.user_id, 'refund', -purchase_transaction.amount, 'Refund for order #' || target_order_id, 'completed', target_order_id);

    -- Update the order status to 'Cancelled'
    UPDATE public.upvote_orders
    SET status = 'Cancelled'
    WHERE id = target_order_id;

    RETURN 'Success: Order #' || target_order_id || ' has been refunded.';
END;
$$;

-- Step 4: Drop existing RLS policies on upvote_orders to replace them
DROP POLICY IF EXISTS "Users can view their own upvote orders" ON public.upvote_orders;
DROP POLICY IF EXISTS "Users can insert their own upvote orders" ON public.upvote_orders;
DROP POLICY IF EXISTS "Users can update their own upvote orders" ON public.upvote_orders;
DROP POLICY IF EXISTS "Admins can view all upvote orders" ON public.upvote_orders;
DROP POLICY IF EXISTS "Admins can update all upvote orders" ON public.upvote_orders;

-- Step 5: Create new RLS policies for upvote_orders
CREATE POLICY "Users can insert their own upvote orders"
  ON public.upvote_orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own orders and admins can view all"
  ON public.upvote_orders FOR SELECT
  USING (
    auth.uid() = user_id OR
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can update their own orders and admins can update all"
  ON public.upvote_orders FOR UPDATE
  USING (
    auth.uid() = user_id OR
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
  );
  
-- Step 6: Assign admin role to the specified user
UPDATE public.profiles
SET is_admin = true
WHERE email = 'ben@rootaccess.design';
