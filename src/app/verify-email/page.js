"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyForm() {
    const searchParams = useSearchParams();
    const emailParam = searchParams.get("email");
    const warnParam = searchParams.get("warn");
    const router = useRouter();

    const [email, setEmail] = useState(emailParam || "");
    const [code, setCode] = useState("");
    const [status, setStatus] = useState("idle"); // idle, loading, success, error
    const [message, setMessage] = useState("");
    const [resendCooldown, setResendCooldown] = useState(0);

    // Auto-resend on warning redirect
    useEffect(() => {
        if (warnParam && email && resendCooldown === 0) {
            handleResend();
        }
    }, [warnParam, email]);

    async function handleSubmit(e) {
        e.preventDefault();
        setStatus("loading");
        setMessage("");

        try {
            const res = await fetch("/api/auth/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code }),
            });
            const data = await res.json();

            if (res.ok) {
                setStatus("success");
                setMessage("Verified! Redirecting...");
                setTimeout(() => router.push("/dashboard"), 2000);
            } else {
                setStatus("error");
                setMessage(data.error || "Invalid code");
            }
        } catch (error) {
            setStatus("error");
            setMessage("Something went wrong");
        }
    }

    async function handleResend() {
        if (resendCooldown > 0) return;

        try {
            await fetch("/api/auth/resend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            setMessage("New code sent! Please check your inbox.");
            setResendCooldown(60);
            const timer = setInterval(() => {
                setResendCooldown(prev => {
                    if (prev <= 1) clearInterval(timer);
                    return prev - 1;
                });
            }, 1000);
        } catch (error) {
            setMessage("Failed to resend");
        }
    }

    return (
        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 w-full max-w-md shadow-xl text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Verify Email</h1>
            {warnParam ? (
                <p className="text-yellow-400 text-sm mb-6 font-bold bg-yellow-400/10 p-2 rounded">
                    ⚠️ Please verify your email to access the dashboard.
                </p>
            ) : (
                <p className="text-slate-400 text-sm mb-6">Enter the 6-digit code sent to your email.</p>
            )}

            {message && (
                <div className={`p-3 rounded-lg mb-4 text-sm font-bold ${status === "success" ? "bg-green-500/10 text-green-400" : "bg-indigo-500/10 text-indigo-400"}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
                {!emailParam && (
                    <div>
                        <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                )}

                <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Verification Code</label>
                    <input
                        type="text"
                        required
                        maxLength={6}
                        value={code}
                        onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white text-center text-2xl tracking-[0.5em] font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="000000"
                    />
                </div>

                <button
                    type="submit"
                    disabled={status === "loading" || code.length !== 6}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
                >
                    {status === "loading" ? "Verifying..." : "Verify & Login"}
                </button>
            </form>

            <div className="mt-6 text-sm">
                <span className="text-slate-400">Didn't receive code? </span>
                <button
                    onClick={handleResend}
                    disabled={resendCooldown > 0}
                    className="text-indigo-400 hover:text-white font-bold disabled:opacity-50"
                >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend"}
                </button>
            </div>
        </div>
    );
}

import FloatingIcons from "@/components/FloatingIcons";

export default function VerifyPage() {
    return (
        <div className="relative min-h-screen bg-slate-900 flex items-center justify-center p-4 overflow-hidden">
            <FloatingIcons />
            <Suspense fallback={<div className="text-white relative z-10">Loading...</div>}>
                <div className="relative z-10 w-full max-w-md">
                    <VerifyForm />
                </div>
            </Suspense>
        </div>
    );
}
