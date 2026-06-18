const nodemailer = require('nodemailer');
const logger = require('./logger');

const createTransporter = () =>
    nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: Number(process.env.EMAIL_PORT) === 465,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

/**
 * Send an email.
 * @param {object} options - { to, subject, html, text? }
 */
const sendEmail = async({ to, subject, html, text }) => {
    try {
        const transporter = createTransporter();
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to,
            subject,
            html,
            text: text || html.replace(/<[^>]*>/g, ''), // fallback plain text
        });
        logger.info(`Email sent to ${to} — messageId: ${info.messageId}`);
        return info;
    } catch (err) {
        logger.error(`Failed to send email to ${to}: ${err.message}`);
        // Do NOT throw — email failure should not break the main flow
    }
};

// ── Email templates ───────────────────────────────────────────────────────────

const sendBookingConfirmation = (to, booking) =>
    sendEmail({
        to,
        subject: `Booking Confirmed — #${booking._id}`,
        html: `
      <h2>Your booking is confirmed! 🎉</h2>
      <p><strong>Vehicle:</strong> ${booking.vehicle?.title || ''}</p>
      <p><strong>From:</strong> ${new Date(booking.startDate).toDateString()}</p>
      <p><strong>To:</strong>   ${new Date(booking.endDate).toDateString()}</p>
      <p><strong>Total:</strong> $${booking.totalPrice}</p>
      <p>Thank you for choosing VehicleRental!</p>
    `,
    });

const sendBookingCancellation = (to, booking) =>
    sendEmail({
        to,
        subject: `Booking Cancelled — #${booking._id}`,
        html: `
      <h2>Your booking has been cancelled.</h2>
      <p>Booking ID: <strong>${booking._id}</strong></p>
      <p>If you were charged, a refund will be processed within 5–7 business days.</p>
    `,
    });

const sendHostApproval = (to, approved) =>
    sendEmail({
        to,
        subject: approved ? 'Your host account is approved!' : 'Host application update',
        html: approved ?
            `<h2>Congratulations! 🎉</h2><p>Your host account has been approved. You can now list your vehicles.</p>` :
            `<h2>Application Update</h2><p>Unfortunately, your host application was not approved at this time.</p>`,
    });

const sendWelcomeEmail = (to, name) =>
    sendEmail({
        to,
        subject: 'Welcome to VehicleRental!',
        html: `<h2>Welcome, ${name}! 👋</h2><p>Your account has been created successfully.</p>`,
    });

module.exports = {
    sendEmail,
    sendBookingConfirmation,
    sendBookingCancellation,
    sendHostApproval,
    sendWelcomeEmail,
};