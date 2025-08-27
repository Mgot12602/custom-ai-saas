import { NextRequest } from 'next/server';

export class WebhookLogger {
  private static logWebhookEvent(req: NextRequest, body: string, source: string) {
    const timestamp = new Date().toISOString();
    const headers = Object.fromEntries(req.headers.entries());
    
    console.log('\n🔔 WEBHOOK EVENT RECEIVED');
    console.log('═'.repeat(50));
    console.log(`⏰ Timestamp: ${timestamp}`);
    console.log(`🔗 Source: ${source}`);
    console.log(`📍 URL: ${req.url}`);
    console.log(`🎯 Method: ${req.method}`);
    console.log(`🏷️  Headers:`, JSON.stringify(headers, null, 2));
    console.log(`📦 Body:`, body);
    console.log('═'.repeat(50));
  }

  static async logStripeWebhook(req: NextRequest, body: string) {
    this.logWebhookEvent(req, body, 'Stripe');
  }

  static async logClerkWebhook(req: NextRequest, body: string) {
    this.logWebhookEvent(req, body, 'Clerk');
  }

  static logGenericWebhook(req: NextRequest, body: string, source: string) {
    this.logWebhookEvent(req, body, source);
  }
}
