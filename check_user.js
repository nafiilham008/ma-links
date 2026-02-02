const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const admin = await prisma.user.findFirst({
        where: { role: 'super admin' }
    });

    if (admin) {
        console.log(`FOUND: ${admin.username}`);
    } else {
        console.log('NOT_FOUND');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
