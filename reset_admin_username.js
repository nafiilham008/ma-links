const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const user = await prisma.user.update({
            where: { username: 'admin' },
            data: { usernameChanged: false },
        });
        console.log(`Successfully reset usernameChanged to false for user: ${user.username}`);
    } catch (error) {
        console.error('Error updating user:', error);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
