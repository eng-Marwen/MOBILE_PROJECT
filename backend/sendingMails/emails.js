// ======================= IMPORTS =======================

// Email HTML templates
import {
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
} from "./emailTemplates.js";

// Mail transporter configuration and sender info
import { sendMail, sender } from "./mail.config.js";

// ======================= SEND VERIFICATION EMAIL =======================

/**
 * Sends a verification email containing a verification code
 * @param {string} email - User email address
 * @param {string|number} verificationToken - Verification code
 */
export const sendVerificatinMail = async (email, verificationToken) => {
  try {
    // Send verification email
    const response = await sendMail.sendMail({
      from: `"${sender.name}" <${sender.email}>`,
      to: email,
      subject: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
    });

    // Log success
    console.log("Email is sent successfully", response);
  } catch (error) {
    // Log error
    console.log("Error sending verification mail");

    // Propagate error
    throw new Error("Error sending verification mail: " + error);
  }
};

// ======================= SEND WELCOME EMAIL =======================

/**
 * Sends a welcome email after successful account verification
 * @param {string} email - User email address
 * @param {string} name - User name
 */
export const sendWemcomeEmail = async (email, name) => {
  try {
    // Send welcome email
    const response = await sendMail.sendMail({
      from: `"${sender.name}" <${sender.email}>`,
      to: email,
      subject: "Welcome to Auth Project",
      html: WELCOME_EMAIL_TEMPLATE.replace("{userName}", name),
    });

    // Log success
    console.log("Email is sent successfully", response);
  } catch (error) {
    // Log error
    console.log("Error sending welcome mail");

    // Throw detailed error
    throw new Error("Error sending welcome mail: " + error.message);
  }
};

// ======================= SEND PASSWORD RESET LINK =======================

/**
 * Sends a password reset link to the user
 * @param {string} token - Password reset token
 * @param {string} email - User email address
 */
export const sendLinkForResettingPwd = async (token, email) => {
  // Build password reset URL
  const resetUrl = "http://localhost/api/auth/reset-password?token=" + token;

  // Email configuration
  const mailOptions = {
    from: `"${sender.name}" <${sender.email}>`,
    to: email,
    subject: "Forgot Password",
    html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetUrl),
  };

  try {
    // Send reset password email
    const response = await sendMail.sendMail(mailOptions);

    // Log success
    console.log("Email is sent successfully to " + email, response.response);
  } catch (error) {
    // Log error
    console.log("Error sending reset password email:", error);

    // Propagate error
    throw new Error("Error sending reset password email: " + error.message);
  }
};

// ======================= PASSWORD RESET SUCCESS EMAIL =======================

/**
 * Sends a confirmation email after password reset succeeds
 * @param {string} email - User email address
 */
export const sendResetPwdSuccessfullyMail = async (email) => {
  try {
    // Email configuration
    const mailOptions = {
      from: sender.email,
      to: email,
      subject: "Password Reset Successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
    };

    // Send email
    await sendMail.sendMail(mailOptions);
  } catch (error) {
    // Throw error if email fails
    throw new Error(
      "Error sending reset password successfully email: " + error.message
    );
  }
};
