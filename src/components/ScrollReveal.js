"use client";
import { useEffect, useRef } from "react";

export default function ScrollReveal({ children, className = "" }) {
    const revealRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("active");
                    }
                });
            },
            { threshold: 0.1 }
        );

        if (revealRef.current) {
            observer.observe(revealRef.current);
        }

        return () => {
            if (revealRef.current) {
                observer.unobserve(revealRef.current);
            }
        };
    }, []);

    return (
        <div ref={revealRef} className={`reveal-up ${className}`}>
            {children}
        </div>
    );
}
