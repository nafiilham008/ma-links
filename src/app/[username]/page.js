import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProfileClient from "@/components/ProfileClient";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function UserProfile(props) {
    const params = await props.params;
    const username = params.username;

    const user = await prisma.user.findUnique({
        where: { username },
        include: {
            links: {
                orderBy: { order: "asc" },
            },
        },
    });

    if (!user) {
        return notFound();
    }

    // Increment views if accessed (simple view counting)
    // We could exclude owner views here if we had the context, but simpler to just count or ignore
    await prisma.user.update({
        where: { id: user.id },
        data: { views: { increment: 1 } },
    });

    return (
        <ProfileClient user={user} />
    );
}
