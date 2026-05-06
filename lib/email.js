import nodemailer from 'nodemailer'

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// Create transporter (configure with your email service)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Send RSVP confirmation to user
export async function sendRsvpConfirmation({ name, email, eventTitle, eventDate, guests }) {
  const mailOptions = {
    from: `"GLB Events" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `RSVP Confirmed: ${eventTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Arial', sans-serif; background-color: #0a0a0a; color: #f5f1e8; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background: linear-gradient(135deg, #1a1a1a, #2d2d2d); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; padding: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 32px; font-weight: bold; color: #ff6b3d; letter-spacing: 4px; }
            .title { font-size: 24px; color: #f5f1e8; margin: 20px 0; }
            .content { line-height: 1.8; color: #c4bfb3; }
            .details { background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 20px; margin: 20px 0; }
            .details-item { margin: 10px 0; padding: 8px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
            .details-item:last-child { border-bottom: none; }
            .label { color: #8b8680; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; }
            .value { color: #f5f1e8; font-size: 16px; margin-top: 4px; }
            .button { display: inline-block; background: linear-gradient(90deg, #ff6b3d, #ff8c61); color: #0a0a0a; padding: 14px 32px; border-radius: 50px; text-decoration: none; margin: 20px 0; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; font-size: 12px; }
            .footer { text-align: center; margin-top: 40px; color: #8b8680; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">GLB</div>
              <div class="title">RSVP Confirmed!</div>
            </div>
            
            <div class="content">
              <p>Hey ${name},</p>
              <p>Thanks for RSVPing! We're excited to see you at <strong>${eventTitle}</strong>.</p>
              
              <div class="details">
                <div class="details-item">
                  <div class="label">Event</div>
                  <div class="value">${eventTitle}</div>
                </div>
                <div class="details-item">
                  <div class="label">Date</div>
                  <div class="value">${eventDate}</div>
                </div>
                <div class="details-item">
                  <div class="label">Guests</div>
                  <div class="value">${guests} ${guests === 1 ? 'person' : 'people'}</div>
                </div>
              </div>
              
              <p>We'll send you more details as the event approaches. If you need to make changes, please reply to this email.</p>
              
              <center>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/events" class="button">View Event Details</a>
              </center>
            </div>
            
            <div class="footer">
              <p>Give Love Back — Create with Purpose. Impact with Heart.</p>
              <p>© ${new Date().getFullYear()} GLB. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }

  await transporter.sendMail(mailOptions)
}

// Notify admin of new RSVP
export async function notifyAdminNewRsvp({ name, email, phone, eventTitle, eventDate, guests, message }) {
  const mailOptions = {
    from: `"GLB Events" <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
    subject: `New RSVP: ${eventTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Arial', sans-serif; background-color: #0a0a0a; color: #f5f1e8; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background: linear-gradient(135deg, #1a1a1a, #2d2d2d); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; padding: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 32px; font-weight: bold; color: #ff6b3d; letter-spacing: 4px; }
            .title { font-size: 24px; color: #f5f1e8; margin: 20px 0; }
            .alert { background: rgba(255, 107, 61, 0.1); border: 1px solid rgba(255, 107, 61, 0.3); border-radius: 16px; padding: 20px; margin: 20px 0; }
            .details { background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 20px; margin: 20px 0; }
            .details-item { margin: 10px 0; padding: 8px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
            .details-item:last-child { border-bottom: none; }
            .label { color: #8b8680; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; }
            .value { color: #f5f1e8; font-size: 16px; margin-top: 4px; }
            .button { display: inline-block; background: linear-gradient(90deg, #ff6b3d, #ff8c61); color: #0a0a0a; padding: 14px 32px; border-radius: 50px; text-decoration: none; margin: 20px 0; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">GLB</div>
              <div class="title">🎉 New RSVP Received</div>
            </div>
            
            <div class="alert">
              <p><strong>${name}</strong> has RSVP'd for <strong>${eventTitle}</strong>!</p>
            </div>
            
            <div class="details">
              <div class="details-item">
                <div class="label">Name</div>
                <div class="value">${name}</div>
              </div>
              <div class="details-item">
                <div class="label">Email</div>
                <div class="value">${email}</div>
              </div>
              ${phone ? `
              <div class="details-item">
                <div class="label">Phone</div>
                <div class="value">${phone}</div>
              </div>
              ` : ''}
              <div class="details-item">
                <div class="label">Event</div>
                <div class="value">${eventTitle}</div>
              </div>
              <div class="details-item">
                <div class="label">Date</div>
                <div class="value">${eventDate}</div>
              </div>
              <div class="details-item">
                <div class="label">Guests</div>
                <div class="value">${guests} ${guests === 1 ? 'person' : 'people'}</div>
              </div>
              ${message ? `
              <div class="details-item">
                <div class="label">Message</div>
                <div class="value">${message}</div>
              </div>
              ` : ''}
            </div>
            
            <center>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/rsvp" class="button">View Dashboard</a>
            </center>
          </div>
        </body>
      </html>
    `,
  }

  await transporter.sendMail(mailOptions)
}

// Send bulk email to RSVP attendees
export async function sendBulkEmail({ recipients, subject, message, eventTitle }) {
  const mailOptions = {
    from: `"GLB Events" <${process.env.SMTP_USER}>`,
    bcc: recipients.join(', '),
    subject,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Arial', sans-serif; background-color: #0a0a0a; color: #f5f1e8; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background: linear-gradient(135deg, #1a1a1a, #2d2d2d); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; padding: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 32px; font-weight: bold; color: #ff6b3d; letter-spacing: 4px; }
            .title { font-size: 24px; color: #f5f1e8; margin: 20px 0; }
            .content { line-height: 1.8; color: #c4bfb3; }
            .footer { text-align: center; margin-top: 40px; color: #8b8680; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">GLB</div>
              <div class="title">${eventTitle}</div>
            </div>
            
            <div class="content">
              ${message}
            </div>
            
            <div class="footer">
              <p>Give Love Back — Create with Purpose. Impact with Heart.</p>
              <p>© ${new Date().getFullYear()} GLB. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }

  await transporter.sendMail(mailOptions)
}

export async function sendContactMessage({ name, email, message }) {
  const safeName = escapeHtml(name)
  const safeEmail = escapeHtml(email)
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br/>')

  const mailOptions = {
    from: `"GLB Website" <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
    subject: `Website Contact: ${safeName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:24px auto;background:#141414;color:#f5f1e8;border-radius:16px;padding:24px;border:1px solid rgba(255,255,255,0.08)">
        <h2 style="margin:0 0 16px;color:#ff6b3d;letter-spacing:1px">New Contact Message</h2>
        <p style="margin:0 0 8px"><strong>Name:</strong> ${safeName}</p>
        <p style="margin:0 0 8px"><strong>Email:</strong> ${safeEmail}</p>
        <p style="margin:16px 0 8px"><strong>Message</strong></p>
        <div style="line-height:1.7;color:#d6d0c4">${safeMessage}</div>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}

export async function sendNewsletterSignup({ email }) {
  const safeEmail = escapeHtml(email)

  const mailOptions = {
    from: `"GLB Website" <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
    subject: 'Website Newsletter Signup',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:24px auto;background:#141414;color:#f5f1e8;border-radius:16px;padding:24px;border:1px solid rgba(255,255,255,0.08)">
        <h2 style="margin:0 0 16px;color:#ff6b3d;letter-spacing:1px">New Newsletter Signup</h2>
        <p style="margin:0"><strong>Email:</strong> ${safeEmail}</p>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}
