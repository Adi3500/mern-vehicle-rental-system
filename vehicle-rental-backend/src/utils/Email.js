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

const sendEmail = async({ to, subject, html, text }) => {
    try {
        const transporter = createTransporter();
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to,
            subject,
            html,
            text: text || html.replace(/<[^>]*>/g, ''),
        });
        logger.info(`Email sent to ${to} - messageId: ${info.messageId}`);
        return info;
    } catch (err) {
        logger.error(`Failed to send email to ${to}: ${err.message}`);
    }
};

const sendBookingConfirmation = (to, booking) =>
    sendEmail({
        to,
        subject: `Booking Confirmed - #${booking._id}`,
        html: `
      <h2>Your booking is confirmed!</h2>
      <p><strong>Vehicle:</strong> ${booking.vehicle?.title || ''}</p>
      <p><strong>From:</strong> ${new Date(booking.startDate).toDateString()}</p>
      <p><strong>To:</strong> ${new Date(booking.endDate).toDateString()}</p>
      <p><strong>Total:</strong> $${booking.totalPrice}</p>
      <p>Thank you for choosing VehicleRental.</p>
    `,
    });

const sendBookingCancellation = (to, booking) =>
    sendEmail({
        to,
        subject: `Booking Cancelled - #${booking._id}`,
        html: `
      <h2>Your booking has been cancelled.</h2>
      <p>Booking ID: <strong>${booking._id}</strong></p>
      <p>If you were charged, a refund will be processed within 5-7 business days.</p>
    `,
    });

const sendHostApproval = (to, approved) =>
    sendEmail({
        to,
        subject: approved ? 'Your host account is approved!' : 'Host application update',
        html: approved
            ? '<h2>Congratulations!</h2><p>Your host account has been approved. You can now list your vehicles.</p>'
            : '<h2>Application Update</h2><p>Unfortunately, your host application was not approved at this time.</p>',
    });

const sendWelcomeEmail = (to, name) =>
    sendEmail({
        to,
        subject: 'Welcome to VehicleRental!',
        html: `<h2>Welcome, ${name}!</h2><p>Your account has been created successfully.</p>`,
    });

const sendEmailVerification = (to, name, verificationUrl) =>
    sendEmail({
        to,
        subject: 'Verify your VehicleRental email',
        html: `
      <h2>Verify your email address</h2>
      <p>Hi ${name},</p>
      <p>Please verify your email to activate your VehicleRental account.</p>
      <p><a href="${verificationUrl}" target="_blank" rel="noopener noreferrer">Verify email</a></p>
      <p>If the button does not work, copy and paste this link into your browser:</p>
      <p>${verificationUrl}</p>
    `,
    });

const sendLicenseReviewUpdate = (to, name, type, status, notes = '') =>
    sendEmail({
        to,
        subject: `${type} verification ${status}`,
        html: `
      <h2>${type} verification update</h2>
      <p>Hi ${name},</p>
      <p>Your ${type.toLowerCase()} verification has been <strong>${status}</strong>.</p>
      ${notes ? `<p>Reviewer notes: ${notes}</p>` : ''}
    `,
    });

module.exports = {
    sendEmail,
    sendBookingConfirmation,
    sendBookingCancellation,
    sendHostApproval,
    sendWelcomeEmail,
    sendEmailVerification,
    sendLicenseReviewUpdate,
};
