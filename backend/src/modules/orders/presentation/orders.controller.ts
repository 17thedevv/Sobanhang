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

      const { 
        items, 
        type, // 'QUICK_SALE' | 'DELIVERY_LATER' | 'DEBT_SALE'
        customerId, 
        discount = 0, 
        shippingFee = 0, 
        paymentSource 
      } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Giỏ hàng trống' });
      }

      if (type === 'QUICK_SALE' && !paymentSource) {
        return res.status(400).json({ error: 'Bán nhanh bắt buộc chọn nguồn tiền (paymentSource)' });
      }

      if (type === 'DEBT_SALE' && !customerId) {
        return res.status(400).json({ error: 'Ghi nợ bắt buộc chọn khách hàng' });
      }

      let total = 0;
      const orderItemsData = [];

      // Check stock and prepare order items
      for (const item of items) {
        const product = await prisma.product.findFirst({
          where: { id: item.productId, storeId }
        });
        
        if (!product) {
          return res.status(404).json({ error: `Không tìm thấy sản phẩm ${item.productId}` });
        }
        
        if (product.trackInventory && product.stock < item.quantity) {
          return res.status(400).json({ error: `Sản phẩm ${product.name} không đủ số lượng tồn kho` });
        }

        const subtotal = product.price * item.quantity;
        total += subtotal;

        orderItemsData.push({
          productId: product.id,
          productNameSnapshot: product.name,
          unitPrice: product.price,
          quantity: Number(item.quantity),
          subtotal: subtotal
        });
      }

      const finalTotal = Math.max(0, total - Number(discount)) + Number(shippingFee);

      // Determine statuses based on checkout type
      let orderStatus = 'DRAFT';
      let paymentStatus = 'UNPAID';
      let fulfillmentStatus = 'NONE';

      if (type === 'QUICK_SALE') {
        orderStatus = 'COMPLETED';
        paymentStatus = 'PAID';
        fulfillmentStatus = 'DELIVERED';
      } else if (type === 'DELIVERY_LATER') {
        orderStatus = 'CONFIRMED';
        paymentStatus = 'UNPAID';
        fulfillmentStatus = 'PENDING_DELIVERY';
      } else if (type === 'DEBT_SALE') {
        orderStatus = 'COMPLETED';
        paymentStatus = 'DEBT';
        fulfillmentStatus = 'DELIVERED';
      } else {
        return res.status(400).json({ error: 'Loại thanh toán không hợp lệ' });
      }

      // Start transaction: Create order + update stock
      const result = await prisma.$transaction(async (tx) => {
        // 1. Create order
        const order = await tx.order.create({
          data: {
            storeId,
            customerId: customerId || null,
            total: finalTotal,
            discount: Number(discount),
            shippingFee: Number(shippingFee),
            orderStatus,
            paymentStatus,
            fulfillmentStatus,
            paymentSource: paymentSource || null,
            items: {
              create: orderItemsData
            }
          },
          include: {
            items: {
              include: {
                product: true
              }
            },
            customer: true
          }
        });

        // 2. Decrement inventory (we do this for all 3 types to reserve stock)
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

        // 3. (Future) Create Ledger Entry if PAID
        
        // 4. (Future) Update Customer Debt Aggregation if DEBT_SALE

        return order;
      });

      return res.status(201).json({ order: result, message: 'Thanh toán thành công' });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  }
}

