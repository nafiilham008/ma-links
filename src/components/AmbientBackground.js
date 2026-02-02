"use client";
import { useEffect, useState } from "react";

const themeEffects = {
    "classic": ["✨", "🔗", "⭐", "🔹", "▫️"],
    "cotton-candy": ["🍬", "🍭", "🧁", "🍥", "🎀", "🍧", "🍡"],
    "ocean-breeze": ["🌊", "🐚", "🫧", "🐬", "🐳", "🐠", "🏖️"],
    "peachy-cream": ["🍑", "🌸", "🍦", "✨", "🏵️", "🍨", "🍮"],
    "lavender-soft": ["💜", "🔮", "🦄", "☂️", "🎆", "🍇", "👾"],
    "matcha-glaze": ["🍃", "🍵", "🌱", "🦋", "🍏", "🍈", "🌵"],
    "minty-fresh": ["🍃", "🍵", "🌱", "🦋", "🍏", "🍈", "🌵"],
    "pastel-sky": ["☁️", "🎈", "🕊️", "✈️", "🚁", "🪁", "🌈"],
    "lemon-sorbet": ["🍋", "🍦", "✨", "🍨", "🍋‍🟩"],
    "rose-garden": ["🌹", "🌺", "🏵️", "🌷", "🦋", "✨"],
    "solar-gold": ["☀️", "🔥", "✨", "🌕", "👑", "🏵️"],
    "cyberpunk": ["⚡", "👾", "🕶️", "🦾", "🧬", "🌃"],
    "midnight-neon": ["🟢", "✨", "🌃", "⚡", "🔋"],
    "nordic-forest": ["🌲", "🏔️", "🦌", "❄️", "🌬️", "🪵"],
    "velvet-night": ["🌙", "🌌", "💜", "✨", "🍷", "🎻"],
    "default": []
};

// Better helper for Apple Emojis
const getAppleEmojiUrl = (emoji) => {
    return `https://emojicdn.elk.sh/${emoji}?style=apple`;
};

export default function AmbientBackground({ themeName, fixed = false }) {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        const emojis = themeEffects[themeName] || [];
        if (emojis.length === 0) {
            setParticles([]);
            return;
        }

        const animationTypes = ['up', 'down', 'left', 'right', 'fade', 'fade', 'up'];

        const newParticles = Array.from({ length: 30 }).map((_, i) => {
            const type = animationTypes[Math.floor(Math.random() * animationTypes.length)];
            const duration = 15 + Math.random() * 20;
            const delay = -(Math.random() * duration); // Start mid-animation

            let style = {
                animationDuration: `${duration}s`,
                animationDelay: `${delay}s`,
                width: `${24 + Math.random() * 40}px`,
                height: `${24 + Math.random() * 40}px`,
            };

            // Core positioning - avoid fixed top:0 if it conflicts
            // For movement animations, transform handles the motion.
            // We just need a valid start position (like left/top % inside container)
            let className = "absolute select-none opacity-70 pointer-events-none ";

            if (type === 'up') {
                className += "animate-float-up";
                style.left = `${Math.random() * 100}%`;
                // No explicit top needed as transform handles -10vh to 110vh, 
                // but setting top:0 ensures it starts relative to container top
                style.top = "0";
            } else if (type === 'down') {
                className += "animate-float-down";
                style.left = `${Math.random() * 100}%`;
                style.top = "0";
            } else if (type === 'left') {
                className += "animate-float-left";
                style.left = "0";
                style.top = `${Math.random() * 100}%`;
            } else if (type === 'right') {
                className += "animate-float-right";
                style.left = "0";
                style.top = `${Math.random() * 100}%`;
            } else { // fade
                className += "animate-fade-float";
                style.left = `${Math.random() * 95}%`;
                style.top = `${Math.random() * 95}%`;
                style.animationDuration = `${5 + Math.random() * 8}s`;
                style.animationDelay = `${-(Math.random() * 5)}s`;
            }

            return {
                id: i,
                emoji: emojis[Math.floor(Math.random() * emojis.length)],
                style,
                className
            };
        });

        setParticles(newParticles);
    }, [themeName]);

    if (particles.length === 0) return null;

    return (
        <div className={`${fixed ? 'fixed' : 'absolute'} inset-0 pointer-events-none overflow-hidden z-[5]`}>
            {particles.map(p => (
                <div
                    key={p.id}
                    className={p.className}
                    style={p.style}
                >
                    <img
                        src={getAppleEmojiUrl(p.emoji)}
                        alt="ambient"
                        className="w-full h-full object-contain drop-shadow-sm will-change-transform"
                        loading="eager"
                    />
                </div>
            ))}
        </div>
    );
}
