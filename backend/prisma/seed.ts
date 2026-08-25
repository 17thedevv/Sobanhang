import bcrypt from 'bcrypt';
import { prisma } from '../src/prisma';

async function main() {
  console.log('🌱 Bắt đầu Seed dữ liệu toàn bộ Epic 1-3...\n');

  const email = 'test@example.com';
  
  // Kiểm tra xem đã có user test chưa — nếu có thì SKIP (an toàn cho production)
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    console.log('✅ Dữ liệu đã tồn tại, bỏ qua seed.');
    return;
  }

  // ══════════════════════════════════════════════════════
  // EPIC 1: Tạo User + Store + Onboarding
  // ══════════════════════════════════════════════════════
  console.log('📦 Epic 1: Tạo User & Cửa hàng...');
  const passwordHash = await bcrypt.hash('12345678', 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      status: 'ACTIVE',
      role: 'OWNER',
      store: {
        create: {
          name: 'Cửa Hàng Demo SoBanHang',
          industry: 'Bán lẻ tổng hợp',
        }
      },
      onboardingSession: {
        create: {
          status: 'COMPLETED',
          needs: JSON.stringify(['pos', 'inventory', 'report']),
        }
      }
    },
    include: {
      store: true
    }
  });

  const storeId = user.store!.id;
  console.log(`   ✅ User: ${email} / Mật khẩu: 12345678`);
  console.log(`   ✅ Cửa hàng: "${user.store!.name}" (ID: ${storeId})\n`);

  // ══════════════════════════════════════════════════════
  // EPIC 3: Tạo Danh mục (Categories)
  // ══════════════════════════════════════════════════════
  console.log('📦 Epic 3: Tạo Danh mục...');
  const catDoUong = await prisma.category.create({
    data: { storeId, name: 'Đồ uống' }
  });
  const catDoAn = await prisma.category.create({
    data: { storeId, name: 'Đồ ăn vặt' }
  });
  const catThoiTrang = await prisma.category.create({
    data: { storeId, name: 'Thời trang' }
  });
  const catDienTu = await prisma.category.create({
    data: { storeId, name: 'Phụ kiện điện tử' }
  });
  console.log(`   ✅ 4 danh mục: Đồ uống, Đồ ăn vặt, Thời trang, Phụ kiện điện tử\n`);

  // ══════════════════════════════════════════════════════
  // EPIC 2 + 3: Tạo Sản phẩm (Products)
  // ══════════════════════════════════════════════════════
  console.log('📦 Epic 2+3: Tạo Sản phẩm...');

  // --- Sản phẩm đơn giản (Epic 2 style) ---
  const spCaPhe = await prisma.product.create({
    data: {
      storeId,
      categoryId: catDoUong.id,
      name: 'Cà phê sữa đá',
      price: 25000,
      stock: 100,
      unit: 'Ly',
      trackInventory: true,
      barcode: 'SP001',
    }
  });

  const spTraDao = await prisma.product.create({
    data: {
      storeId,
      categoryId: catDoUong.id,
      name: 'Trà đào cam sả',
      price: 35000,
      promotionalPrice: 29000,
      stock: 50,
      unit: 'Ly',
      trackInventory: true,
      barcode: 'SP002',
    }
  });

  const spBanhMi = await prisma.product.create({
    data: {
      storeId,
      categoryId: catDoAn.id,
      name: 'Bánh mì thịt nướng',
      price: 20000,
      stock: 80,
      unit: 'Ổ',
      trackInventory: true,
      barcode: 'SP003',
    }
  });

  const spNemChua = await prisma.product.create({
    data: {
      storeId,
      categoryId: catDoAn.id,
      name: 'Nem chua rán',
      price: 36000,
      stock: 60,
      unit: 'Phần',
      trackInventory: true,
      barcode: 'SP004',
    }
  });

  // --- Sản phẩm có Giá sỉ (Epic 3) ---
  const spCocacola = await prisma.product.create({
    data: {
      storeId,
      categoryId: catDoUong.id,
      name: 'Cocacola lon 330ml',
      price: 10000,
      promotionalPrice: 9000,
      stock: 200,
      unit: 'Lon',
      trackInventory: true,
      barcode: 'SP005',
      wholesalePrice: JSON.stringify([
        { minQuantity: 10, price: 8500 },
        { minQuantity: 50, price: 8000 },
      ]),
    }
  });

  const spCapSac = await prisma.product.create({
    data: {
      storeId,
      categoryId: catDienTu.id,
      name: 'Cáp sạc Type-C 1m',
      price: 45000,
      stock: 30,
      unit: 'Sợi',
      trackInventory: true,
      barcode: 'SP006',
    }
  });

  console.log(`   ✅ 6 sản phẩm đơn (Cà phê, Trà đào, Bánh mì, Nem chua, Cocacola, Cáp sạc)`);

  // --- Sản phẩm có Biến thể (Epic 3) ---
  const spAoThun = await prisma.product.create({
    data: {
      storeId,
      categoryId: catThoiTrang.id,
      name: 'Áo thun Polo nam',
      price: 200000,
      stock: 0, // stock nằm ở variants
      unit: 'Cái',
      trackInventory: true,
      barcode: 'SP007',
    }
  });

  // Tạo 4 biến thể: Đỏ-L, Đỏ-XL, Xanh-L, Xanh-XL
  await prisma.productVariant.createMany({
    data: [
      { productId: spAoThun.id, attributes: JSON.stringify({ 'Màu sắc': 'Đỏ', 'Size': 'L' }), price: null, stock: 15, barcode: 'SP007-DL' },
      { productId: spAoThun.id, attributes: JSON.stringify({ 'Màu sắc': 'Đỏ', 'Size': 'XL' }), price: null, stock: 10, barcode: 'SP007-DXL' },
      { productId: spAoThun.id, attributes: JSON.stringify({ 'Màu sắc': 'Xanh', 'Size': 'L' }), price: null, stock: 20, barcode: 'SP007-XL' },
      { productId: spAoThun.id, attributes: JSON.stringify({ 'Màu sắc': 'Xanh', 'Size': 'XL' }), price: 250000, stock: 8, barcode: 'SP007-XXL' },
    ]
  });

  const spOpLung = await prisma.product.create({
    data: {
      storeId,
      categoryId: catDienTu.id,
      name: 'Ốp lưng iPhone 15',
      price: 80000,
      stock: 0,
      unit: 'Cái',
      trackInventory: true,
      barcode: 'SP008',
    }
  });

  await prisma.productVariant.createMany({
    data: [
      { productId: spOpLung.id, attributes: JSON.stringify({ 'Màu': 'Trong suốt' }), price: null, stock: 25, barcode: 'SP008-TS' },
      { productId: spOpLung.id, attributes: JSON.stringify({ 'Màu': 'Đen' }), price: null, stock: 30, barcode: 'SP008-D' },
      { productId: spOpLung.id, attributes: JSON.stringify({ 'Màu': 'Xanh dương' }), price: 90000, stock: 15, barcode: 'SP008-XD' },
    ]
  });

  console.log(`   ✅ 2 sản phẩm có biến thể (Áo thun Polo: 4 biến thể, Ốp lưng: 3 biến thể)\n`);

  // ══════════════════════════════════════════════════════
  // EPIC 2: Tạo Đơn hàng mẫu (Orders)
  // ══════════════════════════════════════════════════════
  console.log('📦 Epic 2: Tạo Đơn hàng mẫu...');

  // Đơn 1: Tiền mặt, 2 cà phê + 1 trà đào
  const order1Total = spCaPhe.price * 2 + (spTraDao.promotionalPrice || spTraDao.price) * 1;
  await prisma.order.create({
    data: {
      storeId,
      total: order1Total,
      isDebt: false,
      paymentMethod: 'CASH',
      items: {
        create: [
          { productId: spCaPhe.id, quantity: 2, price: spCaPhe.price },
          { productId: spTraDao.id, quantity: 1, price: spTraDao.promotionalPrice || spTraDao.price },
        ]
      }
    }
  });

  // Đơn 2: Chuyển khoản, 3 bánh mì + 2 nem chua
  const order2Total = spBanhMi.price * 3 + spNemChua.price * 2;
  await prisma.order.create({
    data: {
      storeId,
      total: order2Total,
      isDebt: false,
      paymentMethod: 'TRANSFER',
      items: {
        create: [
          { productId: spBanhMi.id, quantity: 3, price: spBanhMi.price },
          { productId: spNemChua.id, quantity: 2, price: spNemChua.price },
        ]
      }
    }
  });

  // Đơn 3: Ghi nợ, 5 cocacola
  const order3Total = (spCocacola.promotionalPrice || spCocacola.price) * 5;
  await prisma.order.create({
    data: {
      storeId,
      total: order3Total,
      isDebt: true,
      paymentMethod: 'CASH',
      items: {
        create: [
          { productId: spCocacola.id, quantity: 5, price: spCocacola.promotionalPrice || spCocacola.price },
        ]
      }
    }
  });

  // Trừ tồn kho theo đơn hàng
  await prisma.product.update({ where: { id: spCaPhe.id }, data: { stock: { decrement: 2 } } });
  await prisma.product.update({ where: { id: spTraDao.id }, data: { stock: { decrement: 1 } } });
  await prisma.product.update({ where: { id: spBanhMi.id }, data: { stock: { decrement: 3 } } });
  await prisma.product.update({ where: { id: spNemChua.id }, data: { stock: { decrement: 2 } } });
  await prisma.product.update({ where: { id: spCocacola.id }, data: { stock: { decrement: 5 } } });

  console.log(`   ✅ Đơn 1: Tiền mặt - ${order1Total.toLocaleString()}đ (2 Cà phê + 1 Trà đào)`);
  console.log(`   ✅ Đơn 2: Chuyển khoản - ${order2Total.toLocaleString()}đ (3 Bánh mì + 2 Nem chua)`);
  console.log(`   ✅ Đơn 3: Ghi nợ - ${order3Total.toLocaleString()}đ (5 Cocacola)\n`);

  // ══════════════════════════════════════════════════════
  // TỔNG KẾT
  // ══════════════════════════════════════════════════════
  const totalRevenue = order1Total + order2Total + order3Total;
  console.log('═══════════════════════════════════════');
  console.log('🎉 SEED HOÀN TẤT!');
  console.log('═══════════════════════════════════════');
  console.log(`   👤 Tài khoản  : ${email} / 12345678`);
  console.log(`   🏪 Cửa hàng   : ${user.store!.name}`);
  console.log(`   📂 Danh mục   : 4`);
  console.log(`   📦 Sản phẩm   : 8 (6 đơn + 2 có biến thể)`);
  console.log(`   🏷️  Biến thể   : 7 (4 Áo thun + 3 Ốp lưng)`);
  console.log(`   🧾 Đơn hàng   : 3`);
  console.log(`   💰 Doanh thu  : ${totalRevenue.toLocaleString()}đ`);
  console.log('═══════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
