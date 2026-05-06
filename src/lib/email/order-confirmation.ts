import nodemailer from 'nodemailer'
import type { PublicOrder } from '@/server/orders'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendOrderConfirmation(order: PublicOrder): Promise<void> {
  const email = order.guestEmail
  if (!email) return

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const lineItemsHtml = order.lineItems
    .map(
      (li) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:#f5f1e8">
          ${escapeHtml(li.title)}
        </td>
        <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);text-align:center;color:#c4bfb3">
          ${li.qty}
        </td>
        <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);text-align:right;color:#f5f1e8;font-variant-numeric:tabular-nums">
          N$ ${(li.priceNAD * li.qty).toFixed(2)}
        </td>
      </tr>`,
    )
    .join('')

  const addr = order.shippingAddress

  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
  </head>
  <body style="margin:0;padding:0;background-color:#0a0a0a;font-family:Arial,Helvetica,sans-serif;color:#f5f1e8">
    <div style="max-width:600px;margin:40px auto;background:linear-gradient(135deg,#1a1a1a,#2d2d2d);border:1px solid rgba(255,255,255,0.1);border-radius:24px;padding:40px">
      <div style="text-align:center;margin-bottom:30px">
        <div style="font-size:32px;font-weight:bold;color:#f5f1e8;letter-spacing:4px">GLB</div>
        <div style="font-size:24px;color:#f5f1e8;margin:20px 0">Order Confirmed</div>
      </div>

      <p style="line-height:1.8;color:#c4bfb3">
        Thank you for your order! Here's a summary of what you purchased.
      </p>

      <div style="background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.05);border-radius:16px;padding:20px;margin:20px 0">
        <div style="margin:8px 0;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
          <div style="color:#8b8680;font-size:12px;text-transform:uppercase;letter-spacing:2px">Order Number</div>
          <div style="color:#f5f1e8;font-size:16px;margin-top:4px;font-family:monospace">${escapeHtml(order.orderNumber)}</div>
        </div>
        <div style="margin:8px 0;padding:8px 0">
          <div style="color:#8b8680;font-size:12px;text-transform:uppercase;letter-spacing:2px">Status</div>
          <div style="color:#f5f1e8;font-size:16px;margin-top:4px;text-transform:capitalize">${escapeHtml(order.status)}</div>
        </div>
      </div>

      <table style="width:100%;border-collapse:collapse;margin:20px 0">
        <thead>
          <tr style="border-bottom:1px solid rgba(255,255,255,0.1)">
            <th style="text-align:left;padding:8px 0;color:#8b8680;font-size:12px;text-transform:uppercase;letter-spacing:2px">Item</th>
            <th style="text-align:center;padding:8px 0;color:#8b8680;font-size:12px;text-transform:uppercase;letter-spacing:2px">Qty</th>
            <th style="text-align:right;padding:8px 0;color:#8b8680;font-size:12px;text-transform:uppercase;letter-spacing:2px">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${lineItemsHtml}
        </tbody>
      </table>

      <div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:16px;margin-top:8px">
        <div style="display:flex;justify-content:space-between;margin:4px 0">
          <span style="color:#c4bfb3">Subtotal</span>
          <span style="color:#f5f1e8;font-variant-numeric:tabular-nums">N$ ${order.subtotalNAD.toFixed(2)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin:4px 0">
          <span style="color:#c4bfb3">Shipping</span>
          <span style="color:#f5f1e8;font-variant-numeric:tabular-nums">${order.shippingNAD === 0 ? 'Free' : `N$ ${order.shippingNAD.toFixed(2)}`}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin:12px 0 0;padding-top:12px;border-top:1px solid rgba(255,255,255,0.1);font-size:18px;font-weight:bold">
          <span style="color:#f5f1e8">Total</span>
          <span style="color:#f5f1e8;font-variant-numeric:tabular-nums">N$ ${order.totalNAD.toFixed(2)}</span>
        </div>
      </div>

      <div style="background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.05);border-radius:16px;padding:20px;margin:24px 0">
        <div style="color:#8b8680;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px">Shipping To</div>
        <p style="margin:0;color:#f5f1e8;line-height:1.6">
          ${escapeHtml(addr.name)}<br/>
          ${escapeHtml(addr.line1)}<br/>
          ${addr.line2 ? escapeHtml(addr.line2) + '<br/>' : ''}
          ${escapeHtml(addr.city)}, ${escapeHtml(addr.region)} ${escapeHtml(addr.postalCode)}<br/>
          ${escapeHtml(addr.country)}
        </p>
      </div>

      <div style="text-align:center;margin:24px 0">
        <a href="${appUrl}/shop" style="display:inline-block;background:#f5f1e8;color:#0a0a0a;padding:14px 32px;border-radius:50px;text-decoration:none;font-weight:bold;letter-spacing:2px;text-transform:uppercase;font-size:12px">Continue Shopping</a>
      </div>

      <div style="text-align:center;margin-top:40px;color:#8b8680;font-size:12px">
        <p>Give Love Back — Fashion as an act of care.</p>
        <p>&copy; ${new Date().getFullYear()} GLB. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>`

  await transporter.sendMail({
    from: `"Give Love Back" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Order Confirmed — ${order.orderNumber}`,
    html,
  })
}

export async function sendOrderStatusUpdate(
  order: PublicOrder,
  newStatus: string,
): Promise<void> {
  const email = order.guestEmail
  if (!email) return

  await transporter.sendMail({
    from: `"Give Love Back" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Order ${order.orderNumber} — ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
    html: `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background-color:#0a0a0a;font-family:Arial,Helvetica,sans-serif;color:#f5f1e8">
    <div style="max-width:600px;margin:40px auto;background:linear-gradient(135deg,#1a1a1a,#2d2d2d);border:1px solid rgba(255,255,255,0.1);border-radius:24px;padding:40px">
      <div style="text-align:center;margin-bottom:30px">
        <div style="font-size:32px;font-weight:bold;color:#f5f1e8;letter-spacing:4px">GLB</div>
        <div style="font-size:24px;color:#f5f1e8;margin:20px 0">Order Update</div>
      </div>
      <p style="line-height:1.8;color:#c4bfb3">
        Your order <strong style="color:#f5f1e8;font-family:monospace">${escapeHtml(order.orderNumber)}</strong>
        has been updated to: <strong style="color:#f5f1e8;text-transform:capitalize">${escapeHtml(newStatus)}</strong>.
      </p>
      ${order.trackingNumber ? `<p style="line-height:1.8;color:#c4bfb3">Tracking number: <strong style="color:#f5f1e8;font-family:monospace">${escapeHtml(order.trackingNumber)}</strong></p>` : ''}
      <p style="line-height:1.8;color:#c4bfb3">If you have any questions, please reply to this email.</p>
      <div style="text-align:center;margin-top:40px;color:#8b8680;font-size:12px">
        <p>Give Love Back — Fashion as an act of care.</p>
        <p>&copy; ${new Date().getFullYear()} GLB. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>`,
  })
}
