import bcrypt from 'bcrypt';
import { prisma } from '../src/prisma';

async function main() {
  const email = 'test@example.com';
  
  // Kiểm tra xem đã có user test chưa
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    console.log('Test user already exists. Skipping seed.');
    return;
  }

  // Hash mật khẩu 12345678
  const passwordHash = await bcrypt.hash('12345678', 10);

  // Tạo user và store
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      status: 'ACTIVE',
      role: 'OWNER',
      store: {
        create: {
          name: 'Cửa Hàng Test',
          industry: 'Bán lẻ',
          products: {
            create: [
              { name: 'Cà phê sữa đá', price: 25000, stock: 100, unit: 'Ly' },
              { name: 'Trà đào cam sả', price: 35000, stock: 50, unit: 'Ly' },
              { name: 'Bánh mì thịt nướng', price: 20000, stock: 30, unit: 'Ổ' }
            ]
          }
        }
      },
      onboardingSession: {
        create: {
          status: 'COMPLETED'
        }
      }
    },
    include: {
      store: {
        include: {
          products: true
        }
      }
    }
  });

  // Tạo thêm 1 order mẫu
  if (user.store) {
    const products = user.store.products;
    if (products.length >= 2) {
      await prisma.order.create({
        data: {
          storeId: user.store.id,
          total: products[0].price * 2 + products[1].price * 1,
          isDebt: false,
          paymentMethod: 'CASH',
          items: {
            create: [
              { productId: products[0].id, quantity: 2, price: products[0].price },
              { productId: products[1].id, quantity: 1, price: products[1].price }
            ]
          }
        }
      });
    }
  }

  console.log('Seeding completed successfully.');
  console.log(`- User: ${user.email}`);
  console.log(`- Password: 12345678`);
  console.log(`- Store: ${user.store?.name} (${user.store?.products.length} products seeded)`);
}

main()
  .catch((e) => {
    console.error('Lỗi khi seed data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
