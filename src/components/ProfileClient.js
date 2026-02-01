"use client";
import { useState, useMemo } from "react";
import LinkCard from "./LinkCard";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function ProfileClient({ user }) {
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    const categories = useMemo(() => {
        const cats = new Set(user.links.map(l => l.category).filter(Boolean));
        return ["All", ...Array.from(cats)];
    }, [user.links]);

    const filteredLinks = useMemo(() => {
        return user.links.filter(link => {
            const matchesSearch = link.title.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = selectedCategory === "All" || link.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [user.links, search, selectedCategory]);

    const socialLinks = [
        { id: 'instagram', icon: '📸', url: user.instagram ? `https://instagram.com/${user.instagram}` : null },
        { id: 'youtube', icon: '📺', url: user.youtube ? `https://youtube.com/@${user.youtube}` : null },
        { id: 'spotify', icon: '🎵', url: user.spotify ? `https://open.spotify.com/user/${user.spotify}` : null },
        { id: 'tiktok', icon: '📱', url: user.tiktok ? `https://tiktok.com/@${user.tiktok}` : null },
        { id: 'email', icon: '✉️', url: user.email ? `mailto:${user.email}` : null },
    ].filter(s => s.url);

    return (
        <div className="w-full max-w-2xl flex flex-col items-center">
            {/* Profile Section */}
            <div className="w-full text-center mb-8 animate-fade-in-down">
                <div className="inline-block p-1.5 rounded-full bg-white/40 backdrop-blur-md shadow-2xl mb-6 border border-white/60">
                    <div className="p-1 bg-white rounded-full">
                        <div className="w-28 h-28 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-4xl text-slate-400">👤</span>
                            )}
                        </div>
                    </div>
                </div>
                <h1 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">@{user.username}</h1>
                {user.bio && (
                    <div className="max-w-md mx-auto mb-8 px-4">
                        <p className="text-slate-600 text-sm md:text-base font-medium leading-relaxed italic drop-shadow-sm opacity-90">
                            {user.bio}
                        </p>
                    </div>
                )}

                {/* Social Icons */}
                <div className="flex justify-center gap-4 mb-10">
                    {socialLinks.map(s => (
                        <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
                            className="w-10 h-10 flex items-center justify-center bg-white/50 backdrop-blur-md rounded-full border border-white/60 hover:scale-110 hover:shadow-lg transition-all text-xl shadow-sm">
                            {s.icon}
                        </a>
                    ))}
                </div>
            </div>

            {/* Search & Categories */}
            <div className="w-full mb-8 space-y-4">
                <div className="relative group">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Cari produk atau kategori..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-white/30 backdrop-blur-md border border-white/60 rounded-2xl py-3 pl-12 pr-4 text-slate-800 placeholder-slate-500 outline-none focus:ring-2 focus:ring-white/50 transition-all font-medium shadow-sm"
                    />
                </div>

                {categories.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border shadow-sm ${selectedCategory === cat
                                    ? "bg-slate-800 text-white border-slate-800 scale-105 shadow-md"
                                    : "bg-white/40 text-slate-600 border-white/60 hover:bg-white/60"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Links List */}
            <div className="w-full space-y-4">
                {filteredLinks.map((link) => (
                    <LinkCard key={link.id} link={link} />
                ))}

                {filteredLinks.length === 0 && (
                    <div className="text-center text-slate-500 py-12 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/40">
                        Produk tidak ditemukan.
                    </div>
                )}
            </div>
        </div>
    );
}
