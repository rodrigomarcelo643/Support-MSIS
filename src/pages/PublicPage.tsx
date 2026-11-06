import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import medicineLogo from '../assets/logo/medicine-logo.png';
import southweLogo from '../assets/logo/southwe_main.png';
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
    <div className="min-h-screen bg-[#f4f6fa] text-slate-800 antialiased flex flex-col justify-between overflow-x-hidden">
      {/* Top Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-white/95 backdrop-blur-xs border-b border-slate-200/80 sticky top-0 z-50"
      >
        <div className="max-w-5xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
            <img
              src={southweLogo}
              alt="Southwestern University PHINMA"
              className="h-7 w-7 sm:h-9 sm:w-9 object-contain shrink-0"
            />
            <img
              src={medicineLogo}
              alt="MSIS Logo"
              className="h-7 sm:h-9 w-auto object-contain shrink-0"
            />
            <span className="text-sm sm:text-base md:text-lg font-bold text-slate-800 tracking-tight pl-0.5 sm:pl-1 whitespace-nowrap">
              MSIS <span className="text-red-600 font-semibold">| Support</span>
            </span>
          </div>

          <div className="flex items-center shrink-0">
            <Button
              variant="primary"
              size="sm"
              onClick={handleTicketAction}
              leftIcon={<PlusCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />}
              className="h-8 sm:h-10 px-2.5 sm:px-4 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap"
            >
              <span className="hidden sm:inline">Submit a Ticket</span>
              <span className="sm:hidden">Submit Ticket</span>
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main Support Desk Overview */}
      <main className="max-w-4xl mx-auto px-3.5 sm:px-6 py-6 sm:py-10 md:py-14 w-full space-y-6 sm:space-y-8 md:space-y-12">
        {/* Simple Informative Hero */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center space-y-3 sm:space-y-4 max-w-2xl mx-auto px-2"
        >
          <motion.div variants={itemVariants} className="flex justify-center mb-1 sm:mb-2">
            <div className="flex items-center justify-center gap-2.5 sm:gap-3.5 p-1.5 sm:p-2 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <img
                src={southweLogo}
                alt="Southwestern University PHINMA"
                className="h-10 w-10 sm:h-14 sm:w-14 object-contain"
              />
              <div className="h-8 sm:h-10 w-px bg-slate-200" />
              <img
                src={medicineLogo}
                alt="MSIS Medicine"
                className="h-10 sm:h-14 w-auto object-contain"
              />
            </div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight"
          >
            MSIS Support Desk
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xs sm:text-sm md:text-base text-slate-500 leading-relaxed max-w-xl mx-auto"
          >
            Centralized support for reporting software bugs, system glitches, and technical issues across the MSIS platform.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 pt-1 sm:pt-2 w-full max-w-xs sm:max-w-none mx-auto"
          >
            <Button
              variant="primary"
              size="md"
              onClick={handleTicketAction}
              leftIcon={<PlusCircle className="h-4 w-4 shrink-0" />}
              className="h-10 sm:h-11 px-5 sm:px-6 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap w-full sm:w-auto shadow-xs justify-center"
            >
              Submit a Ticket
            </Button>

            <Button
              variant="outline"
              size="md"
              onClick={handleTicketAction}
              leftIcon={<Search className="h-4 w-4 shrink-0" />}
              className="h-10 sm:h-11 px-5 sm:px-6 rounded-xl text-xs font-semibold bg-white cursor-pointer whitespace-nowrap w-full sm:w-auto shadow-xs justify-center"
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
          className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5"
        >
          <motion.div variants={itemVariants} whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="h-full">
            <Card variant="default" className="bg-white border-slate-200/80 shadow-xs rounded-2xl p-4 sm:p-6 space-y-2.5 sm:space-y-3 h-full flex flex-col justify-between">
              <div className="space-y-2 sm:space-y-3">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <Bug className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Bug & Error Reports</h3>
                  <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed">
                    Submit software bugs, system crashes, display glitches, and unexpected errors with reproduction steps and file attachments.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="h-full">
            <Card variant="default" className="bg-white border-slate-200/80 shadow-xs rounded-2xl p-4 sm:p-6 space-y-2.5 sm:space-y-3 h-full flex flex-col justify-between">
              <div className="space-y-2 sm:space-y-3">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <Wrench className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Technical Support</h3>
                  <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed">
                    Assistance with account access, portal permissions, system configurations, and data sync issues for MSIS.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="h-full">
            <Card variant="default" className="bg-white border-slate-200/80 shadow-xs rounded-2xl p-4 sm:p-6 space-y-2.5 sm:space-y-3 h-full flex flex-col justify-between">
              <div className="space-y-2 sm:space-y-3">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Resolution Tracking</h3>
                  <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed">
                    Track investigation progress, review technical developer responses, and verify when bug fixes are deployed.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Support Information Bar */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-xs"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 text-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                <Clock className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-semibold text-slate-800 block text-xs sm:text-sm">Support Hours</span>
                <span className="text-slate-500 block text-[11px] sm:text-xs">Monday – Friday, 8:00 AM – 5:00 PM</span>
              </div>
            </div>

            <div className="flex items-center gap-3 min-w-0">
              <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                <Mail className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-semibold text-slate-800 block text-xs sm:text-sm">MSIS Technical Contact</span>
                <a
                  href="mailto:support@msis.edu"
                  className="text-slate-500 hover:text-red-600 transition-colors block text-[11px] sm:text-xs truncate"
                >
                  support@msis.edu
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Simple Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-4 sm:py-6 px-4 text-center text-slate-400">
        <p className="text-[11px] sm:text-xs tracking-tight">MSIS Support • Issue & Bug Tracking Desk</p>
      </footer>
    </div>
  );
};

export default PublicPage;
