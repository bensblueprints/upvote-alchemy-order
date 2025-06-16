-- Add missing columns to upvote_orders table for BuyUpvotes.io integration
-- Run this on your Supabase database

-- Add external_order_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='upvote_orders' AND column_name='external_order_id') THEN
        ALTER TABLE public.upvote_orders ADD COLUMN external_order_id text;
    END IF;
END $$;

-- Add error_message column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='upvote_orders' AND column_name='error_message') THEN
        ALTER TABLE public.upvote_orders ADD COLUMN error_message text;
    END IF;
END $$;

-- Update existing orders to have a default status if NULL
UPDATE public.upvote_orders 
SET status = 'pending' 
WHERE status IS NULL;

-- Show updated table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'upvote_orders' 
ORDER BY ordinal_position;

-- Update the refund_order function to support automatic refunds with better error handling
CREATE OR REPLACE FUNCTION public.refund_order(target_order_id bigint)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    order_record public.upvote_orders;
    refund_amount numeric;
    original_transaction public.transactions;
BEGIN
    -- Get the order details
    SELECT * INTO order_record FROM public.upvote_orders WHERE id = target_order_id;
    
    IF order_record.id IS NULL THEN
        RETURN 'Error: Order not found.';
    END IF;
    
    -- Check if already refunded
    IF EXISTS (SELECT 1 FROM public.transactions WHERE upvote_order_id = target_order_id AND type = 'refund') THEN
        RETURN 'Error: This order has already been refunded.';
    END IF;
    
    -- Get the original transaction
    SELECT * INTO original_transaction 
    FROM public.transactions 
    WHERE upvote_order_id = target_order_id AND type = 'purchase'
    ORDER BY created_at DESC LIMIT 1;
    
    IF original_transaction.id IS NULL THEN
        RETURN 'Error: Original transaction not found.';
    END IF;
    
    refund_amount := -original_transaction.amount; -- Make it positive
    
    -- Add refund to user balance
    UPDATE public.profiles 
    SET balance = balance + refund_amount 
    WHERE id = order_record.user_id;
    
    -- Create refund transaction
    INSERT INTO public.transactions (user_id, type, amount, description, status, upvote_order_id)
    VALUES (order_record.user_id, 'refund', refund_amount, 'Automatic refund for failed order #' || target_order_id, 'completed', target_order_id);
    
    -- Update the order status to 'Cancelled'
    UPDATE public.upvote_orders
    SET status = 'Cancelled'
    WHERE id = target_order_id;
    
    RETURN 'Success: Automatic refund of $' || refund_amount || ' has been processed for order #' || target_order_id || '.';
END;
$$; 