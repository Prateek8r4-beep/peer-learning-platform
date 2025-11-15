const twilio = require('twilio');

class TwilioService {
  constructor() {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      this.verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
    }
  }

  async sendVerificationCode(phoneNumber) {
    if (!this.client) {
      console.warn('Twilio not configured, skipping SMS');
      return { success: true, mock: true };
    }

    try {
      const verification = await this.client.verify.v2
        .services(this.verifyServiceSid)
        .verifications.create({
          to: phoneNumber,
          channel: 'sms'
        });

      return {
        success: true,
        status: verification.status,
        to: verification.to
      };
    } catch (error) {
      console.error('Twilio Send Error:', error);
      throw new Error('Failed to send verification code');
    }
  }

  async verifyCode(phoneNumber, code) {
    if (!this.client) {
      console.warn('Twilio not configured, accepting any code');
      return code === '123456'; // Mock verification
    }

    try {
      const verificationCheck = await this.client.verify.v2
        .services(this.verifyServiceSid)
        .verificationChecks.create({
          to: phoneNumber,
          code: code
        });

      return verificationCheck.status === 'approved';
    } catch (error) {
      console.error('Twilio Verify Error:', error);
      return false;
    }
  }

  async sendSMS(to, message) {
    if (!this.client) {
      console.warn('Twilio not configured, skipping SMS');
      return { success: true, mock: true };
    }

    try {
      const result = await this.client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: to
      });

      return {
        success: true,
        sid: result.sid,
        status: result.status
      };
    } catch (error) {
      console.error('Twilio SMS Error:', error);
      throw new Error('Failed to send SMS');
    }
  }
}

module.exports = new TwilioService();
