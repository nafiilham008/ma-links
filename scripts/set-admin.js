const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const email = process.argv[2];

if (!email) {
    console.error("Please provide an email address.");
    console.log("Usage: node scripts/set-admin.js <email>");
    process.exit(1);
}

async function main() {
    console.log(`Promoting ${email} to ADMIN...`);

    try {
        const user = await prisma.user.findFirst({
            where: { email }
        });

        if (!user) {
            console.error("❌ User not found with email:", email);
            return;
        }

        const updated = await prisma.user.update({
            where: { id: user.id },
            data: { role: 'super admin' }
        });
        console.log(`✅ Success! User ${updated.username} (${updated.email}) is now a SUPER ADMIN.`);
    } catch (e) {
        console.error("❌ Error: User not found or DB error.", e.message);
    }
}

main()
    .catch(e => {
        throw e
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
