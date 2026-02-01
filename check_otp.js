
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        where: {
            verificationCode: { not: null }
        },
        select: {
            username: true,
            email: true,
            verificationCode: true,
            updatedAt: true
        },
        orderBy: {
            updatedAt: 'desc'
        },
        take: 5
    });

    console.log("Found " + users.length + " users with verification codes:");
    users.forEach(u => {
        console.log(`User: ${u.username} | Email: ${u.email} | OTP: ${u.verificationCode} | Updated: ${u.updatedAt}`);
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
