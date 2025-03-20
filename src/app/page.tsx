"use client";

import React from 'react';
import { GameProvider } from '@/context/GameContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatusPage } from '@/components/game/status/StatusPage';
import { QuestsPage } from '@/components/game/quests/QuestsPage';
import { ShopPage } from '@/components/game/shop/ShopPage';
import { InventoryPage } from '@/components/game/inventory/InventoryPage';
import { TrainingPage } from '@/components/game/training/TrainingPage';
import { useGame } from '@/context/GameContext';

// Tab Content component
function TabContent() {
  const { activeTab } = useGame();

  switch (activeTab) {
    case 'status':
      return <StatusPage />;
    case 'quests':
      return <QuestsPage />;
    case 'shop':
      return <ShopPage />;
    case 'inventory':
      return <InventoryPage />;
    case 'training':
      return <TrainingPage />;
    default:
      return <StatusPage />;
  }
}

// Wrapper component that uses the context
function AppContent() {
  return (
    <MainLayout>
      <TabContent />
    </MainLayout>
  );
}

// Main component with provider
export default function Home() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
