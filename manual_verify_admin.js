const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const admin = await prisma.user.update({
            where: { username: "superadmin" },
            data: { emailVerified: new Date() }
        });
        console.log("Superadmin verified manually:", admin.username);
    } catch (e) {
        console.error("Error updating superadmin:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
