import { Request, Response } from 'express';
import { authService } from '../domain/auth.service';

export class AuthController {
  async registerPhone(req: Request, res: Response) {
    try {
      const { phone } = req.body;
      
      if (!phone) {
        return res.status(400).json({ error: 'Vui lòng cung cấp số điện thoại' });
      }

      const result = await authService.registerPhone(phone);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export const authController = new AuthController();
