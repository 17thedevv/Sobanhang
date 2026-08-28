import { Request, Response } from 'express';
import { prisma } from '../../../prisma';

export class DebtController {
  // 1. GET /api/debt/summary
  async getSummary(req: Request, res: Response) {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) return res.status(401).json({ error: 'Unauthorized' });

      const transactions = await prisma.debtTransaction.findMany({
        where: { storeId, type: 'DEBT', balance: { gt: 0 } }
      });

      let totalReceivables = 0; // Phải thu (GAVE)
      let totalPayables = 0;    // Phải trả (RECEIVED)

      transactions.forEach(t => {
        if (t.direction === 'GAVE') {
          totalReceivables += t.balance;
        } else if (t.direction === 'RECEIVED') {
          totalPayables += t.balance;
        }
      });

      return res.json({ totalReceivables, totalPayables });
    } catch (error) {
      console.error('Error fetching debt summary:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // 2. GET /api/debt/customers
  async getDebtCustomers(req: Request, res: Response) {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) return res.status(401).json({ error: 'Unauthorized' });

      // Get all active debts
      const activeDebts = await prisma.debtTransaction.findMany({
        where: { storeId, type: 'DEBT', balance: { gt: 0 } },
        include: { customer: true }
      });

      // Group by customer
      const customerMap = new Map<string, any>();

      activeDebts.forEach(t => {
        const cId = t.customerId;
        if (!customerMap.has(cId)) {
          customerMap.set(cId, {
            customer: t.customer,
            totalReceivables: 0,
            totalPayables: 0
          });
        }
        const data = customerMap.get(cId);
        if (t.direction === 'GAVE') {
          data.totalReceivables += t.balance;
        } else if (t.direction === 'RECEIVED') {
          data.totalPayables += t.balance;
        }
      });

      const customersWithDebt = Array.from(customerMap.values());
      return res.json({ customers: customersWithDebt });
    } catch (error) {
      console.error('Error fetching debt customers:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // 3. GET /api/debt/customers/:customerId/transactions
  async getCustomerTransactions(req: Request, res: Response) {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) return res.status(401).json({ error: 'Unauthorized' });
      const customerId = req.params.customerId as string;

      const transactions = await prisma.debtTransaction.findMany({
        where: { storeId, customerId },
        orderBy: { transactionDate: 'desc' },
        include: { cashSource: true }
      });

      return res.json({ transactions });
    } catch (error) {
      console.error('Error fetching customer transactions:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // 4. POST /api/debt/transactions
  async createTransaction(req: Request, res: Response) {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) return res.status(401).json({ error: 'Unauthorized' });

      const { customerId, direction, amount, cashSourceId, note, transactionDate, type, parentId } = req.body;

      if (!customerId || !amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid data' });
      }

      if (type === 'PAYMENT') {
        // Xử lý thanh toán
        if (!parentId) {
           return res.status(400).json({ error: 'Thanh toán cần chọn giao dịch gốc (parentId)' });
        }
        
        const parentDebt = await prisma.debtTransaction.findUnique({ where: { id: parentId }});
        if (!parentDebt || parentDebt.storeId !== storeId || parentDebt.balance < amount) {
           return res.status(400).json({ error: 'Giao dịch gốc không hợp lệ hoặc số tiền vượt quá dư nợ' });
        }

        // Cập nhật dư nợ của giao dịch gốc
        const newBalance = parentDebt.balance - amount;
        await prisma.debtTransaction.update({
          where: { id: parentId },
          data: { balance: newBalance }
        });

        // Tạo giao dịch thanh toán
        const payment = await prisma.debtTransaction.create({
          data: {
            storeId, customerId, direction, amount,
            balance: newBalance, // Dư nợ còn lại của khoản này
            cashSourceId, note,
            transactionDate: transactionDate ? new Date(transactionDate) : undefined,
            type: 'PAYMENT',
            parentId
          }
        });

        // TODO: Cập nhật số dư nguồn tiền (CashSource) nếu cần thiết

        return res.status(201).json({ transaction: payment });
      } else {
        // Ghi nợ mới
        const debt = await prisma.debtTransaction.create({
          data: {
            storeId, customerId, direction, amount,
            balance: amount, // Dư nợ ban đầu bằng số tiền
            cashSourceId, note,
            transactionDate: transactionDate ? new Date(transactionDate) : undefined,
            type: 'DEBT'
          }
        });

        // TODO: Cập nhật số dư nguồn tiền (CashSource) nếu cần thiết

        return res.status(201).json({ transaction: debt });
      }
    } catch (error) {
      console.error('Error creating debt transaction:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
