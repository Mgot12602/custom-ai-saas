import { WebhookEvent } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { createUser } from '@/lib/user';

// Define the structure of the user.created event data
interface UserCreatedEventData {
  id: string;
  first_name?: string;
  last_name?: string;
  email_addresses?: Array<{
    email_address: string;
    verification?: { status?: string };
  }>;
  phone_numbers?: Array<{
    phone_number: string;
    verification?: { status?: string };
  }>;
}

export async function POST(req: NextRequest) {
  console.log('📥 Webhook request received');
  
  // Get the headers
  const svix_id = req.headers.get('svix-id');
  const svix_timestamp = req.headers.get('svix-timestamp');
  const svix_signature = req.headers.get('svix-signature');
  
  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('❌ Missing Svix headers');
    return new NextResponse('Error: Missing svix headers', {
      status: 400,
    });
  }

  // Create a new Svix instance with your webhook secret
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error('❌ Missing webhook secret');
    return new NextResponse('Error: Missing webhook secret', {
      status: 500,
    });
  }

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(webhookSecret);
  
  let evt: WebhookEvent;
  
  // Verify the webhook payload
  try {
    console.log('🔔 Webhook received - verifying signature...');
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
    console.log(`✅ Webhook verified successfully: ${evt.type}`);
  } catch (err) {
    console.error('❌ Error verifying webhook:', err);
    return new NextResponse('Error verifying webhook', {
      status: 400,
    });
  }

  // Process the webhook
  const eventType = evt.type;
  console.log(`📣 Processing webhook event: ${eventType}`);
  
  if (eventType === 'user.created') {
    const userData = evt.data as UserCreatedEventData;
    const { id, first_name, last_name, email_addresses, phone_numbers } = userData;
    
    console.log(`👤 New user created with ID: ${id}`);
    
    // Get the user's name or use a default
    const name = first_name && last_name 
      ? `${first_name} ${last_name}`
      : first_name || email_addresses?.[0]?.email_address?.split('@')[0] || 'Anonymous User';
    
    console.log(`📝 User name: ${name}`);
    
    // Check if any email is verified
    const hasVerifiedEmail = email_addresses?.some(email => 
      email.verification?.status === 'verified') || false;
    
    // Check if any phone is verified
    const hasVerifiedPhone = phone_numbers?.some(phone => 
      phone.verification?.status === 'verified') || false;
    
    console.log(`📧 Email verified: ${hasVerifiedEmail}`);
    console.log(`📱 Phone verified: ${hasVerifiedPhone}`);
    
    // Check if user already exists to prevent duplicates
    try {
      const { getUserByAuthId } = await import('@/lib/user');
      const existingUser = await getUserByAuthId(id);
      
      if (existingUser) {
        console.log(`ℹ️ User ${id} already exists in database, skipping creation`);
        return NextResponse.json({ success: true, message: 'User already exists' }, { status: 200 });
      }
      
      // Create a new user in the database
      await createUser(id, name, hasVerifiedEmail, hasVerifiedPhone);
      console.log(`✅ User successfully created in database`);
      return NextResponse.json({ success: true, message: 'User created successfully' }, { status: 201 });
    } catch (error) {
      console.error(`❌ Error creating user in database:`, error);
      return NextResponse.json({ success: false, error: 'Failed to create user' }, { status: 500 });
    }
  }
  
  // Return a 200 response for other event types
  return NextResponse.json({ message: `Webhook received: ${eventType}` }, { status: 200 });
}
