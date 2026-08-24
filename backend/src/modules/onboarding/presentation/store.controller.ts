import { Request, Response } from 'express';
import { storeService } from '../domain/store.service';

export class StoreController {
  async createStore(req: Request, res: Response) {
    try {
      const { userId, name, industry, role, referralCode } = req.body;
      
      const store = await storeService.createStore({
        userId,
        name,
        industry,
        role,
        referralCode
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
