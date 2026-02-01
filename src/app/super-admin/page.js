"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UsersIcon, GlobeAltIcon, EyeIcon } from '@heroicons/react/24/outline';

export default function SuperAdminPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        fetchStats();
    }, []);

    async function fetchStats() {
        try {
            const res = await fetch('/api/admin/stats');
            if (res.status === 401) {
                router.push('/login');
                return;
            }
            if (res.status === 403) {
                setError("⛔ ACCESS DENIED: You are not a Super Admin.");
                setLoading(false);
                return;
            }
            if (!res.ok) throw new Error("Failed to fetch");

            const json = await res.json();
            setData(json);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError("Failed to load admin data");
            setLoading(false);
        }
    }

    if (loading) return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Loading Admin Dashboard...</div>;

    if (error) return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-bold text-red-500 mb-4">Access Restricted</h1>
            <p className="text-slate-400 mb-6 text-center max-w-md">{error}</p>
            <button onClick={() => router.push('/dashboard')} className="bg-slate-800 hover:bg-slate-700 px-6 py-2 rounded-lg font-bold">
                Back to User Dashboard
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1"><span className="text-red-500">Super Admin</span> Dashboard</h1>
                        <p className="text-slate-400">System-wide monitoring station.</p>
                    </div>
                    <button onClick={() => router.push('/dashboard')} className="text-slate-400 hover:text-white text-sm font-bold">
                        &larr; Back to App
                    </button>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <UsersIcon className="w-24 h-24 text-indigo-500" />
                        </div>
                        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Total Users</h3>
                        <p className="text-5xl font-black text-white">{data.stats.users}</p>
                    </div>
                    <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <GlobeAltIcon className="w-24 h-24 text-emerald-500" />
                        </div>
                        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Total Links</h3>
                        <p className="text-5xl font-black text-white">{data.stats.links}</p>
                    </div>
                    <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <EyeIcon className="w-24 h-24 text-blue-500" />
                        </div>
                        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Total Views</h3>
                        <p className="text-5xl font-black text-white">{data.stats.views}</p>
                    </div>
                </div>

                {/* Recent Users Table */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">Recently Joined Users</h2>
                        <span className="text-xs font-mono bg-slate-900 px-2 py-1 rounded text-slate-500">Live Data</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs font-bold">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Stats</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {data.recentUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden font-bold border border-slate-600">
                                                    {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.username[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white">{user.name || "No Name"}</div>
                                                    <div className="text-xs text-slate-500">@{user.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.emailVerified ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Verified
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-bold border border-yellow-500/20">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span> Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-3 text-xs">
                                                <span className="text-slate-300"><strong>{user._count.links}</strong> links</span>
                                                <span className="text-slate-300"><strong>{user.views}</strong> views</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-bold uppercase ${user.role === 'ADMIN' ? 'text-red-400' : 'text-slate-500'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
