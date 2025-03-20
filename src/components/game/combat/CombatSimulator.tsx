"use client";

import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { CharacterAvatar } from '../common/CharacterAvatar';

type Enemy = {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  rank: 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
  icon: string;
  rewards: {
    exp: number;
    coins: number;
  };
};

type CombatAction = 'attack' | 'skill' | 'potion' | 'flee';
type CombatLog = {
  source: 'player' | 'enemy';
  message: string;
  damage?: number;
  critical?: boolean;
  heal?: boolean;
  buff?: boolean;
};

export function CombatSimulator() {
  const { player, addCoins, showNotification } = useGame();

  const [isInCombat, setIsInCombat] = useState(false);
  const [selectedEnemy, setSelectedEnemy] = useState<Enemy | null>(null);
  const [playerHp, setPlayerHp] = useState(player.hp);
  const [enemyHp, setEnemyHp] = useState(0);
  const [combatLogs, setCombatLogs] = useState<CombatLog[]>([]);
  const [turn, setTurn] = useState<'player' | 'enemy'>('player');
  const [isProcessingTurn, setIsProcessingTurn] = useState(false);
  const [combatResult, setCombatResult] = useState<'victory' | 'defeat' | 'fled' | null>(null);

  // List of enemies
  const enemies: Enemy[] = [
    {
      id: 'goblin',
      name: 'Lowly Goblin',
      level: 1,
      hp: 100,
      maxHp: 100,
      attack: 10,
      defense: 5,
      rank: 'E',
      icon: '👺',
      rewards: {
        exp: 30,
        coins: 50,
      },
    },
    {
      id: 'wolf',
      name: 'Wild Wolf',
      level: 3,
      hp: 180,
      maxHp: 180,
      attack: 15,
      defense: 7,
      rank: 'D',
      icon: '🐺',
      rewards: {
        exp: 60,
        coins: 100,
      },
    },
    {
      id: 'orc',
      name: 'Orc Warrior',
      level: 5,
      hp: 300,
      maxHp: 300,
      attack: 25,
      defense: 15,
      rank: 'C',
      icon: '👹',
      rewards: {
        exp: 120,
        coins: 200,
      },
    },
    {
      id: 'shadow-knight',
      name: 'Shadow Knight',
      level: 10,
      hp: 500,
      maxHp: 500,
      attack: 40,
      defense: 30,
      rank: 'B',
      icon: '🗡️',
      rewards: {
        exp: 250,
        coins: 400,
      },
    },
  ];

  // Combat skills derived from player skills
  const combatSkills = player.skills
    .filter(skill => skill.unlocked && skill.level > 0)
    .map(skill => {
      const attackMultiplier = skill.effects.find(e => e.description.includes('Attack'))?.value || 100;
      return {
        id: skill.id,
        name: skill.name,
        icon: skill.icon,
        damage: Math.floor(player.stats.STR * 5 * (attackMultiplier / 100)),
        description: skill.description,
        cooldown: 0,
        currentCooldown: 0,
      };
    });

  // Calculate player and enemy stats
  const calculatePlayerAttack = () => {
    return player.stats.STR * 5 + (player.stats.AGI * 2);
  };

  const calculatePlayerDefense = () => {
    return player.stats.VIT * 3;
  };

  const initializeCombat = (enemy: Enemy) => {
    setSelectedEnemy(enemy);
    setPlayerHp(player.hp);
    setEnemyHp(enemy.hp);
    setCombatLogs([]);
    setTurn('player');
    setIsInCombat(true);
    setCombatResult(null);
  };

  // Handle player actions
  const handlePlayerAction = (action: CombatAction, skillId?: string) => {
    if (!selectedEnemy || isProcessingTurn || turn !== 'player') return;

    setIsProcessingTurn(true);

    switch (action) {
      case 'attack':
        performPlayerAttack();
        break;
      case 'skill':
        if (skillId) {
          performPlayerSkill(skillId);
        }
        break;
      case 'potion':
        performPotion();
        break;
      case 'flee':
        attemptToFlee();
        break;
    }
  };

  const performPlayerAttack = () => {
    if (!selectedEnemy) return;

    const isCritical = Math.random() < player.stats.PER * 0.01;
    const playerAttack = calculatePlayerAttack();
    const rawDamage = isCritical ? playerAttack * 1.5 : playerAttack;
    const damage = Math.max(1, Math.floor(rawDamage - selectedEnemy.defense * 0.5));

    const newEnemyHp = Math.max(0, enemyHp - damage);
    setEnemyHp(newEnemyHp);

    setCombatLogs(prev => [
      ...prev,
      {
        source: 'player',
        message: isCritical ? 'Critical hit!' : 'You attacked',
        damage,
        critical: isCritical,
      }
    ]);

    if (newEnemyHp <= 0) {
      handleCombatVictory();
    } else {
      setTimeout(() => {
        setTurn('enemy');
        setIsProcessingTurn(false);
      }, 1500);
    }
  };

  const performPlayerSkill = (skillId: string) => {
    if (!selectedEnemy) return;

    const skill = combatSkills.find(s => s.id === skillId);
    if (!skill) return;

    const isCritical = Math.random() < player.stats.PER * 0.015;
    const rawDamage = isCritical ? skill.damage * 1.8 : skill.damage;
    const damage = Math.max(1, Math.floor(rawDamage - selectedEnemy.defense * 0.3));

    const newEnemyHp = Math.max(0, enemyHp - damage);
    setEnemyHp(newEnemyHp);

    setCombatLogs(prev => [
      ...prev,
      {
        source: 'player',
        message: `${skill.name} ${isCritical ? 'critical hit!' : 'hit!'}`,
        damage,
        critical: isCritical,
      }
    ]);

    if (newEnemyHp <= 0) {
      handleCombatVictory();
    } else {
      setTimeout(() => {
        setTurn('enemy');
        setIsProcessingTurn(false);
      }, 1500);
    }
  };

  // Use a potion to heal
  const performPotion = () => {
    const healAmount = Math.floor(player.maxHp * 0.3);
    const newHp = Math.min(player.maxHp, playerHp + healAmount);
    setPlayerHp(newHp);

    setCombatLogs(prev => [
      ...prev,
      {
        source: 'player',
        message: `Used a potion and healed for ${healAmount} HP!`,
        heal: true,
      }
    ]);

    setTimeout(() => {
      setTurn('enemy');
      setIsProcessingTurn(false);
    }, 1500);
  };

  const attemptToFlee = () => {
    const fleeChance = 0.3 + (player.stats.AGI * 0.02);
    const fled = Math.random() < fleeChance;

    if (fled) {
      setCombatLogs(prev => [
        ...prev,
        {
          source: 'player',
          message: 'Successfully fled from combat!',
        }
      ]);

      setTimeout(() => {
        setCombatResult('fled');
        setIsProcessingTurn(false);
        setIsInCombat(false);
      }, 1500);
    } else {
      setCombatLogs(prev => [
        ...prev,
        {
          source: 'player',
          message: 'Failed to flee!',
        }
      ]);

      setTimeout(() => {
        setTurn('enemy');
        setIsProcessingTurn(false);
      }, 1500);
    }
  };

  // Enemy turn
  useEffect(() => {
    if (isInCombat && turn === 'enemy' && selectedEnemy && !isProcessingTurn) {
      setIsProcessingTurn(true);

      // Simple enemy AI, just attacks the player
      setTimeout(() => {
        const rawDamage = selectedEnemy.attack;
        const playerDefense = calculatePlayerDefense();
        const damage = Math.max(1, Math.floor(rawDamage - playerDefense * 0.5));

        const newPlayerHp = Math.max(0, playerHp - damage);
        setPlayerHp(newPlayerHp);

        setCombatLogs(prev => [
          ...prev,
          {
            source: 'enemy',
            message: `${selectedEnemy.name} attacks!`,
            damage,
          }
        ]);

        if (newPlayerHp <= 0) {
          handleCombatDefeat();
        } else {
          setTurn('player');
          setIsProcessingTurn(false);
        }
      }, 1200);
    }
  }, [isInCombat, turn, selectedEnemy, isProcessingTurn, playerHp, calculatePlayerDefense]);

  const handleCombatVictory = () => {
    setTimeout(() => {
      setCombatResult('victory');
      setIsProcessingTurn(false);

      // Add rewards to player
      if (selectedEnemy) {
        const { exp, coins } = selectedEnemy.rewards;
        addCoins(coins);
        showNotification(`Victory! Gained ${exp} exp and ${coins} coins!`, 'success');
      }
    }, 1500);
  };

  const handleCombatDefeat = () => {
    setTimeout(() => {
      setCombatResult('defeat');
      setIsProcessingTurn(false);
      showNotification('You have been defeated!', 'error');
    }, 1500);
  };

  const resetCombat = () => {
    setIsInCombat(false);
    setSelectedEnemy(null);
    setCombatResult(null);
  };

  return (
    <div className="combat-simulator p-4">
      {!isInCombat ? (
        <div className="select-enemy">
          <h2 className="text-2xl font-bold text-[#00d4ff] mb-6">Combat Simulator</h2>

          <p className="mb-6 text-gray-300">
            Test your strength against monsters in simulated combat. Gain experience and rewards without risking your life!
          </p>

          <div className="enemies-list grid grid-cols-1 md:grid-cols-2 gap-4">
            {enemies.map(enemy => (
              <motion.div
                key={enemy.id}
                whileHover={{ scale: 1.03 }}
                className={cn(
                  "border border-gray-700 p-4 rounded-md cursor-pointer bg-[#0a1520]",
                  enemy.level > player.level * 1.5 && "border-red-700 bg-red-950/10"
                )}
                onClick={() => initializeCombat(enemy)}
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{enemy.icon}</div>
                  <div>
                    <h3 className="font-bold text-lg">{enemy.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>Level {enemy.level}</span>
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-xs",
                        enemy.rank === 'E' && "bg-blue-900/40 text-blue-300",
                        enemy.rank === 'D' && "bg-green-900/40 text-green-300",
                        enemy.rank === 'C' && "bg-yellow-900/40 text-yellow-300",
                        enemy.rank === 'B' && "bg-orange-900/40 text-orange-300",
                        enemy.rank === 'A' && "bg-red-900/40 text-red-300",
                        enemy.rank === 'S' && "bg-purple-900/40 text-purple-300"
                      )}>
                        {enemy.rank}-Rank
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-1 text-sm">
                  <div>HP: {enemy.hp}</div>
                  <div>Attack: {enemy.attack}</div>
                  <div>Defense: {enemy.defense}</div>
                  <div className="text-yellow-500">Coins: {enemy.rewards.coins}</div>
                </div>

                {enemy.level > player.level * 1.5 && (
                  <div className="mt-2 text-xs text-red-400">
                    Warning: This enemy might be too strong for you!
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="active-combat">
          {selectedEnemy && (
            <div className="combat-arena mb-4">
              {/* Combat header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  Combat: {player.name} vs {selectedEnemy.name}
                </h2>

                {!combatResult && (
                  <div className={cn(
                    "px-3 py-1 rounded-full text-sm border",
                    turn === 'player' ? "bg-blue-900/20 border-blue-800 text-blue-400" : "bg-red-900/20 border-red-800 text-red-400"
                  )}>
                    {turn === 'player' ? 'Your Turn' : 'Enemy Turn'}
                  </div>
                )}
              </div>

              {/* Combat area */}
              <div className="combat-area border border-[#192844] bg-[#050a14] p-6 mb-4 flex flex-col md:flex-row items-center justify-between">
                {/* Player side */}
                <div className="player-side text-center mb-6 md:mb-0">
                  <div className="flex justify-center mb-2">
                    <CharacterAvatar level={player.level} size="sm" />
                  </div>
                  <div className="font-bold text-sm mb-1">{player.name}</div>
                  <div className="text-xs mb-1">Level {player.level}</div>

                  {/* Player HP bar */}
                  <div className="mt-2 w-full max-w-xs">
                    <div className="flex justify-between text-xs mb-1">
                      <span>HP</span>
                      <span>{playerHp}/{player.maxHp}</span>
                    </div>
                    <div className="w-full bg-gray-900 h-2 rounded-sm overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-700 to-red-500 transition-all duration-300"
                        style={{ width: `${(playerHp / player.maxHp) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* VS */}
                <div className="text-xl font-bold text-gray-600 mx-6">VS</div>

                {/* Enemy side */}
                <div className="enemy-side text-center">
                  <div className="flex justify-center mb-2">
                    <div className="bg-[#0a1520] border border-red-900/30 rounded-full w-20 h-20 flex items-center justify-center text-4xl">
                      {selectedEnemy.icon}
                    </div>
                  </div>
                  <div className="font-bold text-sm mb-1">{selectedEnemy.name}</div>
                  <div className="text-xs mb-1">Level {selectedEnemy.level}</div>

                  {/* Enemy HP bar */}
                  <div className="mt-2 w-full max-w-xs">
                    <div className="flex justify-between text-xs mb-1">
                      <span>HP</span>
                      <span>{enemyHp}/{selectedEnemy.maxHp}</span>
                    </div>
                    <div className="w-full bg-gray-900 h-2 rounded-sm overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-700 to-red-500 transition-all duration-300"
                        style={{ width: `${(enemyHp / selectedEnemy.maxHp) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Combat result */}
              {combatResult && (
                <div className={cn(
                  "combat-result text-center p-6 border rounded-md mb-4",
                  combatResult === 'victory' && "border-green-600 bg-green-950/20",
                  combatResult === 'defeat' && "border-red-600 bg-red-950/20",
                  combatResult === 'fled' && "border-blue-600 bg-blue-950/20"
                )}>
                  <h3 className="text-xl font-bold mb-2">
                    {combatResult === 'victory' && "Victory!"}
                    {combatResult === 'defeat' && "Defeat!"}
                    {combatResult === 'fled' && "Escaped!"}
                  </h3>

                  {combatResult === 'victory' && selectedEnemy && (
                    <div>
                      <p className="mb-4">You have defeated {selectedEnemy.name}!</p>
                      <div className="flex justify-center gap-4">
                        <div className="text-blue-400">
                          <span className="font-bold">{selectedEnemy.rewards.exp}</span> EXP
                        </div>
                        <div className="text-yellow-400">
                          <span className="font-bold">{selectedEnemy.rewards.coins}</span> Coins
                        </div>
                      </div>
                    </div>
                  )}

                  {combatResult === 'defeat' && (
                    <p>You have been defeated. Better luck next time!</p>
                  )}

                  {combatResult === 'fled' && (
                    <p>You managed to escape from the battle.</p>
                  )}

                  <Button
                    className="mt-4 bg-blue-600 hover:bg-blue-700"
                    onClick={resetCombat}
                  >
                    Return to Monster Selection
                  </Button>
                </div>
              )}

              {/* Combat actions */}
              {!combatResult && (
                <div className="combat-actions border border-[#192844] bg-[#0a1520] p-4 mb-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Button
                      className="bg-[#192844] hover:bg-[#253756] transition-colors"
                      disabled={turn !== 'player' || isProcessingTurn}
                      onClick={() => handlePlayerAction('attack')}
                    >
                      Attack
                    </Button>

                    <Button
                      className="bg-[#1e3b44] hover:bg-[#254c56] transition-colors"
                      disabled={turn !== 'player' || isProcessingTurn || combatSkills.length === 0}
                      onClick={() => handlePlayerAction('skill', combatSkills[0]?.id)}
                    >
                      {combatSkills[0]?.name || "No Skills"}
                    </Button>

                    <Button
                      className="bg-[#2d3644] hover:bg-[#394556] transition-colors"
                      disabled={turn !== 'player' || isProcessingTurn || playerHp >= player.maxHp * 0.9}
                      onClick={() => handlePlayerAction('potion')}
                    >
                      Use Potion
                    </Button>

                    <Button
                      className="bg-[#442c36] hover:bg-[#563848] transition-colors"
                      disabled={turn !== 'player' || isProcessingTurn}
                      onClick={() => handlePlayerAction('flee')}
                    >
                      Flee
                    </Button>
                  </div>
                </div>
              )}

              {/* Combat log */}
              <div className="combat-log border border-[#192844] bg-[#050a14] p-4 h-48 overflow-y-auto">
                <h3 className="text-sm font-bold mb-2 text-gray-400">Combat Log</h3>
                <div className="space-y-1">
                  <AnimatePresence>
                    {combatLogs.map((log, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "text-sm py-1 border-b border-gray-800",
                          log.source === 'player' ? "text-blue-300" : "text-red-300"
                        )}
                      >
                        {log.message}
                        {log.damage && (
                          <span className={cn(
                            "ml-2 font-bold",
                            log.critical ? "text-yellow-400" : "text-white"
                          )}>
                            -{log.damage}
                          </span>
                        )}
                        {log.heal && <span className="ml-2 font-bold text-green-400">+heal</span>}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {combatLogs.length === 0 && (
                    <div className="text-sm text-gray-600 italic">
                      Combat has begun. Make your move!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
