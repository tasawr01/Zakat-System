import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Heart, Menu } from 'lucide-react';

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 border-b border-white/10 bg-white/70 backdrop-blur-xl dark:bg-slate-900/70 dark:border-slate-800">
            <div className="container mx-auto px-4 h-16 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                        <Heart className="w-6 h-6 fill-primary" />
                    </div>
                    <span>ZakatSystem</span>
                </Link>

                <div className="hidden md:flex items-center gap-6">
                    <Link href="/donor/dashboard" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                        Donor
                    </Link>
                    <Link href="/beneficiary/apply" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                        Beneficiary
                    </Link>
                    <Link href="/admin/dashboard" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                        Admin
                    </Link>

                </div>

                <button className="md:hidden p-2 text-muted-foreground hover:text-primary">
                    <Menu className="w-6 h-6" />
                </button>
            </div>
        </nav>
    );
}
