"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CashbookController = void 0;
const prisma_1 = require("../../../prisma");
class CashbookController {
    async getSources(req, res) {
        try {
            const storeId = req.user?.storeId;
            if (!storeId) {
                return res.status(403).json({ error: 'Shop not created yet' });
            }
            let sources = await prisma_1.prisma.cashSource.findMany({
                where: { storeId },
                orderBy: { order: 'asc' },
            });
            if (sources.length === 0) {
                // Tự động tạo nguồn tiền mặc định cho cửa hàng
                const defaultSource = await prisma_1.prisma.cashSource.create({
                    data: {
                        storeId,
                        name: 'Tiền mặt',
                        type: 'CASH',
                        balance: 0,
                        isDefault: true,
                        order: 0,
                    }
                });
                sources = [defaultSource];
            }
            return res.json({ sources });
        }
        catch (error) {
            console.error('Error fetching cash sources:', error);
            return res.status(500).json({ error: error.message });
        }
    }
    async createSource(req, res) {
        try {
            const storeId = req.user?.storeId;
            if (!storeId) {
                return res.status(403).json({ error: 'Shop not created yet' });
            }
            const { name, type, balance, createdAt } = req.body;
            const existingSources = await prisma_1.prisma.cashSource.count({
                where: { storeId }
            });
            const source = await prisma_1.prisma.cashSource.create({
                data: {
                    storeId,
                    name,
                    type: type || 'CASH',
                    balance: parseFloat(balance) || 0,
                    isDefault: existingSources === 0,
                    order: existingSources,
                    createdAt: createdAt ? new Date(createdAt) : new Date(),
                }
            });
            if (source.balance > 0) {
                await prisma_1.prisma.cashTransaction.create({
                    data: {
                        cashSourceId: source.id,
                        amount: source.balance,
                        type: 'IN',
                        description: 'Số dư ban đầu',
                        createdAt: source.createdAt
                    }
                });
            }
            return res.status(201).json({ source });
        }
        catch (error) {
            console.error('Error creating cash source:', error);
            return res.status(500).json({ error: error.message });
        }
    }
    async updateSourceOrder(req, res) {
        try {
            const storeId = req.user?.storeId;
            if (!storeId) {
                return res.status(403).json({ error: 'Shop not created yet' });
            }
            const { orderMapping } = req.body; // { sourceId: newOrderIndex }
            const updates = [];
            for (const id in orderMapping) {
                updates.push(prisma_1.prisma.cashSource.update({
                    where: { id, storeId },
                    data: { order: orderMapping[id] }
                }));
            }
            await prisma_1.prisma.$transaction(updates);
            return res.json({ success: true });
        }
        catch (error) {
            console.error('Error updating source order:', error);
            return res.status(500).json({ error: error.message });
        }
    }
    async transferMoney(req, res) {
        try {
            const storeId = req.user?.storeId;
            if (!storeId) {
                return res.status(403).json({ error: 'Shop not created yet' });
            }
            const { fromSourceId, toSourceId, amount, description } = req.body;
            const transferAmount = parseFloat(amount);
            if (!fromSourceId || !toSourceId || isNaN(transferAmount) || transferAmount <= 0) {
                return res.status(400).json({ error: 'Dữ liệu chuyển tiền không hợp lệ' });
            }
            if (fromSourceId === toSourceId) {
                return res.status(400).json({ error: 'Nguồn gửi và nhận không được trùng nhau' });
            }
            const result = await prisma_1.prisma.$transaction(async (tx) => {
                const fromSource = await tx.cashSource.findUnique({
                    where: { id: fromSourceId, storeId }
                });
                const toSource = await tx.cashSource.findUnique({
                    where: { id: toSourceId, storeId }
                });
                if (!fromSource || !toSource) {
                    throw new Error('Không tìm thấy nguồn tiền');
                }
                if (fromSource.balance < transferAmount) {
                    throw new Error('Số dư không đủ');
                }
                // Deduct from sender
                const updatedFrom = await tx.cashSource.update({
                    where: { id: fromSourceId },
                    data: { balance: { decrement: transferAmount } }
                });
                await tx.cashTransaction.create({
                    data: {
                        cashSourceId: fromSourceId,
                        amount: transferAmount,
                        type: 'OUT',
                        description: description || `Chuyển tiền sang ${toSource.name}`,
                    }
                });
                // Add to receiver
                const updatedTo = await tx.cashSource.update({
                    where: { id: toSourceId },
                    data: { balance: { increment: transferAmount } }
                });
                await tx.cashTransaction.create({
                    data: {
                        cashSourceId: toSourceId,
                        amount: transferAmount,
                        type: 'IN',
                        description: description || `Nhận tiền từ ${fromSource.name}`,
                    }
                });
                return { fromSource: updatedFrom, toSource: updatedTo };
            });
            return res.json({ success: true, ...result });
        }
        catch (error) {
            console.error('Error transferring money:', error);
            return res.status(500).json({ error: error.message });
        }
    }
    async collectMoney(req, res) {
        try {
            const storeId = req.user?.storeId;
            if (!storeId) {
                return res.status(403).json({ error: 'Shop not created yet' });
            }
            const { cashSourceId, amount, description } = req.body;
            const collectAmount = parseFloat(amount);
            if (!cashSourceId || isNaN(collectAmount) || collectAmount <= 0) {
                return res.status(400).json({ error: 'Dữ liệu thu tiền không hợp lệ' });
            }
            const result = await prisma_1.prisma.$transaction(async (tx) => {
                const source = await tx.cashSource.findUnique({
                    where: { id: cashSourceId, storeId }
                });
                if (!source) {
                    throw new Error('Không tìm thấy nguồn tiền');
                }
                const updatedSource = await tx.cashSource.update({
                    where: { id: cashSourceId },
                    data: { balance: { increment: collectAmount } }
                });
                await tx.cashTransaction.create({
                    data: {
                        cashSourceId,
                        amount: collectAmount,
                        type: 'IN',
                        description: description || 'Thu tiền ngoài',
                    }
                });
                return updatedSource;
            });
            return res.json({ success: true, source: result });
        }
        catch (error) {
            console.error('Error collecting money:', error);
            return res.status(500).json({ error: error.message });
        }
    }
}
exports.CashbookController = CashbookController;
