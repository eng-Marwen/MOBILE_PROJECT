// ======================= IMPORTS =======================

// HTML template for verification email
import { VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js";

// Mailtrap client configuration & sender info
import { mailtrapClient, sender } from "./mailtrap.config.js";

// ======================= SEND VERIFICATION EMAIL =======================

/**
 * Sends a verification email containing a 6-digit code
 * @param {string} email - Recipient email address
 * @param {string|number} verificationToken - Verification code
 */
export const sendVerificatinMail = async (email, verificationToken) => {
  // Mailtrap expects recipients as an array
  const recipient = [{ email }];

  try {
    // Send verification email using custom HTML template
    const response = mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
      category: "email verification",
    });

    // Log success response
    console.log("Email sent successfully", response);
  } catch (error) {
    // Log error for debugging
    console.log("Error sending verification mail");

    // Throw error to be handled by controller
    throw new Error("Error sending verification mail: " + error);
  }
};

// ======================= SEND WELCOME EMAIL =======================

/**
 * Sends a welcome email after successful account verification
 * @param {string} email - Recipient email address
 * @param {string} name - User name to personalize email
 */
export const sendWemcomeEmail = async (email, name) => {
  // Mailtrap recipient format
  const recipient = [{ email }];

  try {
    // Send email using Mailtrap stored template
    const response = mailtrapClient.send({
      from: sender,
      to: recipient,
      template_uuid: "9944185f-bbe8-4869-8d51-d9f809a57063",
      template_variables: {
        company_info_name: "AUTH Project",
        name: name,
      },
    });

    // Log success response
    console.log("Email sent successfully", response);
  } catch (error) {
    // Log error
    console.log("Error sending welcome mail");

    // Propagate error
    throw new Error("Error sending welcome mail: " + error);
  }
};
