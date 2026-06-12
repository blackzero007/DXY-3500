import type { GameModeConfig } from '../types';

export const GAME_MODES: Record<string, GameModeConfig> = {
  classic: {
    id: 'classic',
    name: '经典模式',
    description: '60秒限时拼词，可使用提示，每日挑战',
    icon: '🎯',
    timeLimit: 60,
    allowHints: true,
    showAnswer: false,
    color: 'teal',
    bgGradient: 'from-teal-500 to-teal-600',
  },
  practice: {
    id: 'practice',
    name: '练习模式',
    description: '无时间限制，可随时查看答案，轻松学习',
    icon: '📚',
    timeLimit: null,
    allowHints: true,
    showAnswer: true,
    color: 'blue',
    bgGradient: 'from-blue-500 to-blue-600',
  },
  challenge: {
    id: 'challenge',
    name: '挑战模式',
    description: '30秒限时，禁止使用提示，考验真实水平',
    icon: '🔥',
    timeLimit: 30,
    allowHints: false,
    showAnswer: false,
    color: 'orange',
    bgGradient: 'from-orange-500 to-red-500',
  },
};

export const getGameModeConfig = (mode: string): GameModeConfig => {
  return GAME_MODES[mode] || GAME_MODES.classic;
};
