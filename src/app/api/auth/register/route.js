import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/lib/email";
import { emailTemplates } from "@/lib/email-templates";

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request) {
    try {
        const { username, email, password, name } = await request.json();

        // Check availability
        const existing = await prisma.user.findFirst({
            where: {
                OR: [{ username }, { email }]
            }
        });

        if (existing) {
            return NextResponse.json({ error: "Username or Email already taken" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        // Create unverified user
        await prisma.user.create({
            data: {
                username,
                email,
                name,
                password: hashedPassword,
                verificationCode: otp,
                verificationExpiry: otpExpiry,
                provider: "credentials",
                emailVerified: null // Explicitly null
            }
        });

        // Send Email
        await sendEmail({
            to: email,
            subject: "Verify your email",
            html: emailTemplates.verification(otp, name)
        });

        return NextResponse.json({ message: "Registered. Check email for OTP." });

    } catch (error) {
        console.error("Register Error:", error);
        return NextResponse.json({ error: "Registration failed" }, { status: 500 });
    }
}
