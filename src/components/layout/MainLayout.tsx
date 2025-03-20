"use client";

import React, { ReactNode } from 'react';
import { useGame } from '@/context/GameContext';
import { NotificationContainer } from '@/components/game/common/Notification';
import { cn } from '@/lib/utils';

// Navigation tabs
const tabs = [
  { id: 'status', label: 'STATUS' },
  { id: 'quests', label: 'QUESTS' },
  { id: 'shop', label: 'SHOP' },
  { id: 'inventory', label: 'INVENTORY' },
  { id: 'training', label: 'TRAINING' }
];

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { activeTab, setActiveTab, notifications, clearNotification } = useGame();

  return (
    <div className="min-h-screen bg-[#040a14] grid-pattern">
      <div className="max-w-5xl mx-auto p-4">
        {/* Header with Logo */}
        <header className="mb-8 text-center border border-[#00d4ff] p-4 shadow-[0_0_15px_rgba(0,212,255,0.3)]">
          <h1 className="text-4xl font-bold text-[#00d4ff] tracking-wider text-glow">
            SOLO LEVELING
          </h1>
          <p className="text-gray-400 text-sm mt-1">Rise from the Weakest Hunter</p>
        </header>

        {/* Navigation Tabs */}
        <nav className="mb-6">
          <div className="grid grid-cols-5 border border-[#00d4ff] shadow-[0_0_10px_rgba(0,212,255,0.2)]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "py-3 font-bold transition-all uppercase tracking-wider",
                  activeTab === tab.id
                    ? "bg-[#0a2d45] text-[#00d4ff]"
                    : "text-gray-400 hover:text-[#00d4ff] hover:bg-[#0a1d35]"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Game Content Container */}
        <div className="border border-[#00d4ff] shadow-[0_0_15px_rgba(0,212,255,0.2)]">
          <div className="relative">
            {/* Title Bar */}
            <div className="text-center border-b border-[#00d4ff] bg-[#061525] py-3">
              <h2 className="text-[#00d4ff] text-2xl font-bold uppercase tracking-widest text-glow">
                {activeTab}
              </h2>
            </div>

            {/* Main Content */}
            <main className="bg-[#040a14] min-h-[500px] p-4 relative">
              {/* Angled Corner Elements */}
              <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-[#00d4ff]"></div>
              <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-[#00d4ff]"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-[#00d4ff]"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-[#00d4ff]"></div>

              <div className="relative z-10 p-4">
                {children}
              </div>
            </main>
          </div>
        </div>

        {/* Notification System */}
        <NotificationContainer
          notifications={notifications}
          onClose={clearNotification}
        />

        {/* Footer */}
        <footer className="mt-8 text-center text-xs text-[#1a4a6b]">
          <p>© Solo Leveling Game System</p>
        </footer>
      </div>
    </div>
  );
}
