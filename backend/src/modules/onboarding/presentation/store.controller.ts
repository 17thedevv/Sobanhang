import { Request, Response } from 'express';
import { storeService } from '../domain/store.service';
import { prisma } from '../../../prisma';

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
      return res.status(500).json({ error: error.message });
    }
  }

  async getSettings(req: Request, res: Response) {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) {
        return res.status(400).json({ error: 'Cửa hàng không tồn tại' });
      }

      const store = await prisma.store.findUnique({
        where: { id: storeId }
      });

      if (!store) {
        return res.status(404).json({ error: 'Cửa hàng không tồn tại' });
      }

      const settings = store.settings ? JSON.parse(store.settings) : {};
      return res.status(200).json(settings);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async updateSettings(req: Request, res: Response) {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) {
        return res.status(400).json({ error: 'Cửa hàng không tồn tại' });
      }

      const { productSettings } = req.body;
      
      const store = await prisma.store.findUnique({
        where: { id: storeId }
      });

      if (!store) {
        return res.status(404).json({ error: 'Cửa hàng không tồn tại' });
      }

      const currentSettings = store.settings ? JSON.parse(store.settings) : {};
      const newSettings = {
        ...currentSettings,
        ...(productSettings && { productSettings })
      };

      await prisma.store.update({
        where: { id: storeId },
        data: { settings: JSON.stringify(newSettings) }
      });

      return res.status(200).json({ message: 'Cập nhật cài đặt thành công', settings: newSettings });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export const storeController = new StoreController();
