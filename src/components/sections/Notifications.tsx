"use client";

import { myFetch } from "@/utils/myFetch";
import { formatUrl } from "@/utils/formatUrl";
import { relativeTime } from "@/utils/relativeTimes";
import Image from "next/image";
import { useEffect, useRef, useState, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import { getCookie } from "cookies-next";
import { useNotification } from "@/context/NotificationContext";
import { Bell, BellOff, CheckCheck, Search } from "lucide-react";

interface Notification {
  _id: string;
  title: string;
  body: string;
  createdAt: string;
  from: {
    _id: string;
    name: string;
    profile: string;
  };
  isRead: boolean;
}

const SOCKET_URL = process.env.NEXT_PUBLIC_IMAGE_URL;

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const now = new Date();
  const { resetUnreadCount } = useNotification();

  console.log("Notifications ===>>>", notifications);

  // Reset badge count on mount
  useEffect(() => {
    resetUnreadCount();
  }, [resetUnreadCount]);

  // 1. Fetch User Profile to get ID
  useEffect(() => {
    const getProfile = async () => {
      try {
        const res = await myFetch("/user/profile", { method: "GET" });
        if (res.success && res.data?._id) {
          setUserId(res.data._id);
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };
    getProfile();
  }, []);

  // 2. Initial Fetch of Notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await myFetch("/notifications", { method: "GET" });
        if (res.success) {
          setNotifications(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // 3. Socket Connection
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
      console.log("Notification Socket connected:", socket.id);
    });

    socket.on(`notification::${userId}`, (newNotification: any) => {
      setNotifications((prev) => [newNotification, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  // Helper to format/generate notification content
  const getDisplayContent = (item: Notification) => {
    const senderName = item.from?.name?.trim() || "System";
    let title = (item.title || "").trim();
    let body = (item.body || "").trim();

    if (!title && !body) {
      title = `Notification from ${senderName}`;
      body = `You have received a new update from ${senderName}.`;
    } else if (!title) {
      title = `Update from ${senderName}`;
    } else if (!body) {
      body = title;
      title = `Notification from ${senderName}`;
    }

    return { title, body };
  };

  // Filter and Search logic
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // 1. Filter by Read/Unread status
      if (filter === "unread" && item.isRead) return false;
      if (filter === "read" && !item.isRead) return false;

      // 2. Filter by search query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const { title, body } = getDisplayContent(item);
        const name = (item.from?.name || "").toLowerCase();
        return (
          title.toLowerCase().includes(query) ||
          body.toLowerCase().includes(query) ||
          name.includes(query)
        );
      }

      return true;
    });
  }, [notifications, filter, searchQuery]);

  // Count metrics
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const readCount = useMemo(() => {
    return notifications.filter((n) => n.isRead).length;
  }, [notifications]);

  const handleMarkAllAsRead = async () => {
    try {
      const res = await myFetch("/notifications/all", {
        method: "GET",
      });
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true }))
        );
        resetUnreadCount();
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="maxWidth py-20 flex flex-col justify-center items-center space-y-4">
        <div className="size-10 border-4 border-brandClr1/20 border-t-brandClr1 rounded-full animate-spin"></div>
        <p className="text-gray-500 text-sm font-medium animate-pulse">
          Loading your notifications...
        </p>
      </div>
    );
  }

  return (
    <div className="maxWidth min-h-screen py-12 md:py-20 space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div className="flex items-center gap-3">
          <div className="bg-brandClr1/10 p-2.5 rounded-xl text-brandClr1">
            <Bell className="size-6 md:size-7" />
          </div>
          <div>
            <h3 className="font-bold text-2xl md:text-3xl text-gray-900">
              Notifications
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Keep track of updates, job actions, and messages
            </p>
          </div>
        </div>

        {notifications.length > 0 && unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 text-sm font-semibold text-brandClr1 hover:text-brandClr1/80 border border-brandClr1/20 hover:border-brandClr1/40 px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs bg-white self-start sm:self-auto"
          >
            <CheckCheck className="size-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Control bar (Filters & Search) */}
      {notifications.length > 0 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl shadow-2xs border border-gray-200/50 self-start">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all cursor-pointer ${
                filter === "all"
                  ? "bg-brandClr1 text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-950 hover:bg-gray-50"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                filter === "unread"
                  ? "bg-brandClr1 text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-950 hover:bg-gray-50"
              }`}
            >
              Unread
              {unreadCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    filter === "unread"
                      ? "bg-white text-brandClr1"
                      : "bg-brandClr1 text-white"
                  }`}
                >
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilter("read")}
              className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all cursor-pointer ${
                filter === "read"
                  ? "bg-brandClr1 text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-950 hover:bg-gray-50"
              }`}
            >
              Read ({readCount})
            </button>
          </div>

          {/* Search bar */}
          <div className="relative flex-1 md:max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-brandClr1/20 focus:border-brandClr1 transition-all placeholder:text-gray-400"
            />
          </div>
        </div>
      )}

      {/* Notifications list */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white border border-gray-100 rounded-2xl shadow-xs space-y-3">
            <div className="bg-gray-50 p-4 rounded-full text-gray-400">
              <BellOff className="size-8" />
            </div>
            <div>
              <p className="text-gray-700 font-semibold text-lg">
                {searchQuery
                  ? "No matching notifications found"
                  : filter === "unread"
                  ? "No unread notifications"
                  : filter === "read"
                  ? "No read notifications"
                  : "No notifications found"}
              </p>
              <p className="text-gray-400 text-sm max-w-xs mx-auto mt-1">
                {searchQuery
                  ? "Try checking your spelling or using different keywords"
                  : "We will notify you here when you receive new updates"}
              </p>
            </div>
          </div>
        ) : (
          filteredNotifications.map((item) => {
            const { title, body } = getDisplayContent(item);
            return (
              <div
                key={item._id}
                className={`group relative flex items-start gap-4 p-4 border rounded-xl transition-all duration-300 ${
                  !item.isRead
                    ? "bg-brandClr1/[0.02] border-brandClr1/15 hover:border-brandClr1/30 hover:bg-brandClr1/[0.04]"
                    : "bg-white border-gray-150/75 hover:border-gray-300 hover:shadow-xs"
                } hover:-translate-y-0.5`}
              >
                {/* Unread indicator dot/bar */}
                {!item.isRead && (
                  <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-10 rounded-full bg-brandClr1" />
                )}

                {/* Sender Profile */}
                <div className="relative shrink-0 select-none">
                  <Image
                    src={formatUrl(item.from?.profile)}
                    alt={item.from?.name || "User"}
                    width={48}
                    height={48}
                    className="w-12 h-12 object-cover rounded-full border border-gray-200/80 bg-gray-50 shadow-2xs"
                  />
                </div>

                {/* Notification body details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`text-sm md:text-base text-gray-900 truncate ${
                        !item.isRead ? "font-bold" : "font-semibold"
                      }`}
                    >
                      {item.from?.name || "System"}
                    </span>
                    <span className="text-gray-400 text-[11px] shrink-0 font-medium select-none">
                      {relativeTime(item.createdAt, { now })}
                    </span>
                  </div>

                  <h4
                    className={`text-sm md:text-base text-gray-850 leading-snug ${
                      !item.isRead ? "font-semibold" : "font-medium"
                    }`}
                  >
                    {title}
                  </h4>

                  <p className="text-sm text-gray-500 leading-relaxed break-words">
                    {body}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
