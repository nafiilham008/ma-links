import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { OAuth2Client } from "google-auth-library";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

// Use server-side env var for verification
const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "super-secret-key-change-this");

export async function POST(request) {
    try {
        const { credential } = await request.json();
        console.log("GOOGLE AUTH HIT - Version 3");

        // Verify Google Token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();

        const googleId = payload.sub;
        const email = payload.email;
        const name = payload.name;
        const picture = payload.picture;

        // Check if user exists
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { googleId: googleId },
                    { email: email } // Link by email if exists
                ]
            }
        });

        if (user) {
            // Update user if needed (e.g. add googleId if linked by email)
            if (!user.googleId) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: { googleId, provider: "google", avatar: user.avatar || picture, emailVerified: new Date() }
                });
            }
        } else {
            // Create new user
            // Generate a username from email or name
            let baseUsername = email.split("@")[0];
            let username = baseUsername;
            let counter = 1;

            // Ensure unique username
            while (await prisma.user.findUnique({ where: { username } })) {
                username = `${baseUsername}${counter}`;
                counter++;
            }

            user = await prisma.user.create({
                data: {
                    username,
                    email,
                    name,
                    googleId,
                    avatar: picture,
                    provider: "google",
                    password: "", // No password for google users
                    emailVerified: new Date(),
                }
            });
        }

        // Generate Session Token
        const token = await new SignJWT({ sub: user.id.toString(), username: user.username })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("24h")
            .sign(JWT_SECRET);

        const cookieStore = await cookies();
        cookieStore.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24, // 1 day
            path: "/",
        });

        return NextResponse.json({
            success: true,
            user: {
                username: user.username,
                role: user.role
            },
            redirect: "/dashboard"
        });

    } catch (error) {
        console.error("Google Auth Error:", error);
        return NextResponse.json({ error: "Authentication failed" }, { status: 400 });
    }
}
