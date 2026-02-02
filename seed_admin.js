const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('password123', 10);

    const existing = await prisma.user.findUnique({
        where: { username: 'superadmin' }
    });

    if (existing) {
        console.log('Superadmin already exists. Skipping creation.');
        return;
    }

    const user = await prisma.user.create({
        data: {
            username: 'superadmin',
            email: 'admin@malinks.web.id',
            password: hashedPassword,
            role: 'super admin',
            provider: 'credentials',
            name: 'Super Admin',
            themePreset: 'midnight-neon',
            emailVerified: new Date()
        },
    });
    console.log(`Created superadmin user with ID: ${user.id}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
