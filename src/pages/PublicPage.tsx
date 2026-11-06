import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import medicineLogo from '../assets/logo/medicine-logo.png';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useAuth } from '../context/AuthContext';
import {
  PlusCircle,
  Bug,
  Wrench,
  CheckCircle2,
  Clock,
  Mail,
  Search
} from 'lucide-react';

export const PublicPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleTicketAction = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45 },
    },
  };

  return (
    <div className="min-h-screen bg-[#f4f6fa] text-slate-800 antialiased flex flex-col justify-between">
      {/* Top Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-white border-b border-slate-200/80 sticky top-0 z-50"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src={medicineLogo} alt="MSIS Logo" className="h-9 w-auto object-contain" />
            <span className="text-lg font-bold text-slate-800 tracking-tight">
              MSIS <span className="text-blue-600 font-semibold">| Support</span>
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="primary"
              size="sm"
              onClick={handleTicketAction}
              leftIcon={<PlusCircle className="h-4 w-4" />}
              className="h-10 px-4 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Submit a Ticket
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main Support Desk Overview */}
      <main className="max-w-4xl mx-auto px-4 py-12 sm:py-16 w-full space-y-12">
        {/* Simple Informative Hero */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center space-y-4 max-w-2xl mx-auto"
        >
          <motion.div variants={itemVariants} className="flex justify-center mb-2">
            <div className="p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <img src={medicineLogo} alt="MSIS Logo" className="h-11 w-auto object-contain" />
            </div>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            MSIS Support Desk
          </motion.h1>

          <motion.p variants={itemVariants} className="text-sm sm:text-base text-slate-500 leading-relaxed">
            Centralized support for reporting software bugs, system glitches, and technical issues across the MSIS platform.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={handleTicketAction}
              leftIcon={<PlusCircle className="h-4 w-4" />}
              className="h-11 px-6 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Submit a Ticket
            </Button>

            <Button
              variant="outline"
              size="md"
              onClick={handleTicketAction}
              leftIcon={<Search className="h-4 w-4" />}
              className="h-11 px-6 rounded-xl text-xs font-semibold bg-white cursor-pointer"
            >
              Track Existing Ticket
            </Button>
          </motion.div>
        </motion.div>

        {/* 3 Simple Informative Support Cards with Framer Motion Stagger */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          <motion.div variants={itemVariants} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <Card variant="default" className="bg-white border-slate-200/80 shadow-xs rounded-2xl p-6 space-y-3 h-full">
              <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Bug className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Bug & Error Reports</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Submit software bugs, system crashes, display glitches, and unexpected errors with reproduction steps and file attachments.
                </p>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <Card variant="default" className="bg-white border-slate-200/80 shadow-xs rounded-2xl p-6 space-y-3 h-full">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Wrench className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Technical Support</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Assistance with account access, portal permissions, system configurations, and data sync issues for MSIS.
                </p>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <Card variant="default" className="bg-white border-slate-200/80 shadow-xs rounded-2xl p-6 space-y-3 h-full">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Resolution Tracking</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Track investigation progress, review technical developer responses, and verify when bug fixes are deployed.
                </p>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Support Information Bar */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <span className="font-semibold text-slate-800 block">Support Hours</span>
                <span className="text-slate-500">Monday – Friday, 8:00 AM – 5:00 PM</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <span className="font-semibold text-slate-800 block">MSIS Technical Contact</span>
                <span className="text-slate-500">support@msis.edu</span>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Simple Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 text-center text-xs text-slate-400">
        <p>MSIS Support • Issue & Bug Tracking Desk</p>
      </footer>
    </div>
  );
};

export default PublicPage;
