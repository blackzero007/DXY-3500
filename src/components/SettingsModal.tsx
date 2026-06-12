import { useEffect, useState } from 'react';
import { X, Bell, BellOff, Clock, Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';
import { useDailyReminder } from '../hooks/useDailyReminder';
import { cn } from '../lib/utils';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const toggleSound = useSettingsStore((s) => s.toggleSound);
  const dailyReminder = useSettingsStore((s) => s.dailyReminder);
  const setDailyReminderEnabled = useSettingsStore((s) => s.setDailyReminderEnabled);
  const setDailyReminderTime = useSettingsStore((s) => s.setDailyReminderTime);
  const { enableWithPermission } = useDailyReminder();

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [show, setShow] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => setShow(true), 10);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [open]);

  const handleToggleReminder = async () => {
    if (!dailyReminder.enabled) {
      if (!('Notification' in window)) {
        alert('您的浏览器不支持通知功能');
        return;
      }
      if (Notification.permission === 'denied') {
        alert('您已禁用通知权限，请在浏览器设置中开启通知权限');
        return;
      }
      await enableWithPermission();
      if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
      }
    } else {
      setDailyReminderEnabled(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        'transition-opacity duration-300',
        show ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div
        className={cn(
          'relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden',
          'transform transition-all duration-300 ease-out',
          show ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'
        )}
      >
        <div className="h-20 flex items-center justify-between px-6 bg-gradient-to-br from-indigo-400 to-indigo-600">
          <h2 className="text-2xl font-bold text-white">设置</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center',
                soundEnabled ? 'bg-teal-100' : 'bg-gray-200'
              )}>
                {soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-teal-600" />
                ) : (
                  <VolumeX className="w-5 h-5 text-gray-500" />
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-800">音效</p>
                <p className="text-sm text-gray-500">游戏过程中的提示音</p>
              </div>
            </div>
            <button
              onClick={toggleSound}
              className={cn(
                'relative w-12 h-7 rounded-full transition-colors duration-200',
                soundEnabled ? 'bg-teal-500' : 'bg-gray-300'
              )}
            >
              <div
                className={cn(
                  'absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200',
                  soundEnabled ? 'translate-x-5' : 'translate-x-0.5'
                )}
              />
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center',
                  dailyReminder.enabled ? 'bg-indigo-100' : 'bg-gray-200'
                )}>
                  {dailyReminder.enabled ? (
                    <Bell className="w-5 h-5 text-indigo-600" />
                  ) : (
                    <BellOff className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">每日提醒</p>
                  <p className="text-sm text-gray-500">定时提醒完成今日挑战</p>
                </div>
              </div>
              <button
                onClick={handleToggleReminder}
                className={cn(
                  'relative w-12 h-7 rounded-full transition-colors duration-200',
                  dailyReminder.enabled ? 'bg-indigo-500' : 'bg-gray-300'
                )}
              >
                <div
                  className={cn(
                    'absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200',
                    dailyReminder.enabled ? 'translate-x-5' : 'translate-x-0.5'
                  )}
                />
              </button>
            </div>

            {dailyReminder.enabled && (
              <div className="pl-4 pr-4 pb-4 space-y-3">
                {'Notification' in window && notificationPermission === 'denied' && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-700">通知权限已被禁用</p>
                      <p className="text-xs text-red-500 mt-1">
                        请在浏览器设置中允许此网站发送通知，然后重新开启每日提醒
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <label className="text-sm font-medium text-gray-700">提醒时间</label>
                  <input
                    type="time"
                    value={dailyReminder.time}
                    onChange={(e) => setDailyReminderTime(e.target.value)}
                    className="ml-auto px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                  />
                </div>

                {notificationPermission === 'granted' && (
                  <p className="text-xs text-gray-500 text-center">
                    ✓ 已获得通知权限，将在每天 {dailyReminder.time} 提醒您
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl font-medium transition-colors"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
}
