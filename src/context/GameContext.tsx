"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

// Define our types
export type Stats = {
  STR: number; // Strength
  VIT: number; // Vitality
  AGI: number; // Agility
  INT: number; // Intelligence
  PER: number; // Perception
  CMD: number; // Command
};

export type StatBonuses = {
  [key in keyof Stats]?: number;
};

export type ItemRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export interface Item {
  id: string;
  name: string;
  description: string;
  category: string;
  rank: ItemRank;
  value: number;
  buffs?: StatBonuses;
  debuffs?: StatBonuses;
  isEquipped?: boolean;
  image?: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  objective: string;
  rank: ItemRank;
  rewards: {
    exp: number;
    coins: number;
    items?: Item[];
  };
  isCompleted?: boolean;
  image?: string;
}

// Types for skills and skill tree
export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
  level: number;
  maxLevel: number;
  requiredLevel: number;
  statRequirements?: Partial<Record<keyof Stats, number>>;
  parentSkillId?: string;
  unlocked: boolean;
  effects: {
    description: string;
    value: number;
    valuePerLevel?: number;
  }[];
  skillPoints: number;
}

// Update PlayerState interface to include skills
export interface PlayerState {
  name: string;
  level: number;
  job: string;
  title: string;
  hp: number;
  maxHp: number;
  ip: number; // Intelligence Points equivalent to MP
  maxIp: number;
  exp: number;
  expToNextLevel: number;
  stats: Stats;
  coins: number;
  inventory: Item[];
  equippedItems: {
    [key: string]: Item | null;
  };
  quests: Quest[];
  dailyQuests: Quest[];
  skills: Skill[];
  availableSkillPoints: number;
  availableStatPoints: {
    physical: number; // For STR, AGI, VIT
    mental: number;   // For INT, PER, CMD
  };
  lastDailyQuestReset?: number;
}

// Update GameContextType to include skill-related functions
export interface GameContextType {
  player: PlayerState;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  notifications: { id: string; message: string; type: 'success' | 'error' | 'info' }[];
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  clearNotification: (id: string) => void;
  updateStat: (stat: keyof Stats, amount: number) => void;
  addItem: (item: Item) => void;
  removeItem: (itemId: string) => void;
  equipItem: (itemId: string) => void;
  unequipItem: (itemId: string) => void;
  addQuest: (quest: Quest) => void;
  completeQuest: (questId: string) => void;
  addCoins: (amount: number) => void;
  removeCoins: (amount: number) => boolean;
  startTraining: (stat: keyof Stats, duration: number) => void;
  isTraining: boolean;
  trainingStat: keyof Stats | null;
  trainingTimeLeft: number;
  trainingProgress: number;
  cancelTraining: () => void;

  // Skill-related functions
  upgradeSkill: (skillId: string) => boolean;
  unlockSkill: (skillId: string) => boolean;
  addSkillPoints: (amount: number) => void;

  // Daily quests
  resetDailyQuests: () => void;
  checkAndResetDailyQuests: () => void;
}

// Define initial skills
const initialSkills: Skill[] = [
  {
    id: "combat-mastery",
    name: "Combat Mastery",
    description: "Basic combat techniques that increase your effectiveness in battle.",
    icon: "⚔️",
    level: 0,
    maxLevel: 5,
    requiredLevel: 1,
    unlocked: true,
    effects: [
      {
        description: "Attack power",
        value: 10,
        valuePerLevel: 5
      },
      {
        description: "Critical hit chance",
        value: 3,
        valuePerLevel: 1
      }
    ],
    skillPoints: 0
  },
  {
    id: "physical-enhancement",
    name: "Physical Enhancement",
    description: "Strengthen your body beyond normal human limits.",
    icon: "💪",
    level: 0,
    maxLevel: 3,
    requiredLevel: 3,
    statRequirements: { STR: 10 },
    parentSkillId: "combat-mastery",
    unlocked: false,
    effects: [
      {
        description: "STR bonus",
        value: 5,
        valuePerLevel: 5
      },
      {
        description: "VIT bonus",
        value: 5,
        valuePerLevel: 5
      }
    ],
    skillPoints: 0
  },
  {
    id: "dagger-proficiency",
    name: "Dagger Proficiency",
    description: "Master the art of dagger combat, enabling rapid strikes.",
    icon: "🗡️",
    level: 0,
    maxLevel: 4,
    requiredLevel: 2,
    statRequirements: { AGI: 5 },
    parentSkillId: "combat-mastery",
    unlocked: false,
    effects: [
      {
        description: "Attack speed",
        value: 10,
        valuePerLevel: 5
      },
      {
        description: "Chance to inflict bleeding",
        value: 5,
        valuePerLevel: 3
      }
    ],
    skillPoints: 0
  },
  {
    id: "mana-control",
    name: "Mana Control",
    description: "Learn to manipulate mana more efficiently.",
    icon: "✨",
    level: 0,
    maxLevel: 5,
    requiredLevel: 3,
    statRequirements: { INT: 10 },
    unlocked: false,
    effects: [
      {
        description: "IP efficiency",
        value: 10,
        valuePerLevel: 5
      },
      {
        description: "Magic damage",
        value: 5,
        valuePerLevel: 3
      }
    ],
    skillPoints: 0
  },
  {
    id: "shadow-extraction",
    name: "Shadow Extraction",
    description: "Extract and store shadows from defeated enemies.",
    icon: "👤",
    level: 0,
    maxLevel: 1,
    requiredLevel: 10,
    statRequirements: { INT: 20, CMD: 15 },
    unlocked: false,
    effects: [
      {
        description: "Shadow storage capacity",
        value: 1,
        valuePerLevel: 0
      }
    ],
    skillPoints: 0
  },
  {
    id: "shadow-soldier",
    name: "Shadow Soldier",
    description: "Command your extracted shadows to fight alongside you.",
    icon: "🧟",
    level: 0,
    maxLevel: 3,
    requiredLevel: 15,
    parentSkillId: "shadow-extraction",
    unlocked: false,
    effects: [
      {
        description: "Shadow soldier strength",
        value: 20,
        valuePerLevel: 15
      },
      {
        description: "Max shadow soldiers",
        value: 1,
        valuePerLevel: 1
      }
    ],
    skillPoints: 0
  }
];

// Update initialPlayerState to include skills
const initialPlayerState: PlayerState = {
  name: "SUNG JIN-WOO",
  level: 2,
  job: "NONE",
  title: "NONE",
  hp: 160,
  maxHp: 160,
  ip: 10,
  maxIp: 10,
  exp: 0,
  expToNextLevel: 66,
  stats: {
    STR: 0,
    VIT: 0,
    AGI: 0,
    INT: 0,
    PER: 0,
    CMD: 0
  },
  coins: 1000,
  inventory: [],
  equippedItems: {
    weapon: null,
    armor: null,
    helmet: null,
    gauntlet: null,
    boots: null,
    accessory: null
  },
  quests: [{
    id: "quest-1",
    title: "Courage of the Weak",
    description: "Become a Player and start your journey.",
    objective: "Become a Player",
    rank: "E",
    rewards: {
      exp: 50,
      coins: 100
    },
    isCompleted: false,
    image: "/images/quest-1.png"
  }],
  dailyQuests: [],
  skills: initialSkills,
  availableSkillPoints: 0,
  availableStatPoints: {
    physical: 6,
    mental: 1
  },
  lastDailyQuestReset: Date.now()
};

// Create the context
export const GameContext = createContext<GameContextType | undefined>(undefined);

// Create a provider component
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from localStorage or use default
  const [player, setPlayer] = useState<PlayerState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('player');
      return saved ? JSON.parse(saved) : initialPlayerState;
    }
    return initialPlayerState;
  });

  const [activeTab, setActiveTab] = useState<string>('status');
  const [notifications, setNotifications] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([]);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [trainingStat, setTrainingStat] = useState<keyof Stats | null>(null);
  const [trainingTimeLeft, setTrainingTimeLeft] = useState<number>(0);
  const [trainingProgress, setTrainingProgress] = useState<number>(0);
  const [trainingInterval, setTrainingInterval] = useState<NodeJS.Timeout | null>(null);

  // Save to localStorage whenever player state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('player', JSON.stringify(player));
    }
  }, [player]);

  // Show notification
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);

    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      clearNotification(id);
    }, 5000);

    return id;
  };

  // Clear notification
  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  // Update a player stat
  const updateStat = (stat: keyof Stats, amount: number) => {
    setPlayer(prev => {
      // Check if we're using available stat points
      if (amount > 0) {
        const isPhysicalStat = ['STR', 'VIT', 'AGI'].includes(stat);
        const pointType = isPhysicalStat ? 'physical' : 'mental';

        // Check if we have enough points
        if (prev.availableStatPoints[pointType] < amount) {
          showNotification(`Not enough ${pointType} stat points available!`, 'error');
          return prev;
        }

        // Update available points
        const newAvailablePoints = {
          ...prev.availableStatPoints,
          [pointType]: prev.availableStatPoints[pointType] - amount
        };

        // Update the stat
        const newStats = {
          ...prev.stats,
          [stat]: prev.stats[stat] + amount
        };

        // Also update HP/IP if needed
        let newHp = prev.maxHp;
        let newMaxHp = prev.maxHp;
        let newIp = prev.ip;
        let newMaxIp = prev.maxIp;

        if (stat === 'VIT') {
          newMaxHp = 100 + (newStats.VIT * 20);
          newHp = newMaxHp;
        }

        if (stat === 'INT') {
          newMaxIp = 5 + (newStats.INT * 5);
          newIp = newMaxIp;
        }

        return {
          ...prev,
          stats: newStats,
          hp: newHp,
          maxHp: newMaxHp,
          ip: newIp,
          maxIp: newMaxIp,
          availableStatPoints: newAvailablePoints
        };
      }

      // Otherwise just update the stat directly
      return {
        ...prev,
        stats: {
          ...prev.stats,
          [stat]: Math.max(0, prev.stats[stat] + amount)
        }
      };
    });
  };

  // Add an item to inventory
  const addItem = (item: Item) => {
    setPlayer(prev => ({
      ...prev,
      inventory: [...prev.inventory, { ...item, isEquipped: false }]
    }));

    showNotification(`Acquired ${item.name}!`, 'success');
  };

  // Remove an item from inventory
  const removeItem = (itemId: string) => {
    setPlayer(prev => {
      const itemToRemove = prev.inventory.find(item => item.id === itemId);

      if (!itemToRemove) {
        showNotification("Item not found in inventory!", 'error');
        return prev;
      }

      // If item is equipped, unequip it first
      if (itemToRemove.isEquipped) {
        for (const slot in prev.equippedItems) {
          if (prev.equippedItems[slot]?.id === itemId) {
            prev.equippedItems[slot] = null;
          }
        }
      }

      return {
        ...prev,
        inventory: prev.inventory.filter(item => item.id !== itemId)
      };
    });
  };

  // Equip an item
  const equipItem = (itemId: string) => {
    setPlayer(prev => {
      const itemToEquip = prev.inventory.find(item => item.id === itemId);

      if (!itemToEquip) {
        showNotification("Item not found in inventory!", 'error');
        return prev;
      }

      // Determine which slot to equip to based on category
      const slot = itemToEquip.category.toLowerCase();

      // Check if something is already equipped in that slot
      if (prev.equippedItems[slot]) {
        // Unequip the current item
        const currentEquippedItem = prev.equippedItems[slot];
        if (currentEquippedItem) {
          prev.inventory = prev.inventory.map(item =>
            item.id === currentEquippedItem.id ? { ...item, isEquipped: false } : item
          );
        }
      }

      // Update the inventory to mark item as equipped
      const updatedInventory = prev.inventory.map(item =>
        item.id === itemId ? { ...item, isEquipped: true } : item
      );

      // Update the equipped items
      const updatedEquippedItems = {
        ...prev.equippedItems,
        [slot]: itemToEquip
      };

      showNotification(`Equipped ${itemToEquip.name}!`, 'success');

      return {
        ...prev,
        inventory: updatedInventory,
        equippedItems: updatedEquippedItems
      };
    });
  };

  // Unequip an item
  const unequipItem = (itemId: string) => {
    setPlayer(prev => {
      // Find which slot has this item
      let slotToUnequip: string | null = null;

      for (const slot in prev.equippedItems) {
        if (prev.equippedItems[slot]?.id === itemId) {
          slotToUnequip = slot;
          break;
        }
      }

      if (!slotToUnequip) {
        showNotification("Item is not equipped!", 'error');
        return prev;
      }

      // Update the inventory to mark item as not equipped
      const updatedInventory = prev.inventory.map(item =>
        item.id === itemId ? { ...item, isEquipped: false } : item
      );

      // Update the equipped items
      const updatedEquippedItems = {
        ...prev.equippedItems,
        [slotToUnequip]: null
      };

      const itemName = prev.inventory.find(item => item.id === itemId)?.name || "item";
      showNotification(`Unequipped ${itemName}!`, 'info');

      return {
        ...prev,
        inventory: updatedInventory,
        equippedItems: updatedEquippedItems
      };
    });
  };

  // Add a quest
  const addQuest = (quest: Quest) => {
    setPlayer(prev => ({
      ...prev,
      quests: [...prev.quests, { ...quest, isCompleted: false }]
    }));

    showNotification(`New quest: ${quest.title}!`, 'info');
  };

  // Complete a quest
  const completeQuest = (questId: string) => {
    setPlayer(prev => {
      const questToComplete = prev.quests.find(quest => quest.id === questId);

      if (!questToComplete || questToComplete.isCompleted) {
        return prev;
      }

      // Update the quest to completed
      const updatedQuests = prev.quests.map(quest =>
        quest.id === questId ? { ...quest, isCompleted: true } : quest
      );

      // Apply rewards
      const newExp = prev.exp + questToComplete.rewards.exp;
      const newCoins = prev.coins + questToComplete.rewards.coins;

      // Check if leveled up
      let newLevel = prev.level;
      let newExpToNextLevel = prev.expToNextLevel;
      let expRemaining = 0;

      if (newExp >= prev.expToNextLevel) {
        newLevel += 1;
        expRemaining = newExp - prev.expToNextLevel;
        newExpToNextLevel = Math.floor(prev.expToNextLevel * 1.5);

        // Grant stat points on level up
        const newAvailablePoints = {
          physical: prev.availableStatPoints.physical + 3,
          mental: prev.availableStatPoints.mental + 1
        };

        // Grant skill points on level up (1 skill point every 3 levels)
        const newSkillPoints = prev.availableSkillPoints + (newLevel % 3 === 0 ? 1 : 0);

        showNotification(`Level Up! You are now level ${newLevel}!`, 'success');

        return {
          ...prev,
          quests: updatedQuests,
          exp: expRemaining,
          level: newLevel,
          expToNextLevel: newExpToNextLevel,
          coins: newCoins,
          availableStatPoints: newAvailablePoints,
          availableSkillPoints: newSkillPoints
        };
      }

      showNotification(`Quest completed: ${questToComplete.title}!`, 'success');

      return {
        ...prev,
        quests: updatedQuests,
        exp: newExp,
        coins: newCoins
      };
    });
  };

  // Add coins to player
  const addCoins = (amount: number) => {
    if (amount <= 0) return;

    setPlayer(prev => ({
      ...prev,
      coins: prev.coins + amount
    }));

    showNotification(`Received ${amount} coins!`, 'success');
  };

  // Remove coins from player (returns true if successful)
  const removeCoins = (amount: number): boolean => {
    if (amount <= 0) return true;

    let success = false;

    setPlayer(prev => {
      if (prev.coins < amount) {
        showNotification(`Not enough coins! Need ${amount} coins.`, 'error');
        return prev;
      }

      success = true;
      return {
        ...prev,
        coins: prev.coins - amount
      };
    });

    return success;
  };

  // Start training a stat
  const startTraining = (stat: keyof Stats, duration: number) => {
    if (isTraining) {
      showNotification("Already training!", 'error');
      return;
    }

    setIsTraining(true);
    setTrainingStat(stat);
    setTrainingTimeLeft(duration);
    setTrainingProgress(0);

    // Start training interval
    const interval = setInterval(() => {
      setTrainingTimeLeft(prev => {
        if (prev <= 1) {
          // Training complete
          clearInterval(interval);
          setTrainingInterval(null);
          setIsTraining(false);
          setTrainingProgress(100);

          // Improve the stat
          updateStat(stat, 20);
          showNotification(`Training complete! +20 ${stat}!`, 'success');

          setTimeout(() => {
            setTrainingStat(null);
            setTrainingTimeLeft(0);
            setTrainingProgress(0);
          }, 3000);

          return 0;
        }

        // Update progress
        setTrainingProgress(Math.floor(((duration - (prev - 1)) / duration) * 100));
        return prev - 1;
      });
    }, 1000);

    setTrainingInterval(interval);
    showNotification(`Started training ${stat}!`, 'info');
  };

  // Cancel training
  const cancelTraining = () => {
    if (!isTraining) return;

    if (trainingInterval) {
      clearInterval(trainingInterval);
      setTrainingInterval(null);
    }

    setIsTraining(false);
    setTrainingStat(null);
    setTrainingTimeLeft(0);
    setTrainingProgress(0);

    showNotification("Training cancelled!", 'info');
  };

  // New function to upgrade a skill
  const upgradeSkill = (skillId: string): boolean => {
    let success = false;

    setPlayer(prev => {
      // Find the skill
      const skillIndex = prev.skills.findIndex(s => s.id === skillId);
      if (skillIndex === -1) {
        showNotification("Skill not found!", 'error');
        return prev;
      }

      const skill = prev.skills[skillIndex];

      // Check if skill is already at max level
      if (skill.level >= skill.maxLevel) {
        showNotification(`${skill.name} is already at max level!`, 'error');
        return prev;
      }

      // Check if skill is unlocked
      if (!skill.unlocked) {
        showNotification(`${skill.name} is not unlocked yet!`, 'error');
        return prev;
      }

      // Check if player has enough skill points
      if (prev.availableSkillPoints <= 0) {
        showNotification("Not enough skill points!", 'error');
        return prev;
      }

      // All checks passed, upgrade the skill
      const updatedSkills = [...prev.skills];
      updatedSkills[skillIndex] = {
        ...skill,
        level: skill.level + 1,
        skillPoints: skill.skillPoints + 1
      };

      success = true;
      showNotification(`${skill.name} upgraded to level ${skill.level + 1}!`, 'success');

      return {
        ...prev,
        skills: updatedSkills,
        availableSkillPoints: prev.availableSkillPoints - 1
      };
    });

    return success;
  };

  // New function to unlock a skill
  const unlockSkill = (skillId: string): boolean => {
    let success = false;

    setPlayer(prev => {
      // Find the skill
      const skillIndex = prev.skills.findIndex(s => s.id === skillId);
      if (skillIndex === -1) {
        showNotification("Skill not found!", 'error');
        return prev;
      }

      const skill = prev.skills[skillIndex];

      // Check if skill is already unlocked
      if (skill.unlocked) {
        showNotification(`${skill.name} is already unlocked!`, 'info');
        return prev;
      }

      // Check player level requirement
      if (prev.level < skill.requiredLevel) {
        showNotification(`You need to be level ${skill.requiredLevel} to unlock this skill!`, 'error');
        return prev;
      }

      // Check stat requirements
      if (skill.statRequirements) {
        for (const [stat, value] of Object.entries(skill.statRequirements)) {
          if (prev.stats[stat as keyof Stats] < value) {
            showNotification(`You need ${stat} ${value} to unlock this skill!`, 'error');
            return prev;
          }
        }
      }

      // Check parent skill requirement
      if (skill.parentSkillId) {
        const parentSkill = prev.skills.find(s => s.id === skill.parentSkillId);
        if (!parentSkill || parentSkill.level === 0) {
          showNotification(`You need to upgrade ${parentSkill?.name || 'the parent skill'} first!`, 'error');
          return prev;
        }
      }

      // Check if player has enough skill points
      if (prev.availableSkillPoints <= 0) {
        showNotification("Not enough skill points!", 'error');
        return prev;
      }

      // All checks passed, unlock the skill
      const updatedSkills = [...prev.skills];
      updatedSkills[skillIndex] = {
        ...skill,
        unlocked: true
      };

      success = true;
      showNotification(`${skill.name} unlocked!`, 'success');

      return {
        ...prev,
        skills: updatedSkills,
        availableSkillPoints: prev.availableSkillPoints - 1
      };
    });

    return success;
  };

  // New function to add skill points
  const addSkillPoints = (amount: number) => {
    if (amount <= 0) return;

    setPlayer(prev => ({
      ...prev,
      availableSkillPoints: prev.availableSkillPoints + amount
    }));

    showNotification(`Gained ${amount} skill points!`, 'success');
  };

  // Function to reset daily quests
  const resetDailyQuests = () => {
    const dailyQuests: Quest[] = [
      {
        id: `daily-${Date.now()}-1`,
        title: "Daily Training",
        description: "Complete a training session to improve your stats.",
        objective: "Train any stat once",
        rank: "E",
        rewards: {
          exp: 20,
          coins: 50,
        },
        isCompleted: false,
      },
      {
        id: `daily-${Date.now()}-2`,
        title: "Equipment Inspection",
        description: "Equip or unequip an item to check your gear.",
        objective: "Equip or unequip one item",
        rank: "E",
        rewards: {
          exp: 15,
          coins: 30,
        },
        isCompleted: false,
      },
      {
        id: `daily-${Date.now()}-3`,
        title: "Resource Gathering",
        description: "Gather resources by completing a quest.",
        objective: "Complete any quest",
        rank: "E",
        rewards: {
          exp: 30,
          coins: 70,
        },
        isCompleted: false,
      }
    ];

    setPlayer(prev => ({
      ...prev,
      dailyQuests,
      lastDailyQuestReset: Date.now()
    }));

    showNotification("Daily quests have been reset!", 'info');
  };

  // Function to check if daily quests need to be reset (24 hours have passed)
  const checkAndResetDailyQuests = () => {
    const now = Date.now();
    const lastReset = player.lastDailyQuestReset || 0;
    const dayInMs = 24 * 60 * 60 * 1000;

    if (now - lastReset >= dayInMs) {
      resetDailyQuests();
    }
  };

  // Check for daily quest reset on initial load
  useEffect(() => {
    checkAndResetDailyQuests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (trainingInterval) {
        clearInterval(trainingInterval);
      }
    };
  }, [trainingInterval]);

  // Create context value
  const contextValue: GameContextType = {
    player,
    activeTab,
    setActiveTab,
    notifications,
    showNotification,
    clearNotification,
    updateStat,
    addItem,
    removeItem,
    equipItem,
    unequipItem,
    addQuest,
    completeQuest,
    addCoins,
    removeCoins,
    startTraining,
    isTraining,
    trainingStat,
    trainingTimeLeft,
    trainingProgress,
    cancelTraining,

    // Skill-related functions
    upgradeSkill,
    unlockSkill,
    addSkillPoints,
    resetDailyQuests,
    checkAndResetDailyQuests
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

// Custom hook to use the game context
export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
