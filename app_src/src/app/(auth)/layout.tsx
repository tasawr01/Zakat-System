import Link from "next/link";
import { Heart } from "lucide-react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-muted/30">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

            <div className="w-full max-w-md space-y-8">
                <div className="flex flex-col items-center text-center">
                    <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary mb-8">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <Heart className="w-8 h-8 fill-primary" />
                        </div>
                        <span>ZakatSystem</span>
                    </Link>
                </div>

                {children}
            </div>
        </div>
    );
}
