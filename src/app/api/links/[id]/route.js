import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(request, props) {
    const params = await props.params;
    try {
        const id = parseInt(params.id);
        const body = await request.json();
        const { title, url, platform, image, order, category, price } = body;

        const link = await prisma.link.update({
            where: { id },
            data: {
                title,
                url,
                platform,
                category,
                image,
                price: price || null,
                order: parseInt(order) || 0,
            },
        });

        return NextResponse.json(link);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update link" }, { status: 500 });
    }
}

export async function DELETE(request, props) {
    const params = await props.params;
    try {
        const id = parseInt(params.id);
        await prisma.link.delete({
            where: { id },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete link" }, { status: 500 });
    }
}
