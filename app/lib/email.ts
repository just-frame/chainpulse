import { Resend } from 'resend';

// Default "from" address - use Resend's default until you verify your domain
const FROM_EMAIL = 'Chainpulse <onboarding@resend.dev>';

// Lazy initialization to avoid build-time errors
let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

interface PriceAlertEmailProps {
  to: string;
  assetName: string;
  assetSymbol: string;
  condition: 'above' | 'below';
  threshold: number;
  currentPrice: number;
  alertType: 'price' | 'percent_change';
}

export async function sendPriceAlertEmail({
  to,
  assetName,
  assetSymbol,
  condition,
  threshold,
  currentPrice,
  alertType,
}: PriceAlertEmailProps) {
  const arrow = condition === 'above' ? '↑' : '↓';
  const verb = condition === 'above' ? 'crossed above' : 'dropped below';
  const thresholdDisplay = alertType === 'price' 
    ? `$${threshold.toLocaleString()}` 
    : `${threshold}%`;
  
  const subject = `${arrow} ${assetSymbol} Alert: Price ${verb} ${thresholdDisplay}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 40px 20px; margin: 0;">
        <div style="max-width: 480px; margin: 0 auto; background-color: #141414; border-radius: 16px; padding: 32px; border: 1px solid #262626;">
          
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; padding: 12px 16px; border-radius: 50%; background-color: ${condition === 'above' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)'}; margin-bottom: 16px;">
              <span style="font-size: 32px;">${condition === 'above' ? '🚀' : '📉'}</span>
            </div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #ffffff;">
              Price Alert Triggered
            </h1>
          </div>
          
          <!-- Asset Info -->
          <div style="background-color: #1a1a1a; border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
            <p style="margin: 0 0 8px 0; color: #888888; font-size: 14px;">
              ${assetName} (${assetSymbol})
            </p>
            <p style="margin: 0; font-size: 36px; font-weight: 700; font-family: 'SF Mono', Monaco, monospace; color: #ffffff;">
              $${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          
          <!-- Alert Details -->
          <div style="background-color: ${condition === 'above' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; border: 1px solid ${condition === 'above' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
            <p style="margin: 0; text-align: center; color: ${condition === 'above' ? '#22c55e' : '#ef4444'}; font-size: 16px;">
              ${arrow} ${verb} your target of <strong>${thresholdDisplay}</strong>
            </p>
          </div>
          
          <!-- CTA -->
          <a href="https://chainpulsetest1.vercel.app" style="display: block; text-align: center; background-color: #ffffff; color: #000000; text-decoration: none; padding: 14px 24px; border-radius: 8px; font-weight: 600; font-size: 16px;">
            View Portfolio →
          </a>
          
          <!-- Footer -->
          <p style="margin: 24px 0 0 0; text-align: center; color: #666666; font-size: 12px;">
            You received this because you set a price alert on Chainpulse.<br>
            <a href="https://chainpulsetest1.vercel.app" style="color: #888888;">Manage your alerts</a>
          </p>
          
        </div>
      </body>
    </html>
  `;

  const text = `
${assetSymbol} Alert Triggered!

${assetName} (${assetSymbol}) has ${verb} ${thresholdDisplay}.

Current Price: $${currentPrice.toLocaleString()}

View your portfolio: https://chainpulsetest1.vercel.app
  `.trim();

  try {
    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error('[Email] Failed to send:', error);
      return { success: false, error };
    }

    console.log('[Email] Sent successfully:', data?.id);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error('[Email] Exception:', err);
    return { success: false, error: err };
  }
}
