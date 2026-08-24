import { Request, Response } from 'express';
import { authService } from '../domain/auth.service';
import jwt from 'jsonwebtoken';

export class AuthController {
  async registerPhone(req: Request, res: Response) {
    try {
      const { phone } = req.body;
      
      if (!phone) {
        return res.status(400).json({ error: 'Vui lòng cung cấp số điện thoại' });
      }

      const result = await authService.registerPhone(phone);
      
      const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_sobanhang';
      
      const setupToken = jwt.sign(
        { userId: result.userId, scope: 'setup' },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.cookie('setupToken', setupToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 3600000 // 1 hour
      });

      return res.status(200).json({ message: result.message });
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
        { userId: user.userId, role: user.role, scope: 'access' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Xóa setupToken cũ
      res.clearCookie('setupToken');

      // Set accessToken mới
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
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
}

export const authController = new AuthController();
