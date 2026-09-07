import { Request, Response } from 'express';
import { prisma } from '../../../prisma';

export class StockLedgerController {
  async getTransactions(req: Request, res: Response) {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) return res.status(403).json({ message: 'Store required' });

      const { productId, type, startDate, endDate } = req.query;
      const where: any = { storeId };

      if (productId && productId !== 'ALL') {
        where.productId = productId as string;
      }
      if (type && type !== 'ALL') {
        where.type = type as string;
      }
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt.gte = new Date(startDate as string);
        }
        if (endDate) {
          const end = new Date(endDate as string);
          end.setHours(23, 59, 59, 999);
          where.createdAt.lte = end;
        }
      }

      const transactions = await prisma.stockTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          product: true,
        }
      });

      res.json({ transactions });
    } catch (error) {
      console.error('Error getting stock ledger transactions:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getProductLedger(req: Request, res: Response) {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) return res.status(403).json({ message: 'Store required' });
      const productId = req.params.productId as string;

      const transactions = await prisma.stockTransaction.findMany({
        where: { storeId, productId },
        orderBy: { createdAt: 'desc' },
        include: {
          product: true,
        }
      });

      res.json({ transactions });
    } catch (error) {
      console.error('Error getting product stock ledger:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getSummary(req: Request, res: Response) {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) return res.status(403).json({ message: 'Store required' });

      // MVP: Calculate total stock value currently. 
      // A more complex implementation would calculate based on date range.
      const products = await prisma.product.findMany({
        where: { storeId }
      });

      let totalStockValue = 0;
      products.forEach(p => {
        totalStockValue += (p.stock * p.price);
      });

      res.json({ 
        totalStockValue
      });
    } catch (error) {
      console.error('Error getting stock ledger summary:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
