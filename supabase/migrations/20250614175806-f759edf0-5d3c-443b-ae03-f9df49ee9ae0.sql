
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
        post_vote_price := 0.20; -- Same as starter, highest price
    END IF;

    -- Comment votes are 80% of post vote price
    comment_vote_price := post_vote_price * 0.8;

    -- Calculate cost and description based on service type
    IF order_service = 1 THEN -- Post upvotes
        cost := order_quantity * post_vote_price;
        service_description := 'Post upvotes';
    ELSIF order_service = 2 THEN -- Post downvotes
        cost := order_quantity * post_vote_price;
        service_description := 'Post downvotes';
    ELSIF order_service = 3 THEN -- Comment upvotes
        cost := order_quantity * comment_vote_price;
        service_description := 'Comment upvotes';
    ELSIF order_service = 4 THEN -- Comment downvotes
        cost := order_quantity * comment_vote_price;
        service_description := 'Comment downvotes';
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

    -- Insert transaction
    INSERT INTO public.transactions (user_id, type, amount, description, status)
    VALUES (current_user_id, 'purchase', -cost, 'Purchase: ' || order_quantity || ' ' || service_description || ' for order #' || new_order_id, 'completed');

    -- Update user balance
    UPDATE public.profiles
    SET balance = balance - cost
    WHERE id = current_user_id;
    
    RETURN QUERY SELECT new_order_id, null::text;
END;
$$;
