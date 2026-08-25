"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preferenceService = exports.PreferenceService = void 0;
const prisma_1 = require("../../../prisma");
class PreferenceService {
    validPreferences = ['CONSULT_NOW', 'SCHEDULE', 'SELF_EXPLORE'];
    async setPreference(data) {
        const { userId, preference } = data;
        if (!userId) {
            throw new Error('Thiếu thông tin người dùng (userId)');
        }
        if (!this.validPreferences.includes(preference)) {
            throw new Error('Lựa chọn không hợp lệ');
        }
        // 1. Kiểm tra trạng thái User
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            include: { onboardingSession: true }
        });
        if (!user) {
            throw new Error('Người dùng không tồn tại');
        }
        // Nếu đã ACTIVE thì không cho phép cập nhật nữa
        if (user.status === 'ACTIVE') {
            throw new Error('Tài khoản đã hoàn tất cài đặt, không thể sửa sở thích onboarding');
        }
        // Nếu status không phải SHOP_CREATED hoặc PASSWORD_NOT_SET, có thể họ chưa tới bước này
        // Nhưng vì MVP, ta chỉ cần chặn nếu là ACTIVE.
        // 2. Kiểm tra xem session Onboarding đã COMPLETED chưa (Idempotency)
        const session = user.onboardingSession;
        if (!session) {
            throw new Error('Không tìm thấy phiên Onboarding của người dùng này');
        }
        if (session.status === 'COMPLETED' && session.onboardingPreference === preference) {
            // Idempotent: Nếu đã completed và giống hệt preference cũ, trả về luôn thành công
            return { message: 'Lựa chọn đã được ghi nhận (Idempotent)', status: 'PASSWORD_NOT_SET' };
        }
        // 3. Cập nhật Preference
        await prisma_1.prisma.$transaction(async (tx) => {
            // Cập nhật session
            await tx.onboardingSession.update({
                where: { userId: userId },
                data: {
                    onboardingPreference: preference,
                    status: 'COMPLETED'
                }
            });
            // Cập nhật user status lên PASSWORD_NOT_SET (để chuẩn bị sang US-07)
            if (user.status !== 'PASSWORD_NOT_SET') {
                await tx.user.update({
                    where: { id: userId },
                    data: { status: 'PASSWORD_NOT_SET' }
                });
            }
        });
        return { message: 'Lưu thiết lập thành công', status: 'PASSWORD_NOT_SET' };
    }
}
exports.PreferenceService = PreferenceService;
exports.preferenceService = new PreferenceService();
