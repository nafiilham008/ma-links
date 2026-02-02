const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Looking for user 'tester'...");
    const user = await prisma.user.findUnique({ where: { username: 'tester' } });

    if (!user) {
        console.error("Error: User 'tester' not found.");
        return;
    }

    console.log(`User 'tester' found with ID: ${user.id}. Removing dummy items...`);

    const result = await prisma.link.deleteMany({
        where: {
            userId: user.id,
            title: {
                startsWith: "Produk Dummy"
            }
        }
    });

    console.log(`✅ Success! Removed ${result.count} dummy items for user 'tester'.`);
}

main()
    .catch(e => {
        console.error("Error removing data:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
