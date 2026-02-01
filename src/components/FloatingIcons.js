"use client";
import { SparklesIcon, ShoppingBagIcon, HeartIcon } from "@heroicons/react/24/outline";

export default function FloatingIcons() {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-20">
            {/* Top Left */}
            <div className="absolute top-[10%] left-[5%] animate-orb" style={{ animationDuration: '8s' }}>
                <SparklesIcon className="w-12 h-12 text-indigo-400 rotate-12" />
            </div>

            {/* Bottom Right */}
            <div className="absolute bottom-[20%] right-[10%] animate-orb" style={{ animationDuration: '12s', animationDelay: '-2s' }}>
                <ShoppingBagIcon className="w-16 h-16 text-purple-400 -rotate-12" />
            </div>

            {/* Middle Left */}
            <div className="absolute top-[50%] left-[8%] animate-orb" style={{ animationDuration: '15s', animationDelay: '-5s' }}>
                <HeartIcon className="w-10 h-10 text-pink-400 rotate-45" />
            </div>

            {/* Top Right */}
            <div className="absolute top-[15%] right-[15%] animate-orb" style={{ animationDuration: '10s', animationDelay: '-3s' }}>
                <SparklesIcon className="w-8 h-8 text-indigo-300 -rotate-12" />
            </div>
        </div>
    );
}
