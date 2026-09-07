import { Request, Response } from 'express';
import { prisma } from '../../../prisma';

function generateIssueCode() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `XH${timestamp}${random}`;
}

export class StockIssueController {
  async getIssues(req: Request, res: Response) {
    try {
      const status = req.query.status as string | undefined;
      const storeId = req.user?.storeId as string;
      if (!storeId) return res.status(403).json({ message: 'Store required' });

      const where: any = { storeId };
      if (status) where.status = status;

      const issues = await prisma.stockIssue.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
        }
      });

      res.json({ issues });
    } catch (error) {
      console.error('Error getting stock issues:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getIssueById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const storeId = req.user?.storeId as string;

      const issue = await prisma.stockIssue.findFirst({
        where: { id, storeId },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      if (!issue) return res.status(404).json({ message: 'Stock issue not found' });

      res.json({ issue });
    } catch (error) {
      console.error('Error getting stock issue:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async createIssue(req: Request, res: Response) {
    try {
      const storeId = req.user?.storeId as string;
      if (!storeId) return res.status(403).json({ message: 'Store required' });

      const { 
        items, // array of { productId, quantity }
        status, // DRAFT or COMPLETED
        note
      } = req.body;

      const code = generateIssueCode();

      const issue = await prisma.$transaction(async (tx) => {
        // 1. Create Issue
        const newIssue = await tx.stockIssue.create({
          data: {
            storeId,
            code,
            status,
            note,
            items: {
              create: items.map((item: any) => ({
                productId: item.productId,
                quantity: item.quantity,
              }))
            }
          },
          include: { items: true }
        });

        // 2. If COMPLETED, deduct stock and add to StockTransaction
        if (status === 'COMPLETED') {
          for (const item of items) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  decrement: item.quantity
                },
                trackInventory: true
              }
            });

            await tx.stockTransaction.create({
              data: {
                storeId,
                productId: item.productId,
                type: 'ISSUE',
                referenceId: newIssue.id,
                quantityChange: -item.quantity,
              }
            });
          }
        }

        return newIssue;
      });

      res.status(201).json({ issue });
    } catch (error) {
      console.error('Error creating stock issue:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateIssueStatus(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { status } = req.body;
      const storeId = req.user?.storeId as string;

      if (status !== 'COMPLETED' && status !== 'CANCELLED') {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const issue = await prisma.$transaction(async (tx) => {
        const existing = await tx.stockIssue.findFirst({
          where: { id, storeId },
          include: { items: true }
        });

        if (!existing) throw new Error('Stock issue not found');
        if (existing.status !== 'DRAFT') throw new Error('Can only update DRAFT issues');

        const updated = await tx.stockIssue.update({
          where: { id },
          data: { status }
        });

        if (status === 'COMPLETED') {
          for (const item of existing.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  decrement: item.quantity
                },
                trackInventory: true
              }
            });

            await tx.stockTransaction.create({
              data: {
                storeId,
                productId: item.productId,
                type: 'ISSUE',
                referenceId: updated.id,
                quantityChange: -item.quantity,
              }
            });
          }
        }

        return updated;
      });

      res.json({ issue });
    } catch (error: any) {
      console.error('Error updating stock issue status:', error);
      res.status(400).json({ message: error.message || 'Internal server error' });
    }
  }
}
