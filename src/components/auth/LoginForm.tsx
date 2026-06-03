"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface FieldErrors {
    email?: string;
    password?: string;
    general?: string;
}

export default function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<FieldErrors>({});
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.error?.code === "VALIDATION_ERROR" && data.error.details) {
                    const fieldErrors: FieldErrors = {};
                    for (const detail of data.error.details as string[]) {
                        if (detail.startsWith("email")) fieldErrors.email = detail.split(": ")[1];
                        if (detail.startsWith("password")) fieldErrors.password = detail.split(": ")[1];
                    }
                    setErrors(fieldErrors);
                } else {
                    setErrors({ general: data.error?.message ?? "Login failed" });
                }
                return;
            }

            router.push("/shop");
        } catch {
            setErrors({ general: "Network error. Please try again." });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Welcome back</CardTitle>
                <CardDescription>Log in to your ShopBot account</CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    {errors.general && (
                        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
                            {errors.general}
                        </p>
                    )}

                    <div className="space-y-1">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setErrors((p) => ({ ...p, email: undefined, general: undefined }));
                            }}
                            disabled={loading}
                            required
                        />
                        {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Your password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setErrors((p) => ({ ...p, password: undefined, general: undefined }));
                            }}
                            disabled={loading}
                            required
                        />
                        {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-3">
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Logging in…" : "Log in"}
                    </Button>
                    <p className="text-sm text-gray-500">
                        Don&apos;t have an account?{" "}
                        <Link href="/register" className="text-gray-900 font-medium hover:underline">
                            Register
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    );
}