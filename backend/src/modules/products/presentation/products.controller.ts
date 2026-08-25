import { Request, Response } from 'express';
import { prisma } from '../../../prisma';

export class ProductsController {
  async getAllProducts(req: Request, res: Response) {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) {
        return res.status(400).json({ error: 'Cửa hàng không tồn tại' });
      }

      const products = await prisma.product.findMany({
        where: { storeId },
        orderBy: { createdAt: 'desc' }
      });

      return res.status(200).json({ products });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async createProduct(req: Request, res: Response) {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) {
        return res.status(400).json({ error: 'Cửa hàng không tồn tại' });
      }

      const { name, price, stock, unit, imageUrl } = req.body;

      if (!name || price === undefined || stock === undefined || !unit) {
        return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin sản phẩm' });
      }

      const product = await prisma.product.create({
        data: {
          storeId,
          name,
          price: Number(price),
          stock: Number(stock),
          unit,
          imageUrl
        }
      });

      return res.status(201).json({ product, message: 'Thêm sản phẩm thành công' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const storeId = req.user?.storeId;
      const { name, price, stock, unit, imageUrl } = req.body;

      // Verify ownership
      const existingProduct = await prisma.product.findFirst({
        where: { id, storeId }
      });

      if (!existingProduct) {
        return res.status(404).json({ error: 'Sản phẩm không tồn tại hoặc không thuộc cửa hàng này' });
      }

      const product = await prisma.product.update({
        where: { id },
        data: {
          name,
          price: price !== undefined ? Number(price) : undefined,
          stock: stock !== undefined ? Number(stock) : undefined,
          unit,
          imageUrl
        }
      });

      return res.status(200).json({ product, message: 'Cập nhật sản phẩm thành công' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const storeId = req.user?.storeId;

      // Verify ownership
      const existingProduct = await prisma.product.findFirst({
        where: { id, storeId }
      });

      if (!existingProduct) {
        return res.status(404).json({ error: 'Sản phẩm không tồn tại hoặc không thuộc cửa hàng này' });
      }

      await prisma.product.delete({
        where: { id }
      });

      return res.status(200).json({ message: 'Xóa sản phẩm thành công' });
    } catch (error: any) {
      // Catch foreign key constraint failures (e.g. if ordered)
      if (error.code === 'P2003') {
        return res.status(400).json({ error: 'Không thể xoá sản phẩm đã phát sinh giao dịch' });
      }
      return res.status(500).json({ error: error.message });
    }
  }
}
