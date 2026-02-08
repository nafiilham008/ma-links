"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FloatingIcons from "@/components/FloatingIcons";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function Register() {
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const router = useRouter();

    // Proactive check: Redirect to dashboard if session exists
    useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await fetch("/api/auth/profile");
                if (res.ok) {
                    router.replace("/dashboard");
                }
            } catch (err) {
                // Not logged in or error, stay on page
            }
        };
        checkSession();
    }, [router]);

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
                    document.getElementById("googleSignUpBtn"),
                    { theme: "filled_black", size: "large", width: "100%", text: "signup_with" }
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
            if (res.ok) {
                router.replace("/dashboard");
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

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    username: formData.username,
                    email: formData.email,
                    password: formData.password
                }),
            });

            const data = await res.json();

            if (res.ok) {
                // Redirect to verification page with email in query param for easier UX
                router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError("Registration failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="relative min-h-screen bg-slate-900 flex items-center justify-center p-4 overflow-hidden">
            <FloatingIcons />
            <div className="relative z-10 bg-slate-800 p-8 rounded-2xl border border-slate-700 w-full max-w-md shadow-xl">
                <h1 className="text-2xl font-bold text-white mb-6 text-center">Create Account</h1>

                {error && <div className="bg-red-500/10 text-red-500 p-3 rounded-lg mb-4 text-sm font-bold">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Full Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="e.g. Wulan Ayu"
                        />
                    </div>
                    <div>
                        <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Username</label>
                        <input
                            type="text"
                            required
                            value={formData.username}
                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="username"
                        />
                    </div>
                    <div>
                        <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 pr-10 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                >
                                    {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Confirm</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    value={formData.confirmPassword}
                                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 pr-10 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                >
                                    {showConfirmPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full mt-8 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50">
                        {loading ? "Creating..." : "Register"}
                    </button>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-700"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-slate-800 px-2 text-slate-500">Or continue with</span>
                    </div>
                </div>

                <div id="googleSignUpBtn" className="w-full flex justify-center mb-6"></div>

                <p className="text-center text-slate-400 text-sm">
                    Already have an account? <a href="/login" className="text-indigo-400 hover:text-white">Login</a>
                </p>
            </div>
        </div>
    );
}
