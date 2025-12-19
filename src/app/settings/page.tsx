'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUser, useUpdateUser } from '@/hooks/useUser';
import { useToast } from '@/components/providers/ToastProvider';
import { Navigation } from '@/components/layout/Navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DistanceUnit } from '@/types';
import { Loader2, ChevronRight, Download, Trash2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { data: user, isLoading, refetch } = useUser();
  const updateUser = useUpdateUser();
  const { showToast } = useToast();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showExportSuccess, setShowExportSuccess] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p>Unable to load settings</p>
      </div>
    );
  }

  const handleDistanceToggle = () => {
    const newUnit: DistanceUnit = user.distanceUnit === 'km' ? 'miles' : 'km';
    updateUser.mutate({ distanceUnit: newUnit });
  };

  const handleExport = async () => {
    try {
      // Fetch comprehensive user data including logs, penalties, and achievements
      const response = await fetch('/api/user/export');
      if (!response.ok) {
        throw new Error('Failed to export data');
      }
      const exportData = await response.json();

      // Create downloadable JSON
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      // Download
      const link = document.createElement('a');
      link.href = url;
      link.download = `solofitness-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setShowExportSuccess(true);
      setTimeout(() => setShowExportSuccess(false), 3000);
    } catch (error) {
      console.error('Export failed:', error);
      showToast({
        type: 'error',
        title: 'Export Failed',
        message: 'Failed to export data. Please try again.',
      });
    }
  };

  const handleReset = async () => {
    try {
      const response = await fetch('/api/user/reset', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to reset data');
      }

      setShowResetConfirm(false);
      // Clear all caches to ensure fresh state after reset
      queryClient.clear();
      // Refetch user data
      refetch();
    } catch (error) {
      console.error('Reset failed:', error);
      showToast({
        type: 'error',
        title: 'Reset Failed',
        message: 'Failed to reset data. Please try again.',
      });
    }
  };

  return (
    <main className="min-h-screen bg-background-dark pb-20">
      <div className="max-w-md mx-auto p-4">
        {/* Header */}
        <header className="mb-6">
          <h1 className="font-heading text-3xl text-glow tracking-wide">
            SETTINGS
          </h1>
        </header>

        {/* Distance Unit */}
        <Card className="mb-4">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={handleDistanceToggle}
          >
            <div>
              <h3 className="font-semibold">Distance Unit</h3>
              <p className="text-sm text-primary-400/60">
                Currently using {user.distanceUnit === 'km' ? 'kilometers' : 'miles'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  user.distanceUnit === 'km'
                    ? 'bg-primary-600 text-white'
                    : 'bg-background-elevated text-primary-400/60'
                }`}
              >
                KM
              </span>
              <span
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  user.distanceUnit === 'miles'
                    ? 'bg-primary-600 text-white'
                    : 'bg-background-elevated text-primary-400/60'
                }`}
              >
                MI
              </span>
            </div>
          </div>
        </Card>

        {/* Data Management */}
        <h2 className="text-sm text-primary-400/60 uppercase tracking-wider mb-2 mt-6">
          Data Management
        </h2>

        <Card className="mb-4">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={handleExport}
          >
            <div className="flex items-center gap-3">
              <Download className="text-primary-400" size={20} />
              <div>
                <h3 className="font-semibold">Export Data</h3>
                <p className="text-sm text-primary-400/60">
                  Download your workout history
                </p>
              </div>
            </div>
            <ChevronRight className="text-primary-400/40" size={20} />
          </div>
        </Card>

        <AnimatePresence>
          {showExportSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-3 bg-success/20 border border-success/30 rounded-lg text-success text-sm"
            >
              Data exported successfully!
            </motion.div>
          )}
        </AnimatePresence>

        <Card className="mb-4">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setShowResetConfirm(true)}
          >
            <div className="flex items-center gap-3">
              <Trash2 className="text-danger" size={20} />
              <div>
                <h3 className="font-semibold text-danger">Reset All Data</h3>
                <p className="text-sm text-primary-400/60">
                  Delete all progress and start fresh
                </p>
              </div>
            </div>
            <ChevronRight className="text-primary-400/40" size={20} />
          </div>
        </Card>

        {/* About */}
        <h2 className="text-sm text-primary-400/60 uppercase tracking-wider mb-2 mt-6">
          About
        </h2>

        <Card>
          <div className="flex items-center gap-3">
            <Info className="text-primary-400" size={20} />
            <div>
              <h3 className="font-semibold">SoloFitness v3</h3>
              <p className="text-sm text-primary-400/60">
                Inspired by Solo Leveling & Duolingo
              </p>
            </div>
          </div>
        </Card>

        <p className="text-center text-xs text-primary-400/40 mt-8">
          &quot;I alone level up.&quot;
        </p>

        {/* Reset Confirmation Modal */}
        <AnimatePresence>
          {showResetConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
              onClick={() => setShowResetConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-background-card border border-danger/30 rounded-xl p-6 max-w-sm w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-danger mb-2">
                  Reset All Data?
                </h3>
                <p className="text-primary-400/80 mb-6">
                  This will permanently delete all your workout history, streaks,
                  and achievements. This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setShowResetConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    className="flex-1"
                    onClick={handleReset}
                  >
                    Reset
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Navigation />
    </main>
  );
}
