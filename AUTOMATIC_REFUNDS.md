# Automatic Refund System

This document explains how the automatic refund system works when external API submissions fail.

## Overview

When an upvote order fails to submit to the BuyUpvotes.io API, the system now automatically:

1. **Detects the failure** - Any API submission error (except local development cases)
2. **Calls the refund function** - Automatically refunds the customer
3. **Updates order status** - Marks order as "Cancelled" 
4. **Provides clear messaging** - Informs user they've been refunded

## How It Works

### 1. Order Placement Process
- Customer places order through the UI
- Order is stored locally in database with balance deduction
- System attempts to submit order to BuyUpvotes.io API via Netlify function
- If API submission succeeds: order gets external ID and "submitted_to_api" status
- If API submission fails: automatic refund is triggered

### 2. Automatic Refund Process
When external API submission fails:

```javascript
// API submission error detected
console.log('API submission failed, automatically refunding order...');

// Call the refund function
const { data: refundResult, error: refundError } = await supabase
  .rpc('refund_order', { target_order_id: parseInt(localOrderId) });

if (refundError) {
  // Refund failed - mark order as failed
  await supabase.from('upvote_orders').update({ 
    status: 'api_submission_failed',
    error_message: `API submission failed: ${apiError.message}. Refund attempt failed: ${refundError.message}`
  }).eq('id', parseInt(localOrderId));
} else {
  // Refund succeeded - mark order as cancelled
  await supabase.from('upvote_orders').update({ 
    status: 'Cancelled',
    error_message: `API submission failed: ${apiError.message}. Customer automatically refunded.`
  }).eq('id', parseInt(localOrderId));
}
```

### 3. Database Refund Function
The `refund_order()` function handles the financial aspects:

```sql
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
    
    -- Check if already refunded (prevents double refunds)
    IF EXISTS (SELECT 1 FROM public.transactions WHERE upvote_order_id = target_order_id AND type = 'refund') THEN
        RETURN 'Error: This order has already been refunded.';
    END IF;
    
    -- Find original purchase transaction
    SELECT * INTO original_transaction 
    FROM public.transactions 
    WHERE upvote_order_id = target_order_id AND type = 'purchase'
    ORDER BY created_at DESC LIMIT 1;
    
    refund_amount := -original_transaction.amount; -- Make it positive
    
    -- Add refund to user balance
    UPDATE public.profiles 
    SET balance = balance + refund_amount 
    WHERE id = order_record.user_id;
    
    -- Create refund transaction record
    INSERT INTO public.transactions (user_id, type, amount, description, status, upvote_order_id)
    VALUES (order_record.user_id, 'refund', refund_amount, 'Automatic refund for failed order #' || target_order_id, 'completed', target_order_id);
    
    -- Update order status to Cancelled
    UPDATE public.upvote_orders
    SET status = 'Cancelled'
    WHERE id = target_order_id;
    
    RETURN 'Success: Automatic refund of $' || refund_amount || ' has been processed for order #' || target_order_id || '.';
END;
$$;
```

## Error Handling

### Local Development
- If Netlify functions aren't available (local dev), orders are marked as "pending_api_submission"
- No refund occurs - admin can manually process these orders
- Error message explains deployment is needed for automatic processing

### API Submission Failures
- Any real API failure triggers automatic refund
- Customer balance is restored immediately
- Order status becomes "Cancelled"
- Clear error message explains what happened

### Double Refund Prevention
- Database function checks for existing refunds
- Returns error if order was already refunded
- Prevents accidental double charges

## Customer Experience

### Success Case
1. Customer places order ($0.28 deducted from balance)
2. Order submits to BuyUpvotes.io successfully
3. Customer sees "Order submitted successfully" message
4. Order begins processing externally

### Failure Case
1. Customer places order ($0.28 deducted from balance)
2. External API submission fails (CORS, server error, etc.)
3. System automatically refunds $0.28 to customer balance
4. Customer sees "Order failed and customer has been automatically refunded" message
5. Customer can immediately place a new order

## Benefits

### No Manual Processing Required
- Zero admin intervention needed for failed orders
- Customers are refunded immediately
- Reduces support tickets and manual work

### Customer Trust
- Immediate refunds build confidence
- Clear error messaging explains what happened
- No risk of lost funds

### System Reliability
- Handles CORS issues gracefully
- Works even when external APIs are down
- Prevents abandoned orders with charged balances

## Transaction Flow

```
1. Customer: Places $0.28 order
2. Database: -$0.28 from balance, creates purchase transaction
3. API: Attempts BuyUpvotes.io submission
4a. Success: Order gets external ID, status = "submitted_to_api"
4b. Failure: Automatic refund triggered
5. Database: +$0.28 to balance, creates refund transaction
6. Order: Status = "Cancelled", customer notified
```

## Monitoring

### Transaction Records
- All refunds are logged in `transactions` table
- Type = "refund" with order ID reference
- Description includes "Automatic refund for failed order"

### Order Status Tracking
- Failed orders have status "Cancelled"
- Error message field contains failure reason
- External order ID remains null for failed orders

### Audit Trail
- Complete transaction history for each order
- Easy to track refund reasons and amounts
- Transparent for both admin and customer review

This automatic refund system ensures customers never lose money due to technical failures while requiring zero manual intervention from administrators. 