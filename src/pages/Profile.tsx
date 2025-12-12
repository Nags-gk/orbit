import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { User, Mail, Shield, Bell, CreditCard, Settings, Save, X } from 'lucide-react';

export default function Profile() {
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({
        name: 'Nagaraj GK',
        email: 'nagagrajgk50@gmail.com',
        phone: '408-210-2658',
        location: 'San Jose, CA'
    });

    const handleSave = () => {
        setIsEditing(false);
        // In a real app, we would save to backend here
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Reset to original values if needed, but for now we'll just exit edit mode
        // To properly implement cancel, we'd need a separate "originalProfile" state
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
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent p-[3px] mb-4">
                            <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                                <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-primary to-accent">
                                    {profile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                </span>
                            </div>
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
                                    <Button onClick={handleSave} className="flex-1 gap-2">
                                        <Save className="w-4 h-4" /> Save
                                    </Button>
                                    <Button onClick={handleCancel} variant="outline" className="flex-1 gap-2">
                                        <X className="w-4 h-4" /> Cancel
                                    </Button>
                                </>
                            ) : (
                                <Button onClick={() => setIsEditing(true)} className="w-full">Edit Profile</Button>
                            )}
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
                            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
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

                            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
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

                            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
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
                </div>
            </div>
        </div>
    );
}
