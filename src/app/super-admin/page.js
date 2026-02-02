"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UsersIcon, GlobeAltIcon, EyeIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function SuperAdminPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });
    const [editingUser, setEditingUser] = useState(null);
    const [confirmAction, setConfirmAction] = useState({ show: false, title: "", message: "", onConfirm: null, type: "danger" });
    const router = useRouter();

    useEffect(() => {
        fetchStats();
    }, []);

    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
    };

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

    async function handleDeleteUser(user) {
        setConfirmAction({
            show: true,
            title: "Delete User",
            message: `Are you sure you want to delete user "@${user.username}"? This action is permanent and will remove all their links.`,
            type: "danger",
            onConfirm: async () => {
                try {
                    const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
                    if (res.ok) {
                        showToast("User deleted successfully");
                        fetchStats();
                    } else {
                        const err = await res.json();
                        showToast(err.error || "Failed to delete user", "error");
                    }
                } catch (err) {
                    showToast("Connection error", "error");
                } finally {
                    setConfirmAction(prev => ({ ...prev, show: false }));
                }
            }
        });
    }

    async function handleUpdateUser(e) {
        e.preventDefault();
        try {
            const res = await fetch(`/api/admin/users/${editingUser.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editingUser.name, username: editingUser.username })
            });
            if (res.ok) {
                showToast("User updated successfully");
                setEditingUser(null);
                fetchStats();
            } else {
                const err = await res.json();
                showToast(err.error || "Failed to update user", "error");
            }
        } catch (err) {
            showToast("Connection error", "error");
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
                    <button onClick={() => router.push('/dashboard')} className="text-slate-400 hover:text-white text-sm font-bold flex items-center gap-2">
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
                <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">Recently Joined Users</h2>
                        <span className="text-xs font-mono bg-slate-900 px-2 py-1 rounded text-slate-500">Live Management</span>
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
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {data.recentUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-700/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden font-bold border border-slate-600 shadow-inner">
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
                                            <span className={`text-xs font-bold uppercase p-1 rounded ${user.role === 'ADMIN' || user.role === 'super admin' ? 'text-red-400 bg-red-400/10' : 'text-slate-500'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => setEditingUser(user)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-600 rounded-lg transition-all">
                                                    <PencilIcon className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDeleteUser(user)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Edit User Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
                    <div className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Edit User</h2>
                            <button onClick={() => setEditingUser(null)} className="text-slate-500 hover:text-white"><XMarkIcon className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={handleUpdateUser} className="space-y-4">
                            <div>
                                <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Display Name</label>
                                <input
                                    required
                                    value={editingUser.name || ""}
                                    onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Username</label>
                                <input
                                    required
                                    value={editingUser.username || ""}
                                    onChange={e => setEditingUser({ ...editingUser, username: e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, '') })}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-indigo-500 outline-none font-mono"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-bold transition-all">Cancel</button>
                                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold transition-all">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Custom Confirmation Modal */}
            {confirmAction.show && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
                    <div className="bg-slate-800 rounded-2xl w-full max-w-sm border border-slate-700 shadow-2xl p-6 text-center">
                        <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 ${confirmAction.type === 'danger' ? 'bg-red-500/20 text-red-500' : 'bg-indigo-500/20 text-indigo-500'}`}>
                            {confirmAction.type === 'danger' ? <TrashIcon className="w-8 h-8" /> : <UsersIcon className="w-8 h-8" />}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{confirmAction.title}</h3>
                        <p className="text-slate-400 text-sm mb-8">{confirmAction.message}</p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmAction({ ...confirmAction, show: false })} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-lg font-bold transition-all">Cancel</button>
                            <button onClick={confirmAction.onConfirm} className={`flex-1 py-2.5 rounded-lg font-bold transition-all shadow-lg ${confirmAction.type === 'danger' ? 'bg-red-600 hover:bg-red-500 shadow-red-500/20' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'}`}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast.show && (
                <div className={`fixed bottom-4 right-4 px-6 py-4 rounded-xl shadow-2xl text-white font-bold animate-slide-up z-[80] ${toast.type === "error" ? "bg-red-500" : "bg-emerald-500"}`}>
                    {toast.message}
                </div>
            )}
        </div>
    );
}
