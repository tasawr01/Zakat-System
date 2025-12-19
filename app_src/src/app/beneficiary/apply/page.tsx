'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { motion } from 'framer-motion';

export default function BeneficiaryApply() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [status, setStatus] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(true);

    useEffect(() => {
        // Check authentication
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            router.push('/login');
            return;
        }

        const userData = JSON.parse(userStr);
        if (userData.role !== 'BENEFICIARY') {
            router.push('/login');
            return;
        }

        setUser(userData);

        // Fetch beneficiaries list
        fetch('/api/beneficiaries')
            .then(res => res.json())
            .then(data => setBeneficiaries(data.beneficiaries || []))
            .catch(err => console.error('Failed to fetch beneficiaries:', err));
    }, [router]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus('');

        const formData = new FormData(e.currentTarget);
        formData.append('userId', user.id);
        formData.append('userName', user.email);

        try {
            const res = await fetch('/api/beneficiaries', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                setStatus('Application submitted successfully for admin review!');
                // Reset form fields
                (e.target as HTMLFormElement).reset();

                // Refresh list
                const listRes = await fetch(`/api/beneficiaries?userId=${user.id}`);
                const listData = await listRes.json();
                setBeneficiaries(listData.beneficiaries || []);
            } else {
                setStatus('Failed to submit application. Please try again.');
            }
        } catch (error) {
            setStatus('An error occurred. Please try again.');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container mx-auto p-8 max-w-4xl">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Apply for Assistance</h1>
                        <p className="text-muted-foreground mt-2">Welcome, {user?.username}</p>
                    </div>
                    <Button variant="outline" onClick={handleLogout}>Logout</Button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Application Form */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Card className="bg-card border border-border p-8">
                            <h2 className="text-2xl font-bold mb-6 text-primary">Submit Your Application</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <Label htmlFor="region">Region</Label>
                                    <select name="region" required className="w-full border-2 border-border bg-background text-foreground rounded-lg px-4 py-2 focus:outline-none focus:border-primary focus:shadow-md font-medium mt-2">
                                        <option value="">Select Region</option>
                                        <option value="Punjab">Punjab</option>
                                        <option value="Sindh">Sindh</option>
                                        <option value="KPK">KPK</option>
                                        <option value="Balochistan">Balochistan</option>
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="income">Monthly Income (PKR)</Label>
                                    <Input type="number" name="income" required className="mt-2" placeholder="Enter your monthly income" />
                                </div>

                                <div>
                                    <Label htmlFor="familyMembers">Family Members</Label>
                                    <Input type="number" name="familyMembers" required className="mt-2" placeholder="Total number of family members" />
                                </div>

                                <div>
                                    <Label htmlFor="requestedAmount">Requested Amount (PKR)</Label>
                                    <Input type="number" name="requestedAmount" required className="mt-2" placeholder="Amount needed for assistance" />
                                </div>

                                <div>
                                    <Label htmlFor="document">Supporting Documents (PDF/Image)</Label>
                                    <input type="file" name="document" className="w-full border-2 border-dashed border-border bg-background text-foreground rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:shadow-md transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary-dark mt-2" />
                                    <p className="text-xs text-muted-foreground mt-2">Upload CNIC or Income Certificate (Stored as BLOB)</p>
                                </div>

                                <Button type="submit" className="w-full bg-gradient-to-br from-secondary to-secondary-dark text-secondary-foreground py-3 rounded-lg font-semibold" disabled={isSubmitting}>
                                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                                </Button>
                            </form>

                            {status && (
                                <div className={`mt-6 p-4 rounded-lg border font-medium ${status.includes('success')
                                    ? 'bg-success/10 border-success/30 text-success'
                                    : 'bg-error/10 border-error/30 text-error'
                                    }`}>
                                    {status}
                                </div>
                            )}
                        </Card>
                    </motion.div>

                    {/* Applications List */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Card className="bg-card border border-border p-8">
                            <h2 className="text-2xl font-bold mb-6 text-secondary">Recent Applications</h2>
                            <div className="space-y-4">
                                {beneficiaries.length > 0 ? (
                                    beneficiaries.map((app: any) => (
                                        <div key={app.id} className="p-4 border border-border rounded-lg bg-background/50 hover:bg-background/80 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-semibold text-foreground">{app.region}</h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${app.status === 'APPROVED'
                                                    ? 'bg-success/20 text-success border border-success/30'
                                                    : app.status === 'PENDING'
                                                        ? 'bg-warning/20 text-warning border border-warning/30'
                                                        : 'bg-error/20 text-error border border-error/30'
                                                    }`}>
                                                    {app.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-2">Income: {app.income.toLocaleString()} PKR</p>
                                            <p className="text-sm text-muted-foreground mb-2">Requested: {app.requestedAmount ? app.requestedAmount.toLocaleString() : 0} PKR</p>
                                            <p className="text-sm text-muted-foreground">Family Members: {app.familyMembers}</p>
                                            <p className="text-xs text-muted-foreground mt-2">Applied: {app.date}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-muted-foreground">No applications yet</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
