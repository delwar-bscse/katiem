"use client";

import { formatUrl } from "@/utils/formatUrl";
import dayjs from "dayjs";
import Image from "next/image";
import { useEffect, useRef } from "react";

interface MessageListProps {
  messages: any[];
  isLoading: boolean;
  activeUserId?: string; // To identify 'me' vs 'them' if we have active user ID, currently we infer from receiver
  clickedChat: any; // Needed for current inference logic
}

const MessageList = ({
  messages,
  isLoading,
  clickedChat,
}: MessageListProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent bg-slate-50/50 p-4">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-full gap-3">
          <div className="size-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm font-medium">
            Loading conversation...
          </p>
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full opacity-60">
          <Image
            src={formatUrl(clickedChat?.participant?.profile)}
            width={80}
            height={80}
            alt="User"
            className="size-20 rounded-full grayscale mb-4 object-cover"
          />
          <p className="text-gray-500">No messages yet. Say hello!</p>
        </div>
      ) : (
        <div className="flex flex-col-reverse gap-4 min-h-full">
          <div ref={bottomRef} />
          {messages.map((item) => {
            // Logic: If receiver ID == clickedChat participant ID, then I sent it.
            // CAUTION: This logic depends on the assumption that 'clickedChat.participant' is the *other* person.
            // If I am sender, receiver is them.
            const isMe = item?.receiver?._id === clickedChat?.participant?._id;

            return (
              <div
                key={item._id}
                className={`flex gap-3 max-w-[85%] ${
                  isMe ? "self-end flex-row-reverse" : "self-start flex-row"
                } group`}
              >
                {/* Avatar (only for them) */}
                {!isMe && (
                  <div className="shrink-0 self-end mb-1">
                    <Image
                      src={formatUrl(clickedChat?.participant?.profile)}
                      alt="User"
                      width={28}
                      height={28}
                      className="size-7 rounded-full object-cover bg-gray-200"
                    />
                  </div>
                )}

                <div
                  className={`relative p-3.5 px-5 rounded-3xl break-words ${
                    isMe
                      ? "bg-gradient-to-br from-primary to-primary/90 text-white rounded-br-sm shadow-md shadow-primary/20"
                      : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm shadow-md shadow-gray-100/50"
                  }`}
                >
                  {/* Images Attachment */}
                  {item.files && item.files.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {item.files.map((file: string, idx: number) => (
                        <Image
                          key={idx}
                          src={formatUrl(file)}
                          alt="attachment"
                          width={200}
                          height={200}
                          className="rounded-lg object-cover max-w-full h-auto max-h-[200px] border border-black/10"
                        />
                      ))}
                    </div>
                  )}

                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {item.message}
                  </p>

                  <span
                    className={`text-[10px] block mt-1.5 text-right font-medium opacity-80 ${
                      isMe ? "text-white/90" : "text-gray-500"
                    }`}
                  >
                    {dayjs(item?.createdAt).format("MMM D, h:mm A")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MessageList;
