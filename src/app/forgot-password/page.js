"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState("idle");
    const router = useRouter();

    async function handleSubmit(e) {
        e.preventDefault();
        setStatus("loading");

        try {
            await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            // Always redirect to make it secure (don't reveal if email exists)
            router.push(`/reset-password?email=${encodeURIComponent(email)}`);
        } catch (error) {
            setStatus("error");
        }
    }

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 w-full max-w-md shadow-xl">
                <h1 className="text-2xl font-bold text-white mb-2 text-center">Forgot Password?</h1>
                <p className="text-slate-400 text-sm text-center mb-6">Enter your email to receive a reset code.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="you@example.com"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={status === "loading"}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
                    >
                        {status === "loading" ? "Sending Code..." : "Send Reset Code"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <a href="/login" className="text-slate-400 hover:text-white text-sm">Back to Login</a>
                </div>
            </div>
        </div>
    );
}
