'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { motion } from 'framer-motion';

export default function DonorDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [assets, setAssets] = useState({ gold: 0, silver: 0, cash: 0 });
    const [zakatResult, setZakatResult] = useState<any>(null);
    const [donations, setDonations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [donationSubmitting, setDonationSubmitting] = useState(false);

    useEffect(() => {
        // Check authentication
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            router.push('/login');
            return;
        }

        const userData = JSON.parse(userStr);
        if (userData.role !== 'DONOR') {
            router.push('/login');
            return;
        }

        setUser(userData);

        // Fetch donations
        fetch(`/api/donations?donorId=${userData.id}`)
            .then(res => res.json())
            .then(data => {
                setDonations(data.donations || []);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch donations:', err);
                setLoading(false);
            });
    }, [router]);

    const calculateZakat = async () => {
        try {
            // Zakat calculation logic
            const goldValue = assets.gold * 6000; // Approximate PKR per gram
            const silverValue = assets.silver * 80; // Approximate PKR per gram
            const totalValue = goldValue + silverValue + assets.cash;

            // Nisab: approximately 85 grams of gold or 595 grams of silver
            const nisab = Math.min(85 * 6000, 595 * 80);

            if (totalValue >= nisab) {
                const zakat = totalValue * 0.025; // 2.5%
                setZakatResult({
                    totalZakat: zakat,
                    details: [
                        { type: 'Gold', zakat: goldValue * 0.025 },
                        { type: 'Silver', zakat: silverValue * 0.025 },
                        { type: 'Cash', zakat: assets.cash * 0.025 },
                    ]
                });
            } else {
                setZakatResult({
                    totalZakat: 0,
                    details: [],
                    message: 'Your assets are below nisab. No zakat is due.'
                });
            }
        } catch (error) {
            console.error('Zakat calculation error:', error);
        }
    };

    const handleMakeDonation = async () => {
        if (!user) return;
        setDonationSubmitting(true);

        try {
            const response = await fetch('/api/donations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: zakatResult?.totalZakat || 0,
                    type: 'ZAKAT',
                    donorId: user.id,
                    donorName: user.email
                })
            });

            if (response.ok) {
                // Refresh donations list
                const donationsRes = await fetch(`/api/donations?donorId=${user.id}`);
                const donationsData = await donationsRes.json();
                setDonations(donationsData.donations || []);
                setZakatResult(null);
                setAssets({ gold: 0, silver: 0, cash: 0 });
                alert('Donation submitted successfully for admin review!');
            } else {
                alert('Failed to submit donation');
            }
        } catch (error) {
            console.error('Error submitting donation:', error);
            alert('Failed to submit donation');
        } finally {
            setDonationSubmitting(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-foreground">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container mx-auto p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Donor Dashboard</h1>
                        <p className="text-muted-foreground mt-2">Welcome, {user?.username}</p>
                    </div>
                    <Button variant="outline" onClick={handleLogout}>Logout</Button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Zakat Calculator */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Card className="bg-card border border-border p-6">
                            <h2 className="text-xl font-semibold mb-6 text-primary">Zakat Calculator</h2>
                            <div className="space-y-4">
                                <div>
                                    <Label className="block text-sm font-semibold text-foreground mb-2">Gold (grams)</Label>
                                    <Input
                                        type="number"
                                        className="w-full border-2 border-border bg-background text-foreground rounded-lg px-4 py-2"
                                        value={assets.gold}
                                        onChange={e => setAssets({ ...assets, gold: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <Label className="block text-sm font-semibold text-foreground mb-2">Silver (grams)</Label>
                                    <Input
                                        type="number"
                                        className="w-full border-2 border-border bg-background text-foreground rounded-lg px-4 py-2"
                                        value={assets.silver}
                                        onChange={e => setAssets({ ...assets, silver: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <Label className="block text-sm font-semibold text-foreground mb-2">Cash (PKR)</Label>
                                    <Input
                                        type="number"
                                        className="w-full border-2 border-border bg-background text-foreground rounded-lg px-4 py-2"
                                        value={assets.cash}
                                        onChange={e => setAssets({ ...assets, cash: Number(e.target.value) })}
                                    />
                                </div>
                                <Button
                                    onClick={calculateZakat}
                                    className="w-full bg-gradient-to-br from-primary to-primary-dark text-primary-foreground py-3 rounded-lg"
                                >
                                    Calculate Zakat
                                </Button>
                            </div>

                            {zakatResult && (
                                <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                                    <h3 className="font-bold text-lg text-primary">Total Zakat: {zakatResult.totalZakat?.toFixed(2) || 0} PKR</h3>
                                    {zakatResult.message ? (
                                        <p className="text-sm text-muted-foreground mt-2">{zakatResult.message}</p>
                                    ) : (
                                        <>
                                            <ul className="mt-3 text-sm space-y-1 text-foreground">
                                                {zakatResult.details?.map((d: any, i: number) => (
                                                    <li key={i} className="flex justify-between">
                                                        <span>{d.type}:</span>
                                                        <span className="font-semibold text-primary">{d.zakat?.toFixed(2) || 0} PKR</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <Button
                                                onClick={handleMakeDonation}
                                                disabled={donationSubmitting}
                                                className="w-full mt-4 bg-gradient-to-br from-secondary to-secondary-dark text-secondary-foreground py-2 rounded-lg"
                                            >
                                                {donationSubmitting ? 'Submitting...' : 'Make Donation'}
                                            </Button>
                                        </>
                                    )}
                                </div>
                            )}
                        </Card>
                    </motion.div>

                    {/* Donation History */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Card className="bg-card border border-border p-6">
                            <h2 className="text-xl font-semibold mb-6 text-secondary">Donation History</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="pb-3 font-semibold text-secondary">Date</th>
                                            <th className="pb-3 font-semibold text-secondary">Type</th>
                                            <th className="pb-3 font-semibold text-secondary">Amount</th>
                                            <th className="pb-3 font-semibold text-secondary">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {donations.length > 0 ? (
                                            donations.map((d: any) => (
                                                <tr key={d.id} className="border-b border-border hover:bg-secondary/5 transition-colors">
                                                    <td className="py-3 text-foreground">{d.date}</td>
                                                    <td className="py-3 text-foreground">{d.type}</td>
                                                    <td className="py-3 font-semibold text-foreground">{d.amount.toLocaleString()} PKR</td>
                                                    <td className="py-3">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${d.status === 'APPROVED'
                                                            ? 'bg-success/20 text-success border border-success/30'
                                                            : 'bg-warning/20 text-warning border border-warning/30'
                                                            }`}>
                                                            {d.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="py-8 text-center text-muted-foreground">
                                                    No donations yet
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
