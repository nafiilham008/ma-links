import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(request, { params }) {
    const userId = request.headers.get("x-user-id");
    const targetUserId = parseInt((await params).id);

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const requester = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
            select: { role: true }
        });

        if (!requester || (requester.role !== 'super admin' && requester.role !== 'ADMIN')) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Prevent self-deletion
        if (parseInt(userId) === targetUserId) {
            return NextResponse.json({ error: "You cannot delete yourself" }, { status: 400 });
        }

        await prisma.user.delete({
            where: { id: targetUserId }
        });

        return NextResponse.json({ message: "User deleted successfully" });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }
}

export async function PATCH(request, { params }) {
    const userId = request.headers.get("x-user-id");
    const targetUserId = parseInt((await params).id);
    const body = await request.json();
    const { name, username, isPremium } = body;

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const requester = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
            select: { role: true }
        });

        if (!requester || (requester.role !== 'super admin' && requester.role !== 'ADMIN')) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Check if username is taken if it's being changed
        if (username) {
            const existing = await prisma.user.findUnique({
                where: { username }
            });
            if (existing && existing.id !== targetUserId) {
                return NextResponse.json({ error: "Username already taken" }, { status: 400 });
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: targetUserId },
            data: {
                name: name !== undefined ? name : undefined,
                username: username !== undefined ? username : undefined,
                isPremium: isPremium !== undefined ? isPremium : undefined
            }
        });

        return NextResponse.json(updatedUser);

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}
