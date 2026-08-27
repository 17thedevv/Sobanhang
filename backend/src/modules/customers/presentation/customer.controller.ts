import { Request, Response } from 'express';
import { prisma } from '../../../prisma';

export class CustomerController {
  async getCustomers(req: Request, res: Response) {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) return res.status(401).json({ error: 'Unauthorized' });

      const customers = await prisma.customer.findMany({
        where: { storeId },
        orderBy: { createdAt: 'desc' }
      });

      return res.json({ customers });
    } catch (error) {
      console.error('Error fetching customers:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createCustomer(req: Request, res: Response) {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) return res.status(401).json({ error: 'Unauthorized' });

      const { name, phone, address, note } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Tên khách hàng là bắt buộc' });
      }

      const customer = await prisma.customer.create({
        data: {
          storeId,
          name,
          phone,
          address,
          note
        }
      });

      return res.status(201).json({ customer });
    } catch (error) {
      console.error('Error creating customer:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
