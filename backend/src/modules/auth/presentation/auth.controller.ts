import { Request, Response } from 'express';
import { authService } from '../domain/auth.service';
import jwt from 'jsonwebtoken';
import { prisma } from '../../../prisma';

export class AuthController {
  async registerEmail(req: Request, res: Response) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Vui lòng cung cấp địa chỉ email' });
      }

      const result = await authService.registerEmail(email);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async verifyOtp(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res.status(400).json({ error: 'Vui lòng cung cấp email và mã OTP' });
      }

      const result = await authService.verifyOtp(email, otp);

      const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_sobanhang';
      
      const setupToken = jwt.sign(
        { userId: result.userId, scope: 'setup' },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.cookie('setupToken', setupToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 3600000 // 1 hour
      });

      return res.status(200).json({ message: 'Xác thực thành công' });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async setPassword(req: Request, res: Response) {
    try {
      const { password } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Không tìm thấy thông tin xác thực' });
      }

      const user = await authService.setPassword(userId, password);

      const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_sobanhang';
      
      const accessToken = jwt.sign(
        { userId: user.userId, role: user.role, scope: 'access', storeId: user.storeId },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Xóa setupToken cũ
      res.clearCookie('setupToken');

      // Set accessToken mới
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 3600000 // 7 days
      });

      return res.status(200).json({ message: 'Thiết lập mật khẩu thành công', user });
    } catch (error: any) {
      if (error.message.includes('tồn tại')) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('đã thiết lập')) {
        return res.status(403).json({ error: error.message });
      }
      return res.status(400).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password, rememberMe } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Vui lòng cung cấp email và mật khẩu' });
      }

      const user = await authService.login(email, password);

      const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_sobanhang';
      const accessToken = jwt.sign(
        { userId: user.userId, role: user.role, scope: 'access', storeId: user.storeId },
        JWT_SECRET,
        { expiresIn: rememberMe ? '30d' : '1d' } // Nếu không nhớ, chỉ lưu 1 ngày
      );

      const cookieOptions: any = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
      };

      if (rememberMe) {
        cookieOptions.maxAge = 30 * 24 * 3600000; // 30 ngày
      } // Nếu rememberMe là false, nó sẽ là Session Cookie (hoặc theo trình duyệt dọn dẹp)

      res.cookie('accessToken', accessToken, cookieOptions);

      return res.status(200).json({ message: 'Đăng nhập thành công', user });
    } catch (error: any) {
      if (error.message.includes('chính xác') || error.message.includes('đăng ký')) {
        return res.status(401).json({ error: error.message });
      }
      if (error.message.includes('thiết lập')) {
        return res.status(403).json({ error: error.message });
      }
      return res.status(400).json({ error: error.message });
    }
  }

  async logout(req: Request, res: Response) {
    const cookieOptions: any = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    };
    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('setupToken', cookieOptions);
    return res.status(200).json({ message: 'Đăng xuất thành công' });
  }

  async getMe(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Không tìm thấy thông tin xác thực' });
      }

      // Fetch user from database to ensure it still exists and gets latest status
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          phone: true,
          status: true,
          role: true,
          store: {
            select: {
              id: true,
              name: true,
              industry: true
            }
          }
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'Không tìm thấy người dùng' });
      }

      return res.status(200).json({ user });
    } catch (error: any) {
      return res.status(500).json({ error: 'Lỗi server khi lấy thông tin người dùng' });
    }
  }

  async googleLogin(req: Request, res: Response) {
    try {
      const { idToken } = req.body;
      if (!idToken) {
        return res.status(400).json({ error: 'Thiếu Google Token' });
      }

      const user = await authService.loginWithGoogle(idToken);
      const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_sobanhang';
      
      // Nếu user.status là ACTIVE thì cho login bình thường
      if (user.status === 'ACTIVE') {
        const accessToken = jwt.sign(
          { userId: user.userId, role: user.role, status: user.status, storeId: user.storeId, scope: 'access' },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        res.cookie('accessToken', accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return res.status(200).json({
          user,
          accessToken
        });
      } else {
        // Tài khoản đang đăng ký dở, cấp setupToken
        const setupToken = jwt.sign(
          { userId: user.userId, role: user.role, status: user.status },
          JWT_SECRET,
          { expiresIn: '1h' }
        );

        res.cookie('setupToken', setupToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          maxAge: 60 * 60 * 1000 // 1 hour
        });

        return res.status(200).json({
          user,
          setupToken
        });
      }
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Vui lòng cung cấp email' });
      }

      const result = await authService.forgotPassword(email);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async verifyResetOtp(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res.status(400).json({ error: 'Vui lòng cung cấp email và mã OTP' });
      }

      const result = await authService.verifyForgotPasswordOtp(email, otp);
      
      const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_sobanhang';
      
      // Cấp resetToken sống trong 15 phút
      const resetToken = jwt.sign(
        { userId: result.userId },
        JWT_SECRET,
        { expiresIn: '15m' }
      );

      res.cookie('resetToken', resetToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      return res.status(200).json({ message: 'Xác minh thành công, vui lòng đặt mật khẩu mới' });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      // Middleware verifyResetToken đã gán userId vào req.user
      const userId = (req as any).user.userId;
      const { newPassword } = req.body;

      if (!newPassword) {
        return res.status(400).json({ error: 'Vui lòng cung cấp mật khẩu mới' });
      }

      await authService.resetPassword(userId, newPassword);

      // Xóa resetToken vì đã dùng xong
      res.clearCookie('resetToken');

      return res.status(200).json({ message: 'Đổi mật khẩu thành công' });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export const authController = new AuthController();
