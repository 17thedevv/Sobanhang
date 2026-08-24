import { prisma } from '../../../prisma';
import crypto from 'crypto';

export class AuthService {
  /**
   * Register a new phone number
   */
  async registerPhone(phone: string) {
    // 1. Normalize phone (basic logic for MVP)
    const normalizedPhone = this.normalizePhone(phone);
    if (!this.isValidVietnamesePhone(normalizedPhone)) {
      throw new Error('Số điện thoại không hợp lệ');
    }

    // 2. Check if phone is already registered and active
    const existingUser = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
    });

    if (existingUser && existingUser.status !== 'NEW' && existingUser.status !== 'REGISTERING') {
      throw new Error('Số điện thoại đã được đăng ký');
    }

    // 3. Create or update user
    let user;
    if (existingUser) {
      user = await prisma.user.update({
        where: { id: existingUser.id },
        data: { status: 'REGISTERING' }
      });
    } else {
      user = await prisma.user.create({
        data: {
          phone: normalizedPhone,
          status: 'REGISTERING',
        }
      });
    }

    // 4. Create OnboardingSession
    await prisma.onboardingSession.upsert({
      where: { phone: normalizedPhone },
      update: { status: 'IN_PROGRESS' },
      create: {
        phone: normalizedPhone,
        status: 'IN_PROGRESS'
      }
    });

    // 5. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store OTP in database
    await prisma.otpVerification.create({
      data: {
        phone: normalizedPhone,
        codeHash: otp, // MVP: store plain text, ideal: hash it
        purpose: 'REGISTER',
        expiresAt: expiresAt,
      }
    });

    // MVP: Print OTP to console instead of sending SMS
    console.log(`\n========================================`);
    console.log(`🔔 SMS SIMULATION: Mã OTP của bạn là: ${otp}`);
    console.log(`========================================\n`);

    return {
      message: 'Mã OTP đã được gửi',
      userId: user.id
    };
  }

  private normalizePhone(phone: string): string {
    let p = phone.trim().replace(/\s/g, '');
    if (p.startsWith('+84')) p = '0' + p.slice(3);
    if (p.startsWith('84')) p = '0' + p.slice(2);
    return p;
  }

  private isValidVietnamesePhone(phone: string): boolean {
    const regex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    return regex.test(phone);
  }
}

export const authService = new AuthService();
