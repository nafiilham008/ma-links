import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

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
                youtube: true,
                spotify: true,
                tiktok: true,
                email: true,
                themePreset: true,
                buttonStyle: true,
                avatar: true,
                customBackground: true,
                enableAmbient: true,
                name: true,
                username: true,
                views: true,
                role: true,
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
        const { bio, instagram, youtube, spotify, tiktok, email, themePreset, buttonStyle, avatar, customBackground, enableAmbient, name } = body;

        await prisma.user.update({
            where: { id: parseInt(userId) },
            data: {
                bio: bio ? bio.substring(0, 80) : null,
                instagram: instagram || null,
                youtube: youtube || null,
                spotify: spotify || null,
                tiktok: tiktok || null,
                email: email || null,
                themePreset: themePreset || "classic",
                buttonStyle: buttonStyle || "rounded",
                avatar: avatar || null,
                customBackground: customBackground || null,
                enableAmbient: enableAmbient !== undefined ? enableAmbient : true,
                name: name || null,
            },
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
