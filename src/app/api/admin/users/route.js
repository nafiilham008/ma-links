import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request) {
    const userId = request.headers.get("x-user-id");
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const requester = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
            select: { role: true }
        });

        if (!requester || requester.role !== 'super admin') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    name: true,
                    role: true,
                    createdAt: true,
                    emailVerified: true,
                    _count: { select: { links: true } },
                    views: true,
                    avatar: true
                }
            }),
            prisma.user.count()
        ]);

        return NextResponse.json({
            users,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
