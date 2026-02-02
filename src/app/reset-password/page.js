"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

function ResetForm() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [email, setEmail] = useState(searchParams.get("email") || "");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [status, setStatus] = useState("idle");
    const [message, setMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setStatus("loading");

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code, password }),
            });
            const data = await res.json();

            if (res.ok) {
                setStatus("success");
                setMessage("Password reset successfully! Redirecting...");
                setTimeout(() => router.push("/login"), 2000);
            } else {
                setStatus("error");
                setMessage(data.error || "Failed to reset password");
            }
        } catch (error) {
            setStatus("error");
            setMessage("Something went wrong");
        }
    }

    return (
        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 w-full max-w-md shadow-xl">
            <h1 className="text-2xl font-bold text-white mb-6 text-center">Reset Password</h1>

            {message && (
                <div className={`p-3 rounded-lg mb-4 text-sm font-bold ${status === "success" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Reset Code</label>
                    <input
                        type="text"
                        required
                        maxLength={6}
                        value={code}
                        onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white text-center text-xl tracking-widest font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="000000"
                    />
                </div>
                <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase mb-1">New Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 pr-12 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="••••••"
                            minLength={6}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                        >
                            {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
                >
                    {status === "loading" ? "Resetting..." : "Set New Password"}
                </button>
            </form>
        </div>
    );
}

export default function ResetPage() {
    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <Suspense fallback={<div className="text-white">Loading...</div>}>
                <ResetForm />
            </Suspense>
        </div>
    );
}
