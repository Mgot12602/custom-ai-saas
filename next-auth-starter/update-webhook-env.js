#!/usr/bin/env node

/**
 * Fresh Webhook Environment Updater
 * 
 * This script updates your local environment when the tunnel URL changes.
 * No API calls, no complexity - just reliable environment management.
 */

const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

class WebhookEnvironmentUpdater {
    /**
     * Update local .env.local file with new tunnel URL
     */
    updateLocalEnvironment(tunnelUrl, webhookUrl) {
        try {
            const envPath = '.env.local';
            console.log(`📝 FRESH: Updating local environment file at ${envPath}...`);

            const existed = fs.existsSync(envPath);
            const before = existed ? fs.readFileSync(envPath, 'utf8') : '';
            const beforeServeo = (before.match(/^SERVEO_URL=.*/m)?.[0]) || '(missing)';
            const beforeWebhook = (before.match(/^CLERK_WEBHOOK_URL=.*/m)?.[0]) || '(missing)';
            console.log(`🔎 FRESH Before:\n  ${beforeServeo}\n  ${beforeWebhook}`);

            let content = before;

            // Replace or append SERVEO_URL
            if (/^SERVEO_URL=.*/m.test(content)) {
                content = content.replace(/^SERVEO_URL=.*/m, `SERVEO_URL=${tunnelUrl}`);
            } else {
                content += (content.length && !content.endsWith('\n') ? '\n' : '') + `SERVEO_URL=${tunnelUrl}\n`;
            }

            // Replace or append CLERK_WEBHOOK_URL
            if (/^CLERK_WEBHOOK_URL=.*/m.test(content)) {
                content = content.replace(/^CLERK_WEBHOOK_URL=.*/m, `CLERK_WEBHOOK_URL=${webhookUrl}`);
            } else {
                content += (content.endsWith('\n') ? '' : '\n') + `CLERK_WEBHOOK_URL=${webhookUrl}\n`;
            }

            // Backup existing file
            if (existed) {
                const backup = `.env.local.bak-${Date.now()}`;
                fs.writeFileSync(backup, before);
                console.log(`🗂️  FRESH: Backup created: ${backup}`);
            }

            fs.writeFileSync(envPath, content);

            // Verify after write
            const after = fs.readFileSync(envPath, 'utf8');
            const afterServeo = (after.match(/^SERVEO_URL=.*/m)?.[0]) || '(missing)';
            const afterWebhook = (after.match(/^CLERK_WEBHOOK_URL=.*/m)?.[0]) || '(missing)';
            console.log(`🔎 FRESH After:\n  ${afterServeo}\n  ${afterWebhook}`);

            const serveoOk = afterServeo === `SERVEO_URL=${tunnelUrl}`;
            const webhookOk = afterWebhook === `CLERK_WEBHOOK_URL=${webhookUrl}`;
            if (!serveoOk || !webhookOk) {
                console.error('❌ FRESH: Verification failed: env file does not contain expected values.');
                return false;
            }

            console.log('✅ FRESH: Local environment updated and verified!');
            return true;
        } catch (error) {
            console.error('❌ FRESH: Error updating local environment:', error.message);
            return false;
        }
    }

    /**
     * Main function to update environment with new tunnel URL
     */
    async updateWebhookUrl(newTunnelUrl) {
        const webhookUrl = `${newTunnelUrl}/api/webhooks/clerk`;
        
        console.log('🚀 FRESH: Updating environment for new tunnel...');
        console.log(`📱 FRESH: App URL: ${newTunnelUrl}`);
        console.log(`🔗 FRESH: Webhook URL: ${webhookUrl}`);
        console.log('');

        // Update local environment file
        const success = this.updateLocalEnvironment(newTunnelUrl, webhookUrl);
        
        if (success) {
            console.log('🎉 FRESH: Environment update completed!');
            console.log('');
            console.log('📋 FRESH: Next Step - Update Clerk Dashboard:');
            console.log(`   1. Go to: https://dashboard.clerk.com/`);
            console.log(`   2. Navigate to: Webhooks`);
            console.log(`   3. Update webhook URL to: ${webhookUrl}`);
            console.log('');
            console.log('💡 FRESH: Tip: Copy the webhook URL above and paste it in Clerk dashboard');
            console.log('⏱️  FRESH: This takes about 30 seconds and only needs to be done when the tunnel changes');
            
            return true;
        } else {
            console.log('❌ FRESH: Environment update failed');
            return false;
        }
    }
}

// CLI Usage
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log(`
🔧 FRESH Webhook Environment Updater

Usage:
  node update-webhook-env-new.js <tunnel-url>

Example:
  node update-webhook-env-new.js https://alpha.serveo.net

This script will:
  1. Update your .env.local file with the new tunnel URL
  2. Show you the webhook URL for Clerk dashboard
  3. Provide clear next steps
        `);
        process.exit(1);
    }

    const newTunnelUrl = args[0];
    
    if (!newTunnelUrl.startsWith('https://')) {
        console.error('❌ FRESH: Error: Tunnel URL must start with https://');
        process.exit(1);
    }

    try {
        const updater = new WebhookEnvironmentUpdater();
        const success = await updater.updateWebhookUrl(newTunnelUrl);
        
        if (!success) {
            process.exit(1);
        }
    } catch (error) {
        console.error('💥 FRESH: Fatal error:', error.message);
        process.exit(1);
    }
}

// Export for use as module
module.exports = WebhookEnvironmentUpdater;

// Run if called directly
if (require.main === module) {
    main();
}
