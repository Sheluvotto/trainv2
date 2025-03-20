"use client";

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PlusIcon } from 'lucide-react';
import { CharacterAvatar } from '../common/CharacterAvatar';

export function StatusPage() {
  const { player, updateStat } = useGame();

  const expPercentage = Math.floor((player.exp / player.expToNextLevel) * 100);
  const hpPercentage = Math.floor((player.hp / player.maxHp) * 100);
  const ipPercentage = Math.floor((player.ip / player.maxIp) * 100);

  // Track which stat was recently increased
  const [recentlyIncreasedStat, setRecentlyIncreasedStat] = useState<string | null>(null);

  const statIcons = {
    STR: '💪',
    VIT: '❤️',
    AGI: '🏃',
    INT: '🧠',
    PER: '👁️',
    CMD: '👑',
  };

  const statNames = {
    STR: 'Strength',
    VIT: 'Vitality',
    AGI: 'Agility',
    INT: 'Intelligence',
    PER: 'Perception',
    CMD: 'Command',
  };

  const physicalStats = ['STR', 'VIT', 'AGI'];
  const mentalStats = ['INT', 'PER', 'CMD'];

  // Function to add stat point with animation
  const addStatPoint = (stat) => {
    updateStat(stat, 1);

    // Set animation state
    setRecentlyIncreasedStat(stat);

    // Clear animation after 1 second
    setTimeout(() => {
      setRecentlyIncreasedStat(null);
    }, 1000);
  };

  // Function to check if stat can be upgraded
  const canUpgradeStat = (stat) => {
    const isPhysicalStat = physicalStats.includes(stat);
    const pointType = isPhysicalStat ? 'physical' : 'mental';
    return player.availableStatPoints[pointType] > 0;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* Character Avatar Column */}
      <div className="md:col-span-2 flex flex-col items-center justify-center gap-4">
        <CharacterAvatar
          level={player.level}
          size="md"
          glowColor={player.level >= 10 ? 'purple' : 'blue'}
        />
      </div>

      {/* Player Info Card */}
      <div className="md:col-span-5 border border-[#00d4ff] bg-[#040a14] p-5">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold mb-1">NAME: <span className="text-white">{player.name}</span></h3>
            <p className="text-gray-400">JOB: <span className="text-white">{player.job}</span></p>
            <p className="text-gray-400">TITLE: <span className="text-white">{player.title}</span></p>
          </div>
          <div className="text-right">
            <div className="text-[#00d4ff] text-6xl font-bold text-glow">
              {player.level}
            </div>
            <div className="text-xs text-gray-400">LEVEL</div>
          </div>
        </div>

        {/* HP Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>HP: {player.hp}/{player.maxHp}</span>
          </div>
          <div className="h-2 w-full bg-gray-900 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-800 to-red-500 transition-all duration-500"
              style={{ width: `${hpPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* IP Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>IP: {player.ip}/{player.maxIp}</span>
          </div>
          <div className="h-2 w-full bg-gray-900 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-800 to-blue-500 transition-all duration-500"
              style={{ width: `${ipPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* XP Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>XP required to go to next Level: {player.exp}/{player.expToNextLevel}</span>
          </div>
          <div className="h-2 w-full bg-gray-900 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-800 to-green-400 transition-all duration-500"
              style={{ width: `${expPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Coins */}
        <div className="flex items-center mt-6 p-3 border border-[#192844] bg-[#060d1b]">
          <div className="mr-2">
            <span className="text-yellow-500 text-xl">○</span>
          </div>
          <div className="font-bold">{player.coins}</div>
        </div>
      </div>

      {/* Stats Display */}
      <div className="md:col-span-5 border border-[#00d4ff] bg-[#040a14] p-5">
        <h3 className="text-xl font-bold mb-5">Hunter Stats</h3>

        {/* Physical Stats */}
        <div className="mb-5">
          <h4 className="text-sm text-gray-400 mb-3 flex items-center">
            PHYSICAL STATS
            <span className="ml-2 px-2 py-1 bg-blue-900/30 text-xs rounded">
              Available Points: {player.availableStatPoints.physical}
            </span>
          </h4>

          <div className="space-y-2">
            {physicalStats.map((stat) => (
              <div
                key={stat}
                className={cn(
                  "flex items-center justify-between p-2 border transition-all duration-200",
                  "bg-[#0a1520] border-[#192844] hover:bg-[#0a1e30]",
                  recentlyIncreasedStat === stat && "animate-pulse border-green-500 bg-[#0a2522]"
                )}
              >
                <div className="flex items-center">
                  <span className="mr-2">{statIcons[stat]}</span>
                  <span>{statNames[stat]}</span>
                </div>
                <div className="flex items-center">
                  <div className={cn(
                    "font-bold mr-2 transition-all",
                    recentlyIncreasedStat === stat ? "animate-stat-increase text-green-400" : ""
                  )}>
                    {player.stats[stat]} <span className="text-green-400">(+20)</span>
                  </div>
                  <Button
                    className={
                      canUpgradeStat(stat)
                        ? "h-6 w-6 p-0 bg-transparent text-green-400 border border-[#192844] hover:border-green-400 transition-colors"
                        : "h-6 w-6 p-0 bg-transparent text-gray-600 border border-[#192844] cursor-not-allowed"
                    }
                    disabled={!canUpgradeStat(stat)}
                    onClick={() => addStatPoint(stat)}
                  >
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mental Stats */}
        <div>
          <h4 className="text-sm text-gray-400 mb-3 flex items-center">
            MENTAL STATS
            <span className="ml-2 px-2 py-1 bg-purple-900/30 text-xs rounded">
              Available Points: {player.availableStatPoints.mental}
            </span>
          </h4>

          <div className="space-y-2">
            {mentalStats.map((stat) => (
              <div
                key={stat}
                className={cn(
                  "flex items-center justify-between p-2 border transition-all duration-200",
                  "bg-[#0a1520] border-[#192844] hover:bg-[#0a1e30]",
                  recentlyIncreasedStat === stat && "animate-pulse border-purple-500 bg-[#0a1d30]"
                )}
              >
                <div className="flex items-center">
                  <span className="mr-2">{statIcons[stat]}</span>
                  <span>{statNames[stat]}</span>
                </div>
                <div className="flex items-center">
                  <div className={cn(
                    "font-bold mr-2 transition-all",
                    recentlyIncreasedStat === stat ? "animate-stat-increase text-purple-400" : ""
                  )}>
                    {player.stats[stat]} <span className="text-green-400">(+20)</span>
                  </div>
                  <Button
                    className={
                      canUpgradeStat(stat)
                        ? "h-6 w-6 p-0 bg-transparent text-green-400 border border-[#192844] hover:border-green-400 transition-colors"
                        : "h-6 w-6 p-0 bg-transparent text-gray-600 border border-[#192844] cursor-not-allowed"
                    }
                    disabled={!canUpgradeStat(stat)}
                    onClick={() => addStatPoint(stat)}
                  >
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
