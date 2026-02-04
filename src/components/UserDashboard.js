import { useState, useEffect, useRef } from "react";
import { PlusIcon, TrashIcon, PencilIcon, ArrowTopRightOnSquareIcon, ArrowLeftOnRectangleIcon, ChevronDownIcon, SwatchIcon, UsersIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { themePresets, buttonStyles } from "@/lib/themes";
import ProfileClient from "@/components/ProfileClient";
import ImageCropper from "@/components/ImageCropper";
import {
    IconSmartHome, IconCandy, IconMoodSmile, IconFlower,
    IconLeaf, IconHeart, IconRipple, IconSun,
    IconBolt, IconTrees, IconMoon, IconCloud,
    IconLemon2, IconCoffee
} from "@tabler/icons-react";

// Helper to map icon names to components
const ThemeIcons = {
    IconSmartHome, IconCandy, IconMoodSmile, IconFlower,
    IconLeaf, IconHeart, IconRipple, IconSun,
    IconBolt, IconTrees, IconMoon, IconCloud,
    IconLemon2, IconCoffee
};

export default function UserDashboard({ user }) {
    const router = useRouter();

    // --- State Initialization ---
    // Safe initialization using props or defaults
    const [profileData, setProfileData] = useState(user || {
        bio: "", instagram: "", facebook: "", youtube: "", spotify: "", tiktok: "", email: "", publicEmail: "",
        themePreset: "classic", buttonStyle: "rounded", role: "USER",
        name: "", username: "", views: 0, links: []
    });

    // Initialize links from user prop immediately to render faster
    const [links, setLinks] = useState(user?.links || []);
    const [stats, setStats] = useState({
        clicks: (user?.links || []).reduce((acc, l) => acc + (l.clicks || 0), 0),
        views: user?.views || 0
    });

    const [loading, setLoading] = useState(!user);
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });

    // UI State
    const [activeTab, setActiveTab] = useState("links");
    const [showModal, setShowModal] = useState(false);
    const [editingLink, setEditingLink] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadingProfile, setUploadingProfile] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [formData, setFormData] = useState({ title: "", url: "", platform: "", category: "", image: "" });
    const [passwordData, setPasswordData] = useState({ current: "", new: "", confirmNew: "" });
    const [changingPassword, setChangingPassword] = useState(false);
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
    const [usernameError, setUsernameError] = useState("");
    const [pendingUsername, setPendingUsername] = useState(user?.username || "");
    const [checkingUsername, setCheckingUsername] = useState(false);
    const [claimingUsername, setClaimingUsername] = useState(false);

    // Cropper State
    const [showCropper, setShowCropper] = useState(false);
    const [tempImageSrc, setTempImageSrc] = useState(null);
    const [cropAspect, setCropAspect] = useState(1);
    const [croppingTarget, setCroppingTarget] = useState(null); // 'avatar', 'customBackground', 'link'

    const [confirmAction, setConfirmAction] = useState({ show: false, title: "", message: "", onConfirm: null, type: "danger" });

    const saveTimeoutRef = useRef(null);

    function updateProfile(updates) {
        // Skip auto-save if trying to change username for google users
        if (updates.username && profileData.provider === 'google' && !profileData.usernameChanged) {
            return;
        }

        // 1. Optimistic Update
        const newData = { ...profileData, ...updates };
        setProfileData(newData);

        // 2. Clear pending save
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        setSavingProfile(true);

        // 3. Debounce API Call (1s buffer)
        saveTimeoutRef.current = setTimeout(async () => {
            try {
                const res = await fetch("/api/auth/profile", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newData)
                });

                if (res.ok) {
                    router.refresh(); // Sync server data
                    // We rely on "Saving..." turning off for feedback
                } else {
                    showToast("Failed to auto-save", "error");
                }
            } catch (error) {
                console.error(error);
                showToast("Connection error", "error");
            } finally {
                setSavingProfile(false);
            }
        }, 1000);
    }

    function showToast(message, type = "success") {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
    }

    // --- On Mount / Update ---
    useEffect(() => {
        if (!user) {
            fetchProfile();
        } else {
            // Sync state with new user prop if it changes
            setStats(prev => ({ ...prev, views: user.views || 0 }));
            // We fetch links fresh anyway to ensure click counts are up to date
            fetchLinks();
        }
    }, [user]);

    async function fetchProfile() {
        try {
            const res = await fetch("/api/auth/profile");
            if (res.ok) {
                const data = await res.json();
                setProfileData(data);
                setStats(prev => ({ ...prev, views: data.views || 0 }));
                if (data.links) {
                    setLinks(data.links);
                    const totalClicks = data.links.reduce((acc, link) => acc + (link.clicks || 0), 0);
                    setStats(prev => ({ ...prev, clicks: totalClicks }));
                }
            } else if (res.status === 401) {
                router.push("/login");
            }
        } catch (error) {
            console.error("Failed to fetch profile", error);
        } finally {
            setLoading(false);
        }
    }

    async function fetchLinks() {
        try {
            const res = await fetch("/api/links");
            const data = await res.json();
            if (Array.isArray(data)) {
                setLinks(data);
                const totalClicks = data.reduce((acc, link) => acc + (link.clicks || 0), 0);
                setStats(prev => ({ ...prev, clicks: totalClicks }));
            }
        } catch (error) {
            console.error("Failed to fetch links", error);
        }
    }

    async function handleLogout() {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
    }

    // --- Handlers (User) ---
    async function handleProfileUpload(e, field) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            setTempImageSrc(reader.result);
            setCroppingTarget(field === 'avatar' ? 'avatar' : 'customBackground');
            setCropAspect(field === 'avatar' ? 1 : 9 / 16);
            setShowCropper(true);
        };
        e.target.value = null;
    }

    async function handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            setTempImageSrc(reader.result);
            setCroppingTarget('link');
            setCropAspect(1);
            setShowCropper(true);
        };
        e.target.value = null;
    }

    async function handleCropSave(croppedBlob) {
        setUploadingProfile(true);
        setShowCropper(false);
        const formData = new FormData();
        formData.append("file", croppedBlob, "image.jpg");

        try {
            const res = await fetch("/api/upload", { method: "POST", body: formData });
            if (!res.ok) throw new Error("Upload failed");
            const data = await res.json();

            if (croppingTarget === 'link') {
                setFormData(prev => ({ ...prev, image: data.url }));
                showToast("Link image updated!");
            } else {
                updateProfile({ [croppingTarget]: data.url });
                showToast(`${croppingTarget === 'avatar' ? 'Profile' : 'Background'} updated!`);
            }
        } catch (error) {
            showToast("Upload failed", "error");
            console.error(error);
        } finally {
            setUploadingProfile(false);
            setTempImageSrc(null);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const method = editingLink ? "PUT" : "POST";
        const endpoint = editingLink ? `/api/links/${editingLink.id}` : "/api/links";

        let category = formData.category?.trim() || "";
        if (category) {
            category = category.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        } else {
            category = null;
        }

        const payload = {
            ...formData,
            category,
            order: editingLink ? editingLink.order : (links.length + 1)
        };

        try {
            const res = await fetch(endpoint, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            if (res.ok) {
                setShowModal(false);
                fetchLinks(); // Refresh list
                showToast(editingLink ? "Link updated!" : "Link created!");
            } else {
                showToast("Failed to save", "error");
            }
        } catch (error) { showToast("Error saving link", "error"); }
    }

    async function handleDelete(id) {
        if (!confirm("Are you sure?")) return;
        try { await fetch(`/api/links/${id}`, { method: "DELETE" }); fetchLinks(); if (editingLink?.id === id) setShowModal(false); } catch (e) { console.error(e); }
    }

    // --- Handlers (Common) ---
    function handleAddNew() { setEditingLink(null); setFormData({ title: "", url: "", platform: "", category: "", image: "" }); setShowModal(true); }
    function handleEdit(link) { setEditingLink(link); setFormData({ title: link.title, url: link.url, platform: link.platform || "", category: link.category || "", image: link.image || "" }); setShowModal(true); }

    async function handlePasswordChange(e) {
        e.preventDefault();
        if (passwordData.new.length < 6) { showToast("Password must be at least 6 chars", "error"); return; }
        if (passwordData.new !== passwordData.confirmNew) { showToast("Passwords do not match", "error"); return; }
        setChangingPassword(true);
        try {
            const res = await fetch("/api/auth/password", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: passwordData.current, newPassword: passwordData.new }) });
            const data = await res.json();
            if (res.ok) { showToast("Password changed!"); setPasswordData({ current: "", new: "", confirmNew: "" }); } else { showToast(data.error || "Failed", "error"); }
        } catch (error) { showToast("Error", "error"); } finally { setChangingPassword(false); }
    }

    async function handleClaimUsername() {
        if (!pendingUsername) return;
        if (pendingUsername === profileData.username) {
            showToast("Username must be different", "error");
            return;
        }

        setConfirmAction({
            show: true,
            title: "Claim Username",
            message: `Are you sure you want to claim "@${pendingUsername}"? This is a one-time change and cannot be reversed.`,
            type: "info",
            onConfirm: async () => {
                setClaimingUsername(true);
                setUsernameError("");
                try {
                    const res = await fetch("/api/auth/profile", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ ...profileData, username: pendingUsername })
                    });
                    const data = await res.json();
                    if (res.ok) {
                        setProfileData(prev => ({ ...prev, username: pendingUsername, usernameChanged: true }));
                        showToast("Username successfully claimed! 🚀");
                        router.refresh();
                    } else {
                        setUsernameError(data.error || "Failed to claim username");
                        showToast(data.error || "Failed to claim username", "error");
                    }
                } catch (error) {
                    console.error(error);
                    showToast("Connection error", "error");
                } finally {
                    setClaimingUsername(false);
                    setConfirmAction(prev => ({ ...prev, show: false }));
                }
            }
        });
    }

    if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading Dashboard...</div>;

    const userForPreview = { ...profileData, links: links };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500/30">
            {/* Navbar */}
            <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/">
                            <h1 className="text-2xl font-bold tracking-tight text-white cursor-pointer hover:opacity-80 transition-opacity">
                                <span className="text-indigo-500">ma-</span>links
                            </h1>
                        </Link>
                        <div className="hidden md:flex gap-1">
                            {["links", "appearance", "settings"].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all capitalize ${activeTab === tab ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <a href={`/${profileData.username}?view=public`} target="_blank" className="text-sm font-medium text-slate-400 hover:text-white flex items-center gap-2">
                            <ArrowTopRightOnSquareIcon className="w-4 h-4" /> <span className="hidden sm:inline">View Live</span>
                        </a>
                        <button onClick={handleLogout} className="text-sm font-medium text-red-400 hover:text-red-300 flex items-center gap-2 border border-slate-800 hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors">
                            <ArrowLeftOnRectangleIcon className="w-4 h-4" /> Logout
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-4 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN: EDITOR */}
                    <div className="lg:col-span-7 space-y-6 relative z-10">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold text-white capitalize">{activeTab === 'links' ? 'My Links' : activeTab}</h2>
                                {activeTab !== 'links' && (
                                    <div className="flex items-center gap-2 px-2 py-1 bg-slate-800/50 rounded-md border border-slate-700/50">
                                        <div className={`w-2 h-2 rounded-full ${savingProfile ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            {savingProfile ? 'Saving...' : 'Saved'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tab Headers (Mobile) */}

                        {/* Tab Headers (Mobile) */}
                        <div className="flex items-center space-x-2 bg-slate-800/50 p-1 rounded-xl mb-4 lg:hidden">
                            {["links", "appearance", "settings"].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-2 text-sm font-bold capitalize rounded-lg transition-all ${activeTab === tab ? "bg-slate-700 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* --- TAB: LINKS --- */}
                        {activeTab === "links" && (
                            <div className="space-y-6">
                                {/* Stats Cards */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 relative overflow-hidden">
                                        <div className="absolute right-0 top-0 p-4 opacity-10"><UsersIcon className="w-16 h-16" /></div>
                                        <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Clicks</div>
                                        <div className="text-3xl font-black text-white">{stats?.clicks ?? 0}</div>
                                    </div>
                                    <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 relative overflow-hidden">
                                        <div className="absolute right-0 top-0 p-4 opacity-10"><EyeIcon className="w-16 h-16" /></div>
                                        <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Profile Views</div>
                                        <div className="text-3xl font-black text-white">{stats?.views ?? 0}</div>
                                    </div>
                                </div>

                                {/* Add Button */}
                                <button
                                    onClick={handleAddNew}
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-indigo-500/20 group"
                                >
                                    <PlusIcon className="w-6 h-6 group-hover:scale-110 transition-transform" /> Add New Link
                                </button>

                                {/* Links List */}
                                <div className="space-y-3">
                                    {!Array.isArray(links) || links.length === 0 ? (
                                        <div className="text-center py-12 bg-slate-800/50 rounded-2xl border border-slate-700/50 border-dashed">
                                            <p className="text-slate-400 font-medium">No links yet. Click the button above to start!</p>
                                        </div>
                                    ) : (
                                        links.map((link) => (
                                            <div key={link.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-slate-600 transition-all group">
                                                <div className="flex justify-between items-start gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-white text-lg truncate">{link.title}</h3>
                                                        <p className="text-slate-400 text-sm truncate mb-2">{link.url}</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            <span className="text-xs bg-slate-900 text-slate-500 px-2 py-1 rounded font-mono border border-slate-700">
                                                                {link.clicks} clicks
                                                            </span>
                                                            {link.category && (
                                                                <span className="text-xs bg-indigo-900/30 text-indigo-400 px-2 py-1 rounded font-bold border border-indigo-500/20">
                                                                    {link.category}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => handleEdit(link)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                                                            <PencilIcon className="w-5 h-5" />
                                                        </button>
                                                        <button onClick={() => handleDelete(link.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors">
                                                            <TrashIcon className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* --- TAB: APPEARANCE --- */}
                        {activeTab === "appearance" && (
                            <div className="space-y-8">
                                {/* Username Section (Only for Google users who haven't changed yet) */}
                                {profileData.provider === 'google' && !profileData.usernameChanged && (
                                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 mb-2">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                                <UsersIcon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-white font-bold text-sm">Claim Your Unique Username!</h3>
                                                <p className="text-indigo-300/60 text-[10px]">Google login grants you a one-time username change.</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="relative">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-[10px] sm:text-xs leading-none flex items-center">
                                                    malinks.web.id/
                                                </div>
                                                <input
                                                    type="text"
                                                    value={pendingUsername}
                                                    onChange={(e) => {
                                                        const val = e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, '');
                                                        setPendingUsername(val);
                                                        setUsernameError("");
                                                    }}
                                                    placeholder="your-chosen-username"
                                                    className={`w-full bg-slate-900 border ${usernameError ? 'border-red-500' : 'border-slate-700'} rounded-xl py-3 pl-[125px] pr-4 text-white focus:outline-none focus:border-indigo-500 font-mono text-sm transition-all`}
                                                />
                                            </div>
                                            {usernameError && <p className="text-red-500 text-[10px] ml-1 font-bold italic">{usernameError}</p>}

                                            <button
                                                onClick={handleClaimUsername}
                                                disabled={claimingUsername || !pendingUsername || pendingUsername === profileData.username}
                                                className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${claimingUsername || !pendingUsername || pendingUsername === profileData.username
                                                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 active:scale-[0.98]'
                                                    }`}
                                            >
                                                {claimingUsername ? (
                                                    <div className="w-4 h-4 border-2 border-indigo-200 border-t-transparent rounded-full animate-spin"></div>
                                                ) : <IconBolt className="w-4 h-4" />}
                                                {claimingUsername ? "Claiming..." : "Claim Username"}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {profileData.provider === 'google' && profileData.usernameChanged && (
                                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 mb-2 flex items-center gap-3 opacity-60 italic">
                                        <UsersIcon className="w-5 h-5 text-slate-500" />
                                        <span className="text-slate-400 text-[10px]">Your username: <strong>@{profileData.username}</strong> (Username changed once)</span>
                                    </div>
                                )}

                                {/* Profile Section */}
                                <section className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                                    <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                        <div className="w-1 h-6 bg-indigo-500 rounded-full"></div> Profile
                                    </h2>
                                    <div className="flex flex-col md:flex-row items-center gap-8">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-32 h-32 rounded-full bg-slate-900 border-4 border-slate-700 overflow-hidden relative group">
                                                {profileData.avatar ? (
                                                    <img src={profileData.avatar} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-4xl">👤</div>
                                                )}
                                                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                                                    <span className="text-xs font-bold text-white uppercase tracking-wider">Change</span>
                                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleProfileUpload(e, 'avatar')} />
                                                </label>
                                                {uploadingProfile && <div className="absolute inset-0 bg-black/80 flex items-center justify-center"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>}
                                            </div>
                                            <button
                                                onClick={() => document.querySelector('input[type="file"]').click()}
                                                className="text-xs font-bold text-indigo-400 hover:text-indigo-300"
                                            >
                                                Upload Image (Max 2MB)
                                            </button>
                                        </div>
                                        <div className="flex-1 w-full space-y-4">
                                            <div>
                                                <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Display Name</label>
                                                <input
                                                    value={profileData.name || ""}
                                                    onChange={e => updateProfile({ name: e.target.value })}
                                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500"
                                                    placeholder="e.g. Wulan Store"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Bio</label>
                                                <div className="relative">
                                                    <textarea
                                                        value={profileData.bio || ""}
                                                        onChange={e => updateProfile({ bio: e.target.value })}
                                                        maxLength={150}
                                                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white h-24 focus:outline-none focus:border-indigo-500 resize-none"
                                                        placeholder="Tell your audience who you are..."
                                                    />
                                                    <div className="absolute bottom-2 right-2 text-[10px] font-bold text-slate-500 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-700">
                                                        {(profileData.bio || "").length}/150
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Themes */}
                                <section className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                                    <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                        <div className="w-1 h-6 bg-pink-500 rounded-full"></div> Themes
                                    </h2>
                                    <div className="space-y-8">
                                        {Object.entries(
                                            Object.entries(themePresets).reduce((acc, [key, theme]) => {
                                                const cat = theme.category || "Other";
                                                if (!acc[cat]) acc[cat] = [];
                                                acc[cat].push({ key, ...theme });
                                                return acc;
                                            }, {})
                                        ).map(([category, themes]) => (
                                            <div key={category} className="space-y-4">
                                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                    <span className="w-8 h-[1px] bg-slate-700"></span>
                                                    {category}
                                                </h3>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                    {themes.map((theme) => {
                                                        const IconComponent = theme.icon ? ThemeIcons[theme.icon] : null;
                                                        return (
                                                            <button
                                                                key={theme.key}
                                                                onClick={() => updateProfile({ themePreset: theme.key })}
                                                                className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all group ${profileData.themePreset === theme.key ? "border-indigo-500 scale-105 shadow-xl shadow-indigo-500/20" : "border-slate-700 hover:border-slate-500"}`}
                                                            >
                                                                <div className={`absolute inset-0 ${theme.bg}`}></div>

                                                                {/* Theme Preview Content */}
                                                                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                                                                    <div className={`w-full h-12 rounded-lg ${theme.cardBg} border ${theme.cardBorder} mb-2 flex items-center justify-center`}>
                                                                        {IconComponent && <IconComponent className={`w-6 h-6 ${theme.text} opacity-40 group-hover:opacity-100 transition-opacity`} />}
                                                                        {!IconComponent && theme.key === 'midnight-neon' && <div className="w-6 h-6 rounded-full bg-lime-400 group-hover:shadow-[0_0_10px_#a3e635] transition-all"></div>}
                                                                    </div>
                                                                    <div className="space-y-1 w-full">
                                                                        <div className={`w-3/4 h-1.5 rounded-full ${theme.cardBg} border ${theme.cardBorder}`}></div>
                                                                        <div className={`w-1/2 h-1.5 rounded-full ${theme.cardBg} border ${theme.cardBorder}`}></div>
                                                                    </div>
                                                                </div>

                                                                <div className="absolute bottom-0 w-full bg-black/60 p-2 text-center text-[10px] font-bold text-white backdrop-blur-md border-t border-white/5">
                                                                    {theme.name}
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8">
                                        <h3 className="text-sm font-bold text-white mb-4">Button Style</h3>
                                        <div className="flex flex-wrap gap-4">
                                            {Object.keys(buttonStyles).map(style => (
                                                <button
                                                    key={style}
                                                    onClick={() => updateProfile({ buttonStyle: style })}
                                                    className={`px-6 py-3 bg-slate-700 text-white border-2 transition-all ${buttonStyles[style]} ${profileData.buttonStyle === style ? "border-indigo-500 bg-slate-600" : "border-transparent"}`}
                                                >
                                                    {style.charAt(0).toUpperCase() + style.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </section>

                                {/* Custom Background */}
                                <section className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <div className="w-1 h-6 bg-emerald-500 rounded-full"></div> Custom Background
                                    </h2>
                                    <div className="flex items-center gap-4">
                                        {profileData.customBackground ? (
                                            <div className="w-24 h-48 bg-slate-900 rounded-lg overflow-hidden border border-slate-600 relative group">
                                                <img src={profileData.customBackground} className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => updateProfile({ customBackground: null })}
                                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <TrashIcon className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="w-24 h-48 bg-slate-900/50 rounded-lg border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-500">
                                                <SwatchIcon className="w-8 h-8" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="text-sm text-slate-400 mb-4">Upload a custom image for your page background. Best resolution: 1080x1920px. (Max 5MB)</p>
                                            <label className="inline-block bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg cursor-pointer text-sm font-bold transition-all">
                                                <span>{uploadingProfile ? "Uploading..." : "Select Image"}</span>
                                                <input type="file" onChange={(e) => handleProfileUpload(e, 'customBackground')} className="hidden" accept="image/*" />
                                            </label>
                                        </div>
                                    </div>
                                    <div className="mt-6 flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                                        <div>
                                            <div className="text-white font-bold text-sm">Ambient Effects</div>
                                            <div className="text-slate-500 text-xs">Floating emojis animation</div>
                                        </div>
                                        <button
                                            onClick={() => updateProfile({ enableAmbient: !profileData.enableAmbient })}
                                            className={`w-12 h-6 rounded-full transition-colors relative ${profileData.enableAmbient ? "bg-indigo-500" : "bg-slate-700"}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${profileData.enableAmbient ? "left-7" : "left-1"}`}></div>
                                        </button>
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* --- TAB: SETTINGS --- */}
                        {activeTab === "settings" && (
                            <div className="space-y-6">
                                <section className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                                    <h2 className="text-lg font-bold text-white mb-6">Social Icons</h2>
                                    <div className="grid grid-cols-1 gap-4">
                                        {['instagram', 'facebook', 'youtube', 'tiktok', 'spotify'].map(platform => (
                                            <div key={platform} className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 uppercase text-xs font-bold">
                                                    {platform}
                                                </div>
                                                <input
                                                    type="text"
                                                    value={profileData[platform] || ""}
                                                    onChange={e => updateProfile({ [platform]: e.target.value })}
                                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg py-3 pl-28 pr-4 text-white focus:outline-none focus:border-indigo-500 font-mono text-sm"
                                                    placeholder={platform === 'facebook' ? "username or link" : "Input username"}
                                                />
                                            </div>
                                        ))}
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 uppercase text-xs font-bold">
                                                Contact Email
                                            </div>
                                            <input
                                                type="text"
                                                value={profileData.publicEmail || ""}
                                                onChange={e => updateProfile({ publicEmail: e.target.value })}
                                                className="w-full bg-slate-900 border border-slate-600 rounded-lg py-3 pl-28 pr-4 text-white focus:outline-none focus:border-indigo-500 font-mono text-sm"
                                                placeholder="Public contact email"
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* --- Handlers (User) --- */}

                                {profileData.provider !== 'google' && (
                                    <section className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                                        <h2 className="text-lg font-bold text-white mb-6">Change Password</h2>
                                        <form onSubmit={handlePasswordChange} className="space-y-4">
                                            <div className="relative">
                                                <input
                                                    type={showPasswords.current ? "text" : "password"}
                                                    value={passwordData.current}
                                                    onChange={e => setPasswordData({ ...passwordData, current: e.target.value })}
                                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 pr-12 text-white focus:outline-none focus:border-indigo-500"
                                                    placeholder="Current Password"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                                >
                                                    {showPasswords.current ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                                </button>
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type={showPasswords.new ? "text" : "password"}
                                                    value={passwordData.new}
                                                    onChange={e => setPasswordData({ ...passwordData, new: e.target.value })}
                                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 pr-12 text-white focus:outline-none focus:border-indigo-500"
                                                    placeholder="New Password (min 6 chars)"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.current }))}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                                >
                                                    {showPasswords.new ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                                </button>
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type={showPasswords.confirm ? "text" : "password"}
                                                    value={passwordData.confirmNew}
                                                    onChange={e => setPasswordData({ ...passwordData, confirmNew: e.target.value })}
                                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 pr-12 text-white focus:outline-none focus:border-indigo-500"
                                                    placeholder="Confirm New Password"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                                >
                                                    {showPasswords.confirm ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                                </button>
                                            </div>
                                            <button type="submit" className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-all w-full">
                                                {changingPassword ? "Updating..." : "Update Password"}
                                            </button>
                                        </form>
                                    </section>
                                )}
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: PREVIEW */}
                    <div className="hidden lg:block lg:col-span-5 relative">
                        <div className="sticky top-24">
                            <div className="text-center mb-4">
                                <span className="bg-slate-800 text-slate-400 text-xs font-bold px-3 py-1 rounded-full border border-slate-700">LIVE PREVIEW</span>
                            </div>
                            <div className="mockup-phone border-slate-800 bg-slate-900 rounded-[3rem] border-[14px] overflow-hidden shadow-2xl w-full max-w-[320px] mx-auto aspect-[9/19] relative ring-1 ring-white/10">
                                <div className="h-full w-full overflow-hidden relative rounded-[2.5rem] bg-slate-900">
                                    {/* Interaction blocker - allows scroll but blocks clicks/zooms more reliably */}
                                    <div className="absolute inset-x-0 top-0 bottom-0 z-50 pointer-events-none"></div>
                                    <div className="origin-top-left transition-transform duration-300 flex flex-col overflow-y-auto overflow-x-hidden no-scrollbar bg-slate-900"
                                        style={{ transform: 'scale(0.75)', height: '133.33%', width: '133.33%' }}>
                                        <ProfileClient user={userForPreview} isPreview={true} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Cropper Modal */}
                {showCropper && tempImageSrc && (
                    <ImageCropper
                        imageSrc={tempImageSrc}
                        cropAspect={cropAspect}
                        onCancel={() => { setShowCropper(false); setTempImageSrc(null); }}
                        onCropComplete={handleCropSave}
                    />
                )}

                {/* Link Edit Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
                        <div className="bg-slate-800 rounded-2xl w-full max-w-lg border border-slate-700 shadow-2xl transform transition-all p-6">
                            <h2 className="text-2xl font-bold text-white mb-6">{editingLink ? "Edit Link" : "Create New Link"}</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Title</label>
                                    <input
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-indigo-500 outline-none"
                                        placeholder="e.g. My Website"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Platform (Optional)</label>
                                    <input
                                        value={formData.platform}
                                        onChange={e => setFormData({ ...formData, platform: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-indigo-500 outline-none"
                                        placeholder="e.g. YouTube, Shopee, Tokopedia"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-xs font-bold uppercase mb-1">URL</label>
                                    <input
                                        required
                                        value={formData.url}
                                        onChange={e => setFormData({ ...formData, url: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-indigo-500 outline-none"
                                        placeholder="https://..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Category (Optional)</label>
                                    <div className="relative">
                                        <input
                                            value={formData.category}
                                            onChange={e => {
                                                setFormData({ ...formData, category: e.target.value });
                                                setShowCategoryDropdown(true);
                                            }}
                                            onFocus={() => setShowCategoryDropdown(true)}
                                            onBlur={() => setTimeout(() => setShowCategoryDropdown(false), 200)}
                                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-indigo-500 outline-none"
                                            placeholder="Select or type..."
                                        />
                                        {showCategoryDropdown && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-10 max-h-40 overflow-y-auto">
                                                {[...new Set(links.map(l => l.category).filter(Boolean))].map(cat => (
                                                    <div key={cat}
                                                        className="p-2 hover:bg-slate-700 cursor-pointer text-sm text-slate-300"
                                                        onClick={() => setFormData({ ...formData, category: cat })}>
                                                        {cat}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <ChevronDownIcon className="w-5 h-5 absolute right-3 top-3.5 text-slate-500 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Thumbnail (Optional)</label>
                                    <div className="flex items-center gap-4">
                                        {formData.image && (
                                            <div className="relative group/thumb">
                                                <img src={formData.image} className="w-12 h-12 rounded-lg object-cover bg-slate-900 border border-slate-700" />
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, image: "" }))}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover/thumb:opacity-100 transition-opacity"
                                                >
                                                    <TrashIcon className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )}
                                        <label className="flex-1 cursor-pointer bg-slate-900 border border-slate-600 hover:bg-slate-700 rounded-lg p-3 text-center transition-colors">
                                            <span className="text-sm font-bold text-slate-300">
                                                {uploading ? "Uploading..." : formData.image ? "Change Image (Max 2MB)" : "Choose Image (Max 2MB)"}
                                            </span>
                                            <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                                        </label>
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-8">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-bold transition-colors">Cancel</button>
                                    <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold transition-colors">Save Link</button>
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
            </main>
        </div>
    );
}
