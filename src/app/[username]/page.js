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

    return (
        <main className="min-h-screen w-full bg-mesh-gradient flex flex-col items-center py-12 px-4 sm:px-6">
            <ProfileClient user={user} />

            {/* Footer */}
            <div className="mt-16 text-center">
                <p className="text-slate-500/60 text-sm font-medium tracking-wide">
                    Powered by <span className="text-slate-700 font-bold">Linktree Clone</span>
                </p>
                <a href="/login" className="text-slate-400 text-xs hover:text-slate-600 animate-pulse mt-2 block">Create your own</a>
            </div>
        </main>
    );
}
