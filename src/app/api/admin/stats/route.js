import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request) {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Verify Admin Role
        const requester = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
            select: { role: true }
        });

        if (!requester || requester.role !== 'super admin') {
            return NextResponse.json({ error: "Forbidden: Admins Only" }, { status: 403 });
        }

        // Fetch Stats
        const [userCount, linkCount, totalViewsAggregate, recentUsers] = await Promise.all([
            prisma.user.count(),
            prisma.link.count(),
            prisma.user.aggregate({
                _sum: { views: true }
            }),
            prisma.user.findMany({
                take: 3,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    username: true,
                    createdAt: true,
                    emailVerified: true,
                    views: true,
                    _count: {
                        select: { links: true }
                    }
                }
            })
        ]);

        // Fetch Top Users
        const topUsers = await prisma.user.findMany({
            take: 3,
            orderBy: { views: 'desc' },
            select: {
                id: true,
                name: true,
                username: true,
                views: true,
                avatar: true
            }
        });

        return NextResponse.json({
            stats: {
                users: userCount,
                links: linkCount,
                views: totalViewsAggregate._sum.views || 0,
            },
            recentUsers,
            topUsers
        });

    } catch (error) {
        console.error("Admin Stats Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
