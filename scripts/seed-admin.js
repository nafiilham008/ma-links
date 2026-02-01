const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = "admin@example.com";
    const password = "admin";

    console.log(`🌱 Seeding Super Admin...`);

    try {
        // 1. Check if user exists by email (since email is not @unique in schema)
        const existingUser = await prisma.user.findFirst({
            where: { email: email }
        });

        if (existingUser) {
            // 2. Update existing user
            const user = await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                    role: 'super admin',
                    // Update password to ensure it is reset to 'admin'
                    password: await bcrypt.hash(password, 10)
                }
            });
            console.log(`✅ Super Admin UPDATED: ${user.email}. Role set to 'super admin'.`);
        } else {
            // 3. Create new user
            // Check if username 'superadmin' is available
            const usernameCheck = await prisma.user.findUnique({
                where: { username: "superadmin" }
            });

            if (usernameCheck) {
                console.error("❌ Cannot create admin: Username 'superadmin' is already taken by another email.");
                return;
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await prisma.user.create({
                data: {
                    email: email,
                    username: "superadmin",
                    name: "Super Admin",
                    password: hashedPassword,
                    role: 'super admin',
                    provider: "credentials",
                    emailVerified: new Date(),
                    themePreset: "midnight-neon"
                }
            });
            console.log(`✅ Super Admin CREATED: ${user.email} (Pass: ${password})`);
        }
    } catch (e) {
        console.error("❌ Seeding failed:", e);
    }
}

main()
    .catch(e => {
        throw e
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
