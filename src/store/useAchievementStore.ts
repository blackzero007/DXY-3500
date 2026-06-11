import { create } from 'zustand';
import type { AchievementId, Achievement, AchievementProgress } from '../types';
import { getAchievements, saveAchievements } from '../utils/storage';
import { getGameRecords, getStreak, getFavorites } from '../utils/storage';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_clear',
    name: '初出茅庐',
    description: '首次通关',
    icon: '🏅',
    target: 1,
  },
  {
    id: 'streak_7',
    name: '坚持不懈',
    description: '连续7天打卡',
    icon: '🔥',
    target: 7,
  },
  {
    id: 'no_hint',
    name: '独立思考',
    description: '零提示通关',
    icon: '🧠',
    target: 1,
  },
  {
    id: 'speed_demon',
    name: '闪电快手',
    description: '1分钟内完成',
    icon: '⚡',
    target: 1,
  },
  {
    id: 'correct_20',
    name: '学富五车',
    description: '累计答对20题',
    icon: '📖',
    target: 20,
  },
  {
    id: 'favorite_10',
    name: '采蜜达人',
    description: '收藏10个单词',
    icon: '⭐',
    target: 10,
  },
  {
    id: 'hint_user',
    name: '善用助力',
    description: '使用3次提示',
    icon: '💡',
    target: 3,
  },
  {
    id: 'word_master',
    name: '词汇大师',
    description: '完成全部50个单词',
    icon: '👑',
    target: 50,
  },
];

interface AchievementStore {
  progress: AchievementProgress[];
  newlyUnlocked: AchievementId[];
  initAchievements: () => void;
  checkAchievements: (context?: { hintsUsed?: number; timeUsed?: number }) => void;
  clearNewlyUnlocked: () => void;
}

function createDefaultProgress(): AchievementProgress[] {
  return ACHIEVEMENTS.map((a) => ({
    id: a.id,
    current: 0,
    unlockedAt: null,
  }));
}

function mergeWithDefaults(saved: AchievementProgress[]): AchievementProgress[] {
  const defaults = createDefaultProgress();
  return defaults.map((d) => {
    const s = saved.find((p) => p.id === d.id);
    return s || d;
  });
}

export const useAchievementStore = create<AchievementStore>((set, get) => ({
  progress: createDefaultProgress(),
  newlyUnlocked: [],

  initAchievements: () => {
    const saved = getAchievements();
    const progress = mergeWithDefaults(saved);
    set({ progress });
  },

  checkAchievements: (context) => {
    const records = getGameRecords();
    const streak = getStreak();
    const favorites = getFavorites();
    const successCount = records.filter((r) => r.success).length;
    const uniqueSuccessWords = new Set(records.filter((r) => r.success).map((r) => r.word)).size;
    const totalHintsUsed = records.reduce((sum, r) => sum + r.hintsUsed, 0);
    const hasNoHintSuccess = records.some((r) => r.success && r.hintsUsed === 0);
    const hasFastSuccess = records.some((r) => r.success && r.timeUsed <= 60);

    const currentValues: Record<AchievementId, number> = {
      first_clear: successCount >= 1 ? 1 : 0,
      streak_7: streak,
      no_hint: hasNoHintSuccess ? 1 : 0,
      speed_demon: hasFastSuccess ? 1 : 0,
      correct_20: successCount,
      favorite_10: favorites.length,
      hint_user: totalHintsUsed,
      word_master: uniqueSuccessWords,
    };

    const { progress } = get();
    const newlyUnlocked: AchievementId[] = [];

    const updated = progress.map((p) => {
      const newValue = currentValues[p.id];
      if (p.unlockedAt !== null) {
        return { ...p, current: newValue };
      }
      const achievement = ACHIEVEMENTS.find((a) => a.id === p.id)!;
      if (newValue >= achievement.target) {
        newlyUnlocked.push(p.id);
        return { ...p, current: newValue, unlockedAt: Date.now() };
      }
      return { ...p, current: newValue };
    });

    saveAchievements(updated);
    set({ progress: updated, newlyUnlocked });
  },

  clearNewlyUnlocked: () => {
    set({ newlyUnlocked: [] });
  },
}));
