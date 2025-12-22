"use client";

import Navbar from './components/Navbar';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Users, BarChart3, HeartHandshake } from 'lucide-react';

export default function Home() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Failed to fetch stats:', err));
  }, []);

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      {}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />

        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              Powered by Oracle Database Technology
            </span>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-foreground">
              Modernizing <span className="text-primary">Zakat</span> & <br />
              <span className="text-secondary">Charity</span> Distribution
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              A transparent, secure, and efficient platform connecting donors with beneficiaries,
              ensuring every contribution reaches those in need.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/donor/dashboard">
                <Button size="lg" className="gap-2">
                  Start Donating <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/beneficiary/apply">
                <Button variant="outline" size="lg">
                  Apply for Aid
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose Our Platform?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built with advanced database technologies to ensure integrity, speed, and reliability.
            </p>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            <motion.div variants={item}>
              <Card hoverEffect className="h-full">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  <HeartHandshake className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">For Donors</h3>
                <p className="text-muted-foreground mb-6">
                  Calculate Zakat accurately, track your donations in real-time, and receive detailed impact reports.
                </p>
                <Link href="/donor/dashboard" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
                  Learn more <ArrowRight className="w-4 h-4" />
                </Link>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card hoverEffect className="h-full">
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-6">
                  <Users className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">For Beneficiaries</h3>
                <p className="text-muted-foreground mb-6">
                  Simple, dignified application process with secure verification and quick disbursement of funds.
                </p>
                <Link href="/beneficiary/apply" className="text-secondary font-medium hover:underline inline-flex items-center gap-1">
                  Apply now <ArrowRight className="w-4 h-4" />
                </Link>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card hoverEffect className="h-full">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-6">
                  <BarChart3 className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Transparency</h3>
                <p className="text-muted-foreground mb-6">
                  Complete visibility into fund distribution with advanced analytics and audit trails.
                </p>
                <Link href="/admin/dashboard" className="text-blue-500 font-medium hover:underline inline-flex items-center gap-1">
                  View reports <ArrowRight className="w-4 h-4" />
                </Link>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Total Donations", value: stats ? `Rs. ${stats.totalDonations.toLocaleString()}` : "Loading...", icon: BarChart3 },
              { label: "Beneficiaries Helped", value: stats ? `${stats.beneficiariesHelped.toLocaleString()}+` : "Loading...", icon: Users },
              { label: "Partner NGOs", value: stats ? `${stats.partnerNGOs}+` : "Loading...", icon: HeartHandshake },
              { label: "Success Rate", value: stats ? `${stats.successRate}%` : "Loading...", icon: ShieldCheck },
            ].map((stat, index) => (
              <div key={index} className="p-6">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <stat.icon className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
