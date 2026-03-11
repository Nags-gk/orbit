import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { User, Mail, Shield, Bell, CreditCard, Settings, Save, X, LogOut, Palette, RefreshCcw, Camera, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { THEME_PRESETS, hexToHsl, hslToHex, type ThemeVariable } from '../lib/themes';

export default function Profile() {
    const { user, logout, updateUser } = useAuthStore();
    const { themeId, setTheme, customColors, setCustomColor, resetCustomTheme } = useStore();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showAdvancedTheme, setShowAdvancedTheme] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [profile, setProfile] = useState({
        name: user?.fullName || 'Orbit User',
        email: user?.email || '',
        phone: 'Add phone number',
        location: 'Add location'
    });

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updatedUser = await apiFetch('/auth/me', {
                method: 'PUT',
                body: JSON.stringify({
                    fullName: profile.name,
                    email: profile.email
                })
            });
            updateUser(updatedUser);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update profile", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const updatedUser = await apiFetch('/auth/me/profile-picture', {
                method: 'POST',
                body: formData
            });
            updateUser(updatedUser);
        } catch (error) {
            console.error("Failed to upload profile picture", error);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Reset to original values if needed, but for now we'll just exit edit mode
        // To properly implement cancel, we'd need a separate "originalProfile" state
    };

    // Helper to get full URL for profile picture
    const getProfilePictureUrl = () => {
        if (!user?.profilePictureUrl) return null;
        if (user.profilePictureUrl.startsWith('http')) return user.profilePictureUrl;
        return `${window.location.protocol}//${window.location.hostname}:5173${user.profilePictureUrl}`; // Proxy via dev server
    };

    return (
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
                <Card className="h-fit border-none bg-card/40 backdrop-blur-sm">
                    <CardContent className="pt-6 flex flex-col items-center text-center">
                        <div className="relative group w-24 h-24 mb-4">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-accent p-[3px] shadow-[0_0_20px_rgba(var(--primary),0.3)]">
                                <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                                    {getProfilePictureUrl() ? (
                                        <img src={getProfilePictureUrl()!} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-primary to-accent">
                                            {profile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Hidden file input */}
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                            />

                            {/* Upload Overlay */}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-2 border-primary/50"
                            >
                                {isUploading ? (
                                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                                ) : (
                                    <Camera className="w-6 h-6 text-white" />
                                )}
                            </button>
                        </div>
                        <h2 className="text-2xl font-bold">{profile.name}</h2>
                        <p className="text-muted-foreground">Premium Member</p>
                        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="w-4 h-4" />
                            <span>{profile.email}</span>
                        </div>
                        <div className="mt-6 w-full flex gap-2">
                            {isEditing ? (
                                <>
                                    <Button onClick={handleSave} disabled={isSaving} className="flex-1 gap-2">
                                        <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Save"}
                                    </Button>
                                    <Button onClick={handleCancel} variant="outline" className="flex-1 gap-2">
                                        <X className="w-4 h-4" /> Cancel
                                    </Button>
                                </>
                            ) : (
                                <Button onClick={() => setIsEditing(true)} className="w-full">Edit Profile</Button>
                            )}
                        </div>
                        <div className="mt-4 w-full pt-4 border-t border-border">
                            <Button
                                onClick={handleLogout}
                                variant="destructive"
                                className="w-full bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-600 dark:text-red-400 border border-red-500/30 dark:border-red-500/20"
                            >
                                <LogOut className="w-4 h-4 mr-2" /> Sign Out
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="border-none bg-card/40 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5 text-primary" />
                                Personal Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                                    {isEditing ? (
                                        <Input
                                            value={profile.name}
                                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        />
                                    ) : (
                                        <p className="font-medium h-10 flex items-center">{profile.name}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                                    {isEditing ? (
                                        <Input
                                            value={profile.email}
                                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                        />
                                    ) : (
                                        <p className="font-medium h-10 flex items-center">{profile.email}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                                    {isEditing ? (
                                        <Input
                                            value={profile.phone}
                                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                        />
                                    ) : (
                                        <p className="font-medium h-10 flex items-center">{profile.phone}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">Location</p>
                                    {isEditing ? (
                                        <Input
                                            value={profile.location}
                                            onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                                        />
                                    ) : (
                                        <p className="font-medium h-10 flex items-center">{profile.location}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none bg-card/40 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="w-5 h-5 text-primary" />
                                Preferences
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-foreground/5 transition-colors cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                                        <Bell className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Notifications</p>
                                        <p className="text-sm text-muted-foreground">Manage your email and push notifications</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm">Manage</Button>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-foreground/5 transition-colors cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                                        <Shield className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Security</p>
                                        <p className="text-sm text-muted-foreground">2FA and password settings</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm">Manage</Button>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-foreground/5 transition-colors cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                                        <CreditCard className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Billing</p>
                                        <p className="text-sm text-muted-foreground">Manage your subscription and payment methods</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm">Manage</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none bg-card/40 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Palette className="w-5 h-5 text-primary" />
                                Appearance
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Theme Presets */}
                            <div className="space-y-3">
                                <p className="text-sm font-medium text-muted-foreground">Theme Presets</p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {Object.values(THEME_PRESETS).map((preset) => (
                                        <button
                                            key={preset.id}
                                            onClick={() => setTheme(preset.id)}
                                            className={`flex flex-col items-start p-3 rounded-xl border transition-all duration-300 text-left ${themeId === preset.id
                                                ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(var(--primary),0.2)]'
                                                : 'border-border hover:border-border/80 bg-black/20 hover:bg-black/40'
                                                }`}
                                        >
                                            <span className="font-semibold">{preset.name}</span>
                                            <span className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                                                {preset.description}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Advanced Customization Toggle */}
                            <div className="pt-4 border-t border-border">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Advanced Customization</p>
                                        <p className="text-sm text-muted-foreground">Override specific colors</p>
                                    </div>
                                    <Button
                                        variant={showAdvancedTheme ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setShowAdvancedTheme(!showAdvancedTheme)}
                                    >
                                        {showAdvancedTheme ? 'Hide Editor' : 'Show Editor'}
                                    </Button>
                                </div>

                                {showAdvancedTheme && (
                                    <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Color Variables</span>
                                            {Object.keys(customColors).length > 0 && (
                                                <Button variant="ghost" size="sm" onClick={resetCustomTheme} className="h-8 text-xs text-destructive hover:text-destructive">
                                                    <RefreshCcw className="w-3 h-3 mr-2" /> Reset Defaults
                                                </Button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {(['background', 'card', 'primary', 'accent', 'secondary', 'muted', 'border', 'destructive'] as ThemeVariable[]).map((variable) => {
                                                // Get the active HSL value (either customized or from base preset)
                                                const activePreset = THEME_PRESETS[themeId] || THEME_PRESETS.dark;
                                                const currentHsl = customColors[variable] || activePreset.tokens[variable];
                                                const currentHex = hslToHex(currentHsl);

                                                return (
                                                    <div key={variable} className="flex items-center justify-between p-2 rounded-lg bg-black/20 border border-border/50">
                                                        <span className="text-sm font-medium capitalize">{variable}</span>
                                                        <div className="flex items-center gap-2">
                                                            {customColors[variable] && (
                                                                <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">Custom</span>
                                                            )}
                                                            <input
                                                                type="color"
                                                                value={currentHex}
                                                                onChange={(e) => {
                                                                    const newHsl = hexToHsl(e.target.value);
                                                                    setCustomColor(variable, newHsl);
                                                                }}
                                                                className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
                                                                title={`Edit ${variable} color`}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
