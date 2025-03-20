"use client";

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircleIcon, Clock, Award, ChevronRight, Gamepad2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DungeonExploration } from '../common/DungeonExploration';
import { LevelUpAnimation } from '../common/LevelUpAnimation';

export function QuestsPage() {
  const { player, completeQuest } = useGame();
  const { quests } = player;

  const [selectedQuest, setSelectedQuest] = useState(null);
  const [dungeonOpen, setDungeonOpen] = useState(false);
  const [levelUpOpen, setLevelUpOpen] = useState(false);
  const [initialLevel, setInitialLevel] = useState(player.level);

  // Sort quests by completion status and rank
  const sortedQuests = [...quests].sort((a, b) => {
    // First sort by completion status
    if (a.isCompleted && !b.isCompleted) return 1;
    if (!a.isCompleted && b.isCompleted) return -1;

    // Then sort by rank (E, D, C, B, A, S)
    const rankOrder = { 'E': 0, 'D': 1, 'C': 2, 'B': 3, 'A': 4, 'S': 5 };
    return rankOrder[a.rank] - rankOrder[b.rank];
  });

  // Function to get rank style
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

  // Start dungeon exploration
  const startExploration = (quest) => {
    setSelectedQuest(quest);
    setInitialLevel(player.level);
    setDungeonOpen(true);
  };

  // Handle dungeon completion
  const handleDungeonComplete = () => {
    setDungeonOpen(false);
    // Check if player leveled up
    if (player.level > initialLevel) {
      setLevelUpOpen(true);
    }
  };

  return (
    <div className="quests-container">
      <div className="space-y-4">
        {sortedQuests.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No quests available. Check the shop for new quests.</p>
          </div>
        ) : (
          sortedQuests.map((quest) => (
            <Card
              key={quest.id}
              className={cn(
                "border border-gray-800 bg-black/40 backdrop-blur-sm overflow-hidden",
                quest.isCompleted && "opacity-70"
              )}
            >
              <div className="flex flex-col md:flex-row">
                {/* Quest Image or Placeholder */}
                <div className="w-full md:w-[105px] h-[105px] bg-gray-900 flex items-center justify-center">
                  {quest.image ? (
                    <img
                      src={quest.image}
                      alt={quest.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-gray-500 text-xs">
                      105 x 105<br/>IMAGE HERE
                    </div>
                  )}
                </div>

                {/* Quest Details */}
                <div className="flex-1 p-4">
                  <div className="flex justify-between">
                    <CardTitle className="text-xl mb-2">{quest.title}</CardTitle>
                    {quest.isCompleted && (
                      <span className="text-green-500 flex items-center">
                        <CheckCircleIcon className="h-5 w-5 mr-1" />
                        Completed
                      </span>
                    )}
                  </div>

                  <div className="mb-2 text-sm">
                    <span className="text-gray-400">Quest Difficulty:</span>
                    <span className={cn("ml-2 font-medium", getRankStyle(quest.rank))}>
                      {quest.rank}-Rank
                    </span>
                  </div>

                  <div className="mb-2 text-sm">
                    <span className="text-gray-400">Objective:</span>
                    <span className="ml-2">{quest.objective}</span>
                  </div>

                  <div className="text-xs text-gray-500">
                    Quest given by [Unknown]
                  </div>
                </div>
              </div>

              <CardFooter className="flex justify-between p-4 border-t border-gray-800 bg-gray-900/30">
                <div>
                  <h4 className="text-green-500 text-sm font-medium mb-1 flex items-center">
                    <Award className="h-4 w-4 mr-1" /> REWARDS:
                  </h4>
                  <div className="flex space-x-3 text-xs">
                    <div className="flex items-center">
                      <span className="mr-1">⬆️</span> Level Increase
                    </div>
                    <div className="flex items-center">
                      <span className="text-yellow-500 mr-1">○</span> {quest.rewards.coins} coins
                    </div>
                    <div className="flex items-center">
                      <span className="text-blue-500 mr-1">✨</span> {quest.rewards.exp} XP
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!quest.isCompleted && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[#00d4ff] border-[#00d4ff40] hover:bg-[#00d4ff20]"
                      onClick={() => startExploration(quest)}
                    >
                      <Gamepad2 className="h-4 w-4 mr-1" />
                      Explore
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    disabled={quest.isCompleted}
                    onClick={() => completeQuest(quest.id)}
                    className={cn(
                      !quest.isCompleted && "text-blue-500 hover:text-blue-400"
                    )}
                  >
                    {quest.isCompleted ? (
                      <span>Completed</span>
                    ) : (
                      <span className="flex items-center">
                        Quick Complete <ChevronRight className="h-4 w-4 ml-1" />
                      </span>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Dungeon exploration modal */}
      {selectedQuest && (
        <DungeonExploration
          questId={selectedQuest.id}
          questTitle={selectedQuest.title}
          questRank={selectedQuest.rank}
          isOpen={dungeonOpen}
          onClose={handleDungeonComplete}
        />
      )}

      {/* Level up animation */}
      <LevelUpAnimation
        level={player.level}
        isOpen={levelUpOpen}
        onClose={() => setLevelUpOpen(false)}
      />
    </div>
  );
}
