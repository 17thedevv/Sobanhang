import { Request, Response } from 'express';
import { prisma } from '../../../prisma';

export class CategoriesController {
  async getAllCategories(req: Request, res: Response) {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) {
        return res.status(400).json({ error: 'Cửa hàng không tồn tại' });
      }

      const categories = await prisma.category.findMany({
        where: { storeId },
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { products: true }
          }
        }
      });

      return res.status(200).json({ categories });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async createCategory(req: Request, res: Response) {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) {
        return res.status(400).json({ error: 'Cửa hàng không tồn tại' });
      }

      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Vui lòng nhập tên danh mục' });
      }

      const category = await prisma.category.create({
        data: {
          storeId,
          name
        }
      });

      return res.status(201).json({ category, message: 'Thêm danh mục thành công' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async updateCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const storeId = req.user?.storeId;
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Vui lòng nhập tên danh mục' });
      }

      const existingCategory = await prisma.category.findFirst({
        where: { id, storeId }
      });

      if (!existingCategory) {
        return res.status(404).json({ error: 'Danh mục không tồn tại' });
      }

      const category = await prisma.category.update({
        where: { id },
        data: { name }
      });

      return res.status(200).json({ category, message: 'Cập nhật danh mục thành công' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async deleteCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const storeId = req.user?.storeId;

      const existingCategory = await prisma.category.findFirst({
        where: { id, storeId }
      });

      if (!existingCategory) {
        return res.status(404).json({ error: 'Danh mục không tồn tại' });
      }

      // Check if products are using this category
      const productsCount = await prisma.product.count({
        where: { categoryId: id }
      });

      if (productsCount > 0) {
        return res.status(400).json({ error: 'Không thể xóa danh mục đang có sản phẩm' });
      }

      await prisma.category.delete({
        where: { id }
      });

      return res.status(200).json({ message: 'Xóa danh mục thành công' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
