import { Request, Response } from 'express';
import { preferenceService } from '../domain/preference.service';

export class PreferenceController {
  async setPreference(req: Request, res: Response) {
    try {
      const { preference } = req.body;
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Không tìm thấy thông tin xác thực' });
      }
      
      const result = await preferenceService.setPreference({ userId, preference });

      return res.status(200).json(result);
    } catch (error: any) {
      if (error.message === 'Lựa chọn không hợp lệ' || error.message.includes('Thiếu')) {
        return res.status(400).json({ error: error.message });
      }
      if (error.message.includes('không tồn tại')) {
        return res.status(404).json({ error: error.message });
      }
      // Từ chối (Forbidden) khi cố gọi lúc đã ACTIVE
      if (error.message.includes('hoàn tất cài đặt')) {
        return res.status(403).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }
}

export const preferenceController = new PreferenceController();
