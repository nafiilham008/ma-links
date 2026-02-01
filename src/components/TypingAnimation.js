"use client";
import { useState, useEffect } from "react";

export default function TypingAnimation({ words = ["Link", "Website", "Portfolio", "Store", "Socials"] }) {
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [currentText, setCurrentText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [speed, setSpeed] = useState(150);

    useEffect(() => {
        const handleTyping = () => {
            const fullWord = words[currentWordIndex];

            if (isDeleting) {
                // Deleting text
                setCurrentText(fullWord.substring(0, currentText.length - 1));
                setSpeed(50); // Faster deletion
            } else {
                // Typing text
                setCurrentText(fullWord.substring(0, currentText.length + 1));
                setSpeed(150); // Normal typing speed
            }

            // Word completed typing
            if (!isDeleting && currentText === fullWord) {
                setTimeout(() => setIsDeleting(true), 2000); // Wait before deleting
            }
            // Word completely deleted
            else if (isDeleting && currentText === "") {
                setIsDeleting(false);
                setCurrentWordIndex((prev) => (prev + 1) % words.length);
                setSpeed(500); // Short pause before typing next word
            }
        };

        const timer = setTimeout(handleTyping, speed);
        return () => clearTimeout(timer);
    }, [currentText, isDeleting, currentWordIndex, words, speed]);

    return (
        <span className="relative">
            <span className="text-white">{currentText}</span>
            <span className="ml-1 border-r-4 border-indigo-400 animate-pulse"></span>
        </span>
    );
}
