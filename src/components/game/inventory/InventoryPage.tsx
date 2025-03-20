"use client";

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldIcon, Award, Package, CheckIcon, XIcon, InfoIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function InventoryPage() {
  const { player, equipItem, unequipItem, removeItem, addCoins } = useGame();
  const { inventory, equippedItems } = player;
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState('inventory');

  // Filter inventory by equipped status
  const equippedInventory = inventory.filter(item => item.isEquipped);
  const unequippedInventory = inventory.filter(item => !item.isEquipped);

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

  // Function to handle equipping an item
  const handleEquip = (item) => {
    equipItem(item.id);
  };

  // Function to handle unequipping an item
  const handleUnequip = (item) => {
    unequipItem(item.id);
  };

  // Function to handle selling an item
  const handleSell = (item) => {
    removeItem(item.id);
    addCoins(item.value);
  };

  return (
    <div className="inventory-container">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-4 uppercase neon-blue">INVENTORY</h2>
      </div>

      {/* Inventory Tabs */}
      <Tabs defaultValue="inventory" className="w-full">
        <div className="flex justify-center mb-6">
          <TabsList className="bg-gray-900/50 border border-gray-800">
            <TabsTrigger
              value="inventory"
              className="data-[state=active]:bg-blue-900/30 data-[state=active]:text-blue-400"
              onClick={() => setActiveTab('inventory')}
            >
              INVENTORY
            </TabsTrigger>
            <TabsTrigger
              value="equipped"
              className="data-[state=active]:bg-blue-900/30 data-[state=active]:text-blue-400"
              onClick={() => setActiveTab('equipped')}
            >
              EQUIPPED
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Main Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          {unequippedInventory.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Your inventory is empty. Visit the shop to purchase items.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unequippedInventory.map((item) => (
                <Card
                  key={item.id}
                  className="border border-gray-800 bg-black/40 backdrop-blur-sm hover:bg-gray-900/40 transition-colors"
                >
                  <CardHeader className="p-4 pb-0">
                    <div className="flex items-center justify-between">
                      <CardTitle className={cn("text-lg", getRankStyle(item.rank))}>{item.name}</CardTitle>
                      <span className={cn("text-sm font-medium px-2 py-1 rounded bg-gray-900", getRankStyle(item.rank))}>
                        {item.rank}-Rank
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4">
                    <div className="flex">
                      <div className="w-16 h-16 bg-gray-900 mr-4 flex items-center justify-center">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ShieldIcon className="h-8 w-8 text-gray-600" />
                        )}
                      </div>

                      <div className="flex-1">
                        <p className="text-sm text-gray-400 mb-2">{item.description}</p>

                        {/* Item Stats */}
                        {item.buffs && Object.keys(item.buffs).length > 0 && (
                          <div className="mb-2">
                            <h4 className="text-xs text-green-500 mb-1">-BUFF:</h4>
                            {Object.entries(item.buffs).map(([stat, value]) => (
                              <div key={stat} className="text-xs text-green-400">
                                -{stat} +{value}
                              </div>
                            ))}
                          </div>
                        )}

                        {item.debuffs && Object.keys(item.debuffs).length > 0 && (
                          <div>
                            <h4 className="text-xs text-red-500 mb-1">-DEBUFF:</h4>
                            {Object.entries(item.debuffs).map(([stat, value]) => (
                              <div key={stat} className="text-xs text-red-400">
                                -{stat} {value}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="p-4 pt-0 flex justify-between">
                    <div className="text-sm text-gray-400">
                      Value: <span className="text-yellow-500">{item.value}</span>
                    </div>

                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-400 border-red-800/50 hover:bg-red-900/30">
                            Sell
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-900 border-gray-800">
                          <DialogHeader>
                            <DialogTitle>Sell Item</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to sell {item.name} for {item.value} coins?
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="ghost" onClick={() => {}}>Cancel</Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleSell(item)}
                            >
                              Sell
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-400 border-blue-800/50 hover:bg-blue-900/30"
                        onClick={() => handleEquip(item)}
                      >
                        Equip
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Equipped Items Tab */}
        <TabsContent value="equipped" className="space-y-4">
          {equippedInventory.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ShieldIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>You don't have any equipped items.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {equippedInventory.map((item) => (
                <Card
                  key={item.id}
                  className="border border-gray-800 bg-black/40 backdrop-blur-sm hover:bg-gray-900/40 transition-colors"
                >
                  <CardHeader className="p-4 pb-0">
                    <div className="flex items-center justify-between">
                      <CardTitle className={cn("text-lg", getRankStyle(item.rank))}>{item.name}</CardTitle>
                      <div className="flex items-center">
                        <span className="text-green-500 mr-2">
                          <CheckIcon className="h-4 w-4" />
                        </span>
                        <span className={cn("text-sm font-medium px-2 py-1 rounded bg-gray-900", getRankStyle(item.rank))}>
                          {item.rank}-Rank
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4">
                    <div className="flex">
                      <div className="w-16 h-16 bg-gray-900 mr-4 flex items-center justify-center relative">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ShieldIcon className="h-8 w-8 text-gray-600" />
                        )}
                        <div className="absolute -top-2 -right-2 bg-green-500 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          E
                        </div>
                      </div>

                      <div className="flex-1">
                        <p className="text-sm text-gray-400 mb-2">{item.description}</p>

                        {/* Item Stats */}
                        {item.buffs && Object.keys(item.buffs).length > 0 && (
                          <div className="mb-2">
                            <h4 className="text-xs text-green-500 mb-1">-BUFF:</h4>
                            {Object.entries(item.buffs).map(([stat, value]) => (
                              <div key={stat} className="text-xs text-green-400">
                                -{stat} +{value}
                              </div>
                            ))}
                          </div>
                        )}

                        {item.debuffs && Object.keys(item.debuffs).length > 0 && (
                          <div>
                            <h4 className="text-xs text-red-500 mb-1">-DEBUFF:</h4>
                            {Object.entries(item.debuffs).map(([stat, value]) => (
                              <div key={stat} className="text-xs text-red-400">
                                -{stat} {value}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="p-4 pt-0 flex justify-between">
                    <div className="text-sm text-gray-400">
                      Category: <span className="text-white">{item.category}</span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="text-yellow-400 border-yellow-800/50 hover:bg-yellow-900/30"
                      onClick={() => handleUnequip(item)}
                    >
                      Unequip
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
