"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface FormState {
    name: string;
    email: string;
    password: string;
}

interface FieldErrors {
    name?: string;
    email?: string;
    password?: string;
    general?: string;
}

export default function RegisterForm() {
    const router = useRouter();
    const [form, setForm] = useState<FormState>({
        name: "",
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState<FieldErrors>({});
    const [loading, setLoading] = useState(false);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setErrors((prev) => ({
            ...prev,
            [e.target.name]: undefined,
            general: undefined,
        }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.error?.code === "VALIDATION_ERROR" && data.error.details) {
                    const fieldErrors: FieldErrors = {};
                    for (const detail of data.error.details as string[]) {
                        if (detail.startsWith("name"))
                            fieldErrors.name = detail.split(": ")[1];
                        if (detail.startsWith("email"))
                            fieldErrors.email = detail.split(": ")[1];
                        if (detail.startsWith("password"))
                            fieldErrors.password = detail.split(": ")[1];
                    }
                    setErrors(fieldErrors);
                } else {
                    setErrors({ general: data.error?.message ?? "Registration failed" });
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
                <CardTitle className="text-2xl">Create an account</CardTitle>
                <CardDescription>Start shopping with AI assistance</CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    {errors.general && (
                        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
                            {errors.general}
                        </p>
                    )}

                    <div className="space-y-1">
                        <Label htmlFor="name">Full name</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="John Doe"
                            value={form.name}
                            onChange={handleChange}
                            disabled={loading}
                            required
                        />
                        {errors.name && (
                            <p className="text-xs text-red-600">{errors.name}</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={handleChange}
                            disabled={loading}
                            required
                        />
                        {errors.email && (
                            <p className="text-xs text-red-600">{errors.email}</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Minimum 8 characters"
                            value={form.password}
                            onChange={handleChange}
                            disabled={loading}
                            required
                        />
                        {errors.password && (
                            <p className="text-xs text-red-600">{errors.password}</p>
                        )}
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-3">
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Creating account…" : "Create account"}
                    </Button>
                    <p className="text-sm text-gray-500">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="text-gray-900 font-medium hover:underline"
                        >
                            Log in
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    );
}
