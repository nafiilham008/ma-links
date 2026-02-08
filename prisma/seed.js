const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    // 1. Create Admin
    const adminPassword = await bcrypt.hash('admin123', 10)
    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {
            password: adminPassword,
            role: 'super admin',
            isPremium: true,
            emailVerified: new Date(),
        },
        create: {
            username: 'admin',
            name: 'Super Admin',
            email: 'admin@malinks.local',
            password: adminPassword,
            role: 'super admin',
            provider: 'credentials',
            emailVerified: new Date(),
            isPremium: true,
            purchasedThemes: ['trusted-seller', 'soft-aesthetic', 'rgb-gamer', 'nusantara-batik', 'yummy-pop']
        },
    })

    // 2. Create Standard User (Fixed Verification)
    const userPassword = await bcrypt.hash('user', 10)
    const user = await prisma.user.upsert({
        where: { username: 'user' },
        update: {
            password: userPassword,
            role: 'affiliate',
            isPremium: false,
            purchasedThemes: [],
            emailVerified: new Date(),
        },
        create: {
            username: 'user',
            name: 'Standard User',
            email: 'user@malinks.local',
            password: userPassword,
            role: 'affiliate',
            provider: 'credentials',
            isPremium: false,
            purchasedThemes: [],
            emailVerified: new Date(),
        },
    })

    // 3. Create Specific User "user123"
    const user123Password = await bcrypt.hash('user123', 10)
    const user123 = await prisma.user.upsert({
        where: { username: 'user123' },
        update: {
            password: user123Password,
            role: 'affiliate',
            isPremium: false,
            purchasedThemes: [],
            emailVerified: new Date(),
        },
        create: {
            username: 'user123',
            name: 'User 123',
            email: 'user123@malinks.local',
            password: user123Password,
            role: 'affiliate',
            provider: 'credentials',
            isPremium: false,
            purchasedThemes: [],
            emailVerified: new Date(),
        },
    })

    console.log({ admin: admin.username, user: user.username, user123: user123.username })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
