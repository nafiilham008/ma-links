"use client";
export default function FloatingPhone() {
    return (
        <div className="relative w-full max-w-[280px] mx-auto animate-orb group">
            {/* Glow behind phone */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-[3rem] blur-3xl group-hover:opacity-75 transition-opacity"></div>

            <div className="mockup-phone border-slate-800 bg-slate-900 rounded-[3rem] border-[10px] overflow-hidden shadow-2xl relative z-10">
                <div className="camera"></div>
                <div className="display pt-12 pb-6 px-4 bg-slate-950 relative h-[500px] overflow-hidden">
                    {/* Real Image Overlay (Optional) */}
                    <img
                        src="/hero-preview.png"
                        alt="Hero Preview"
                        className="absolute inset-0 w-full h-full object-cover z-30 transition-opacity duration-1000"
                        onError={(e) => e.target.style.display = 'none'}
                    />

                    {/* Premium Cyber/Dark Mockup */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-950 to-purple-900 z-10"></div>
                    {/* Ambient Glows inside phone */}
                    <div className="absolute top-1/4 -left-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl z-15 animate-pulse"></div>
                    <div className="absolute bottom-1/4 -right-10 w-32 h-32 bg-pink-500/20 rounded-full blur-2xl z-15 animate-pulse" style={{ animationDelay: '1s' }}></div>

                    <div className="relative z-20 flex flex-col items-center w-full">
                        {/* Profile Header */}
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-400 to-pink-500 mb-4 shadow-[0_0_20px_rgba(129,140,248,0.5)] ring-2 ring-white/20"></div>
                        <div className="w-32 h-3 bg-white rounded-full mb-2 shadow-sm"></div>
                        <div className="w-20 h-2 bg-indigo-300/40 rounded-full mb-4"></div>
                        <div className="w-full h-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-full mb-6 flex items-center px-4 gap-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></div>
                            <div className="w-32 h-1 bg-white/20 rounded-full"></div>
                        </div>

                        {/* Social Row */}
                        <div className="flex gap-4 mb-8">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                                    <div className="w-4 h-4 rounded-sm bg-indigo-300/60"></div>
                                </div>
                            ))}
                        </div>

                        {/* Search & Categories */}
                        <div className="w-full h-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl mb-4 px-4 flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full border-2 border-indigo-400/50"></div>
                            <div className="w-24 h-1.5 bg-white/10 rounded-full"></div>
                        </div>
                        <div className="flex gap-2 mb-6 w-full overflow-hidden">
                            {["All", "Baju", "Skincare"].map((cat, i) => (
                                <div key={i} className={`px-4 py-1.5 rounded-full text-[8px] font-bold border transition-all ${i === 0 ? "bg-indigo-500 border-indigo-400 text-white shadow-lg shadow-indigo-500/20" : "bg-white/5 border-white/10 text-white/40"}`}>
                                    {cat}
                                </div>
                            ))}
                        </div>

                        {/* Link Cards */}
                        <div className="w-full space-y-3">
                            {[
                                { color: "from-indigo-500 to-blue-500", label: "My Favorite Baju" },
                                { color: "from-purple-500 to-pink-500", label: "Skincare Route" },
                            ].map((item, i) => (
                                <div key={i} className="w-full h-14 bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl flex items-center px-3 gap-3 hover:bg-white/15 transition-all group/card">
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} shadow-lg shadow-indigo-500/20`}></div>
                                    <div className="flex-1">
                                        <div className="h-2 bg-white rounded-full w-3/4 mb-1.5"></div>
                                        <div className="h-1 bg-white/30 rounded-full w-1/2"></div>
                                    </div>
                                    <div className="w-3 h-3 border-t-2 border-r-2 border-indigo-400 rotate-45 mr-1 opacity-50 group-hover/card:opacity-100 transition-opacity"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Gloss effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5 pointer-events-none z-40"></div>
                </div>
            </div>
        </div>
    );
}
