import { Request, Response } from 'express';
import { prisma } from '../../../prisma';

function generateCheckCode() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `KK${timestamp}${random}`;
}

export class StockCheckController {
  async getChecks(req: Request, res: Response) {
    try {
      const status = req.query.status as string | undefined;
      const storeId = req.user?.storeId as string;
      if (!storeId) return res.status(403).json({ message: 'Store required' });

      const where: any = { storeId };
      if (status) where.status = status;

      const checks = await prisma.stockCheck.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
        }
      });

      res.json({ checks });
    } catch (error) {
      console.error('Error getting stock checks:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getCheckById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const storeId = req.user?.storeId as string;

      const check = await prisma.stockCheck.findFirst({
        where: { id, storeId },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      if (!check) return res.status(404).json({ message: 'Stock check not found' });

      res.json({ check });
    } catch (error) {
      console.error('Error getting stock check:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async createCheck(req: Request, res: Response) {
    try {
      const storeId = req.user?.storeId as string;
      if (!storeId) return res.status(403).json({ message: 'Store required' });

      const { 
        items, // array of { productId, systemQuantity, actualQuantity, diffQuantity }
        status, // CHECKING or BALANCED
        note
      } = req.body;

      const code = generateCheckCode();

      const check = await prisma.$transaction(async (tx) => {
        // 1. Create Check
        const newCheck = await tx.stockCheck.create({
          data: {
            storeId,
            code,
            status,
            note,
            items: {
              create: items.map((item: any) => ({
                productId: item.productId,
                systemQuantity: item.systemQuantity,
                actualQuantity: item.actualQuantity,
                diffQuantity: item.diffQuantity,
              }))
            }
          },
          include: { items: true }
        });

        // 2. If BALANCED, update stock and add to StockTransaction
        if (status === 'BALANCED') {
          for (const item of items) {
            // Only update if there is a difference
            if (item.diffQuantity !== 0) {
              await tx.product.update({
                where: { id: item.productId },
                data: {
                  stock: item.actualQuantity,
                  trackInventory: true
                }
              });

              await tx.stockTransaction.create({
                data: {
                  storeId,
                  productId: item.productId,
                  type: 'CHECK',
                  referenceId: newCheck.id,
                  quantityChange: item.diffQuantity,
                }
              });
            }
          }
        }

        return newCheck;
      });

      res.status(201).json({ check });
    } catch (error) {
      console.error('Error creating stock check:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateCheckStatus(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { status } = req.body;
      const storeId = req.user?.storeId as string;

      if (status !== 'BALANCED' && status !== 'CANCELLED') {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const check = await prisma.$transaction(async (tx) => {
        const existing = await tx.stockCheck.findFirst({
          where: { id, storeId },
          include: { items: true }
        });

        if (!existing) throw new Error('Stock check not found');
        if (existing.status !== 'CHECKING') throw new Error('Can only update CHECKING status');

        const updated = await tx.stockCheck.update({
          where: { id },
          data: { status }
        });

        if (status === 'BALANCED') {
          for (const item of existing.items) {
            if (item.diffQuantity !== 0) {
              await tx.product.update({
                where: { id: item.productId },
                data: {
                  stock: item.actualQuantity,
                  trackInventory: true
                }
              });

              await tx.stockTransaction.create({
                data: {
                  storeId,
                  productId: item.productId,
                  type: 'CHECK',
                  referenceId: updated.id,
                  quantityChange: item.diffQuantity,
                }
              });
            }
          }
        }

        return updated;
      });

      res.json({ check });
    } catch (error: any) {
      console.error('Error updating stock check status:', error);
      res.status(400).json({ message: error.message || 'Internal server error' });
    }
  }
}
