"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeService = exports.StoreService = void 0;
const prisma_1 = require("../../../prisma");
class StoreService {
    /**
     * Tạo cửa hàng mới và gán owner
     */
    async createStore(data) {
        const { userId, name, industry, role, referralCode } = data;
        // 1. Validate đầu vào cơ bản
        if (!name || name.trim().length < 3) {
            throw new Error('Tên cửa hàng phải có ít nhất 3 ký tự');
        }
        if (!industry || industry.trim().length === 0) {
            throw new Error('Vui lòng chọn ngành hàng');
        }
        if (!userId) {
            throw new Error('Thiếu thông tin người dùng (userId)');
        }
        // 2. Kiểm tra User có tồn tại không
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('Người dùng không tồn tại');
        }
        // MVP: Một user chỉ có 1 cửa hàng
        const existingStore = await prisma_1.prisma.store.findFirst({
            where: { ownerId: userId },
        });
        if (existingStore) {
            throw new Error('Người dùng này đã có cửa hàng');
        }
        // 3. Tạo Store
        // Ở MVP chúng ta ghi nhận vai trò mặc định là Chủ cửa hàng
        const store = await prisma_1.prisma.store.create({
            data: {
                name: name.trim(),
                industry: industry.trim(),
                ownerId: userId,
            },
        });
        // 4. Update trạng thái User sang SHOP_CREATED
        await prisma_1.prisma.user.update({
            where: { id: userId },
            data: { status: 'SHOP_CREATED' },
        });
        return store;
    }
}
exports.StoreService = StoreService;
exports.storeService = new StoreService();
