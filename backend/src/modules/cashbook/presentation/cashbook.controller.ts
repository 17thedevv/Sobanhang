import { Request, Response } from 'express';
import { prisma } from '../../../prisma';

export class CashbookController {
  async getSources(req: Request, res: Response) {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) {
        return res.status(403).json({ error: 'Shop not created yet' });
      }

      const sources = await prisma.cashSource.findMany({
        where: { storeId },
        orderBy: { order: 'asc' },
      });
      return res.json({ sources });
    } catch (error: any) {
      console.error('Error fetching cash sources:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  async createSource(req: Request, res: Response) {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) {
        return res.status(403).json({ error: 'Shop not created yet' });
      }

      const { name, type, balance, createdAt } = req.body;
      
      const existingSources = await prisma.cashSource.count({
        where: { storeId }
      });

      const source = await prisma.cashSource.create({
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
        await prisma.cashTransaction.create({
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
    } catch (error: any) {
      console.error('Error creating cash source:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  async updateSourceOrder(req: Request, res: Response) {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) {
        return res.status(403).json({ error: 'Shop not created yet' });
      }

      const { orderMapping } = req.body; // { sourceId: newOrderIndex }
      
      const updates = [];
      for (const id in orderMapping) {
        updates.push(
          prisma.cashSource.update({
            where: { id, storeId },
            data: { order: orderMapping[id] }
          })
        );
      }

      await prisma.$transaction(updates);
      return res.json({ success: true });
    } catch (error: any) {
      console.error('Error updating source order:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  async transferMoney(req: Request, res: Response) {
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

      const result = await prisma.$transaction(async (tx) => {
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
    } catch (error: any) {
      console.error('Error transferring money:', error);
      return res.status(500).json({ error: error.message });
    }
  }
}
