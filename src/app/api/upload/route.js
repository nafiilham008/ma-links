import { NextResponse } from "next/server";
import path from "path";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";

export async function POST(request) {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
        return NextResponse.json({ error: "No file received." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    // Sanitize filename: remove special characters, keep only alphanum, underscores, dots, and dashes
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = Date.now() + "_" + safeName;

    try {
        // Use persistent path on VPS, fallback to local for development
        let uploadDir = "/var/www/ma-links-uploads";
        if (!existsSync(uploadDir)) {
            uploadDir = path.join(process.cwd(), "public/uploads");
        }

        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        await writeFile(
            path.join(uploadDir, filename),
            buffer
        );

        return NextResponse.json({ url: `/uploads/${filename}` });
    } catch (error) {
        console.error("Error occurred ", error);
        return NextResponse.json({ error: "Failed to upload file." }, { status: 500 });
    }
}
