"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { getCookie } from "cookies-next";
import { myFetch } from "@/utils/myFetch";

interface NotificationContextType {
  unreadCount: number;
  resetUnreadCount: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

// const SOCKET_URL = "http://10.10.7.50:5002/";
// const SOCKET_URL = "https://api.instantlabour.co.uk/";
const SOCKET_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // 1. Fetch User Profile to get ID (needed for socket room)
  useEffect(() => {
    const getProfile = async () => {
      try {
        const res = await myFetch("/user/profile", { method: "GET" });
        if (res.success && res.data?._id) {
          setUserId(res.data._id);
        }
      } catch (err) {
        console.error("Failed to fetch profile for notifications:", err);
      }
    };
    getProfile();
  }, []);

  // Fetch initial notifications count
  useEffect(() => {
    if (!userId) return;
    const fetchNotifications = async () => {
      try {
        const res = await myFetch("/notifications", { method: "GET" });
        if (res.success) {
          const unread = res.data.filter((n: any) => !n.isRead).length;
          setUnreadCount(unread);
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };
    fetchNotifications();
  }, [userId]);

  // 2. Socket Connection
  useEffect(() => {
    if (!userId) return;

    const accessToken = getCookie("accessToken");

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      auth: {
        token: accessToken,
      },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Global Notification Socket connected");
    });

    socket.on(`notification::${userId}`, (newNotification: any) => {
      console.log("New Notification received in Context:", newNotification);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  const resetUnreadCount = () => {
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider value={{ unreadCount, resetUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    // Return default values if used outside provider (e.g. public pages)
    return {
      unreadCount: 0,
      resetUnreadCount: () => {},
    };
  }
  return context;
};
