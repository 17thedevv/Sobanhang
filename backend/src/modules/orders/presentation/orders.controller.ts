import { Request, Response } from 'express';
import { prisma } from '../../../prisma';

export class OrdersController {
  async getOrders(req: Request, res: Response) {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) {
        return res.status(400).json({ error: 'Cửa hàng không tồn tại' });
      }

      const orders = await prisma.order.findMany({
        where: { storeId },
        include: {
          items: {
            include: {
              product: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return res.status(200).json({ orders });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async createOrder(req: Request, res: Response) {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) {
        return res.status(400).json({ error: 'Cửa hàng không tồn tại' });
      }

      const { total, paymentMethod, isDebt, items } = req.body;

      if (total === undefined || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Đơn hàng không hợp lệ' });
      }

      // Check stock before creating order
      for (const item of items) {
        const product = await prisma.product.findFirst({
          where: { id: item.productId, storeId }
        });
        if (!product) {
          return res.status(404).json({ error: `Không tìm thấy sản phẩm ${item.productId}` });
        }
        if (product.stock < item.quantity) {
          return res.status(400).json({ error: `Sản phẩm ${product.name} không đủ số lượng tồn kho` });
        }
      }

      // Start transaction: Create order + update stock
      const result = await prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            storeId,
            total: Number(total),
            paymentMethod: paymentMethod || 'CASH',
            isDebt: Boolean(isDebt),
            items: {
              create: items.map((item: any) => ({
                productId: item.productId,
                quantity: Number(item.quantity),
                price: Number(item.price)
              }))
            }
          },
          include: {
            items: true
          }
        });

        // Update product stock
        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: Number(item.quantity)
              }
            }
          });
        }

        return order;
      });

      return res.status(201).json({ order: result, message: 'Thanh toán thành công' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
