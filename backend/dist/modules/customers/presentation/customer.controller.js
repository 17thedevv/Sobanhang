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
            const { search, sortBy, sortOrder } = req.query;
            const where = { storeId };
            if (search) {
                where.OR = [
                    { name: { contains: search } },
                    { phone: { contains: search } }
                ];
            }
            const orderBy = {};
            if (sortBy) {
                orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';
            }
            else {
                orderBy.createdAt = 'desc';
            }
            const customers = await prisma_1.prisma.customer.findMany({
                where,
                orderBy,
                include: {
                    groups: true,
                    tags: true
                }
            });
            return res.json({ customers });
        }
        catch (error) {
            console.error('Error fetching customers:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    async getCustomerById(req, res) {
        try {
            const storeId = req.user?.storeId;
            if (!storeId)
                return res.status(401).json({ error: 'Unauthorized' });
            const { id } = req.params;
            const customer = await prisma_1.prisma.customer.findUnique({
                where: { id: id },
                include: {
                    groups: true,
                    tags: true,
                    notes: { orderBy: { createdAt: 'desc' } },
                    orders: {
                        where: { orderStatus: 'COMPLETED' },
                        orderBy: { createdAt: 'desc' },
                        include: { items: true }
                    }
                }
            });
            if (!customer || customer.storeId !== storeId) {
                return res.status(404).json({ error: 'Not found' });
            }
            return res.json({ customer });
        }
        catch (error) {
            console.error('Error fetching customer:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    async createCustomer(req, res) {
        try {
            const storeId = req.user?.storeId;
            if (!storeId)
                return res.status(401).json({ error: 'Unauthorized' });
            const { name, phone, address, note, email, avatarUrl, isSupplier, birthday, gender, groupIds, tagIds, invoiceInfo } = req.body;
            const customer = await prisma_1.prisma.customer.create({
                data: {
                    storeId,
                    name,
                    phone,
                    address,
                    note,
                    email,
                    avatarUrl,
                    isSupplier,
                    birthday: birthday ? new Date(birthday) : null,
                    gender,
                    groups: groupIds ? { connect: groupIds.map((id) => ({ id })) } : undefined,
                    tags: tagIds ? { connect: tagIds.map((id) => ({ id })) } : undefined,
                    invoiceInfo: invoiceInfo ? { create: invoiceInfo } : undefined
                }
            });
            return res.status(201).json({ customer });
        }
        catch (error) {
            console.error('Error creating customer:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    async updateCustomer(req, res) {
        try {
            const storeId = req.user?.storeId;
            if (!storeId)
                return res.status(401).json({ error: 'Unauthorized' });
            const { id } = req.params;
            const { name, phone, address, note, email, avatarUrl, isSupplier, birthday, gender, groupIds, tagIds, invoiceInfo } = req.body;
            const existing = await prisma_1.prisma.customer.findUnique({
                where: { id: id },
                include: { invoiceInfo: true }
            });
            if (!existing || existing.storeId !== storeId) {
                return res.status(404).json({ error: 'Not found' });
            }
            const updated = await prisma_1.prisma.customer.update({
                where: { id: id },
                data: {
                    name, phone, address, note, email, avatarUrl, isSupplier, gender,
                    birthday: birthday ? new Date(birthday) : null,
                    groups: groupIds ? { set: groupIds.map((gId) => ({ id: gId })) } : undefined,
                    tags: tagIds ? { set: tagIds.map((tId) => ({ id: tId })) } : undefined,
                    invoiceInfo: invoiceInfo ? (existing.invoiceInfo
                        ? { update: invoiceInfo }
                        : { create: invoiceInfo }) : undefined
                }
            });
            return res.json({ customer: updated });
        }
        catch (error) {
            console.error('Error updating customer:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    async deleteCustomer(req, res) {
        try {
            const storeId = req.user?.storeId;
            if (!storeId)
                return res.status(401).json({ error: 'Unauthorized' });
            const { id } = req.params;
            const existing = await prisma_1.prisma.customer.findUnique({ where: { id: id } });
            if (!existing || existing.storeId !== storeId) {
                return res.status(404).json({ error: 'Not found' });
            }
            await prisma_1.prisma.customer.delete({ where: { id: id } });
            return res.json({ success: true });
        }
        catch (error) {
            console.error('Error deleting customer:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    // --- NOTES ---
    async addNote(req, res) {
        try {
            const storeId = req.user?.storeId;
            if (!storeId)
                return res.status(401).json({ error: 'Unauthorized' });
            const { id } = req.params;
            const { content } = req.body;
            const existing = await prisma_1.prisma.customer.findUnique({ where: { id: id } });
            if (!existing || existing.storeId !== storeId) {
                return res.status(404).json({ error: 'Not found' });
            }
            const note = await prisma_1.prisma.customerNote.create({
                data: { customerId: id, content }
            });
            return res.status(201).json({ note });
        }
        catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    // --- GROUPS ---
    async getGroups(req, res) {
        try {
            const storeId = req.user?.storeId;
            if (!storeId)
                return res.status(401).json({ error: 'Unauthorized' });
            const groups = await prisma_1.prisma.customerGroup.findMany({
                where: { storeId },
                include: { _count: { select: { customers: true } } },
                orderBy: { createdAt: 'desc' }
            });
            return res.json({ groups });
        }
        catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    async getGroupDetail(req, res) {
        try {
            const storeId = req.user?.storeId;
            if (!storeId)
                return res.status(401).json({ error: 'Unauthorized' });
            const { id } = req.params;
            const group = await prisma_1.prisma.customerGroup.findUnique({
                where: { id: id },
                include: { customers: true }
            });
            if (!group || group.storeId !== storeId)
                return res.status(404).json({ error: 'Not found' });
            return res.json({ group });
        }
        catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    async addCustomersToGroup(req, res) {
        try {
            const storeId = req.user?.storeId;
            if (!storeId)
                return res.status(401).json({ error: 'Unauthorized' });
            const { id } = req.params;
            const { customerIds } = req.body;
            const group = await prisma_1.prisma.customerGroup.findUnique({ where: { id: id } });
            if (!group || group.storeId !== storeId)
                return res.status(404).json({ error: 'Not found' });
            await prisma_1.prisma.customerGroup.update({
                where: { id: id },
                data: {
                    customers: { connect: customerIds.map((cId) => ({ id: cId })) }
                }
            });
            return res.json({ success: true });
        }
        catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    async removeCustomersFromGroup(req, res) {
        try {
            const storeId = req.user?.storeId;
            if (!storeId)
                return res.status(401).json({ error: 'Unauthorized' });
            const { id } = req.params;
            const { customerIds } = req.body;
            const group = await prisma_1.prisma.customerGroup.findUnique({ where: { id: id } });
            if (!group || group.storeId !== storeId)
                return res.status(404).json({ error: 'Not found' });
            await prisma_1.prisma.customerGroup.update({
                where: { id: id },
                data: {
                    customers: { disconnect: customerIds.map((cId) => ({ id: cId })) }
                }
            });
            return res.json({ success: true });
        }
        catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    async createGroup(req, res) {
        try {
            const storeId = req.user?.storeId;
            if (!storeId)
                return res.status(401).json({ error: 'Unauthorized' });
            const { name } = req.body;
            const group = await prisma_1.prisma.customerGroup.create({
                data: { name, storeId }
            });
            return res.status(201).json({ group });
        }
        catch (error) {
            console.error('Error creating group:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    async deleteGroup(req, res) {
        try {
            const storeId = req.user?.storeId;
            if (!storeId)
                return res.status(401).json({ error: 'Unauthorized' });
            const { id } = req.params;
            const group = await prisma_1.prisma.customerGroup.findUnique({ where: { id: id } });
            if (!group || group.storeId !== storeId)
                return res.status(404).json({ error: 'Not found' });
            await prisma_1.prisma.customerGroup.delete({ where: { id: id } });
            return res.json({ success: true });
        }
        catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    // --- TAGS ---
    async getTags(req, res) {
        try {
            const storeId = req.user?.storeId;
            if (!storeId)
                return res.status(401).json({ error: 'Unauthorized' });
            const tags = await prisma_1.prisma.customerTag.findMany({
                where: { storeId },
                orderBy: { createdAt: 'desc' }
            });
            return res.json({ tags });
        }
        catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    async createTag(req, res) {
        try {
            const storeId = req.user?.storeId;
            if (!storeId)
                return res.status(401).json({ error: 'Unauthorized' });
            const { name } = req.body;
            const tag = await prisma_1.prisma.customerTag.create({
                data: { name, storeId }
            });
            return res.status(201).json({ tag });
        }
        catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    async deleteTag(req, res) {
        try {
            const storeId = req.user?.storeId;
            if (!storeId)
                return res.status(401).json({ error: 'Unauthorized' });
            const { id } = req.params;
            const tag = await prisma_1.prisma.customerTag.findUnique({ where: { id: id } });
            if (!tag || tag.storeId !== storeId)
                return res.status(404).json({ error: 'Not found' });
            await prisma_1.prisma.customerTag.delete({ where: { id: id } });
            return res.json({ success: true });
        }
        catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}
exports.CustomerController = CustomerController;
