"use client";
import { useState, useMemo } from "react";
import LinkCard from "./LinkCard";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { themePresets, buttonStyles } from "@/lib/themes";

import {
    IconBrandInstagram, IconBrandYoutube, IconBrandSpotify, IconBrandTiktok, IconMail,
    IconSmartHome, IconCandy, IconMoodSmile, IconFlower,
    IconLeaf, IconHeart, IconRipple, IconSun,
    IconBolt, IconTrees, IconMoon, IconCloud,
    IconLemon2, IconCoffee
} from "@tabler/icons-react";

const ThemeIcons = {
    IconSmartHome, IconCandy, IconMoodSmile, IconFlower,
    IconLeaf, IconHeart, IconRipple, IconSun,
    IconBolt, IconTrees, IconMoon, IconCloud,
    IconLemon2, IconCoffee
};
import AmbientBackground from "./AmbientBackground";

export default function ProfileClient({ user, isPreview = false }) {
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    const currentTheme = themePresets[user.themePreset] || themePresets["classic"];
    const currentButtonStyle = user.buttonStyle || "rounded";

    const categories = useMemo(() => {
        const cats = new Set(user.links.map(l => l.category).filter(Boolean).map(c =>
            c.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
        ));
        return ["All", ...Array.from(cats)];
    }, [user.links]);

    const filteredLinks = useMemo(() => {
        return user.links.filter(link => {
            const matchesSearch = link.title.toLowerCase().includes(search.toLowerCase());
            // Title Case both for comparison to be safe
            const normalizedLinkCat = link.category ? link.category.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') : null;
            const matchesCategory = selectedCategory === "All" || normalizedLinkCat === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [user.links, search, selectedCategory]);

    const socialLinks = [
        { id: 'instagram', icon: <IconBrandInstagram className="w-5 h-5" />, url: user.instagram ? `https://instagram.com/${user.instagram}` : null },
        { id: 'youtube', icon: <IconBrandYoutube className="w-5 h-5" />, url: user.youtube ? `https://youtube.com/@${user.youtube}` : null },
        { id: 'spotify', icon: <IconBrandSpotify className="w-5 h-5" />, url: user.spotify ? `https://open.spotify.com/user/${user.spotify}` : null },
        { id: 'tiktok', icon: <IconBrandTiktok className="w-5 h-5" />, url: user.tiktok ? `https://tiktok.com/@${user.tiktok}` : null },
        { id: 'email', icon: <IconMail className="w-5 h-5" />, url: user.email ? `mailto:${user.email}` : null },
    ].filter(s => s.url);

    return (
        <main
            className={`min-h-screen w-full flex flex-col items-center py-12 px-4 sm:px-6 transition-all duration-500 relative overflow-hidden`}
            style={
                user.customBackground
                    ? {
                        backgroundImage: `url(${user.customBackground})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundAttachment: "fixed"
                    }
                    : {}
            }
        >
            {/* Background Gradient fallback if no custom BG */}
            {!user.customBackground && (
                <div className={`${isPreview ? "absolute" : "fixed"} inset-0 z-0 ${currentTheme.bg}`}></div>
            )}

            {/* Ambient Effects */}
            {user.enableAmbient !== false && (
                <AmbientBackground themeName={user.themePreset} />
            )}

            <div className="w-full max-w-2xl flex flex-col items-center relative z-10">

                {/* Profile Section */}
                <div className="w-full text-center mb-8 animate-fade-in-down">
                    <div className={`inline-block p-1.5 rounded-full backdrop-blur-md shadow-2xl mb-6 border ${currentTheme.cardBg} ${currentTheme.cardBorder} relative`}>
                        <div className="p-1 bg-white/10 rounded-full">
                            <div className="w-28 h-28 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center border border-white/20">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl text-slate-400">👤</span>
                                )}
                            </div>
                        </div>
                        {/* Theme Icon Badge */}
                        {currentTheme.icon && ThemeIcons[currentTheme.icon] && (
                            <div className={`absolute -bottom-1 -right-1 w-9 h-9 rounded-full ${currentTheme.cardBg} backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-lg z-20`}>
                                {(() => {
                                    const Icon = ThemeIcons[currentTheme.icon];
                                    return <Icon className={`w-5 h-5 ${currentTheme.text}`} />;
                                })()}
                            </div>
                        )}
                    </div>
                    <h1 className={`text-4xl font-black ${currentTheme.text} mb-1 tracking-tight`}>
                        {user.name || `@${user.username}`}
                    </h1>
                    {user.name && (
                        <p className={`text-sm font-medium ${currentTheme.text} opacity-70 mb-2`}>@{user.username}</p>
                    )}
                    {user.bio && (
                        <div className="max-w-md mx-auto mb-8 px-4">
                            <p className={`${currentTheme.text} text-sm md:text-base font-medium leading-relaxed italic drop-shadow-sm opacity-90`}>
                                {user.bio}
                            </p>
                        </div>
                    )}

                    {/* Social Icons */}
                    <div className="flex justify-center gap-4 mb-10">
                        {socialLinks.map(s => (
                            <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
                                className={`w-10 h-10 flex items-center justify-center ${currentTheme.cardBg} backdrop-blur-md rounded-full border ${currentTheme.cardBorder} hover:scale-110 hover:shadow-lg transition-all text-xl shadow-sm ${currentTheme.text}`}>
                                {s.icon}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Search & Categories */}
                <div className="w-full mb-8 space-y-4">
                    <div className="relative group">
                        <MagnifyingGlassIcon className={`w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 ${currentTheme.text} opacity-50 group-focus-within:opacity-100 transition-opacity`} />
                        <input
                            type="text"
                            placeholder="Search items or categories..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className={`w-full ${currentTheme.cardBg} backdrop-blur-md border ${currentTheme.cardBorder} rounded-2xl py-3 pl-12 pr-4 ${currentTheme.text} placeholder-${currentTheme.text}/50 outline-none focus:ring-2 focus:ring-white/20 transition-all font-medium shadow-sm`}
                        />
                    </div>

                    {categories.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto p-4 no-scrollbar">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-6 py-2.5 font-bold whitespace-nowrap transition-all border shadow-sm ${buttonStyles[currentButtonStyle] === "rounded-full" ? "rounded-full" : (buttonStyles[currentButtonStyle] || "rounded-lg")} ${selectedCategory === cat
                                        ? `${currentTheme.text} bg-white/20 border-white/40 scale-105 shadow-md`
                                        : `${currentTheme.text} opacity-60 hover:opacity-100 border-transparent hover:bg-white/10`
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
                        <LinkCard
                            key={link.id}
                            link={link}
                            theme={currentTheme}
                            buttonStyle={currentButtonStyle}
                            isPreview={isPreview}
                        />
                    ))}

                    {filteredLinks.length === 0 && (
                        <div className={`text-center ${currentTheme.text} opacity-60 py-12 ${currentTheme.cardBg} backdrop-blur-sm rounded-2xl border ${currentTheme.cardBorder}`}>
                            No items found.
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-16 text-center">
                    <p className={`${currentTheme.text} opacity-60 text-sm font-medium tracking-wide`}>
                        Powered by <span className="font-bold">ma-links</span>
                    </p>
                    <a href="/login" className={`${currentTheme.text} opacity-40 text-xs hover:opacity-80 animate-pulse mt-2 block`}>Create your own</a>
                </div>
            </div>
        </main>
    );
}
