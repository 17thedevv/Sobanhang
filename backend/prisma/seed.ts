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
          industry: 'Bán lẻ'
        }
      },
      onboardingSession: {
        create: {
          status: 'COMPLETED'
        }
      }
    },
    include: {
      store: true
    }
  });

  console.log('Seeding completed successfully.');
  console.log(`- User: ${user.email}`);
  console.log(`- Password: 12345678`);
  console.log(`- Store: ${user.store?.name}`);
}

main()
  .catch((e) => {
    console.error('Lỗi khi seed data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
