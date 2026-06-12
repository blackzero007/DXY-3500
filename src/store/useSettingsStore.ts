import { create } from 'zustand';
import { getSettings, saveSettings, type AppSettings, type Theme } from '../utils/storage';
import { soundManager } from '../utils/soundManager';

interface SettingsStore extends AppSettings {
  initSettings: () => void;
  toggleSound: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  toggleDailyReminder: () => void;
  setDailyReminderEnabled: (enabled: boolean) => void;
  setDailyReminderTime: (time: string) => void;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  soundEnabled: true,
  theme: 'light',
  dailyReminder: {
    enabled: false,
    time: '09:00',
  },

  initSettings: () => {
    const saved = getSettings();
    soundManager.setEnabled(saved.soundEnabled);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(saved.theme);
    set({
      soundEnabled: saved.soundEnabled,
      theme: saved.theme,
      dailyReminder: saved.dailyReminder,
    });
  },

  toggleTheme: () => {
    const current = get().theme;
    const newTheme: Theme = current === 'light' ? 'dark' : 'light';
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
    saveSettings({ ...get(), theme: newTheme });
    set({ theme: newTheme });
  },

  setTheme: (theme: Theme) => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    saveSettings({ ...get(), theme });
    set({ theme });
  },

  toggleSound: () => {
    const current = get().soundEnabled;
    const newValue = !current;
    soundManager.setEnabled(newValue);
    saveSettings({ ...get(), soundEnabled: newValue });
    set({ soundEnabled: newValue });

    if (newValue) {
      soundManager.play('placeLetter');
    }
  },

  setSoundEnabled: (enabled: boolean) => {
    soundManager.setEnabled(enabled);
    saveSettings({ ...get(), soundEnabled: enabled });
    set({ soundEnabled: enabled });

    if (enabled) {
      soundManager.play('placeLetter');
    }
  },

  toggleDailyReminder: () => {
    const current = get().dailyReminder;
    const newEnabled = !current.enabled;
    const newSettings = {
      ...get(),
      dailyReminder: { ...current, enabled: newEnabled },
    };
    saveSettings(newSettings);
    set({ dailyReminder: { ...current, enabled: newEnabled } });
  },

  setDailyReminderEnabled: (enabled: boolean) => {
    const current = get().dailyReminder;
    const newSettings = {
      ...get(),
      dailyReminder: { ...current, enabled },
    };
    saveSettings(newSettings);
    set({ dailyReminder: { ...current, enabled } });
  },

  setDailyReminderTime: (time: string) => {
    const current = get().dailyReminder;
    const newSettings = {
      ...get(),
      dailyReminder: { ...current, time },
    };
    saveSettings(newSettings);
    set({ dailyReminder: { ...current, time } });
  },
}));
