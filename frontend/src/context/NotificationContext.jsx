import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { getMyNotificationsApi, getUnreadCountApi, markAsReadApi, markAllAsReadApi } from '../api/notifications';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    try {
      const [{ data: list }, { data: countData }] = await Promise.all([getMyNotificationsApi(), getUnreadCountApi()]);
      setNotifications(list);
      setUnreadCount(countData.count);
    } catch {
      // ignore - polling will retry
    }
  }, [user]);

  useEffect(() => {
    refresh();
    if (!user) return undefined;
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [user, refresh]);

  const markRead = useCallback(async (id) => {
    await markAsReadApi(id);
    await refresh();
  }, [refresh]);

  const markAllRead = useCallback(async () => {
    await markAllAsReadApi();
    await refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ notifications, unreadCount, refresh, markRead, markAllRead }),
    [notifications, unreadCount, refresh, markRead, markAllRead]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
