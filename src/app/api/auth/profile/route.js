import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request) {
    const userId = request.headers.get("x-user-id");

    if (!userId || isNaN(parseInt(userId))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
            select: {
                bio: true,
                instagram: true,
                facebook: true,
                youtube: true,
                spotify: true,
                tiktok: true,
                email: true,
                publicEmail: true,
                themePreset: true,
                buttonStyle: true,
                avatar: true,
                customBackground: true,
                enableAmbient: true,
                usernameChanged: true,
                provider: true,
                name: true,
                username: true,
                views: true,
                role: true,
                emailVerified: true,
                isPremium: true,
                purchasedThemes: true,
            }
        });

        if (!user) {
            return NextResponse.json({
                bio: "",
                instagram: "",
                youtube: "",
                spotify: "",
                tiktok: "",
                username: "guest",
                email: "",
                themePreset: "classic",
                buttonStyle: "rounded",
                avatar: null,
                customBackground: null,
                enableAmbient: true,
                name: "",
                views: 0,
                role: "affiliate"
            });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Profile Fetch Error:", error);
        return NextResponse.json({
            error: "Failed to fetch profile",
            message: error.message,
            tip: "Restart your dev server and run 'npx prisma generate' if you see 'Unknown field'."
        }, { status: 500 });
    }
}

export async function PUT(request) {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json().catch(() => ({}));
        const { username, bio, instagram, facebook, youtube, spotify, tiktok, email, publicEmail, themePreset, buttonStyle, avatar, customBackground, enableAmbient, name } = body;

        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const updateData = {
            bio: bio ? bio.substring(0, 150) : null,
            instagram: instagram || null,
            facebook: facebook || null,
            youtube: youtube || null,
            spotify: spotify || null,
            tiktok: tiktok || null,
            email: email || null,
            publicEmail: publicEmail || null,
            themePreset: themePreset || "classic",
            buttonStyle: buttonStyle || "rounded",
            avatar: avatar || null,
            customBackground: customBackground || null,
            enableAmbient: enableAmbient !== undefined ? enableAmbient : true,
            name: name || null,
        };

        if (username && username !== user.username) {
            if (user.usernameChanged) {
                return NextResponse.json({ error: "Username change not allowed" }, { status: 403 });
            }

            // Check if new username is unique
            const existing = await prisma.user.findUnique({ where: { username } });
            if (existing) {
                return NextResponse.json({ error: "Username already taken" }, { status: 409 });
            }

            updateData.username = username;
            updateData.usernameChanged = true;
        }

        await prisma.user.update({
            where: { id: parseInt(userId) },
            data: updateData,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Profile Update Error:", error);
        return NextResponse.json({
            error: "Failed to update profile",
            message: error.message
        }, { status: 500 });
    }
}
