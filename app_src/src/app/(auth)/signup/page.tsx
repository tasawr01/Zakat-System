"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card } from "@/components/ui/Card";
import { motion } from "framer-motion";
import { User, HeartHandshake } from "lucide-react";

interface SignupResponse {
    success: boolean;
    user: {
        id: string;
        email: string;
        username: string;
        role: 'DONOR' | 'BENEFICIARY';
    };
    token: string;
    error?: string;
}

export default function SignupPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [role, setRole] = useState<"DONOR" | "BENEFICIARY">("DONOR");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password, role }),
            });

            const data: SignupResponse = await response.json();

            if (!response.ok) {
                setError(data.error || "Signup failed");
                setIsLoading(false);
                return;
            }

            // Store token in localStorage
            localStorage.setItem("auth-token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            // Redirect based on role
            const roleRoutes = {
                'DONOR': '/donor/dashboard',
                'BENEFICIARY': '/beneficiary/apply'
            };

            router.push(roleRoutes[data.user.role]);
        } catch (error) {
            setError("An error occurred. Please try again.");
            setIsLoading(false);
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center min-h-screen bg-background p-4"
        >
            <div className="w-full max-w-md">
                <Card className="p-8">
                    <div className="flex flex-col space-y-2 text-center mb-8">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Create an account</h1>
                        <p className="text-sm text-muted-foreground">
                            Choose your role and enter your details below
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-error/10 border border-error/30 text-error text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <button
                            type="button"
                            onClick={() => setRole("DONOR")}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${role === "DONOR"
                                ? "border-primary bg-primary/10 text-primary shadow-md shadow-primary/20"
                                : "border-border bg-card hover:border-primary/50 text-muted-foreground"
                                }`}
                        >
                            <HeartHandshake className="w-6 h-6 mb-2" />
                            <span className="text-sm font-semibold">Donor</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole("BENEFICIARY")}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${role === "BENEFICIARY"
                                ? "border-secondary bg-secondary/10 text-secondary shadow-md shadow-secondary/20"
                                : "border-border bg-card hover:border-secondary/50 text-muted-foreground"
                                }`}
                        >
                            <User className="w-6 h-6 mb-2" />
                            <span className="text-sm font-semibold">Beneficiary</span>
                        </button>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                placeholder="johndoe"
                                autoCapitalize="none"
                                autoCorrect="off"
                                disabled={isLoading}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                placeholder="name@example.com"
                                type="email"
                                autoCapitalize="none"
                                autoComplete="email"
                                autoCorrect="off"
                                disabled={isLoading}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                disabled={isLoading}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button className="w-full mt-2" type="submit" disabled={isLoading}>
                            {isLoading ? "Creating account..." : "Create Account"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-muted-foreground">Already have an account? </span>
                        <Link href="/login" className="font-medium text-primary hover:underline">
                            Sign in
                        </Link>
                    </div>
                </Card>
            </div>
        </motion.div>
    );
}
