const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Looking for user 'tester'...");
    const user = await prisma.user.findUnique({ where: { username: 'tester' } });

    if (!user) {
        console.error("Error: User 'tester' not found. Please create the user first.");
        return;
    }

    console.log(`User 'tester' found with ID: ${user.id}. Generating 50 dummy items...`);

    const dummyLinks = [];
    const categories = ["Makanan", "Minuman", "Pakaian", "Elektronik", "Aksesoris"];

    for (let i = 1; i <= 50; i++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        const price = (Math.floor(Math.random() * 50) + 1) * 5000; // Random price 5k - 250k

        dummyLinks.push({
            title: `Produk Dummy ${i} - ${category}`,
            url: `https://store.example.com/product/${i}`,
            price: `Rp ${price.toLocaleString('id-ID')}`,
            platform: 'custom',
            category: category,
            image: null, // User requested no images
            order: i,
            userId: user.id,
        });
    }

    console.log("Inserting data into database...");
    const result = await prisma.link.createMany({
        data: dummyLinks
    });

    console.log(`✅ Success! inserted ${result.count} dummy items for user 'tester'.`);
}

main()
    .catch(e => {
        console.error("Error seeding data:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
