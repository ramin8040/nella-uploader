import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Seed or update Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      name: 'مدیر ارشد',
    },
  });
  console.log(`👤 Admin created/verified: ${admin.username} (Password: admin123)`);

  // 2. Seed or update Settings
  const settings = await prisma.settings.upsert({
    where: { id: 'singleton' },
    update: {
      primaryColor: '#e08d3c',
      secondaryColor: '#ffd7ab',
    },
    create: {
      id: 'singleton',
      brandName: 'مرکز پخش موسیقی نلا',
      brandLogoUrl: '/assets/logo.svg',
      primaryColor: '#e08d3c',
      secondaryColor: '#ffd7ab',
      instagramUrl: 'https://instagram.com/music_center',
      telegramUrl: 'https://t.me/music_center',
      phoneNumber: '۰۹۱۲۳۴۵۶۷۸۹',
      websiteUrl: 'https://example.com',
    },
  });
  console.log(`⚙️ Settings initialized: ${settings.brandName}`);

  // 3. Optional sample track for initial testing
  const trackCount = await prisma.music.count();
  if (trackCount === 0) {
    const sampleTrack = await prisma.music.create({
      data: {
        id: 'f8Ka2Lp',
        slug: 'f8Ka2Lp',
        title: 'باران بهاری (قطعه نمونه)',
        artist: 'محمدرضا شجریان',
        album: 'آرامش شبانه',
        duration: 214.0, // 3m 34s
        bitrate: 320,
        fileSize: 8560000,
        mimeType: 'audio/mpeg',
        storageKey: 'sample_rain.mp3',
        playCount: 1420,
        likeCount: 310,
      },
    });

    const sampleTrack2 = await prisma.music.create({
      data: {
        id: 'm9Xq3Nw',
        slug: 'm9Xq3Nw',
        title: 'شب سکوت کویر',
        artist: 'کیهان کلهر',
        album: 'موسیقی بی‌کلام',
        duration: 185.0,
        bitrate: 320,
        fileSize: 7420000,
        mimeType: 'audio/mpeg',
        storageKey: 'sample_desert.mp3',
        playCount: 980,
        likeCount: 205,
      },
    });
    console.log(`🎵 Sample tracks created: ${sampleTrack.title}, ${sampleTrack2.title}`);
  }

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
