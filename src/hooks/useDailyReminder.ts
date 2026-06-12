import { useEffect, useRef, useCallback } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { getTodayString } from '../utils/dateUtils';
import { getTodayRecord } from '../utils/storage';

const LAST_NOTIFIED_KEY = 'word_puzzle_last_notified';

function getLastNotifiedDate(): string | null {
  try {
    return localStorage.getItem(LAST_NOTIFIED_KEY);
  } catch {
    return null;
  }
}

function setLastNotifiedDate(date: string): void {
  try {
    localStorage.setItem(LAST_NOTIFIED_KEY, date);
  } catch {
    console.error('Failed to save last notified date');
  }
}

function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return { hours, minutes };
}

function shouldNotifyNow(reminderTime: string): boolean {
  const { hours, minutes } = parseTime(reminderTime);
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const targetMinutes = hours * 60 + minutes;
  return currentMinutes >= targetMinutes && currentMinutes < targetMinutes + 2;
}

export function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return Promise.resolve('denied' as NotificationPermission);
  }
  if (Notification.permission === 'granted' || Notification.permission === 'denied') {
    return Promise.resolve(Notification.permission);
  }
  return Notification.requestPermission();
}

export function useDailyReminder() {
  const dailyReminder = useSettingsStore((s) => s.dailyReminder);
  const setDailyReminderEnabled = useSettingsStore((s) => s.setDailyReminderEnabled);
  const checkIntervalRef = useRef<number | null>(null);

  const showNotification = useCallback(() => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const todayStr = getTodayString();
    const lastNotified = getLastNotifiedDate();

    if (lastNotified === todayStr) {
      return;
    }

    const todayRecord = getTodayRecord(todayStr, 'classic');
    if (todayRecord && todayRecord.success) {
      setLastNotifiedDate(todayStr);
      return;
    }

    try {
      const notification = new Notification('📚 每日单词拼图提醒', {
        body: '今日挑战还未完成，快来完成今天的单词拼图吧！',
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: 'daily-reminder',
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      setLastNotifiedDate(todayStr);
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }, []);

  const enableWithPermission = useCallback(async () => {
    const permission = await requestNotificationPermission();
    if (permission === 'granted') {
      setDailyReminderEnabled(true);
    }
  }, [setDailyReminderEnabled]);

  useEffect(() => {
    if (!dailyReminder.enabled) {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      return;
    }

    if (!('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'denied') {
      return;
    }

    showNotification();

    checkIntervalRef.current = window.setInterval(() => {
      if (shouldNotifyNow(dailyReminder.time)) {
        showNotification();
      }
    }, 60 * 1000);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [dailyReminder.enabled, dailyReminder.time, showNotification]);

  return {
    enableWithPermission,
  };
}
