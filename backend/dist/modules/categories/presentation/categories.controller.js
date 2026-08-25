"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesController = void 0;
const prisma_1 = require("../../../prisma");
class CategoriesController {
    async getAllCategories(req, res) {
        try {
            const storeId = req.user?.storeId;
            if (!storeId) {
                return res.status(400).json({ error: 'Cửa hàng không tồn tại' });
            }
            const categories = await prisma_1.prisma.category.findMany({
                where: { storeId },
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: { products: true }
                    }
                }
            });
            return res.status(200).json({ categories });
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async createCategory(req, res) {
        try {
            const storeId = req.user?.storeId;
            if (!storeId) {
                return res.status(400).json({ error: 'Cửa hàng không tồn tại' });
            }
            const { name } = req.body;
            if (!name) {
                return res.status(400).json({ error: 'Vui lòng nhập tên danh mục' });
            }
            const category = await prisma_1.prisma.category.create({
                data: {
                    storeId,
                    name
                }
            });
            return res.status(201).json({ category, message: 'Thêm danh mục thành công' });
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async updateCategory(req, res) {
        try {
            const { id } = req.params;
            const storeId = req.user?.storeId;
            const { name } = req.body;
            if (!name) {
                return res.status(400).json({ error: 'Vui lòng nhập tên danh mục' });
            }
            const existingCategory = await prisma_1.prisma.category.findFirst({
                where: { id: id, storeId }
            });
            if (!existingCategory) {
                return res.status(404).json({ error: 'Danh mục không tồn tại' });
            }
            const category = await prisma_1.prisma.category.update({
                where: { id: id },
                data: { name }
            });
            return res.status(200).json({ category, message: 'Cập nhật danh mục thành công' });
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async deleteCategory(req, res) {
        try {
            const { id } = req.params;
            const storeId = req.user?.storeId;
            const existingCategory = await prisma_1.prisma.category.findFirst({
                where: { id: id, storeId }
            });
            if (!existingCategory) {
                return res.status(404).json({ error: 'Danh mục không tồn tại' });
            }
            // Check if products are using this category
            const productsCount = await prisma_1.prisma.product.count({
                where: { categoryId: id }
            });
            if (productsCount > 0) {
                return res.status(400).json({ error: 'Không thể xóa danh mục đang có sản phẩm' });
            }
            await prisma_1.prisma.category.delete({
                where: { id: id }
            });
            return res.status(200).json({ message: 'Xóa danh mục thành công' });
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
exports.CategoriesController = CategoriesController;
