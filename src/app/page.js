import Link from "next/link";
import { LinkIcon, ChartBarIcon, SparklesIcon, UserGroupIcon, GlobeAltIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import prisma from "@/lib/prisma";
import TypingAnimation from "@/components/TypingAnimation";
import ScrollReveal from "@/components/ScrollReveal";
import FloatingPhone from "@/components/FloatingPhone";
import FloatingIcons from "@/components/FloatingIcons";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

function formatCount(count) {
    if (count > 999) return "999+";
    return count.toString();
}

export default async function Home() {
    // Check Authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const isLoggedIn = !!token;

    // Fetch stats safely
    let userCount = 0;
    let linkCount = 0;

    try {
        const [users, links] = await Promise.all([
            prisma.user.count(),
            prisma.link.count()
        ]);
        userCount = users;
        linkCount = links;
    } catch (e) {
        console.error("Failed to fetch stats", e);
    }

    return (
        <main className="min-h-screen w-full bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500/30">
            {/* Navbar */}
            <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="text-xl font-bold tracking-tight text-white"><span className="text-indigo-400">ma-</span>links</span>
                </div>
                <div className="flex gap-4">
                    {isLoggedIn ? (
                        <Link href="/dashboard" className="flex items-center gap-2 text-sm font-bold px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all shadow-lg shadow-indigo-500/20">
                            Dashboard <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                        </Link>
                    ) : (
                        <>
                            <Link href="/login" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors py-2">
                                Log In
                            </Link>
                            <Link href="/register" className="text-sm font-semibold px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all shadow-lg shadow-indigo-500/20">
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-20 pb-32 px-6 overflow-hidden">
                <FloatingIcons />
                {/* Background Glow Orbs */}
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] animate-orb"></div>
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-orb" style={{ animationDelay: '-5s' }}></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-8 animate-fade-in-down">
                                <SparklesIcon className="w-4 h-4" />
                                <span>The Ultimate Tool for Affiliates</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight tracking-tight">
                                One <TypingAnimation words={["Link", "Catalogue", "Website", "Store", "Socials"]} />. <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-gradient">Unlimited Commissions.</span>
                            </h1>
                            <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl lg:mx-0 mx-auto leading-relaxed">
                                The smarter way to organize your product recommendations.
                                Optimize your bio link, track clicks, and skyrocket your affiliate sales.
                                No coding required.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-16">
                                <Link href="/register" className="relative group px-8 py-4 bg-white text-slate-900 font-bold text-lg rounded-xl hover:bg-slate-100 transition-all shadow-xl shadow-white/5 transform hover:-translate-y-1 overflow-hidden">
                                    <div className="absolute inset-0 animate-shimmer pointer-events-none"></div>
                                    <span className="relative z-10">Create My Free Page</span>
                                </Link>
                                <Link href="/tester" className="px-8 py-4 bg-slate-800 text-white font-bold text-lg rounded-xl hover:bg-slate-700 transition-all border border-slate-700">
                                    View Demo Profile
                                </Link>
                            </div>

                            {/* Community Stats */}
                            <div className="flex justify-center lg:justify-start gap-8 md:gap-16 pt-10 border-t border-slate-800/50">
                                <div className="flex flex-col items-center lg:items-start">
                                    <div className="flex items-center gap-2 text-3xl font-black text-white mb-1">
                                        <UserGroupIcon className="w-8 h-8 text-indigo-500" />
                                        {formatCount(userCount)}
                                    </div>
                                    <span className="text-sm font-bold uppercase tracking-wider text-slate-500">Creators Joined</span>
                                </div>
                                <div className="flex flex-col items-center lg:items-start">
                                    <div className="flex items-center gap-2 text-3xl font-black text-white mb-1">
                                        <GlobeAltIcon className="w-8 h-8 text-emerald-500" />
                                        {formatCount(linkCount)}
                                    </div>
                                    <span className="text-sm font-bold uppercase tracking-wider text-slate-500">Links Shared</span>
                                </div>
                            </div>
                        </div>

                        {/* Floating Phone Section */}
                        <ScrollReveal className="hidden lg:block">
                            <FloatingPhone />
                        </ScrollReveal>
                    </div>

                    <div className="mt-24 flex justify-center">
                        <div className="inline-flex flex-col sm:flex-row items-center gap-4 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]"></div>
                                </div>
                                <span className="text-white font-bold tracking-wide uppercase text-xs">Free Forever</span>
                            </div>
                            <div className="hidden sm:block w-px h-4 bg-white/10"></div>
                            <p className="text-slate-400 text-sm font-medium">No credit card needed • Link unlimited products</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="bg-slate-800/30 py-24 px-6 border-y border-slate-800/50 relative overflow-hidden">
                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <ScrollReveal>
                            <div className="bg-slate-900/50 backdrop-blur-sm p-10 rounded-[2.5rem] border border-slate-800 hover:border-indigo-500/30 transition-all group h-full">
                                <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/5">
                                    <LinkIcon className="w-7 h-7 text-indigo-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">Smart Organization</h3>
                                <p className="text-slate-400 leading-relaxed text-lg">
                                    Categorize your Shopee & TikTok links easily. Help your audience find exactly what they're looking for without endless scrolling.
                                </p>
                            </div>
                        </ScrollReveal>

                        {/* Feature 2 */}
                        <ScrollReveal>
                            <div className="bg-slate-900/50 backdrop-blur-sm p-10 rounded-[2.5rem] border border-slate-800 hover:border-purple-500/30 transition-all group h-full" style={{ animationDelay: '0.2s' }}>
                                <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/5">
                                    <SparklesIcon className="w-7 h-7 text-purple-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">Premium Aesthetics</h3>
                                <p className="text-slate-400 leading-relaxed text-lg">
                                    Stand out with professional, modern designs. Glassmorphism, dark mode, and smooth animations—right out of the box.
                                </p>
                            </div>
                        </ScrollReveal>

                        {/* Feature 3 */}
                        <ScrollReveal>
                            <div className="bg-slate-900/50 backdrop-blur-sm p-10 rounded-[2.5rem] border border-slate-800 hover:border-emerald-500/30 transition-all group h-full" style={{ animationDelay: '0.4s' }}>
                                <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/5">
                                    <ChartBarIcon className="w-7 h-7 text-emerald-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">Real-time Analytics</h3>
                                <p className="text-slate-400 leading-relaxed text-lg">
                                    Track exactly which products are getting clicks. Know your top performers and optimize your strategy to earn more.
                                </p>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 text-center border-t border-slate-800">
                <p className="text-slate-500 mb-4">&copy; {new Date().getFullYear()} ma-links. All rights reserved.</p>
                <div className="flex justify-center gap-6 text-sm text-slate-400">
                    <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                </div>
            </footer>
        </main>
    );
}
