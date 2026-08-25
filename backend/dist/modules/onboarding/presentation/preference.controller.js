"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preferenceController = exports.PreferenceController = void 0;
const preference_service_1 = require("../domain/preference.service");
class PreferenceController {
    async setPreference(req, res) {
        try {
            const { preference } = req.body;
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({ error: 'Không tìm thấy thông tin xác thực' });
            }
            const result = await preference_service_1.preferenceService.setPreference({ userId, preference });
            return res.status(200).json(result);
        }
        catch (error) {
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
exports.PreferenceController = PreferenceController;
exports.preferenceController = new PreferenceController();
