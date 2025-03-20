"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useGame } from '@/context/GameContext';
import { cn } from '@/lib/utils';

interface DungeonExplorationProps {
  questId: string;
  questTitle: string;
  questRank: string;
  isOpen: boolean;
  onClose: () => void;
}

type ExplorationStep = 'preparation' | 'exploration' | 'combat' | 'reward' | 'completed';

export function DungeonExploration({ questId, questTitle, questRank, isOpen, onClose }: DungeonExplorationProps) {
  const { player, showNotification, completeQuest, addCoins, addItem } = useGame();

  const [currentStep, setCurrentStep] = useState<ExplorationStep>('preparation');
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState('');
  const [encounterType, setEncounterType] = useState<'monster' | 'treasure' | 'trap' | null>(null);
  const [rewards, setRewards] = useState<{coins: number, exp: number, items: string[]}>({ coins: 0, exp: 0, items: [] });

  // Effect to handle the exploration progress
  useEffect(() => {
    if (!isOpen || currentStep !== 'exploration') return;

    const messages = [
      "Entering the dungeon...",
      "Navigating dark corridors...",
      "Exploring unknown territory...",
      "Detecting traces of monsters...",
      "Proceeding carefully..."
    ];

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      setProgress(currentProgress);

      // Update progress message
      if (currentProgress % 20 === 0) {
        const msgIndex = Math.floor(currentProgress / 20) % messages.length;
        setProgressMsg(messages[msgIndex]);
      }

      // Random encounters
      if (currentProgress === 30 || currentProgress === 65 || currentProgress === 85) {
        const rand = Math.random();
        if (rand < 0.6) {
          setEncounterType('monster');
          setCurrentStep('combat');
          clearInterval(interval);
        } else if (rand < 0.8) {
          setEncounterType('treasure');
          const coinAmount = Math.floor(Math.random() * 200) + 100;
          setRewards(prev => ({ ...prev, coins: prev.coins + coinAmount }));
          showNotification(`Found treasure! +${coinAmount} coins`, 'success');
        } else {
          setEncounterType('trap');
          showNotification('You triggered a trap! Careful!', 'error');
        }
      }

      // Exploration complete
      if (currentProgress >= 100) {
        clearInterval(interval);
        setCurrentStep('reward');

        // Calculate rewards based on quest rank
        const baseCoins = 100;
        const baseExp = 50;
        const rankMultiplier = { 'E': 1, 'D': 2, 'C': 4, 'B': 8, 'A': 16, 'S': 32 }[questRank] || 1;

        setRewards({
          coins: rewards.coins + baseCoins * rankMultiplier,
          exp: baseExp * rankMultiplier,
          items: []
        });
      }
    }, 200);

    return () => clearInterval(interval);
  }, [isOpen, currentStep, questRank, rewards, showNotification, encounterType]);

  // Handle combat resolution
  const resolveCombat = (victory: boolean) => {
    if (victory) {
      showNotification('Victory! You defeated the monster.', 'success');
      const monsterCoins = Math.floor(Math.random() * 50) + 25;
      setRewards(prev => ({ ...prev, coins: prev.coins + monsterCoins }));
    } else {
      showNotification('You retreated from combat.', 'info');
    }

    setEncounterType(null);
    setCurrentStep('exploration');
  };

  // Handle claiming rewards
  const claimRewards = () => {
    addCoins(rewards.coins);
    completeQuest(questId);
    setCurrentStep('completed');

    // Close after a delay
    setTimeout(() => onClose(), 2000);
  };

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('preparation');
      setProgress(0);
      setProgressMsg('');
      setEncounterType(null);
      setRewards({ coins: 0, exp: 0, items: [] });
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#040a14] border-[#00d4ff] max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[#00d4ff] text-center">
            {questTitle} <span className={`rank-${questRank.toLowerCase()}`}>({questRank}-Rank)</span>
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-[300px] relative">
          {/* Preparation step */}
          {currentStep === 'preparation' && (
            <div className="space-y-4">
              <p className="text-center">
                Prepare to enter the dungeon. Once you begin, you'll explore,
                encounter monsters, and find treasures.
              </p>

              <div className="bg-[#0a1520] border border-[#192844] p-3">
                <h3 className="text-sm font-bold mb-2">YOUR STATS</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>HP: {player.hp}/{player.maxHp}</div>
                  <div>IP: {player.ip}/{player.maxIp}</div>
                  <div>STR: {player.stats.STR}</div>
                  <div>AGI: {player.stats.AGI}</div>
                  <div>VIT: {player.stats.VIT}</div>
                  <div>INT: {player.stats.INT}</div>
                </div>
              </div>

              <div className="flex justify-center mt-4 space-x-4">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button
                  className="bg-[#00d4ff] text-black hover:bg-[#00a0c0]"
                  onClick={() => setCurrentStep('exploration')}
                >
                  Begin Exploration
                </Button>
              </div>
            </div>
          )}

          {/* Exploration step */}
          {currentStep === 'exploration' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-[#00d4ff] text-xl mb-2">Exploring Dungeon</h3>
                <p className="text-gray-400">{progressMsg}</p>
              </div>

              <Progress value={progress} className="h-2" />

              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="bg-[#0a1520] border border-[#192844] p-2">
                  <div className="text-[#00d4ff]">Distance</div>
                  <div>{Math.floor(progress)}%</div>
                </div>
                <div className="bg-[#0a1520] border border-[#192844] p-2">
                  <div className="text-[#00d4ff]">Dangers</div>
                  <div>{Math.floor(progress / 25)}</div>
                </div>
                <div className="bg-[#0a1520] border border-[#192844] p-2">
                  <div className="text-[#00d4ff]">Treasures</div>
                  <div>{rewards.coins > 0 ? Math.floor(rewards.coins / 100) : 0}</div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button variant="destructive" onClick={() => setCurrentStep('reward')}>
                  Retreat
                </Button>
              </div>
            </div>
          )}

          {/* Combat step */}
          {currentStep === 'combat' && (
            <div className="space-y-4">
              <h3 className="text-center text-red-500 text-xl">Monster Encounter!</h3>

              <div className="flex justify-center">
                <div className="w-32 h-32 bg-[#0a1520] border border-red-800 flex items-center justify-center">
                  <div className="text-6xl">👹</div>
                </div>
              </div>

              <p className="text-center text-sm">
                You've encountered a monster! What will you do?
              </p>

              <div className="flex justify-center space-x-4">
                <Button variant="destructive" onClick={() => resolveCombat(false)}>
                  Retreat
                </Button>
                <Button
                  className="bg-[#00d4ff] text-black hover:bg-[#00a0c0]"
                  onClick={() => resolveCombat(true)}
                >
                  Fight
                </Button>
              </div>
            </div>
          )}

          {/* Reward step */}
          {currentStep === 'reward' && (
            <div className="space-y-4">
              <h3 className="text-center text-[#00d4ff] text-xl">Quest {progress >= 100 ? 'Complete' : 'Abandoned'}</h3>

              <div className="bg-[#0a1520] border border-[#192844] p-4">
                <h4 className="text-center font-bold mb-3">Rewards</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-center">
                    <div className="text-yellow-500 text-xl mr-2">○</div>
                    <div className="font-bold">{rewards.coins} coins</div>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="text-blue-500 text-lg mr-2">✨</div>
                    <div className="font-bold">{progress >= 100 ? rewards.exp : Math.floor(rewards.exp * progress / 100)} XP</div>
                  </div>
                </div>

                {progress < 100 && (
                  <div className="text-center text-red-400 text-sm mt-4">
                    <p>Quest abandoned - reduced rewards</p>
                  </div>
                )}
              </div>

              <div className="flex justify-center">
                <Button
                  className="bg-[#00d4ff] text-black hover:bg-[#00a0c0]"
                  onClick={claimRewards}
                >
                  Claim Rewards
                </Button>
              </div>
            </div>
          )}

          {/* Completed step */}
          {currentStep === 'completed' && (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="text-4xl text-[#00d4ff]">✓</div>
              <h3 className="text-[#00d4ff]">Quest Completed!</h3>
              <p className="text-gray-400">Rewards have been added to your account</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
