"use client";

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skill } from '@/context/GameContext';
import { motion } from 'framer-motion';

export function SkillsPage() {
  const { player, upgradeSkill, unlockSkill } = useGame();
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [showSkillDialog, setShowSkillDialog] = useState(false);

  // Group skills by their parent relationships to create the tree structure
  const rootSkills = player.skills.filter(skill => !skill.parentSkillId);

  // Find child skills for a given parent
  const getChildSkills = (parentId: string) => {
    return player.skills.filter(skill => skill.parentSkillId === parentId);
  };

  // Calculate the effect value based on skill level
  const calculateEffectValue = (effect: { value: number, valuePerLevel?: number }, skillLevel: number) => {
    const baseValue = effect.value;
    const levelBonus = effect.valuePerLevel ? effect.valuePerLevel * skillLevel : 0;
    return baseValue + levelBonus;
  };

  // Handle skill click to show details
  const handleSkillClick = (skill: Skill) => {
    setSelectedSkill(skill);
    setShowSkillDialog(true);
  };

  // Handle upgrading a skill
  const handleUpgradeSkill = () => {
    if (!selectedSkill) return;

    const success = upgradeSkill(selectedSkill.id);
    if (success) {
      // Refresh the selected skill data after successful upgrade
      const updatedSkill = player.skills.find(s => s.id === selectedSkill.id);
      if (updatedSkill) {
        setSelectedSkill(updatedSkill);
      }
    }
  };

  // Handle unlocking a skill
  const handleUnlockSkill = () => {
    if (!selectedSkill) return;

    const success = unlockSkill(selectedSkill.id);
    if (success) {
      // Refresh the selected skill data after successful unlock
      const updatedSkill = player.skills.find(s => s.id === selectedSkill.id);
      if (updatedSkill) {
        setSelectedSkill(updatedSkill);
      }
    }
  };

  // Recursive function to render a skill and its children
  const renderSkillNode = (skill: Skill, level: number = 0) => {
    const childSkills = getChildSkills(skill.id);
    const isUnlocked = skill.unlocked;
    const isMaxLevel = skill.level >= skill.maxLevel;

    return (
      <div key={skill.id} className="relative">
        <div className={cn(
          "skill-node relative mb-6",
          level > 0 && "ml-8"
        )}>
          {/* Connecting lines for child skills */}
          {level > 0 && (
            <div className="absolute -left-8 top-6 h-[2px] w-8 bg-blue-500/30"></div>
          )}

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "cursor-pointer p-3 border rounded-md relative overflow-hidden",
              isUnlocked
                ? isMaxLevel
                  ? "border-purple-500 bg-purple-950/20"
                  : "border-blue-500 bg-blue-950/20"
                : "border-gray-700 bg-gray-900/50",
              isUnlocked && skill.level > 0 && "shadow-[0_0_10px_rgba(0,100,255,0.5)]"
            )}
            onClick={() => handleSkillClick(skill)}
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">{skill.icon}</div>
              <div>
                <h3 className={cn(
                  "font-bold",
                  isUnlocked
                    ? isMaxLevel
                      ? "text-purple-400"
                      : "text-blue-400"
                    : "text-gray-400"
                )}>
                  {skill.name}
                </h3>
                <div className="text-xs text-gray-500">
                  {isUnlocked ? `Level ${skill.level}/${skill.maxLevel}` : `Required: Level ${skill.requiredLevel}`}
                </div>
              </div>
            </div>

            {/* Level indicator */}
            {isUnlocked && skill.level > 0 && (
              <div className="absolute top-0 right-0 px-2 py-1 text-xs font-bold rounded-bl-md bg-blue-900/50">
                Lv. {skill.level}
              </div>
            )}
          </motion.div>

          {/* Render child skills */}
          {childSkills.length > 0 && (
            <div className="mt-2 space-y-2 border-l-2 border-blue-500/20 pl-6">
              {childSkills.map(childSkill => renderSkillNode(childSkill, level + 1))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="skill-tree-container p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#00d4ff]">Hunter Skills</h1>
        <div className="flex items-center gap-2">
          <div className="bg-[#0a1520] border border-[#192844] px-3 py-1 rounded-sm">
            <span className="text-gray-400 mr-2">Skill Points:</span>
            <span className="font-bold text-[#00d4ff]">{player.availableSkillPoints}</span>
          </div>
        </div>
      </div>

      {player.availableSkillPoints > 0 && (
        <div className="mb-6 bg-[#0a2030] border border-[#192844] p-3 rounded-sm">
          <p className="text-blue-400">You have {player.availableSkillPoints} skill points available! Unlock or upgrade skills to become stronger.</p>
        </div>
      )}

      <div className="skill-tree bg-[#050a14] border border-[#00d4ff40] p-6 rounded-sm">
        {rootSkills.map(skill => renderSkillNode(skill))}
      </div>

      {/* Skill Detail Dialog */}
      {selectedSkill && (
        <Dialog open={showSkillDialog} onOpenChange={setShowSkillDialog}>
          <DialogContent className="bg-[#080e1a] border-[#00d4ff] max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <span className="text-2xl">{selectedSkill.icon}</span>
                <span>{selectedSkill.name}</span>
                {selectedSkill.level > 0 && (
                  <span className="text-sm bg-blue-900/50 px-2 py-1 rounded-sm ml-2">
                    Lv. {selectedSkill.level}
                  </span>
                )}
              </DialogTitle>
              <DialogDescription className="text-gray-400 mt-2">
                {selectedSkill.description}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Skill Requirements */}
              {!selectedSkill.unlocked && (
                <div className="bg-[#0a1520] p-3 rounded-sm border border-[#192844]">
                  <h4 className="font-bold text-sm mb-2 text-gray-300">Requirements</h4>
                  <ul className="text-sm space-y-1">
                    <li className={cn(
                      "flex items-center gap-2",
                      player.level >= selectedSkill.requiredLevel ? "text-green-400" : "text-red-400"
                    )}>
                      <span>{player.level >= selectedSkill.requiredLevel ? "✓" : "✗"}</span>
                      <span>Player Level {selectedSkill.requiredLevel}</span>
                    </li>

                    {selectedSkill.statRequirements && Object.entries(selectedSkill.statRequirements).map(([stat, value]) => (
                      <li key={stat} className={cn(
                        "flex items-center gap-2",
                        player.stats[stat as keyof typeof player.stats] >= value ? "text-green-400" : "text-red-400"
                      )}>
                        <span>{player.stats[stat as keyof typeof player.stats] >= value ? "✓" : "✗"}</span>
                        <span>{stat} {value}</span>
                      </li>
                    ))}

                    {selectedSkill.parentSkillId && (
                      <li className={cn(
                        "flex items-center gap-2",
                        (player.skills.find(s => s.id === selectedSkill.parentSkillId)?.level ?? 0) > 0
                          ? "text-green-400"
                          : "text-red-400"
                      )}>
                        <span>
                          {(player.skills.find(s => s.id === selectedSkill.parentSkillId)?.level ?? 0) > 0 ? "✓" : "✗"}
                        </span>
                        <span>
                          {player.skills.find(s => s.id === selectedSkill.parentSkillId)?.name || "Parent Skill"} Level 1
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Skill Effects */}
              <div className="bg-[#0a1520] p-3 rounded-sm border border-[#192844]">
                <h4 className="font-bold text-sm mb-2 text-gray-300">Effects</h4>
                <ul className="text-sm space-y-2">
                  {selectedSkill.effects.map((effect, index) => (
                    <li key={index} className="flex justify-between">
                      <span>{effect.description}</span>
                      <span className="font-bold">
                        {selectedSkill.unlocked
                          ? calculateEffectValue(effect, selectedSkill.level)
                          : effect.value}
                        {selectedSkill.level < selectedSkill.maxLevel && effect.valuePerLevel && (
                          <span className="text-green-400 text-xs ml-1">
                            (+{effect.valuePerLevel}/level)
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <DialogFooter className="mt-4">
              {!selectedSkill.unlocked ? (
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={
                    player.availableSkillPoints <= 0 ||
                    player.level < selectedSkill.requiredLevel ||
                    (selectedSkill.parentSkillId &&
                      player.skills.find(s => s.id === selectedSkill.parentSkillId)?.level === 0)
                  }
                  onClick={handleUnlockSkill}
                >
                  Unlock Skill
                </Button>
              ) : (
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={
                    player.availableSkillPoints <= 0 ||
                    selectedSkill.level >= selectedSkill.maxLevel
                  }
                  onClick={handleUpgradeSkill}
                >
                  {selectedSkill.level < selectedSkill.maxLevel
                    ? `Upgrade to Level ${selectedSkill.level + 1}`
                    : "Maximum Level Reached"}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
