"use client";

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TimerIcon, ActivityIcon, Dumbbell, Brain, Clock } from 'lucide-react';

const trainingOptions = [
  {
    id: 'str-training',
    name: 'Strength Training',
    description: 'Lift weights and build muscle to increase your Strength stat.',
    stat: 'STR',
    duration: 10, // seconds
    icon: <Dumbbell className="h-12 w-12" />,
    color: 'bg-red-900/30 border-red-700/50',
    textColor: 'text-red-500'
  },
  {
    id: 'agi-training',
    name: 'Agility Training',
    description: 'Practice sprints and parkour to enhance your Agility stat.',
    stat: 'AGI',
    duration: 10, // seconds
    icon: <ActivityIcon className="h-12 w-12" />,
    color: 'bg-green-900/30 border-green-700/50',
    textColor: 'text-green-500'
  },
  {
    id: 'vit-training',
    name: 'Vitality Training',
    description: 'Endurance exercises to boost your HP and Vitality stat.',
    stat: 'VIT',
    duration: 10, // seconds
    icon: <TimerIcon className="h-12 w-12" />,
    color: 'bg-yellow-900/30 border-yellow-700/50',
    textColor: 'text-yellow-500'
  },
  {
    id: 'int-training',
    name: 'Intelligence Training',
    description: 'Study ancient tomes to increase your Intelligence stat.',
    stat: 'INT',
    duration: 10, // seconds
    icon: <Brain className="h-12 w-12" />,
    color: 'bg-blue-900/30 border-blue-700/50',
    textColor: 'text-blue-500'
  }
];

export function TrainingPage() {
  const { player, isTraining, trainingStat, trainingTimeLeft, trainingProgress, startTraining, cancelTraining } = useGame();
  const [selectedTraining, setSelectedTraining] = useState(null);

  // Function to start a training session
  const handleStartTraining = (training) => {
    if (isTraining) return;

    setSelectedTraining(training);
    startTraining(training.stat, training.duration);
  };

  // Function to cancel training
  const handleCancelTraining = () => {
    setSelectedTraining(null);
    cancelTraining();
  };

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="training-container">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-4 uppercase neon-blue">TRAINING</h2>
        <p className="text-gray-400">Train your body and mind to become stronger</p>
      </div>

      {/* Training Progress (if active) */}
      {isTraining && (
        <div className="mb-8 bg-black/40 p-6 border border-gray-800 rounded-lg">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold mb-1">Training in Progress</h3>
            <p className={cn("text-sm", selectedTraining?.textColor)}>
              {selectedTraining?.name || `${trainingStat} Training`}
            </p>
          </div>

          <div className="mb-4 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center">
              {selectedTraining?.icon || <ActivityIcon className="h-10 w-10 text-blue-500" />}
            </div>
          </div>

          <div className="mb-2 flex justify-between items-center">
            <span className="text-sm text-gray-400">Progress</span>
            <span className="text-sm font-medium">{trainingProgress}%</span>
          </div>

          <Progress
            value={trainingProgress}
            className="h-2 mb-4"
            indicatorClassName={cn(
              "bg-gradient-to-r",
              trainingStat === 'STR' ? "from-red-900 to-red-500" :
              trainingStat === 'AGI' ? "from-green-900 to-green-500" :
              trainingStat === 'VIT' ? "from-yellow-900 to-yellow-500" :
              trainingStat === 'INT' ? "from-blue-900 to-blue-500" :
              "from-purple-900 to-purple-500"
            )}
          />

          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1 text-gray-400" />
              <span className="text-sm">{formatTime(trainingTimeLeft)} remaining</span>
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={handleCancelTraining}
            >
              Cancel Training
            </Button>
          </div>
        </div>
      )}

      {/* Training Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {trainingOptions.map((training) => (
          <div
            key={training.id}
            className={cn(
              "border rounded-lg p-4",
              training.color,
              isTraining && trainingStat === training.stat ? "ring-2 ring-blue-500" : "",
              isTraining && trainingStat !== training.stat ? "opacity-50" : ""
            )}
          >
            <div className="flex items-start">
              <div className="mr-4 bg-black/30 rounded-full p-2">
                {training.icon}
              </div>

              <div className="flex-1">
                <h3 className={cn("text-lg font-bold mb-1", training.textColor)}>
                  {training.name}
                </h3>
                <p className="text-sm text-gray-300 mb-4">{training.description}</p>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-400">
                    Duration: <span className="text-white">{formatTime(training.duration)}</span>
                  </div>

                  <Button
                    variant="outline"
                    className={cn(
                      "border-gray-700",
                      !isTraining && training.textColor,
                      isTraining && trainingStat === training.stat ? "bg-blue-900/50 text-blue-400" : ""
                    )}
                    disabled={isTraining && trainingStat !== training.stat}
                    onClick={() => {
                      if (isTraining && trainingStat === training.stat) {
                        handleCancelTraining();
                      } else {
                        handleStartTraining(training);
                      }
                    }}
                  >
                    {isTraining && trainingStat === training.stat ? (
                      "Training..."
                    ) : (
                      "Start Training"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Training Benefits */}
      <div className="mt-8 p-4 border border-gray-800 bg-gray-900/20 rounded-lg">
        <h3 className="text-lg font-bold mb-2 text-center">Training Benefits</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center mr-3">
              <Dumbbell className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h4 className="font-medium text-red-500">Strength</h4>
              <p className="text-xs text-gray-400">Increases attack power</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-green-900/30 flex items-center justify-center mr-3">
              <ActivityIcon className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <h4 className="font-medium text-green-500">Agility</h4>
              <p className="text-xs text-gray-400">Improves speed and evasion</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-yellow-900/30 flex items-center justify-center mr-3">
              <TimerIcon className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <h4 className="font-medium text-yellow-500">Vitality</h4>
              <p className="text-xs text-gray-400">Increases max HP and stamina</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center mr-3">
              <Brain className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h4 className="font-medium text-blue-500">Intelligence</h4>
              <p className="text-xs text-gray-400">Boosts magical abilities and IP</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
