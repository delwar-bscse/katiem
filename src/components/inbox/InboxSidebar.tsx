/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Input } from "@/components/ui/input";
import { formatUrl } from "@/utils/formatUrl";
import dayjs from "dayjs";
import Image from "next/image";
import { Search } from "lucide-react";
import { useUpdateSearchParams } from "@/hooks/useUpdateSearchParams";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface InboxSidebarProps {
  chatList: any[];
  selectedChat: any;
  onChatClick: (chat: any) => void;
  className?: string; // For hiding on mobile
  activeUserId?: string | null;
}

const InboxSidebar = ({
  chatList,
  selectedChat,
  onChatClick,
  className = "",
  activeUserId,
}: InboxSidebarProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const updateSearchParam = useUpdateSearchParams();
  const [searchChat, setSearchChat] = useState("")


  const handleClick = (item: any) => {
    const newId = String(item._ids || item._id);
    const currentId = searchParams.get("chat_id");

    if (currentId === newId) return;

    onChatClick(item);
    updateSearchParam("chat_id", newId);
  };

  useEffect(()=>{
    const params = new URLSearchParams(window.location.search);
    if(searchChat){
      params.set('searchChat', searchChat)
      router.push(`?${params.toString()}`, { scroll: false });
    }else{
      params.delete('searchChat')
      router.push(`?${params.toString()}`, { scroll: false });
    }
  },[searchChat]);

  return (
    <div
      className={`h-[calc(100vh-120px)] flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${className}`}
    >
      <div className="p-4 border-b border-gray-100 bg-white z-10">
        <h2 className="text-xl font-bold text-gray-800 mb-4 px-1">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
          <Input
            value={searchChat}
            onChange={(e) => setSearchChat(e.target.value)}
            className="w-full rounded-xl bg-gray-50 pl-10 h-10 border-gray-200 focus-visible:ring-1 focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
            placeholder="Search chats..."
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent p-3 space-y-2">
        {chatList?.map((item) => {
          // Check if message is unread AND sent by someone else
          // If activeUserId is not yet loaded, we might default to comparing against participant
          // But strict logic: isRead must be explicitly false
          const isUnread =
            item.latestMessage?.isRead === false &&
            item.latestMessage?.sender?._id !== activeUserId;
          return (
            <div
              key={item._id}
              onClick={() => {
                handleClick(item)
              }}
              className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border ${selectedChat?._id === item._id
                ? "bg-primary/5 border-primary/10 shadow-sm"
                : "bg-white border-transparent hover:bg-gray-50 hover:border-gray-100"
                }`}
            >
              <div
                className={`relative shrink-0 ${selectedChat?._id === item._id
                  ? "ring-2 ring-primary ring-offset-2 rounded-full"
                  : ""
                  }`}
              >
                <Image
                  src={formatUrl(item?.participant?.profile)}
                  alt={item?.participant?.name || "User"}
                  width={48}
                  height={48}
                  className="size-12 object-cover rounded-full bg-gray-100"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3
                    className={`text-sm truncate ${selectedChat?._id === item._id
                      ? "text-primary font-bold"
                      : isUnread
                        ? "text-gray-900 font-extrabold"
                        : "text-gray-800 font-medium"
                      }`}
                  >
                    {item?.participant?.name || "Unknown User"}
                  </h3>
                  <span
                    className={`text-[10px] shrink-0 ${isUnread ? "text-primary font-bold" : "text-gray-400"
                      }`}
                  >
                    {item?.latestMessage?.createdAt
                      ? dayjs(item.latestMessage.createdAt).format("MMM D, h:mm A")
                      : ""}
                  </span>
                </div>
                <p
                  className={`text-xs truncate ${selectedChat?._id === item._id
                    ? "text-gray-600 font-medium"
                    : isUnread
                      ? "text-gray-900 font-bold"
                      : "text-gray-500"
                    }`}
                >
                  {item?.latestMessage?.files?.length > 0
                    ? item.latestMessage?.sender?._id === activeUserId
                      ? "You sent an image"
                      : "Sent you an image"
                    : item?.latestMessage?.message || "No messages yet"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InboxSidebar;
