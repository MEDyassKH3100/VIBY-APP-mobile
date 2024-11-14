// mail.service.ts
import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Set up transporter to use Gmail
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
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
      <p>Please click the link below to verify your email:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
    `;

    await this.transporter.sendMail({
      from: 'Auth-backend service <chatesprit3@gmail.com>',
      to: email,
      subject: 'Verify Your Email',
      html: html
    });
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
