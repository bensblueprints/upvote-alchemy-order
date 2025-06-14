
DO $$
DECLARE
    user_id_to_update uuid;
BEGIN
    -- Find the user ID from their email
    SELECT id INTO user_id_to_update FROM public.profiles WHERE email = 'hello@test.com';

    -- Proceed only if user is found
    IF user_id_to_update IS NOT NULL THEN
        -- Add $20 to the user's balance
        UPDATE public.profiles
        SET balance = balance + 20.00
        WHERE id = user_id_to_update;

        -- Create a transaction record for this manual deposit
        INSERT INTO public.transactions (user_id, type, amount, description, status)
        VALUES (user_id_to_update, 'deposit', 20.00, 'Manual deposit for testing', 'completed');
    ELSE
        -- Raise a notice if the user is not found
        RAISE NOTICE 'User with email hello@test.com not found. No balance updated.';
    END IF;
END $$;
