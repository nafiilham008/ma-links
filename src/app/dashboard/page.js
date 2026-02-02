"use client";
import { useState, useEffect, useRef } from "react";
import { ArrowLeftOnRectangleIcon, UsersIcon, GlobeAltIcon, EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import UserDashboard from "@/components/UserDashboard";

export default function Dashboard() {
    const router = useRouter();

    // --- State ---
    const [profileData, setProfileData] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    // Admin specific state
    const [adminStats, setAdminStats] = useState(null);
    const [allUsers, setAllUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });
    const [editingUser, setEditingUser] = useState(null);
    const [confirmAction, setConfirmAction] = useState({ show: false, title: "", message: "", onConfirm: null, type: "danger" });
    const [usernameError, setUsernameError] = useState("");
    const [checkingUsername, setCheckingUsername] = useState(false);

    function showToast(message, type = "success") {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
    }

    useEffect(() => {
        fetchProfile();
    }, []);

    async function fetchProfile() {
        try {
            const res = await fetch("/api/auth/profile");
            if (res.ok) {
                const data = await res.json();
                setProfileData(data);

                if (!data.emailVerified) {
                    router.push(`/verify-email?email=${encodeURIComponent(data.email)}&warn=true`);
                    return;
                }

                // Check role
                if (data.role === 'super admin') {
                    setIsAdmin(true);
                    // Start loading admin data
                    fetchAdminStats();
                    fetchAllUsers(1, 10);
                } else {
                    setIsAdmin(false);
                    setLoading(false); // Stop loading for regular users
                }
            } else if (res.status === 401) {
                router.push("/login");
            }
        } catch (error) {
            console.error("Failed to fetch profile", error);
            setLoading(false);
        }
    }

    async function fetchAdminStats() {
        try {
            const res = await fetch('/api/admin/stats');
            if (res.ok) {
                const json = await res.json();
                setAdminStats(json);
            }
        } catch (e) {
            console.error(e);
            showToast("Failed to load admin stats", "error");
        } finally {
            setLoading(false); // Main API loaded
        }
    }

    async function fetchAllUsers(page = 1, limit = 10) {
        setLoadingUsers(true);
        try {
            const res = await fetch(`/api/admin/users?page=${page}&limit=${limit}`);
            if (res.ok) {
                const json = await res.json();
                setAllUsers(json.users);
                setPagination(json.pagination);
            }
        } catch (e) {
            showToast("Failed to load users", "error");
        } finally {
            setLoadingUsers(false);
        }
    }

    function handlePageChange(newPage) {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchAllUsers(newPage, pagination.limit);
        }
    }

    function handleLimitChange(e) {
        const newLimit = parseInt(e.target.value);
        fetchAllUsers(1, newLimit);
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
                        fetchAllUsers(pagination.page, pagination.limit);
                        fetchAdminStats();
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
                fetchAllUsers(pagination.page, pagination.limit);
            } else {
                const err = await res.json();
                showToast(err.error || "Failed to update user", "error");
            }
        } catch (err) {
            showToast("Connection error", "error");
        }
    }

    async function handleLogout() {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
    }

    const checkUsernameTimeoutRef = useRef(null);
    async function checkUsernameAvailability(username, userId) {
        if (!username || username.length < 3) return;
        setCheckingUsername(true);
        try {
            const res = await fetch(`/api/admin/check-username?username=${username}`);
            if (res.ok) {
                const data = await res.json();
                if (!data.available && data.ownerId !== userId) {
                    setUsernameError("Username is already taken");
                } else {
                    setUsernameError("");
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setCheckingUsername(false);
        }
    }

    function handleUsernameChange(val) {
        const cleanVal = val.toLowerCase().replace(/[^a-z0-9._-]/g, '');
        setEditingUser({ ...editingUser, username: cleanVal });
        setUsernameError("");

        if (checkUsernameTimeoutRef.current) clearTimeout(checkUsernameTimeoutRef.current);
        if (cleanVal === editingUser.username) return; // No change

        checkUsernameTimeoutRef.current = setTimeout(() => {
            checkUsernameAvailability(cleanVal, editingUser.id);
        }, 500);
    }

    if (loading) return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p>Loading Dashboard...</p>
            </div>
        </div>
    );

    // --- REGULAR USER DASHBOARD ---
    if (!isAdmin && profileData) {
        return <UserDashboard user={profileData} />;
    }

    // --- SAFETY CHECK ---
    if (!profileData) return null;

    // --- SUPER ADMIN DASHBOARD ---
    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1"><span className="text-red-500">Super Admin</span> Dashboard</h1>
                        <p className="text-slate-400">Monitoring Station</p>
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-2 border border-slate-700 hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-lg font-medium transition-colors">
                        <ArrowLeftOnRectangleIcon className="w-5 h-5" /> Logout
                    </button>
                </header>

                {!adminStats ? (
                    <div className="text-center text-slate-500 animate-pulse">Loading real-time stats...</div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl relative overflow-hidden group">
                                <div className="absolute right-0 top-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <UsersIcon className="w-24 h-24 text-indigo-500" />
                                </div>
                                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Total Users</h3>
                                <p className="text-5xl font-black text-white">{adminStats.stats.users}</p>
                            </div>
                            <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl relative overflow-hidden group">
                                <div className="absolute right-0 top-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <GlobeAltIcon className="w-24 h-24 text-emerald-500" />
                                </div>
                                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Total Links</h3>
                                <p className="text-5xl font-black text-white">{adminStats.stats.links}</p>
                            </div>
                            <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl relative overflow-hidden group">
                                <div className="absolute right-0 top-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <EyeIcon className="w-24 h-24 text-blue-500" />
                                </div>
                                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Total Views</h3>
                                <p className="text-5xl font-black text-white">{adminStats.stats.views}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Recent Users Table */}
                            <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
                                <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-white">Recently Joined</h2>
                                    <span className="text-xs font-mono bg-slate-900 px-2 py-1 rounded text-slate-500">Live</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs font-bold">
                                            <tr>
                                                <th className="px-6 py-4">User</th>
                                                <th className="px-6 py-4">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-700">
                                            {adminStats.recentUsers.map((user) => (
                                                <tr key={user.id} className="hover:bg-slate-700/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden font-bold border border-slate-600">
                                                                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.username[0].toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-white max-w-[100px] truncate">{user.name || "No Name"}</div>
                                                                <div className="text-xs text-slate-500">@{user.username}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {user.emailVerified ? (
                                                            <span className="text-emerald-400 text-xs font-bold">Verified</span>
                                                        ) : (
                                                            <span className="text-yellow-400 text-xs font-bold">Pending</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Top Users Table */}
                            <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
                                <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-white">Top Users (Views)</h2>
                                    <span className="text-xs font-mono bg-slate-900 px-2 py-1 rounded text-slate-500">Most Popular</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs font-bold">
                                            <tr>
                                                <th className="px-6 py-4">Rank</th>
                                                <th className="px-6 py-4">User</th>
                                                <th className="px-6 py-4 text-right">Total Views</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-700">
                                            {adminStats.topUsers && adminStats.topUsers.map((user, index) => (
                                                <tr key={user.id} className="hover:bg-slate-700/50 transition-colors">
                                                    <td className="px-6 py-4 font-black text-slate-500">#{index + 1}</td>
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
                                                    <td className="px-6 py-4 text-right font-mono font-bold text-indigo-400">
                                                        {user.views.toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* All Users Table with Pagination */}
                        <div className="mt-12 bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
                            <div className="p-6 border-b border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
                                <h2 className="text-xl font-bold text-white">All Users Database</h2>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-slate-400">Rows:</span>
                                    <select
                                        value={pagination.limit}
                                        onChange={handleLimitChange}
                                        className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2"
                                    >
                                        <option value="10">10</option>
                                        <option value="20">20</option>
                                        <option value="50">50</option>
                                        <option value="100">100</option>
                                    </select>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs font-bold">
                                        <tr>
                                            <th className="px-6 py-4">User</th>
                                            <th className="px-6 py-4">Email</th>
                                            <th className="px-6 py-4">Role</th>
                                            <th className="px-6 py-4">Links</th>
                                            <th className="px-6 py-4">Views</th>
                                            <th className="px-6 py-4">Joined</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700">
                                        {loadingUsers ? (
                                            <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">Loading users...</td></tr>
                                        ) : allUsers.length === 0 ? (
                                            <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">No users found.</td></tr>
                                        ) : (
                                            allUsers.map((user) => (
                                                <tr key={user.id} className="hover:bg-slate-700/50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden font-bold border border-slate-600">
                                                                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.username[0].toUpperCase()}
                                                            </div>
                                                            <div className="font-bold text-white">{user.username}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-300">{user.email}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`text-xs font-bold uppercase ${user.role === 'super admin' ? 'text-red-400' : 'text-slate-500'}`}>{user.role}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-300">{user._count?.links || 0}</td>
                                                    <td className="px-6 py-4 text-slate-300">{user.views}</td>
                                                    <td className="px-6 py-4 text-slate-400 font-mono text-xs">{new Date(user.createdAt).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2 transition-all">
                                                            <button onClick={() => setEditingUser(user)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-600 rounded-lg transition-all">
                                                                <PencilIcon className="w-4 h-4 cursor-pointer" />
                                                            </button>
                                                            <button onClick={() => handleDeleteUser(user)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                                                                <TrashIcon className="w-4 h-4 cursor-pointer" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 border-t border-slate-700 flex justify-between items-center bg-slate-900/30">
                                <span className="text-sm text-slate-500">
                                    Page {pagination.page} of {pagination.totalPages} ({pagination.total} users)
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={pagination.page === 1}
                                        className="px-3 py-1 bg-slate-800 border border-slate-600 rounded text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Prev
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        disabled={pagination.page >= pagination.totalPages}
                                        className="px-3 py-1 bg-slate-800 border border-slate-600 rounded text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Toast Notification */}
                        {toast.show && (
                            <div className={`fixed bottom-4 right-4 px-6 py-4 rounded-xl shadow-2xl text-white font-bold animate-slide-up z-[80] ${toast.type === "error" ? "bg-red-500" : "bg-emerald-500"}`}>
                                {toast.message}
                            </div>
                        )}

                        {/* Edit User Modal */}
                        {editingUser && (
                            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
                                <div className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-bold text-white">Edit User</h2>
                                        <button onClick={() => setEditingUser(null)} className="text-slate-500 hover:text-white">✕</button>
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
                                            <div className="relative">
                                                <input
                                                    required
                                                    value={editingUser.username || ""}
                                                    onChange={e => handleUsernameChange(e.target.value)}
                                                    className={`w-full bg-slate-900 border ${usernameError ? 'border-red-500' : 'border-slate-600'} rounded-lg p-3 text-white focus:border-indigo-500 outline-none font-mono`}
                                                />
                                                {checkingUsername && (
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                        <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                                    </div>
                                                )}
                                            </div>
                                            {usernameError && <p className="text-red-500 text-[10px] mt-1 font-bold italic">{usernameError}</p>}
                                        </div>
                                        <div className="flex gap-3 pt-4">
                                            <button type="button" onClick={() => { setEditingUser(null); setUsernameError(""); }} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-bold transition-all">Cancel</button>
                                            <button
                                                type="submit"
                                                disabled={!!usernameError || checkingUsername}
                                                className={`flex-1 py-3 rounded-xl font-bold transition-all ${!!usernameError || checkingUsername ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
                                            >
                                                {checkingUsername ? "Checking..." : "Save Changes"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Custom Confirmation Modal */}
                        {confirmAction.show && (
                            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
                                <div className="bg-slate-800 rounded-2xl w-full max-w-sm border border-slate-700 shadow-2xl p-6 text-center">
                                    <h3 className="text-xl font-bold text-white mb-2">{confirmAction.title}</h3>
                                    <p className="text-slate-400 text-sm mb-8">{confirmAction.message}</p>
                                    <div className="flex gap-3">
                                        <button onClick={() => setConfirmAction({ ...confirmAction, show: false })} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-lg font-bold transition-all">Cancel</button>
                                        <button onClick={confirmAction.onConfirm} className={`flex-1 py-2.5 rounded-lg font-bold transition-all shadow-lg ${confirmAction.type === 'danger' ? 'bg-red-600 hover:bg-red-500 shadow-red-500/20' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'}`}>Confirm</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
