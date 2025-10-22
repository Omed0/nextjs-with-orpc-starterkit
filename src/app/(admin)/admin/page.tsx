import { client } from "@/lib/orpc";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Shield, Calendar } from "lucide-react";

export default async function AdminProfile() {
    const user = (await client.session()).session.user;

    const initials = user.name.charAt(0) || "U";

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl">
            <div className="space-y-8">
                {/* Page Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Admin Profile</h1>
                    <p className="text-muted-foreground">
                        Manage your account settings and preferences
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Profile Card */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>
                                Your personal account details and role
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-start gap-6">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={user.image || undefined} />
                                    <AvatarFallback className="text-2xl">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <div>w
                                                <p className="text-sm font-medium text-muted-foreground">
                                                    Full Name
                                                </p>
                                                <p className="text-base font-semibold">{user.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">
                                                    Email Address
                                                </p>
                                                <p className="text-base font-semibold">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Shield className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">
                                                    Role
                                                </p>
                                                <Badge variant="default" className="mt-1">
                                                    Administrator
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Status</CardTitle>
                            <CardDescription>Current account information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Account Type
                                </p>
                                <Badge variant="secondary" className="text-sm">
                                    Premium Admin
                                </Badge>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Status
                                </p>
                                <Badge variant="secondary" className="text-sm bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                                    Active
                                </Badge>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Member Since
                                    </p>
                                </div>
                                <p className="text-sm font-semibold">
                                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Permissions Card */}
                    <Card className="md:col-span-2 lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Administrator Permissions</CardTitle>
                            <CardDescription>
                                Full access to all system features and settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <PermissionItem
                                    title="User Management"
                                    description="Create, edit, and delete users"
                                    enabled
                                />
                                <PermissionItem
                                    title="Content Management"
                                    description="Manage all content and media"
                                    enabled
                                />
                                <PermissionItem
                                    title="Analytics Access"
                                    description="View detailed analytics and reports"
                                    enabled
                                />
                                <PermissionItem
                                    title="System Settings"
                                    description="Configure system-wide settings"
                                    enabled
                                />
                                <PermissionItem
                                    title="Queue Management"
                                    description="Monitor and manage job queues"
                                    enabled
                                />
                                <PermissionItem
                                    title="File Management"
                                    description="Upload and manage files"
                                    enabled
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function PermissionItem({
    title,
    description,
    enabled,
}: {
    title: string;
    description: string;
    enabled: boolean;
}) {
    return (
        <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
            <div
                className={`mt-0.5 h-2 w-2 rounded-full ${enabled ? "bg-green-500" : "bg-muted"}`}
            />
            <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">{title}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
        </div>
    );
}