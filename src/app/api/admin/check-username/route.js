import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
    const userId = request.headers.get("x-user-id");
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username")?.toLowerCase();

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!username) {
        return NextResponse.json({ error: "Username required" }, { status: 400 });
    }

    try {
        const requester = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
            select: { role: true }
        });

        if (!requester || (requester.role !== 'super admin' && requester.role !== 'ADMIN')) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const existing = await prisma.user.findUnique({
            where: { username },
            select: { id: true }
        });

        return NextResponse.json({
            available: !existing,
            ownerId: existing?.id || null
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
