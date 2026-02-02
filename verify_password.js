const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findUnique({
        where: { username: 'superadmin' }
    });

    if (!user) {
        console.log('User not found');
        return;
    }

    console.log('User found:', user.username);
    console.log('Stored Hash:', user.password);

    const isValid = await bcrypt.compare('password123', user.password);
    console.log('Password valid:', isValid);

    if (!isValid) {
        console.log('Updating password to known hash...');
        const newHash = await bcrypt.hash('password123', 10);
        await prisma.user.update({
            where: { username: 'superadmin' },
            data: { password: newHash }
        });
        console.log('Password updated.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
