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

// Helper to convert emoji char to hex codepoint sequence for CDN
const getEmojiUrl = (emoji) => {
    const codePoints = Array.from(emoji)
        .map(c => c.codePointAt(0).toString(16))
        .join('-');
    return `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/${codePoints}.png`;
};

// Better helper for Apple Emojis
const getAppleEmojiUrl = (emoji) => {
    return `https://emojicdn.elk.sh/${emoji}?style=apple`;
};

export default function AmbientBackground({ themeName }) {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        const emojis = themeEffects[themeName] || [];
        if (emojis.length === 0) {
            setParticles([]);
            return;
        }

        const newParticles = Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            emoji: emojis[Math.floor(Math.random() * emojis.length)],
            left: `${Math.random() * 100}%`,
            animationDuration: `${15 + Math.random() * 20}s`,
            animationDelay: `${Math.random() * 10}s`,
            size: 24 + Math.random() * 40,
        }));

        setParticles(newParticles);
    }, [themeName]);

    if (particles.length === 0) return null;

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-[5]">
            {particles.map(p => (
                <div
                    key={p.id}
                    className="absolute animate-float opacity-80 select-none"
                    style={{
                        left: p.left,
                        bottom: "-10%",
                        animationDuration: p.animationDuration,
                        animationDelay: p.animationDelay,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                    }}
                >
                    <img
                        src={getAppleEmojiUrl(p.emoji)}
                        alt="ambient"
                        className="w-full h-full object-contain drop-shadow-sm"
                        loading="lazy"
                    />
                </div>
            ))}
        </div>
    );
}
