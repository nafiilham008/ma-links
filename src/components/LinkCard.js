"use client";

import { useState } from "react";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

export default function LinkCard({ link }) {
    const [showLightbox, setShowLightbox] = useState(false);

    const handleClick = async () => {
        // Fire and forget click tracking
        fetch("/api/analytics", {
            method: "POST",
            body: JSON.stringify({ id: link.id }),
        });
        // Navigation handled by the <a> tag naturally, 
        // but if we want to delay or ensure tracking, we might preventDefault.
        // Ideally, for speed, we just let it go. Tracking usually works.
    };

    return (
        <>
            <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClick}
                className="block w-full group relative mb-4"
            >
                {/* Modern Wide Card Background */}
                <div className="absolute inset-0 bg-white/40 backdrop-blur-xl rounded-[2rem] transform transition-all duration-500 group-hover:bg-white/60 group-hover:scale-[1.01] group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] border border-white/60 group-hover:border-white"></div>

                {/* Content */}
                <div className="relative p-3 flex items-center gap-4">

                    {/* Thumbnail Container */}
                    <div
                        className="w-16 h-16 flex-shrink-0 rounded-[1.5rem] overflow-hidden border border-white/40 bg-white/20 relative z-20 group/image shadow-sm"
                        onClick={(e) => {
                            if (link.image) {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowLightbox(true);
                            }
                        }}
                    >
                        {link.image ? (
                            <img src={link.image} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-110" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50">
                                <span className="text-xl font-bold">{(link.title || "?").charAt(0).toUpperCase()}</span>
                            </div>
                        )}

                        {link.image && (
                            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-[10px] font-bold uppercase tracking-widest">Zoom</span>
                            </div>
                        )}
                    </div>

                    {/* Text Section */}
                    <div className="flex-grow text-left min-w-0 pr-4">
                        <div className="flex flex-col">
                            <h2 className="text-slate-800 font-bold text-lg truncate tracking-tight group-hover:text-indigo-600 transition-colors">
                                {link.title}
                            </h2>
                            {link.platform && (
                                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                                    {link.platform}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Action Arrow */}
                    <div className="flex-shrink-0 pr-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all">
                        <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                    </div>
                </div>
            </a>

            {/* Lightbox */}
            {showLightbox && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-200"
                    onClick={() => setShowLightbox(false)}>
                    <div className="relative max-w-5xl max-h-screen">
                        <img src={link.image} className="max-w-full max-h-[85vh] rounded-lg shadow-2xl border-2 border-white/10" />
                        <button className="absolute -top-12 right-0 text-white hover:text-gray-300">
                            ✕ Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
