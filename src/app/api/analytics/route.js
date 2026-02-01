import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const body = await request.json();
        const { id } = body;

        const link = await prisma.link.update({
            where: { id: parseInt(id) },
            data: {
                clicks: { increment: 1 },
            },
        });

        return NextResponse.json(link);
    } catch (error) {
        return NextResponse.json({ error: "Failed to track click" }, { status: 500 });
    }
}
