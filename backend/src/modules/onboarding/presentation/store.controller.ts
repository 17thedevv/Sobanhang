import { Request, Response } from 'express';
import { storeService } from '../domain/store.service';

export class StoreController {
  async createStore(req: Request, res: Response) {
    try {
      const { name, industry, role, referralCode } = req.body;
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Không tìm thấy thông tin xác thực' });
      }

      const store = await storeService.createStore({
        userId,
        name,
        industry,
        role,
        referralCode
      });

      const jwt = require('jsonwebtoken');
      const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_sobanhang';
      
      const accessToken = jwt.sign(
        { userId: req.user?.userId, role: req.user?.role, scope: 'access', storeId: store.id },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 3600000 // 7 days
      });

      return res.status(201).json({
        message: 'Tạo cửa hàng thành công',
        store
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export const storeController = new StoreController();
