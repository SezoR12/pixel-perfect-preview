import React, { createContext, useContext, useState, useCallback } from "react";
import { Notification as ApiNotification, getNotifications, markNotificationRead as markReadApi, markAllNotificationsRead as markAllReadApi } from "@/lib/api";

interface ToastAlert {
  id: string;
  title: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
}

interface NotificationStoreState {
  notifications: ApiNotification[];
  toasts: ToastAlert[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
  addToast: (toast: Omit<ToastAlert, "id">) => void;
  removeToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationStoreState | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [toasts, setToasts] = useState<ToastAlert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetched = await getNotifications();
      setNotifications(fetched);
    } catch (err) {
      console.error("Failed to load global notification queue", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markRead = async (id: number) => {
    try {
      await markReadApi(id);
      setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await markAllReadApi();
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    } catch (err) {}
  };

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<ToastAlert, "id">) => {
      const id = Date.now().toString() + Math.random().toString(36).slice(2, 6);
      const newToast = { id, ...toast };
      setToasts((prev) => [newToast, ...prev]);

      if (toast.duration !== 0) {
        setTimeout(() => {
          removeToast(id);
        }, toast.duration || 5000);
      }
    },
    [removeToast]
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        toasts,
        unreadCount,
        isLoading,
        fetchNotifications,
        markRead,
        markAllRead,
        addToast,
        removeToast,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationStore = (): NotificationStoreState => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotificationStore must be used within an accredited NotificationProvider.");
  }
  return context;
};
