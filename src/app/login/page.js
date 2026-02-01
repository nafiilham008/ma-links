"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const router = useRouter();


    // Google Auth Implementation
    useEffect(() => {
        /* global google */
        if (typeof window !== "undefined") {
            const script = document.createElement("script");
            script.src = "https://accounts.google.com/gsi/client";
            script.async = true;
            script.onload = () => {
                google.accounts.id.initialize({
                    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
                    callback: handleGoogleCallback
                });
                google.accounts.id.renderButton(
                    document.getElementById("googleSignInBtn"),
                    { theme: "filled_black", size: "large", width: "100%", text: "continue_with" }
                );
            };
            document.body.appendChild(script);
        }
    }, []);

    async function handleGoogleCallback(response) {
        try {
            const res = await fetch("/api/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ credential: response.credential }),
            });
            const data = await res.json();

            if (res.ok && data.success) {
                // Always redirect to dashboard, the dashboard page will handle role-based rendering
                router.push("/dashboard");
            } else {
                setError("Google Sign-In failed");
            }
        } catch (error) {
            console.error(error);
            setError("Google Sign-In Error");
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                // Always redirect to dashboard
                router.push("/dashboard");
            } else {
                setError(data.error || "Login failed");
            }
        } catch (error) {
            setError("An error occurred during login");
        }
    }

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 w-full max-w-md shadow-xl">
                <h1 className="text-2xl font-bold text-white mb-6 text-center tracking-tight">Welcome Back</h1>

                {error && <div className="bg-red-500/10 text-red-500 p-3 rounded-lg mb-4 text-sm font-bold">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Username</label>
                        <input
                            type="text"
                            required
                            value={formData.username}
                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </form>

                <div className="flex justify-end mt-2 mb-6">
                    <a href="/forgot-password" className="text-xs font-bold text-indigo-400 hover:text-indigo-300">Forgot Password?</a>
                </div>

                <button onClick={handleSubmit} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all mb-6">
                    Login
                </button>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-700"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-slate-800 px-2 text-slate-500">Or continue with</span>
                    </div>
                </div>

                <div id="googleSignInBtn" className="w-full flex justify-center mb-6"></div>

                <p className="text-center text-slate-400 text-sm">
                    Don't have an account? <a href="/register" className="text-indigo-400 hover:text-white">Register</a>
                </p>
            </div>
        </div>
    );
}
