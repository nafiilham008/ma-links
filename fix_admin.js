const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const targetEmail = 'user_admin@malinks.web.id';

    // Update the existing 'admin' user
    const updatedUser = await prisma.user.update({
        where: { username: 'admin' },
        data: {
            password: hashedPassword,
            role: 'admin', // Downgrading from super admin if it was
            email: targetEmail, // Updating email to match request
            emailVerified: new Date()
        }
    });

    console.log(`Updated user 'admin':`, updatedUser);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
