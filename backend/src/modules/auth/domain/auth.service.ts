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
      where: { userId: user.id },
      update: { status: 'IN_PROGRESS' },
      create: {
        userId: user.id,
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

  /**
   * Xác minh OTP (US-03)
   */
  async verifyOtp(phone: string, otp: string) {
    const normalizedPhone = this.normalizePhone(phone);

    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        phone: normalizedPhone,
        purpose: 'REGISTER',
        consumedAt: null
      },
      orderBy: { expiresAt: 'desc' }
    });

    if (!otpRecord) {
      throw new Error('Mã OTP không tồn tại hoặc đã được sử dụng');
    }

    if (new Date() > otpRecord.expiresAt) {
      throw new Error('Mã OTP đã hết hạn');
    }

    // Ở MVP, ta dùng codeHash lưu plaintext, thực tế phải băm
    if (otpRecord.codeHash !== otp) {
      await prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { attempts: otpRecord.attempts + 1 }
      });
      throw new Error('Mã OTP không chính xác');
    }

    // Đánh dấu đã dùng
    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { consumedAt: new Date() }
    });

    const user = await prisma.user.findUnique({
      where: { phone: normalizedPhone }
    });

    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }

    return {
      userId: user.id
    };
  }

  /**
   * Thiết lập mật khẩu cho tài khoản (US-07)
   */
  async setPassword(userId: string, password: string) {
    const minLength = parseInt(process.env.PASSWORD_MIN_LENGTH || '8');
    if (!password || password.length < minLength) {
      throw new Error(`Mật khẩu phải chứa ít nhất ${minLength} ký tự`);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('Người dùng không tồn tại');
    }

    if (user.status === 'ACTIVE') {
      throw new Error('Người dùng đã thiết lập mật khẩu');
    }
    
    // In strict mode, we could assert status === 'PASSWORD_NOT_SET'
    
    const bcrypt = require('bcrypt');
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        status: 'ACTIVE'
      }
    });

    return {
      userId: updatedUser.id,
      phone: updatedUser.phone,
      role: updatedUser.role,
      status: updatedUser.status
    };
  }

  /**
   * Đăng nhập bằng Số điện thoại & Mật khẩu (US-08)
   */
  async login(phone: string, password: string) {
    const normalizedPhone = this.normalizePhone(phone);
    const user = await prisma.user.findUnique({
      where: { phone: normalizedPhone }
    });

    if (!user) {
      throw new Error('Số điện thoại chưa được đăng ký');
    }

    if (user.status !== 'ACTIVE') {
      throw new Error('Tài khoản chưa hoàn tất thiết lập hoặc đang bị khóa');
    }

    if (!user.passwordHash) {
      throw new Error('Tài khoản chưa thiết lập mật khẩu');
    }

    const bcrypt = require('bcrypt');
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      throw new Error('Mật khẩu không chính xác');
    }

    return {
      userId: user.id,
      phone: user.phone,
      role: user.role,
      status: user.status
    };
  }
}

export const authService = new AuthService();
