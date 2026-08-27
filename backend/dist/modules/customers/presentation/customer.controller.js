"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerController = void 0;
const prisma_1 = require("../../../prisma");
class CustomerController {
    async getCustomers(req, res) {
        try {
            const storeId = req.user?.storeId;
            if (!storeId)
                return res.status(401).json({ error: 'Unauthorized' });
            const customers = await prisma_1.prisma.customer.findMany({
                where: { storeId },
                orderBy: { createdAt: 'desc' }
            });
            return res.json({ customers });
        }
        catch (error) {
            console.error('Error fetching customers:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    async createCustomer(req, res) {
        try {
            const storeId = req.user?.storeId;
            if (!storeId)
                return res.status(401).json({ error: 'Unauthorized' });
            const { name, phone, address, note } = req.body;
            if (!name) {
                return res.status(400).json({ error: 'Tên khách hàng là bắt buộc' });
            }
            const customer = await prisma_1.prisma.customer.create({
                data: {
                    storeId,
                    name,
                    phone,
                    address,
                    note
                }
            });
            return res.status(201).json({ customer });
        }
        catch (error) {
            console.error('Error creating customer:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}
exports.CustomerController = CustomerController;
