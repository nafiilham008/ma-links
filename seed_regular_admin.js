const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    // 1. Create Regular Admin
    const hashedPassword = await bcrypt.hash('password123', 10);

    const existingAdmin = await prisma.user.findUnique({
        where: { username: 'admin' }
    });

    if (existingAdmin) {
        console.log('Regular admin already exists.');
    } else {
        const user = await prisma.user.create({
            data: {
                username: 'admin',
                email: 'user_admin@malinks.web.id', // Different email to avoid conflict
                password: hashedPassword,
                role: 'admin', // Regular admin role
                provider: 'credentials',
                name: 'Regular Admin',
                themePreset: 'classic',
                emailVerified: new Date()
            },
        });
        console.log(`Created regular admin user with ID: ${user.id}`);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
