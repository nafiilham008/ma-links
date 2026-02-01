import Link from "next/link";

export default function Home() {
    return (
        <main className="min-h-screen w-full bg-slate-900 flex flex-col items-center justify-center p-4">
            <div className="text-center max-w-lg">
                <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-6 tracking-tight">
                    Linktree Clone
                </h1>
                <p className="text-slate-400 text-xl mb-10 leading-relaxed">
                    One link for all your links. Create your profile, share it with the world, and track your audience.
                </p>

                <div className="flex gap-4 justify-center">
                    <Link href="/login" className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all border border-slate-700">
                        Log In
                    </Link>
                    <Link href="/register" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/20">
                        Sign Up
                    </Link>
                </div>
            </div>

            <div className="mt-20 text-slate-500 text-sm">
                Example profile: <Link href="/wulan" className="text-indigo-400 hover:underline">/wulan</Link>
            </div>
        </main>
    );
}
