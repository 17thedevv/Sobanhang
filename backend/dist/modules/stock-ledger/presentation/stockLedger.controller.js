"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockLedgerController = void 0;
const prisma_1 = require("../../../prisma");
class StockLedgerController {
    async getTransactions(req, res) {
        try {
            const storeId = req.user?.storeId;
            if (!storeId)
                return res.status(403).json({ message: 'Store required' });
            const { productId, type, startDate, endDate } = req.query;
            const where = { storeId };
            if (productId && productId !== 'ALL') {
                where.productId = productId;
            }
            if (type && type !== 'ALL') {
                where.type = type;
            }
            if (startDate || endDate) {
                where.createdAt = {};
                if (startDate) {
                    where.createdAt.gte = new Date(startDate);
                }
                if (endDate) {
                    const end = new Date(endDate);
                    end.setHours(23, 59, 59, 999);
                    where.createdAt.lte = end;
                }
            }
            const transactions = await prisma_1.prisma.stockTransaction.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                include: {
                    product: true,
                }
            });
            res.json({ transactions });
        }
        catch (error) {
            console.error('Error getting stock ledger transactions:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    async getProductLedger(req, res) {
        try {
            const storeId = req.user?.storeId;
            if (!storeId)
                return res.status(403).json({ message: 'Store required' });
            const productId = req.params.productId;
            const transactions = await prisma_1.prisma.stockTransaction.findMany({
                where: { storeId, productId },
                orderBy: { createdAt: 'desc' },
                include: {
                    product: true,
                }
            });
            res.json({ transactions });
        }
        catch (error) {
            console.error('Error getting product stock ledger:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    async getSummary(req, res) {
        try {
            const storeId = req.user?.storeId;
            if (!storeId)
                return res.status(403).json({ message: 'Store required' });
            // MVP: Calculate total stock value currently. 
            // A more complex implementation would calculate based on date range.
            const products = await prisma_1.prisma.product.findMany({
                where: { storeId }
            });
            let totalStockValue = 0;
            products.forEach(p => {
                totalStockValue += (p.stock * p.price);
            });
            res.json({
                totalStockValue
            });
        }
        catch (error) {
            console.error('Error getting stock ledger summary:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}
exports.StockLedgerController = StockLedgerController;
