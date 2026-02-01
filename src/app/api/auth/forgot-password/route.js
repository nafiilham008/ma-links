import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { emailTemplates } from "@/lib/email-templates";

export async function POST(request) {
    try {
        const { email } = await request.json();

        const user = await prisma.user.findFirst({ where: { email } });
        if (!user) {
            return NextResponse.json({ message: "Code sent" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

        await prisma.user.update({
            where: { id: user.id },
            data: { verificationCode: otp, verificationExpiry: otpExpiry }
        });

        await sendEmail({
            to: email,
            subject: "Reset Password Code",
            html: emailTemplates.resetPassword(otp)
        });

        return NextResponse.json({ message: "Code sent" });

    } catch (error) {
        return NextResponse.json({ error: "Error" }, { status: 500 });
    }
}
