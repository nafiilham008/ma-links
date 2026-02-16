import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "super-secret-key-change-this"
);

export async function POST(request) {
    try {
        const body = await request.json();
        const { username, password } = body;

        // Allow login with username OR email
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { username: username },
                    { email: username } // Creating a flexible login
                ]
            }
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // Create JWT
        const token = await new SignJWT({ sub: user.id.toString(), username: user.username })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("24h")
            .sign(JWT_SECRET);

        const response = NextResponse.json({
            success: true,
            user: {
                username: user.username,
                role: user.role
            }
        });

        // Set HTTP-only cookie
        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24, // 24 hours
            path: "/",
        });

        return response;

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Login failed" }, { status: 500 });
    }
}
