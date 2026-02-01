"use client";
import { useState, useEffect } from "react";
import { PlusIcon, TrashIcon, PencilIcon, ArrowTopRightOnSquareIcon, ArrowLeftOnRectangleIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export default function Dashboard() {
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ clicks: 0, views: 0 });
    const [showModal, setShowModal] = useState(false);
    const [editingLink, setEditingLink] = useState(null);
    const [username, setUsername] = useState("");
    const router = useRouter();

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        url: "",
        platform: "",
        category: "",
        image: "",
    });

    const [profileData, setProfileData] = useState({
        bio: "",
        instagram: "",
        youtube: "",
        spotify: "",
        tiktok: "",
        email: "",
    });

    const [uploading, setUploading] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);

    // Notification State
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

    function showToast(message, type = "success") {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
    }

    useEffect(() => {
        fetchLinks();
        fetchProfile();
    }, []);

    async function fetchProfile() {
        try {
            const res = await fetch("/api/auth/profile");
            if (res.ok) {
                const data = await res.json();
                setProfileData(data);
            }
        } catch (error) {
            console.error("Failed to fetch profile", error);
        }
    }

    async function fetchLinks() {
        try {
            const res = await fetch("/api/links");
            if (res.status === 401) {
                router.push("/login");
                return;
            }
            const data = await res.json();
            setLinks(data);

            const totalClicks = data.reduce((acc, link) => acc + link.clicks, 0);
            setStats({ clicks: totalClicks, views: 0 });
            setLoading(false);

            // Attempt to set username from cookie or a dedicated /api/me endpoint
            // For now, we will just rely on the redirect if not logged in.
        } catch (error) {
            console.error("Failed to fetch", error);
        }
    }

    function handleEdit(link) {
        setEditingLink(link);
        setFormData({
            title: link.title,
            url: link.url,
            platform: link.platform || "",
            category: link.category || "",
            image: link.image || "",
        });
        setShowModal(true);
    }

    function handleAddNew() {
        setEditingLink(null);
        setFormData({
            title: "",
            url: "",
            platform: "",
            category: "",
            image: ""
        });
        setShowModal(true);
    }

    async function handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert("File too large (Max 2MB)");
            return;
        }

        setUploading(true);
        const data = new FormData();
        data.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: data,
            });
            const json = await res.json();
            if (json.url) {
                setFormData(prev => ({ ...prev, image: json.url }));
            }
        } catch (error) {
            console.error("Upload failed", error);
            showToast("Upload failed", "error");
        } finally {
            setUploading(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const method = editingLink ? "PUT" : "POST";
        const endpoint = editingLink ? `/api/links/${editingLink.id}` : "/api/links";

        // Auto-calculate order and standardize category capitalization
        const payload = {
            ...formData,
            category: formData.category?.trim()
                ? formData.category.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
                : null,
            order: editingLink ? editingLink.order : (links.length + 1)
        };

        try {
            const res = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                setShowModal(false);
                fetchLinks();
                showToast(editingLink ? "Link updated!" : "Link created!");
            } else {
                showToast("Failed to save", "error");
            }
        } catch (error) {
            console.error("Failed to save", error);
            showToast("Error saving link", "error");
        }
    }

    async function handleProfileSubmit(e) {
        e.preventDefault();
        setSavingProfile(true);
        try {
            const res = await fetch("/api/auth/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profileData),
            });
            if (res.ok) {
                showToast("Profile updated!");
            } else {
                showToast("Failed to update profile", "error");
            }
        } catch (error) {
            console.error("Failed to update profile", error);
            showToast("Error updating profile", "error");
        } finally {
            setSavingProfile(false);
        }
    }

    async function handleDelete(id) {
        if (!confirm("Are you sure?")) return;
        try {
            await fetch(`/api/links/${id}`, { method: "DELETE" });
            fetchLinks();
            if (editingLink?.id === id) setShowModal(false);
        } catch (error) {
            console.error("Failed to delete", error);
        }
    }

    async function handleLogout() {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
        } catch (error) {
            console.error("Logout failed", error);
            // Fallback redirect
            router.push("/login");
        }
    }

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
                    <div className="flex gap-4">
                        {/* Note: We don't have the username easily here without an extra API call, so link to generic homepage or handle dynamic later */}
                        <button onClick={handleLogout} className="flex items-center gap-2 border border-slate-700 hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-lg font-medium transition-colors">
                            <ArrowLeftOnRectangleIcon className="w-5 h-5" /> Logout
                        </button>
                    </div>
                </header>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl">
                        <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Total Clicks</h3>
                        <p className="text-4xl font-black text-white">{stats.clicks}</p>
                    </div>
                    <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl opacity-60">
                        <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Total Views</h3>
                        <p className="text-4xl font-black text-white">--</p>
                        <span className="text-xs text-slate-500">Coming soon</span>
                    </div>
                </div>

                {/* Content Layout */}
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* Sidebar / Profile Settings */}
                    <aside className="w-full lg:w-80 order-1 lg:order-1 space-y-6">
                        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl">
                            <h2 className="text-xl font-bold text-white mb-6">Profile Settings</h2>
                            <form onSubmit={handleProfileSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Bio</label>
                                    <textarea
                                        value={profileData.bio || ""}
                                        onChange={e => setProfileData({ ...profileData, bio: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-24 resize-none"
                                        placeholder="Tell people about yourself..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={profileData.email || ""}
                                        onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-3 pt-2">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Social Media Usernames</p>
                                    <div>
                                        <label className="text-[10px] text-slate-400 uppercase">Instagram</label>
                                        <input
                                            type="text"
                                            value={profileData.instagram || ""}
                                            onChange={e => setProfileData({ ...profileData, instagram: e.target.value })}
                                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-400 uppercase">YouTube</label>
                                        <input
                                            type="text"
                                            value={profileData.youtube || ""}
                                            onChange={e => setProfileData({ ...profileData, youtube: e.target.value })}
                                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-400 uppercase">TikTok</label>
                                        <input
                                            type="text"
                                            value={profileData.tiktok || ""}
                                            onChange={e => setProfileData({ ...profileData, tiktok: e.target.value })}
                                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={savingProfile}
                                    className="w-full mt-4 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-lg text-sm transition-all shadow-lg disabled:opacity-50"
                                >
                                    {savingProfile ? "Saving..." : "Save Profile"}
                                </button>
                            </form>
                        </div>
                    </aside>

                    {/* Main List */}
                    <div className="flex-1 w-full order-2 lg:order-2">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white">Your Links</h2>
                            <button onClick={handleAddNew} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors">
                                <PlusIcon className="w-4 h-4" /> Add New
                            </button>
                        </div>

                        <div className="space-y-4">
                            {links.map((link) => (
                                <div key={link.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center gap-4 group hover:border-slate-500 transition-colors">
                                    <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center font-bold text-slate-400 border border-slate-700">
                                        {link.order}
                                    </div>
                                    <div className="flex-shrink-0 w-12 h-12 bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
                                        {link.image ? (
                                            <img src={link.image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="flex items-center justify-center h-full text-slate-600 text-xs">No Img</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-white font-bold truncate">{link.title}</h3>
                                        <p className="text-slate-500 text-sm truncate font-mono">{link.url}</p>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                                            <span>{link.clicks} clicks</span>
                                            {link.platform && <span className="bg-slate-900 px-1.5 py-0.5 rounded uppercase text-[10px]">{link.platform}</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleEdit(link)} className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors">
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDelete(link.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {links.length === 0 && !loading && (
                                <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl text-slate-600">
                                    No links yet. Click "Add New" to start.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Modal Overlay */}
                    {showModal && (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                            onClick={(e) => {
                                if (e.target === e.currentTarget) setShowModal(false);
                            }}
                        >
                            <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
                                <button type="button" onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white">✕</button>

                                <h2 className="text-xl font-bold text-white mb-6">
                                    {editingLink ? "Edit Link" : "Create New Link"}
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Title</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            placeholder="e.g. My Portfolio"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">URL</label>
                                        <input
                                            type="url"
                                            required
                                            value={formData.url}
                                            onChange={e => setFormData({ ...formData, url: e.target.value })}
                                            className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            placeholder="https://..."
                                        />
                                    </div>

                                    {/* Image Upload */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Thumbnail Image (Max 2MB)</label>
                                        <div className="flex gap-4 items-center">
                                            {formData.image && (
                                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
                                                    <img src={formData.image} className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileUpload}
                                                    disabled={uploading}
                                                    className="w-full text-slate-400 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
                                                />
                                                {uploading && <p className="text-xs text-indigo-400 mt-1">Uploading...</p>}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Platform (Optional)</label>
                                        <input
                                            type="text"
                                            value={formData.platform}
                                            onChange={e => setFormData({ ...formData, platform: e.target.value })}
                                            className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            placeholder="e.g. Instagram"
                                        />
                                    </div>

                                    <div className="relative">
                                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Category (Search or Type New)</label>
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                value={formData.category}
                                                onFocus={() => setShowCategoryDropdown(true)}
                                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all pr-10"
                                                placeholder="e.g. Products / Social"
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                                                <ChevronDownIcon className="w-4 h-4" />
                                            </div>
                                        </div>

                                        {showCategoryDropdown && (
                                            <>
                                                <div className="fixed inset-0 z-[60]" onClick={() => setShowCategoryDropdown(false)}></div>
                                                <div className="absolute z-[70] mt-1 w-full bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <div className="max-h-48 overflow-y-auto custom-scrollbar">
                                                        {Array.from(new Set(links.map(l => l.category).filter(Boolean)))
                                                            .filter(cat => cat.toLowerCase().includes(formData.category.toLowerCase()))
                                                            .map(cat => (
                                                                <button
                                                                    key={cat}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setFormData({ ...formData, category: cat });
                                                                        setShowCategoryDropdown(false);
                                                                    }}
                                                                    className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-indigo-600 hover:text-white transition-colors border-b border-slate-700/50 last:border-0"
                                                                >
                                                                    {cat}
                                                                </button>
                                                            ))}
                                                        {formData.category && !Array.from(new Set(links.map(l => l.category).filter(Boolean))).includes(formData.category) && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowCategoryDropdown(false)}
                                                                className="w-full text-left px-4 py-3 text-xs font-bold italic text-indigo-400 hover:bg-slate-700 transition-colors"
                                                            >
                                                                Create new category: "{formData.category}"
                                                            </button>
                                                        )}
                                                        {Array.from(new Set(links.map(l => l.category).filter(Boolean))).length === 0 && (
                                                            <div className="px-4 py-3 text-sm text-slate-500 italic text-center">
                                                                No existing categories. Type to create one.
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-8 pt-4 border-t border-slate-800 flex gap-4">
                                    <button type="submit" disabled={uploading} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/20 disabled:opacity-50">
                                        {uploading ? 'Uploading...' : 'Save Link'}
                                    </button>
                                    {editingLink && (
                                        <button type="button" onClick={() => handleDelete(editingLink.id)} className="px-4 text-red-500 font-bold hover:text-red-400 transition-colors">
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    )}

                </div>
            </div>

            {/* Custom Toast Notification */}
            {toast.show && (
                <div
                    className={`fixed bottom-8 right-8 z-[100] px-6 py-3 rounded-2xl shadow-2xl border backdrop-blur-md flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300 ${toast.type === "success"
                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                        : "bg-red-500/20 border-red-500/50 text-red-400"
                        }`}
                >
                    <div className={`w-2 h-2 rounded-full ${toast.type === "success" ? "bg-emerald-400" : "bg-red-400"}`}></div>
                    <span className="font-bold text-sm">{toast.message}</span>
                </div>
            )}
        </div>
    );
}
