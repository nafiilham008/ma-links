const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const username = 'admin'; // Target username
    const newRole = 'affiliate'; // Target role

    try {
        const user = await prisma.user.update({
            where: { username: username },
            data: { role: newRole },
        });
        console.log(`Successfully updated role for user '${username}' to '${newRole}'.`);
        console.log('Updated user:', user);
    } catch (error) {
        console.error('Error updating user role:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
