import { Request, Response } from 'express';
import { prisma } from '../../../prisma';

function generateReceiptCode() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `NH${timestamp}${random}`;
}

export class StockReceiptController {
  async getReceipts(req: Request, res: Response) {
    try {
      const { status, supplierId } = req.query;
      const storeId = req.user?.storeId;
      if (!storeId) return res.status(403).json({ message: 'Store required' });

      const where: any = { storeId };
      if (status) where.status = status;
      if (supplierId) where.supplierId = supplierId;

      const receipts = await prisma.stockReceipt.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          supplier: true,
          items: true,
        }
      });

      res.json({ receipts });
    } catch (error) {
      console.error('Error getting receipts:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getReceiptById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const storeId = req.user?.storeId;

      const receipt = await prisma.stockReceipt.findFirst({
        where: { id, storeId },
        include: {
          supplier: true,
          items: {
            include: {
              product: true
            }
          }
        }
      });

      if (!receipt) return res.status(404).json({ message: 'Receipt not found' });

      res.json({ receipt });
    } catch (error) {
      console.error('Error getting receipt:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async createReceipt(req: Request, res: Response) {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) return res.status(403).json({ message: 'Store required' });

      const { 
        supplierId, 
        items, // array of { productId, quantity, importPrice, subTotal }
        totalAmount, 
        discount, 
        shippingFee, 
        finalAmount, 
        paidAmount, 
        status, // DRAFT or COMPLETED
        note,
        cashSourceId 
      } = req.body;

      const code = generateReceiptCode();

      const receipt = await prisma.$transaction(async (tx) => {
        // 1. Create Receipt
        const newReceipt = await tx.stockReceipt.create({
          data: {
            storeId,
            code,
            supplierId,
            totalAmount,
            discount,
            shippingFee,
            finalAmount,
            paidAmount,
            status,
            note,
            items: {
              create: items.map((item: any) => ({
                productId: item.productId,
                quantity: item.quantity,
                importPrice: item.importPrice,
                subTotal: item.subTotal
              }))
            }
          }
        });

        // 2. If COMPLETED, process inventory and payments
        if (status === 'COMPLETED') {
          // Update Inventory
          for (const item of items) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } }
            });
          }

          // Handle Cash Payment if any
          if (paidAmount > 0 && cashSourceId) {
            await tx.cashSource.update({
              where: { id: cashSourceId },
              data: { balance: { decrement: paidAmount } }
            });
            
            await tx.cashTransaction.create({
              data: {
                cashSourceId,
                amount: paidAmount,
                type: 'OUT',
                description: `Thanh toán phiếu nhập hàng ${code}`,
                referenceId: newReceipt.id
              }
            });
          }

          // Handle Debt if finalAmount > paidAmount
          if (finalAmount > paidAmount && supplierId) {
            const debtAmount = finalAmount - paidAmount;
            await tx.debtTransaction.create({
              data: {
                storeId,
                customerId: supplierId,
                amount: debtAmount,
                direction: 'RECEIVED', // "Tôi đã nhận" (goods) -> "Phải trả"
                balance: debtAmount,
                transactionDate: new Date(),
                note: `Ghi nợ phiếu nhập hàng ${code}`
              }
            });
          }
        }

        return newReceipt;
      });

      res.status(201).json({ receipt });
    } catch (error) {
      console.error('Error creating receipt:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async confirmReceipt(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const storeId = req.user?.storeId;
      if (!storeId) return res.status(403).json({ message: 'Store required' });
      const { paidAmount, cashSourceId } = req.body;

      const receipt = await prisma.stockReceipt.findFirst({
        where: { id, storeId },
        include: { items: true }
      });

      if (!receipt) return res.status(404).json({ message: 'Receipt not found' });
      if (receipt.status !== 'DRAFT') return res.status(400).json({ message: 'Receipt is not in DRAFT status' });

      const finalAmount = receipt.finalAmount;

      const updated = await prisma.$transaction(async (tx) => {
        const updatedReceipt = await tx.stockReceipt.update({
          where: { id },
          data: { status: 'COMPLETED', paidAmount }
        });

        // Update Inventory
        for (const item of receipt.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } }
          });
        }

        // Handle Cash Payment if any
        if (paidAmount > 0 && cashSourceId) {
          await tx.cashSource.update({
            where: { id: cashSourceId },
            data: { balance: { decrement: paidAmount } }
          });
          
          await tx.cashTransaction.create({
            data: {
              cashSourceId,
              amount: paidAmount,
              type: 'OUT',
              description: `Thanh toán phiếu nhập hàng ${receipt.code}`,
              referenceId: receipt.id
            }
          });
        }

        // Handle Debt if finalAmount > paidAmount
        if (finalAmount > paidAmount && receipt.supplierId) {
          const debtAmount = finalAmount - paidAmount;
          await tx.debtTransaction.create({
            data: {
              storeId,
              customerId: receipt.supplierId,
              amount: debtAmount,
              direction: 'RECEIVED', // "Tôi đã nhận" (hàng) -> Nợ phải trả
              balance: debtAmount,
              transactionDate: new Date(),
              note: `Ghi nợ phiếu nhập hàng ${receipt.code}`
            }
          });
        }

        return updatedReceipt;
      });

      res.json({ receipt: updated });
    } catch (error) {
      console.error('Error confirming receipt:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async payReceiptDebt(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const storeId = req.user?.storeId;
      if (!storeId) return res.status(403).json({ message: 'Store required' });
      const { amount, cashSourceId } = req.body;

      const receipt = await prisma.stockReceipt.findFirst({
        where: { id, storeId }
      });

      if (!receipt) return res.status(404).json({ message: 'Receipt not found' });
      if (receipt.status !== 'COMPLETED' && receipt.status !== 'PARTIAL_PAID') {
        return res.status(400).json({ message: 'Receipt cannot be paid' });
      }

      const remaining = receipt.finalAmount - receipt.paidAmount;
      if (amount > remaining) return res.status(400).json({ message: 'Amount exceeds remaining debt' });

      const updated = await prisma.$transaction(async (tx) => {
        const newPaid = receipt.paidAmount + amount;
        const newStatus = newPaid >= receipt.finalAmount ? 'COMPLETED' : 'PARTIAL_PAID';

        const updatedReceipt = await tx.stockReceipt.update({
          where: { id },
          data: { 
            paidAmount: newPaid,
            status: newStatus 
          }
        });

        // Handle Cash
        if (amount > 0 && cashSourceId) {
          await tx.cashSource.update({
            where: { id: cashSourceId },
            data: { balance: { decrement: amount } }
          });
          
          await tx.cashTransaction.create({
            data: {
              cashSourceId,
              amount: amount,
              type: 'OUT',
              description: `Thanh toán nợ phiếu nhập hàng ${receipt.code}`,
              referenceId: receipt.id
            }
          });
        }

        if (receipt.supplierId) {
          const debtTx = await tx.debtTransaction.findFirst({
            where: { note: `Ghi nợ phiếu nhập hàng ${receipt.code}` }
          });
          if (debtTx) {
            await tx.debtTransaction.create({
               data: {
                 storeId,
                 customerId: receipt.supplierId,
                 amount: amount,
                 direction: 'GAVE', // Thanh toán nợ (chi tiền ra)
                 balance: 0, 
                 transactionDate: new Date(),
                 note: `Thanh toán nợ phiếu nhập ${receipt.code}`,
                 parentId: debtTx.id
               }
            });
            await tx.debtTransaction.update({
              where: { id: debtTx.id },
              data: { balance: { decrement: amount } }
            });
          }
        }

        return updatedReceipt;
      });

      res.json({ receipt: updated });
    } catch (error) {
      console.error('Error paying receipt debt:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async deleteReceipt(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const storeId = req.user?.storeId;
      if (!storeId) return res.status(403).json({ message: 'Store required' });

      const receipt = await prisma.stockReceipt.findFirst({
        where: { id, storeId }
      });

      if (!receipt) return res.status(404).json({ message: 'Receipt not found' });
      if (receipt.status !== 'DRAFT') {
        return res.status(400).json({ message: 'Only DRAFT receipts can be deleted' });
      }

      await prisma.stockReceipt.delete({
        where: { id }
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting receipt:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
