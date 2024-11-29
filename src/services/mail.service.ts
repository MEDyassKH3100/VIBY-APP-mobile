// mail.service.ts
import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Set up transporter to use Gmail
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // ou utilisez un autre service SMTP
      port: 587,
      secure: false, // utilisez true pour le port 465
      auth: {
        user: 'chatesprit3@gmail.com',
        pass: 'vdhu sqjt wuid vjkr',
      },
    });
  }

  async sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `http://localhost:3000/auth/verify/${token}`;
    const html = `
       <h1>Email Verification</h1>
    <p>Please click the button below to verify your email:</p>
    <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 14px 25px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px;">Verify Email</a>
   `;
   try {
    await this.transporter.sendMail({
      from: 'Auth-backend service <chatesprit3@gmail.com>',
      to: email,
      subject: 'Verify Your Email',
      html: html,
    });
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw new Error('Email sending failed');
  }
}

  async sendOtpEmail(to: string, otp: number) {
    const htmlTemplate = `
      <h1>Réinitialisation de mot de passe - OTP</h1>
      <p>Votre OTP est : <strong>${otp}</strong></p>
      <p>Il expirera dans 10 minutes.</p>
    `;

    const mailOptions = {
      from: 'Auth-backend service <chatesprit3@gmail.com>',
      to: to,
      subject: 'OTP for Password Reset',
      html: htmlTemplate,
    };

    const info = await this.transporter.sendMail(mailOptions);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info)); // Useful for testing with Ethereal
  }
}
