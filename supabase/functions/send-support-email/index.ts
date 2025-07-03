import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

const ADMIN_EMAIL = "admin@upvotethat.com"; // Change this to your actual admin email
const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY') || '';
const BREVO_SENDER_EMAIL = Deno.env.get('BREVO_SENDER_EMAIL') || 'noreply@upvotethat.com';
const BREVO_SENDER_NAME = Deno.env.get('BREVO_SENDER_NAME') || 'UpvoteThat Support';

interface SupportRequest {
  name: string;
  email: string;
  issueType: string;
  orderNumber?: string;
  description: string;
  userId?: string;
  userBalance?: number;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supportRequest: SupportRequest = await req.json()
    
    // Validate required fields
    if (!supportRequest.name || !supportRequest.email || !supportRequest.issueType || !supportRequest.description) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Format issue type for display
    const issueTypeMap: { [key: string]: string } = {
      'order': 'Issue Regarding an Order',
      'payment': 'Issue Regarding a Payment', 
      'other': 'Something Else'
    };

    const issueTypeDisplay = issueTypeMap[supportRequest.issueType] || supportRequest.issueType;
    
    // Format email content
    const emailSubject = `Support Request: ${issueTypeDisplay} - ${supportRequest.name}`;
    
    const emailBody = `
New Support Request Received

Customer Details:
- Name: ${supportRequest.name}
- Email: ${supportRequest.email}
- User ID: ${supportRequest.userId || 'Not logged in'}
- Account Balance: $${supportRequest.userBalance || 0}

Issue Information:
- Type: ${issueTypeDisplay}
${supportRequest.orderNumber ? `- Order Number: ${supportRequest.orderNumber}` : ''}
- Submitted: ${new Date().toLocaleString()}

Issue Description:
${supportRequest.description}

---
This support request was automatically generated from the UpvoteThat.com support form.
Reply directly to this email to respond to the customer.
    `.trim();

    // Send email using SMTP
    const emailResponse = await sendEmail({
      to: ADMIN_EMAIL,
      replyTo: supportRequest.email,
      subject: emailSubject,
      body: emailBody
    });

    if (!emailResponse.success) {
      throw new Error(emailResponse.error);
    }

    return new Response(
      JSON.stringify({ 
        message: 'Support request sent successfully',
        ticketId: `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error sending support email:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to send support request' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Brevo email function
async function sendEmail({ to, replyTo, subject, body }: {
  to: string;
  replyTo: string;
  subject: string;
  body: string;
}) {
  try {
    // If Brevo API key is not configured, just log the email
    if (!BREVO_API_KEY) {
      console.log('Brevo API not configured. Email content:');
      console.log('To:', to);
      console.log('Reply-To:', replyTo);
      console.log('Subject:', subject);
      console.log('Body:', body);
      
      return { 
        success: true, 
        message: 'Email logged (Brevo not configured)' 
      };
    }

    // Send email using Brevo API
    console.log('Sending email via Brevo...');
    console.log('To:', to);
    console.log('Subject:', subject);
    
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: BREVO_SENDER_NAME,
          email: BREVO_SENDER_EMAIL
        },
        to: [
          {
            email: to,
            name: 'Admin'
          }
        ],
        replyTo: {
          email: replyTo,
          name: 'Customer'
        },
        subject: subject,
        textContent: body,
        htmlContent: body.replace(/\n/g, '<br>')
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Brevo API error: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    console.log('Email sent successfully via Brevo:', result);
    
    return { success: true, message: 'Email sent successfully via Brevo' };
    
  } catch (error) {
    console.error('Brevo Error:', error);
    return { 
      success: false, 
      error: `Failed to send email: ${error.message}` 
    };
  }
}

/* Add these lines to your Supabase Edge Functions environment:
BREVO_API_KEY=your-brevo-api-key
BREVO_SENDER_EMAIL=noreply@yourdomain.com
BREVO_SENDER_NAME=UpvoteThat Support

For Brevo:
1. Login to your Brevo account
2. Go to Settings > API Keys
3. Create a new API key
4. Add a verified sender email in Settings > Senders & IP
*/ 