import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const links = await prisma.link.findMany({
            where: { userId: parseInt(userId) },
            orderBy: { order: "asc" },
        });
        return NextResponse.json(links);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch links" }, { status: 500 });
    }
}

export async function POST(request) {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json().catch(() => ({}));
        const { title, url, platform, image, order, category, price } = body;

        if (!title || !url) {
            return NextResponse.json({ error: "Title and URL are required" }, { status: 400 });
        }

        const link = await prisma.link.create({
            data: {
                title,
                url,
                platform: platform || null,
                category: category || null,
                image: image || null,
                price: price || null,
                order: parseInt(order) || 0,
                userId: parseInt(userId),
            },
        });

        return NextResponse.json(link);
    } catch (error) {
        console.error("Link Create Error:", error);
        return NextResponse.json({
            error: "Failed to create link",
            message: error.message,
            tip: "Restart your dev server and run 'npx prisma generate' if you see 'Unknown field'."
        }, { status: 500 });
    }
}
