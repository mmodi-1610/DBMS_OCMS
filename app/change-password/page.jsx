"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Lock, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function ChangePasswordPage() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess(false);

        // Validation
        if (newPassword.length < 6) {
            setError("New password must be at least 6 characters");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match");
            return;
        }

        if (currentPassword === newPassword) {
            setError("New password must be different from current password");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/change-password", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to change password");
                return;
            }

            setSuccess(true);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                router.push("/dashboard");
            }, 2000);
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container mx-auto max-w-2xl px-4 py-8">
            <div className="mb-6">
                <Button
                    variant="ghost"
                    onClick={() => router.push("/dashboard")}
                    className="mb-4"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Button>
                <h1 className="text-3xl font-bold text-foreground font-serif">
                    Change Password
                </h1>
                <p className="text-muted-foreground mt-2">
                    Update your account password securely
                </p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-primary" />
                        <CardTitle className="font-serif">Security Settings</CardTitle>
                    </div>
                    <CardDescription>
                        Enter your current password and choose a new password
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {error && (
                            <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="rounded-md bg-green-50 dark:bg-green-900/20 px-4 py-3 text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                Password changed successfully! Redirecting...
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input
                                id="currentPassword"
                                type="password"
                                placeholder="Enter your current password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                                disabled={loading || success}
                            />
                        </div>

                        <div className="h-px bg-border my-2" />

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                placeholder="Enter new password (min 6 characters)"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                disabled={loading || success}
                                minLength={6}
                            />
                            <p className="text-xs text-muted-foreground">
                                Minimum 6 characters required
                            </p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={loading || success}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full mt-4"
                            disabled={loading || success}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Changing Password...
                                </>
                            ) : success ? (
                                <>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Password Changed
                                </>
                            ) : (
                                "Change Password"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
