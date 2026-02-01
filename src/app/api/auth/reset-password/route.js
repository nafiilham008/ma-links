import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request) {
    try {
        const { email, code, password } = await request.json();

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

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                verificationCode: null,
                verificationExpiry: null
            }
        });

        return NextResponse.json({ message: "Password reset successful" });

    } catch (error) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
