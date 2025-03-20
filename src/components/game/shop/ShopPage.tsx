"use client";

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { ShoppingBag, Scroll } from 'lucide-react';

// Quest data
const questsForSale = [
  {
    id: 'shop-quest-1',
    title: 'E-Rank Type Quest',
    description: 'A simple quest suitable for novice hunters.',
    objective: 'Complete a basic training routine',
    category: 'QUEST',
    rank: 'E',
    value: 100,
    rewards: {
      exp: 25,
      coins: 50
    }
  },
  {
    id: 'shop-quest-2',
    title: 'D-Rank Type Quest',
    description: 'A moderate challenge for beginners.',
    objective: 'Defeat 3 monsters',
    category: 'QUEST',
    rank: 'D',
    value: 300,
    rewards: {
      exp: 75,
      coins: 150
    }
  },
  {
    id: 'shop-quest-3',
    title: 'C-Rank Type Quest',
    description: 'A challenging quest for intermediate hunters.',
    objective: 'Recover a stolen artifact',
    category: 'QUEST',
    rank: 'C',
    value: 2700,
    rewards: {
      exp: 200,
      coins: 500
    }
  },
  {
    id: 'shop-quest-4',
    title: 'B-Rank Type Quest',
    description: 'A difficult quest for experienced hunters.',
    objective: 'Clear the ancient dungeon',
    category: 'QUEST',
    rank: 'B',
    value: 75000,
    rewards: {
      exp: 800,
      coins: 2000
    }
  },
  {
    id: 'shop-quest-5',
    title: 'A-Rank Type Quest',
    description: 'A very dangerous mission for elite hunters only.',
    objective: 'Defeat the demon lord',
    category: 'QUEST',
    rank: 'A',
    value: 100000,
    rewards: {
      exp: 2000,
      coins: 5000
    }
  },
  {
    id: 'shop-quest-6',
    title: 'S-Rank Type Quest',
    description: 'The most challenging quest. Only for the strongest hunters.',
    objective: 'Save the world from destruction',
    category: 'QUEST',
    rank: 'S',
    value: 200000,
    rewards: {
      exp: 5000,
      coins: 20000
    }
  }
];

// Item data
const itemsForSale = [
  {
    id: 'shop-item-1',
    name: 'Basic Health Potion',
    description: 'Restores 50 HP instantly.',
    category: 'CONSUMABLE',
    rank: 'E',
    value: 50,
    image: '/images/health-potion.jpg'
  },
  {
    id: 'shop-item-2',
    name: 'Gauntlet of Lightning',
    description: 'A Red Gauntlet with Yellow Lines. Said to be worn by The Fastest Man Alive...',
    category: 'GAUNTLET',
    rank: 'S',
    value: 50000,
    buffs: {
      AGI: 20
    },
    image: '/images/gauntlet.jpg'
  },
  {
    id: 'shop-item-3',
    name: 'Elixir of Intelligence',
    description: 'Permanently increases intelligence by 5 points.',
    category: 'CONSUMABLE',
    rank: 'A',
    value: 10000,
    image: '/images/elixir.jpg'
  }
];

export function ShopPage() {
  const { player, addQuest, addItem, removeCoins, showNotification } = useGame();
  const [activeTab, setActiveTab] = useState<string>('buy');

  // Function to get rank color class
  const getRankStyle = (rank) => {
    switch(rank) {
      case 'S': return 'rank-s';
      case 'A': return 'rank-a';
      case 'B': return 'rank-b';
      case 'C': return 'rank-c';
      case 'D': return 'rank-d';
      case 'E': return 'rank-e';
      default: return '';
    }
  };

  // Function to purchase a quest
  const purchaseQuest = (quest) => {
    if (player.level < 7 && quest.rank === 'S') {
      showNotification('You need to be at least level 7 to purchase S-rank quests!', 'error');
      return;
    }

    if (player.level < 5 && quest.rank === 'A') {
      showNotification('You need to be at least level 5 to purchase A-rank quests!', 'error');
      return;
    }

    if (removeCoins(quest.value)) {
      addQuest({
        id: `purchased-${quest.id}-${Date.now()}`,
        title: quest.title,
        description: quest.description,
        objective: quest.objective,
        rank: quest.rank,
        rewards: quest.rewards,
        isCompleted: false
      });

      showNotification(`Purchased quest: ${quest.title}!`, 'success');
    }
  };

  // Function to purchase an item
  const purchaseItem = (item) => {
    if (removeCoins(item.value)) {
      addItem({
        id: `purchased-${item.id}-${Date.now()}`,
        name: item.name,
        description: item.description,
        category: item.category,
        rank: item.rank,
        value: Math.floor(item.value * 0.7), // Resale value is 70% of purchase price
        buffs: item.buffs,
        debuffs: item.debuffs,
        image: item.image
      });

      showNotification(`Purchased item: ${item.name}!`, 'success');
    }
  };

  return (
    <div className="shop-container">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-4 uppercase neon-blue">SHOP</h2>
      </div>

      {/* Shop Tabs */}
      <Tabs defaultValue="buy" className="w-full">
        <div className="flex justify-center mb-6">
          <TabsList className="bg-gray-900/50 border border-gray-800">
            <TabsTrigger
              value="buy"
              className="data-[state=active]:bg-blue-900/30 data-[state=active]:text-blue-400"
            >
              BUY
            </TabsTrigger>
            <TabsTrigger
              value="sell"
              className="data-[state=active]:bg-blue-900/30 data-[state=active]:text-blue-400"
            >
              SELL
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Player Coins */}
        <div className="mb-4 flex justify-end">
          <div className="bg-gray-900/80 border border-gray-800 px-4 py-2 rounded-md flex items-center">
            <span className="text-yellow-500 mr-2 text-xl">○</span>
            <span className="font-bold">{player.coins}</span>
          </div>
        </div>

        {/* Buy Tab */}
        <TabsContent value="buy" className="relative">
          {player.level < 3 && (
            <div className="text-red-500 mb-4 text-center">
              [You cannot buy anything at your level]
            </div>
          )}

          {/* Categories */}
          <div className="flex space-x-4 mb-6">
            <Button
              variant="ghost"
              className={cn(
                "flex items-center border-b-2",
                activeTab === 'buy' ? "border-blue-500 text-blue-400" : "border-transparent"
              )}
              onClick={() => setActiveTab('buy')}
            >
              <Scroll className="h-4 w-4 mr-2" /> Quests
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "flex items-center border-b-2",
                activeTab === 'items' ? "border-blue-500 text-blue-400" : "border-transparent"
              )}
              onClick={() => setActiveTab('items')}
            >
              <ShoppingBag className="h-4 w-4 mr-2" /> Items
            </Button>
          </div>

          {/* Quests for Sale */}
          {activeTab === 'buy' && (
            <div className="space-y-3">
              {questsForSale.map((quest) => (
                <div key={quest.id} className="flex items-center justify-between p-4 bg-gray-900/30 border border-gray-800 rounded-md">
                  <div className="flex items-center">
                    <div className={cn(
                      "w-10 h-10 mr-4 flex items-center justify-center rounded",
                      getRankStyle(quest.rank),
                      "bg-gray-900"
                    )}>
                      <div className="w-2 h-2 rounded-full bg-current"></div>
                    </div>
                    <div>
                      <h3 className="font-medium">{quest.title}</h3>
                      <div className="text-sm text-gray-400">
                        CATEGORY: <span className="text-gray-300">QUEST</span>
                      </div>
                      <div className="text-sm text-gray-400">
                        RANK: <span className={cn("font-medium", getRankStyle(quest.rank))}>{quest.rank}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400 mb-2">
                      VALUE: <span className="text-yellow-500">{quest.value}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-green-900/30 hover:bg-green-900/50 border-green-700"
                      disabled={player.coins < quest.value || player.level < 3}
                      onClick={() => purchaseQuest(quest)}
                    >
                      BUY
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Items for Sale */}
          {activeTab === 'items' && (
            <div className="space-y-3">
              {itemsForSale.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-900/30 border border-gray-800 rounded-md">
                  <div className="flex items-center">
                    <div className="w-12 h-12 mr-4 bg-gray-900 flex items-center justify-center">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="h-6 w-6 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <div className="text-sm text-gray-400">
                        CATEGORY: <span className="text-gray-300">{item.category}</span>
                      </div>
                      <div className="text-sm text-gray-400">
                        RANK: <span className={cn("font-medium", getRankStyle(item.rank))}>{item.rank}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400 mb-2">
                      VALUE: <span className="text-yellow-500">{item.value}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-green-900/30 hover:bg-green-900/50 border-green-700"
                      disabled={player.coins < item.value || player.level < 3}
                      onClick={() => purchaseItem(item)}
                    >
                      BUY
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Sell Tab */}
        <TabsContent value="sell" className="space-y-4">
          {player.inventory.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Your inventory is empty. Purchase items to sell them later.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Placeholder for sell functionality */}
              <div className="text-center py-6 text-gray-300">
                <p>Select items from your inventory to sell them.</p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
