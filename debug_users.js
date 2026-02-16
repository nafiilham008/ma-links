const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.user.findMany();
        console.log('--- USERS IN DB ---');
        users.forEach(u => {
            console.log(`ID: ${u.id}, Username: '${u.username}', Email: '${u.email}', Role: '${u.role}', Verified: ${u.emailVerified}`);
        });
        console.log('--- END ---');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
