"use client";

import { useState } from "react";
import Link from "next/link";

interface Bartr {
  id: string;
  status: string;
  listing: {
    id: string;
    title: string;
    imageUrl: string | null;
  };
  initiator: {
    id: string;
    name: string | null;
    image: string | null;
  };
  receiver: {
    id: string;
    name: string | null;
    image: string | null;
  };
  messages: Array<{
    id: string;
    content: string;
    createdAt: Date;
  }>;
  updatedAt: Date;
}

interface MessagesClientProps {
  bartrs: Bartr[];
  currentUserId: string;
}

export default function MessagesClient({ bartrs, currentUserId }: MessagesClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"messages" | "requests">("messages");

  // For PENDING bartrs: show in Requests only if current user is the receiver
  // For initiator, PENDING bartrs should appear in Messages
  const pendingBartrs = bartrs.filter(
    (bartr) => bartr.status === "PENDING" && bartr.receiver.id === currentUserId
  );
  
  const acceptedBartrs = bartrs.filter(
    (bartr) => 
      bartr.status === "ACCEPTED" || 
      bartr.status === "COMPLETED" ||
      (bartr.status === "PENDING" && bartr.initiator.id === currentUserId)
  );

  const displayBartrs = activeTab === "messages" ? acceptedBartrs : pendingBartrs;

  const filteredBartrs = displayBartrs.filter((bartr) => {
    const otherUser = bartr.initiator.id === currentUserId ? bartr.receiver : bartr.initiator;
    return (
      otherUser.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bartr.listing.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 md:py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Chat</h1>
      </div>

      <div className="flex gap-4 mb-6 border-b border-[#EAEAEA]">
        <button
          onClick={() => setActiveTab("messages")}
          className={`pb-3 px-4 font-semibold transition ${
            activeTab === "messages"
              ? "text-[#5D845F] border-b-2 border-[#5D845F]"
              : "text-[#6b6b6b] hover:text-[#333333]"
          }`}
        >
          Messages {acceptedBartrs.length > 0 && `(${acceptedBartrs.length})`}
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`pb-3 px-4 font-semibold transition ${
            activeTab === "requests"
              ? "text-[#5D845F] border-b-2 border-[#5D845F]"
              : "text-[#6b6b6b] hover:text-[#333333]"
          }`}
        >
          Requests {pendingBartrs.length > 0 && `(${pendingBartrs.length})`}
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-12 rounded-xl bg-[#EAF0E8] border border-transparent placeholder:text-[#B0A9A9] focus:outline-none focus:ring-2 focus:ring-[#5D845F]"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B0A9A9]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
          </svg>
        </div>
      </div>

      <div className="space-y-3">
        {filteredBartrs.map((bartr) => {
          const otherUser = bartr.initiator.id === currentUserId ? bartr.receiver : bartr.initiator;
          const lastMessage = bartr.messages[0];

          return (
            <Link
              key={bartr.id}
              href={`/messages/${bartr.id}`}
              className="block border border-[#EAEAEA] rounded-xl p-4 hover:bg-gray-50 transition"
            >
              <div className="flex gap-3">
                <img
                  src={otherUser.image || "https://raw.githubusercontent.com/kryptobolt07/assests/main/chat/profile_1.svg"}
                  alt={otherUser.name || "User"}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold truncate">{otherUser.name}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        bartr.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : bartr.status === "COMPLETED"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {bartr.status}
                    </span>
                  </div>
                  <p className="text-sm text-[#B0A9A9] truncate mb-1">
                    Re: {bartr.listing.title}
                  </p>
                  {lastMessage && (
                    <p className="text-sm text-[#6b6b6b] truncate">{lastMessage.content}</p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filteredBartrs.length === 0 && (
        <div className="text-center py-12">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-16 h-16 mx-auto text-[#B0A9A9] mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 10h8m-8 4h5m9 5l-3-3H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v12z"
            />
          </svg>
          <p className="text-[#B0A9A9] mb-2">
            {activeTab === "messages" ? "No active conversations yet" : "No pending requests"}
          </p>
          <Link
            href="/browse"
            className="inline-block mt-4 text-[#5D845F] hover:text-[#4d6f4f] font-semibold"
          >
            Browse items to start trading
          </Link>
        </div>
      )}
    </main>
  );
}

