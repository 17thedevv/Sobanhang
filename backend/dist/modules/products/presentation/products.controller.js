"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsController = void 0;
const prisma_1 = require("../../../prisma");
class ProductsController {
    async getAllProducts(req, res) {
        try {
            const storeId = req.user?.storeId;
            if (!storeId) {
                return res.status(400).json({ error: 'Cửa hàng không tồn tại' });
            }
            const products = await prisma_1.prisma.product.findMany({
                where: { storeId },
                include: {
                    category: true,
                    variants: true
                },
                orderBy: { createdAt: 'desc' }
            });
            return res.status(200).json({ products });
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async createProduct(req, res) {
        try {
            const storeId = req.user?.storeId;
            if (!storeId) {
                return res.status(400).json({ error: 'Cửa hàng không tồn tại' });
            }
            const { name, price, stock, unit, imageUrl, categoryId, barcode, promotionalPrice, wholesalePrice, trackInventory, variants } = req.body;
            if (!name || price === undefined || !unit) {
                return res.status(400).json({ error: 'Vui lòng điền tên, giá và đơn vị sản phẩm' });
            }
            // Generate barcode if not provided
            let finalBarcode = barcode;
            if (!finalBarcode) {
                // Simple barcode generation (e.g. SP + timestamp)
                finalBarcode = 'SP' + Date.now().toString().slice(-6);
            }
            const product = await prisma_1.prisma.product.create({
                data: {
                    storeId,
                    name,
                    price: Number(price),
                    stock: stock !== undefined ? Number(stock) : 0,
                    unit,
                    imageUrl,
                    categoryId: categoryId || null,
                    barcode: finalBarcode,
                    promotionalPrice: promotionalPrice !== undefined ? Number(promotionalPrice) : null,
                    wholesalePrice: wholesalePrice ? JSON.stringify(wholesalePrice) : null,
                    trackInventory: trackInventory !== undefined ? Boolean(trackInventory) : true,
                    variants: {
                        create: variants && Array.isArray(variants) ? variants.map((v) => ({
                            attributes: JSON.stringify(v.attributes),
                            price: v.price !== undefined ? Number(v.price) : null,
                            stock: v.stock !== undefined ? Number(v.stock) : 0,
                            barcode: v.barcode || null
                        })) : []
                    }
                },
                include: {
                    category: true,
                    variants: true
                }
            });
            return res.status(201).json({ product, message: 'Thêm sản phẩm thành công' });
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async updateProduct(req, res) {
        try {
            const { id } = req.params;
            const storeId = req.user?.storeId;
            const { name, price, stock, unit, imageUrl, categoryId, barcode, promotionalPrice, wholesalePrice, trackInventory, variants } = req.body;
            // Verify ownership
            const existingProduct = await prisma_1.prisma.product.findFirst({
                where: { id: id, storeId }
            });
            if (!existingProduct) {
                return res.status(404).json({ error: 'Sản phẩm không tồn tại hoặc không thuộc cửa hàng này' });
            }
            // We need a transaction to delete old variants and create new ones (simplest approach)
            const product = await prisma_1.prisma.$transaction(async (tx) => {
                // Delete old variants if 'variants' array is provided in request
                if (variants && Array.isArray(variants)) {
                    await tx.productVariant.deleteMany({
                        where: { productId: id }
                    });
                }
                return await tx.product.update({
                    where: { id: id },
                    data: {
                        name,
                        price: price !== undefined ? Number(price) : undefined,
                        stock: stock !== undefined ? Number(stock) : undefined,
                        unit,
                        imageUrl,
                        categoryId: categoryId !== undefined ? categoryId : undefined,
                        barcode: barcode !== undefined ? barcode : undefined,
                        promotionalPrice: promotionalPrice !== undefined ? Number(promotionalPrice) : undefined,
                        wholesalePrice: wholesalePrice !== undefined ? (wholesalePrice ? JSON.stringify(wholesalePrice) : null) : undefined,
                        trackInventory: trackInventory !== undefined ? Boolean(trackInventory) : undefined,
                        variants: variants && Array.isArray(variants) ? {
                            create: variants.map((v) => ({
                                attributes: JSON.stringify(v.attributes),
                                price: v.price !== undefined ? Number(v.price) : null,
                                stock: v.stock !== undefined ? Number(v.stock) : 0,
                                barcode: v.barcode || null
                            }))
                        } : undefined
                    },
                    include: {
                        category: true,
                        variants: true
                    }
                });
            });
            return res.status(200).json({ product, message: 'Cập nhật sản phẩm thành công' });
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async deleteProduct(req, res) {
        try {
            const { id } = req.params;
            const storeId = req.user?.storeId;
            // Verify ownership
            const existingProduct = await prisma_1.prisma.product.findFirst({
                where: { id: id, storeId }
            });
            if (!existingProduct) {
                return res.status(404).json({ error: 'Sản phẩm không tồn tại hoặc không thuộc cửa hàng này' });
            }
            await prisma_1.prisma.product.delete({
                where: { id: id }
            });
            return res.status(200).json({ message: 'Xóa sản phẩm thành công' });
        }
        catch (error) {
            // Catch foreign key constraint failures (e.g. if ordered)
            if (error.code === 'P2003') {
                return res.status(400).json({ error: 'Không thể xoá sản phẩm đã phát sinh giao dịch' });
            }
            return res.status(500).json({ error: error.message });
        }
    }
}
exports.ProductsController = ProductsController;
