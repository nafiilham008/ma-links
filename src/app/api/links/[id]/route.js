import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function PUT(request, props) {
    const params = await props.params;
    try {
        const id = parseInt(params.id);
        const body = await request.json();
        const { title, url, platform, image, order, category, price } = body;

        // Get old link to check for image cleanup
        const oldLink = await prisma.link.findUnique({ where: { id } });

        // Standardize category capitalization
        const formattedCategory = category?.trim()
            ? category.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
            : null;

        const link = await prisma.link.update({
            where: { id },
            data: {
                title,
                url,
                platform: platform || null,
                category: formattedCategory,
                image: image || null,
                price: price || null,
                order: parseInt(order) || 0,
            },
        });

        // Cleanup old image if changed
        if (oldLink && oldLink.image && oldLink.image !== image) {
            try {
                const oldPath = path.join(process.cwd(), "public", oldLink.image);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            } catch (e) {
                console.error("Old image cleanup failed", e);
            }
        }

        return NextResponse.json(link);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update link" }, { status: 500 });
    }
}

export async function DELETE(request, props) {
    const params = await props.params;
    try {
        const id = parseInt(params.id);

        // Find link to get image path before deletion
        const link = await prisma.link.findUnique({ where: { id } });

        if (link && link.image) {
            try {
                const filePath = path.join(process.cwd(), "public", link.image);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            } catch (e) {
                console.error("Image unlink failed", e);
            }
        }

        await prisma.link.delete({
            where: { id },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete link" }, { status: 500 });
    }
}
