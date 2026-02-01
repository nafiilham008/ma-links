import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
    try {
        const { email, code } = await request.json();

        const user = await prisma.user.findFirst({
            where: {
                email,
                verificationCode: code,
                verificationExpiry: { gt: new Date() }
            }
        });

        if (!user) {
            return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
        }

        // Verify user
        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: new Date(),
                verificationCode: null,
                verificationExpiry: null
            }
        });

        return NextResponse.json({ message: "Verified" });

    } catch (error) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
