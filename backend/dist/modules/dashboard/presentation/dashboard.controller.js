"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const prisma_1 = require("../../../prisma");
class DashboardController {
    async getStats(req, res) {
        try {
            const storeId = req.user?.storeId;
            if (!storeId) {
                return res.status(400).json({ error: 'Cửa hàng không tồn tại' });
            }
            // 1. Tổng doanh thu
            const result = await prisma_1.prisma.order.aggregate({
                where: { storeId },
                _sum: {
                    total: true
                }
            });
            const revenue = result._sum.total || 0;
            // 2. Số lượng đơn hàng
            const ordersCount = await prisma_1.prisma.order.count({
                where: { storeId }
            });
            // 3. Sản phẩm bán chạy (Top 5)
            // Lấy tất cả OrderItems của cửa hàng này để tính toán.
            const orderItems = await prisma_1.prisma.orderItem.findMany({
                where: {
                    order: {
                        storeId
                    }
                },
                include: {
                    product: true
                }
            });
            const productSales = {};
            orderItems.forEach(item => {
                if (!item.product)
                    return;
                const pId = item.productId;
                if (!productSales[pId]) {
                    productSales[pId] = {
                        id: pId,
                        name: item.product.name,
                        quantity: 0,
                        revenue: 0
                    };
                }
                productSales[pId].quantity += item.quantity;
                productSales[pId].revenue += item.quantity * item.unitPrice;
            });
            const topProducts = Object.values(productSales)
                .sort((a, b) => b.quantity - a.quantity)
                .slice(0, 5);
            // (Tương lai có thể thêm: 4. Biểu đồ doanh thu theo 7 ngày gần nhất)
            return res.status(200).json({
                revenue,
                ordersCount,
                topProducts
            });
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
exports.DashboardController = DashboardController;
