'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { motion } from 'framer-motion';

interface Analytics {
    totalDonations: number;
    totalDonated: number;
    availableFunds?: number;
    donationsByMonth: { month: string; type: string; amount: number }[];
    distributionByRegionAndStatus: { region: string; status: string; count: number; amount: number }[];
}

interface PendingDonation {
    id: number;
    amount: number;
    type: string;
    date: string;
    donorName: string;
    donorId: string;
}

interface PendingBeneficiary {
    id: number;
    userName: string;
    userId: string;
    region: string;
    income: number;
    familyMembers: number;
    hasDocument?: number;
    date: string;
}

interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    createdAt: string;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'overview' | 'users'>('overview');
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [pendingDonations, setPendingDonations] = useState<PendingDonation[]>([]);
    const [pendingBeneficiaries, setPendingBeneficiaries] = useState<PendingBeneficiary[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [processingId, setProcessingId] = useState<number | null>(null);

    useEffect(() => {
        const verifyAuth = async () => {
            const token = localStorage.getItem('auth-token');
            const user = JSON.parse(localStorage.getItem('user') || '{}');

            if (!token || user.role !== 'ADMIN') {
                router.push('/login');
                return;
            }

            await fetchData();
        };

        verifyAuth();
    }, [router]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [analyticsRes, pendingRes, usersRes] = await Promise.all([
                fetch('/api/admin/analytics'),
                fetch('/api/admin/pending'),
                fetch('/api/admin/users')
            ]);

            if (analyticsRes.ok) {
                const data = await analyticsRes.json();
                setAnalytics(data);
            }

            if (pendingRes.ok) {
                const data = await pendingRes.json();
                setPendingDonations(data.pendingDonations);
                setPendingBeneficiaries(data.pendingBeneficiaries);
            }

            if (usersRes.ok) {
                const data = await usersRes.json();
                setUsers(data.users || []);
            }
        } catch (err) {
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string | number, type: 'donation' | 'beneficiary') => {
        await handleAction(id, type, 'APPROVED');
    };

    const handleReject = async (id: string | number, type: 'donation' | 'beneficiary') => {
        await handleAction(id, type, 'REJECTED');
    };

    const handleAction = async (id: string | number, type: string, status: string) => {
        try {
            setProcessingId(Number(id));
            const res = await fetch('/api/admin/pending', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'update', type, id, status })
            });

            if (res.ok) {
                await fetchData();
            } else {
                setError('Failed to process action');
            }
        } catch (err) {
            setError('Error processing action');
        } finally {
            setProcessingId(null);
        }
    };

    const handleDeleteUser = async (userId: number) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        try {
            setProcessingId(userId);
            const res = await fetch(`/api/admin/users?id=${userId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                await fetchData(); // Refresh list
            } else {
                setError('Failed to delete user');
            }
        } catch (err) {
            setError('Error deleting user');
        } finally {
            setProcessingId(null);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur border-b border-emerald-500/20">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <h1 className="text-2xl font-bold text-emerald-400">Admin Dashboard</h1>
                        <nav className="flex gap-4">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'overview'
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('users')}
                                className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'users'
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
                            >
                                User Management
                            </button>
                        </nav>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300"
                    >
                        {error}
                        <button onClick={() => setError('')} className="float-right hover:text-white">&times;</button>
                    </motion.div>
                )}

                {activeTab === 'overview' ? (
                    <>
                        {/* Analytics Section */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <h2 className="text-xl font-bold text-emerald-300 mb-6">Analytics Overview</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                                <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/30">
                                    <div className="p-6">
                                        <p className="text-emerald-300/70 text-sm font-medium">Total Donations</p>
                                        <p className="text-3xl font-bold text-emerald-400 mt-2">{analytics?.totalDonations || 0}</p>
                                    </div>
                                </Card>

                                <Card className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/30">
                                    <div className="p-6">
                                        <p className="text-amber-300/70 text-sm font-medium">Available Funds</p>
                                        <p className="text-3xl font-bold text-amber-400 mt-2">
                                            Rs. {analytics?.availableFunds?.toLocaleString() || 0}
                                        </p>
                                        <p className="text-xs text-amber-300/50 mt-1">
                                            Total: {analytics?.totalDonated?.toLocaleString() || 0}
                                        </p>
                                    </div>
                                </Card>

                                <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30">
                                    <div className="p-6">
                                        <p className="text-purple-300/70 text-sm font-medium">Pending Items</p>
                                        <p className="text-3xl font-bold text-purple-400 mt-2">
                                            {pendingDonations.length + pendingBeneficiaries.length}
                                        </p>
                                    </div>
                                </Card>
                            </div>
                        </motion.div>

                        {/* Pending Donations Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="mb-12"
                        >
                            <h2 className="text-xl font-bold text-amber-300 mb-6">Pending Donations for Review</h2>
                            {pendingDonations.length > 0 ? (
                                <div className="grid gap-4">
                                    {pendingDonations.map((donation) => (
                                        <Card
                                            key={donation.id}
                                            className="bg-slate-800/50 border-amber-500/30 hover:border-amber-500/60 transition-colors"
                                        >
                                            <div className="p-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div>
                                                        <p className="text-amber-300 font-semibold">{donation.donorName}</p>
                                                        <p className="text-slate-400 text-sm">{donation.type} • {donation.date}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-amber-400 text-2xl font-bold">Rs. {donation.amount}</p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-3 mt-6">
                                                    <button
                                                        onClick={() => handleApprove(donation.id, 'donation')}
                                                        disabled={processingId === donation.id}
                                                        className="flex-1 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        {processingId === donation.id ? 'Processing...' : 'Approve'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(donation.id, 'donation')}
                                                        disabled={processingId === donation.id}
                                                        className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        {processingId === donation.id ? 'Processing...' : 'Reject'}
                                                    </button>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <Card className="bg-slate-800/30 border-amber-500/20">
                                    <div className="p-12 text-center">
                                        <p className="text-slate-400">No pending donations for review</p>
                                    </div>
                                </Card>
                            )}
                        </motion.div>

                        {/* Pending Beneficiaries Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mb-12"
                        >
                            <h2 className="text-xl font-bold text-purple-300 mb-6">Pending Beneficiary Applications</h2>
                            {pendingBeneficiaries.length > 0 ? (
                                <div className="grid gap-4">
                                    {pendingBeneficiaries.map((beneficiary) => (
                                        <Card
                                            key={beneficiary.id}
                                            className="bg-slate-800/50 border-purple-500/30 hover:border-purple-500/60 transition-colors"
                                        >
                                            <div className="p-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <p className="text-purple-300 font-semibold">{beneficiary.userName}</p>
                                                        <p className="text-slate-400 text-sm">{beneficiary.region} • {beneficiary.date}</p>
                                                    </div>
                                                    <div className="text-right text-sm">
                                                        <p className="text-slate-300">Income: Rs. {beneficiary.income}</p>
                                                        <p className="text-slate-300">Family Size: {beneficiary.familyMembers}</p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-3 mt-6">
                                                    {beneficiary.hasDocument === 1 && (
                                                        <a
                                                            href={`/api/documents/${beneficiary.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex-1 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 rounded-lg transition-colors text-center"
                                                        >
                                                            View Document
                                                        </a>
                                                    )}
                                                    <button
                                                        onClick={() => handleApprove(beneficiary.id, 'beneficiary')}
                                                        disabled={processingId === beneficiary.id}
                                                        className="flex-1 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        {processingId === beneficiary.id ? 'Processing...' : 'Approve'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(beneficiary.id, 'beneficiary')}
                                                        disabled={processingId === beneficiary.id}
                                                        className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        {processingId === beneficiary.id ? 'Processing...' : 'Reject'}
                                                    </button>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <Card className="bg-slate-800/30 border-purple-500/20">
                                    <div className="p-12 text-center">
                                        <p className="text-slate-400">No pending beneficiary applications</p>
                                    </div>
                                </Card>
                            )}
                        </motion.div>
                    </>
                ) : (
                    // Users Management Tab
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h2 className="text-xl font-bold text-blue-300 mb-6">User Management</h2>
                        <Card className="bg-slate-800/50 border-blue-500/30 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-900/50">
                                        <tr>
                                            <th className="p-4 text-slate-400 font-medium">Username</th>
                                            <th className="p-4 text-slate-400 font-medium">Email</th>
                                            <th className="p-4 text-slate-400 font-medium">Role</th>
                                            <th className="p-4 text-slate-400 font-medium">Joined Date</th>
                                            <th className="p-4 text-slate-400 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/50">
                                        {users.map((user) => (
                                            <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                                                <td className="p-4 text-slate-200 font-medium">{user.username}</td>
                                                <td className="p-4 text-slate-300">{user.email}</td>
                                                <td className="p-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                                                        user.role === 'DONOR' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                                            'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                                        }`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-slate-400 text-sm">{user.createdAt}</td>
                                                <td className="p-4 text-right">
                                                    {user.role !== 'ADMIN' && (
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            disabled={processingId === user.id}
                                                            className="text-red-400 hover:text-red-300 hover:bg-red-500/20 px-3 py-1 rounded transition-colors disabled:opacity-50"
                                                        >
                                                            {processingId === user.id ? '...' : 'Delete'}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {users.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-slate-400">
                                                    No users found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
