"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type MenuOption = "photo" | "deal" | null;

interface Message {
  id: string;
  content: string;
  messageType: string;
  createdAt: Date;
  sender: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface Bartr {
  id: string;
  status: string;
  initiatorId: string;
  receiverId: string;
  initiatorConfirmed: boolean;
  receiverConfirmed: boolean;
  listing: {
    id: string;
    title: string;
    imageUrl: string | null;
    description: string;
    category: string;
    condition: string;
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
  messages: Message[];
}

interface OfferedListing {
  id: string;
  title: string;
  imageUrl: string | null;
  description: string;
  category: string;
  condition: string;
}

interface ChatClientProps {
  bartr: Bartr;
  offeredListing: OfferedListing | null;
  currentUserId: string;
}

export default function ChatClient({ bartr: initialBartr, offeredListing, currentUserId }: ChatClientProps) {
  const router = useRouter();
  const [bartr, setBartr] = useState(initialBartr);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const bartrRef = useRef(bartr);

  const otherUser = bartr.initiator.id === currentUserId ? bartr.receiver : bartr.initiator;
  const isReceiver = bartr.receiverId === currentUserId;

  // Keep ref in sync with state
  useEffect(() => {
    bartrRef.current = bartr;
  }, [bartr]);

  // Scroll to bottom when component first mounts
  useEffect(() => {
    if (bartr.messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, []); // Empty dependency array - only run once on mount

  // Poll for new messages every 3 seconds
  useEffect(() => {
    const pollMessages = async () => {
      try {
        const currentBartr = bartrRef.current;
        const response = await fetch(`/api/bartrs/${currentBartr.id}`);
        if (response.ok) {
          const updatedBartr = await response.json();
          
          // Check if there are new messages or status changed
          const newMessageCount = updatedBartr.messages.length;
          const previousMessageCount = currentBartr.messages.length;
          const previousStatus = currentBartr.status;
          
          if (newMessageCount > previousMessageCount || updatedBartr.status !== previousStatus) {
            setBartr(updatedBartr);
            
            // Auto-scroll to bottom only if new messages were added
            if (newMessageCount > previousMessageCount) {
              setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }
          }
        }
      } catch (error) {
        console.error("Error polling messages:", error);
      }
    };

    const interval = setInterval(pollMessages, 3000); // Poll every 3 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [bartr.id]); // Only depend on bartr.id to avoid recreating interval

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/bartrs/${bartr.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newMessage,
        }),
      });

      if (response.ok) {
        const message = await response.json();
        const updatedBartr = {
          ...bartr,
          messages: [...bartr.messages, message],
        };
        setBartr(updatedBartr);
        setNewMessage("");
        // Scroll to bottom after sending message
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBartr = async () => {
    try {
      const response = await fetch(`/api/bartrs/${bartr.id}/accept`, {
        method: "POST",
      });

      if (response.ok) {
        const updatedBartr = { ...bartr, status: "ACCEPTED" };
        setBartr(updatedBartr);
        router.refresh();
      }
    } catch (error) {
      console.error("Error accepting bartr:", error);
    }
  };

  const handleDeclineBartr = async () => {
    try {
      const response = await fetch(`/api/bartrs/${bartr.id}/decline`, {
        method: "POST",
      });

      if (response.ok) {
        router.push("/messages");
      }
    } catch (error) {
      console.error("Error declining bartr:", error);
    }
  };

  const handleCompleteBartr = async () => {
    try {
      const response = await fetch(`/api/bartrs/${bartr.id}/complete`, {
        method: "POST",
      });

      if (response.ok) {
        const updatedBartr = { ...bartr, status: "COMPLETED" };
        setBartr(updatedBartr);
        router.refresh();
      }
    } catch (error) {
      console.error("Error completing bartr:", error);
    }
  };

  const handleSendCloseDealRequest = async () => {
    setShowMenu(false);
    try {
      const response = await fetch(`/api/bartrs/${bartr.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: "I'd like to finalize this trade. Please confirm to complete the deal.",
          messageType: "CLOSE_DEAL_REQUEST",
        }),
      });

      if (response.ok) {
        const message = await response.json();
        setBartr({
          ...bartr,
          messages: [...bartr.messages, message],
        });
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } catch (error) {
      console.error("Error sending deal closure request:", error);
    }
  };

  const handleRespondToCloseDeal = async (accept: boolean) => {
    try {
      const response = await fetch(`/api/bartrs/${bartr.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: accept ? "Trade confirmed! Deal is complete." : "I need more time. Let's continue chatting.",
          messageType: accept ? "CLOSE_DEAL_ACCEPTED" : "CLOSE_DEAL_REJECTED",
        }),
      });

      if (response.ok) {
        const message = await response.json();
        setBartr({
          ...bartr,
          messages: [...bartr.messages, message],
        });
        
        if (accept) {
          // Call the complete API for two-way confirmation
          await handleCompleteBartr();
        }
        
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } catch (error) {
      console.error("Error responding to deal closure:", error);
    }
  };

  return (
    <main className="flex-1 flex flex-col w-full h-full">
      <div className="border-b border-[#EAEAEA] p-4 bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/messages" className="hover:bg-gray-100 p-2 rounded-full transition">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-[#333333]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <img
              src={otherUser.image || "https://raw.githubusercontent.com/kryptobolt07/assests/main/chat/profile_1.svg"}
              alt={otherUser.name || "User"}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h2 className="font-semibold">{otherUser.name}</h2>
              <p className="text-sm text-[#B0A9A9]">Re: {bartr.listing.title}</p>
            </div>
          </div>
          <span
            className={`text-xs px-3 py-1 rounded-full ${
              bartr.status === "PENDING"
                ? "bg-yellow-100 text-yellow-800"
                : bartr.status === "ACCEPTED"
                ? "bg-green-100 text-green-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {bartr.status}
          </span>
        </div>

        {bartr.status === "PENDING" && (
          <div className="mt-4 p-4 bg-[#EAF0E8] rounded-lg border border-[#5D845F]/20">
            <p className="text-sm font-semibold mb-3 text-[#333333]">Trade Proposal</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-lg border border-[#EAEAEA] shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-[#5D845F]">{isReceiver ? 'Your Item' : 'They Want'}:</span>
                </div>
                <div className="flex gap-3">
                  <img
                    src={bartr.listing.imageUrl || "https://i.imgur.com/Qj04L0z.png"}
                    alt={bartr.listing.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#333333] mb-1">{bartr.listing.title}</p>
                    <p className="text-xs text-[#B0A9A9]">{bartr.listing.category}</p>
                    <p className="text-xs text-[#6b6b6b] mt-1">Condition: {bartr.listing.condition}</p>
                  </div>
                </div>
              </div>
              {offeredListing ? (
                <div className="bg-white p-3 rounded-lg border border-[#EAEAEA] shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-[#5D845F]">{isReceiver ? 'In Exchange For' : 'Your Offer'}:</span>
                  </div>
                  <div className="flex gap-3">
                    <img
                      src={offeredListing.imageUrl || "https://i.imgur.com/Qj04L0z.png"}
                      alt={offeredListing.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#333333] mb-1">{offeredListing.title}</p>
                      <p className="text-xs text-[#B0A9A9]">{offeredListing.category}</p>
                      <p className="text-xs text-[#6b6b6b] mt-1">Condition: {offeredListing.condition}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-3 rounded-lg border border-[#EAEAEA] shadow-sm flex items-center justify-center">
                  <p className="text-sm text-[#B0A9A9]">No item offered (Donation request)</p>
                </div>
              )}
            </div>

            {isReceiver && (
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleAcceptBartr}
                  className="flex-1 bg-[#5D845F] hover:bg-[#4d6f4f] text-white py-2.5 rounded-[10px] text-sm font-semibold transition shadow-sm"
                >
                  Accept Request
                </button>
                <button
                  onClick={handleDeclineBartr}
                  className="flex-1 bg-[#8B5A5A] hover:bg-[#6d4545] text-white py-2.5 rounded-[10px] text-sm font-semibold transition shadow-sm"
                >
                  Decline Request
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {bartr.status === "PENDING" ? (
        <div className="flex-1 flex items-center justify-center p-8 bg-[#F9F9F9] overflow-y-auto">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-[#EAF0E8] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#5D845F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#333333] mb-2">Waiting for Response</h3>
            <p className="text-sm text-[#6b6b6b]">
              {isReceiver 
                ? "Please review the trade proposal above and accept or decline."
                : "The other user needs to accept your trade proposal before you can start chatting."}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F9F9F9]">
            {bartr.messages.map((message) => {
              const isOwn = message.sender.id === currentUserId;
              console.log('Message:', message.content, 'Type:', message.messageType);
              const isCloseDealRequest = message.messageType === "CLOSE_DEAL_REQUEST";
              const isCloseDealResponse = message.messageType === "CLOSE_DEAL_ACCEPTED" || message.messageType === "CLOSE_DEAL_REJECTED";
              
              if (isCloseDealRequest) {
                return (
                  <div key={message.id} className="flex justify-center">
                    <div className="max-w-md w-full bg-gradient-to-r from-[#EAF0E8] to-[#E0EBE0] border-2 border-[#5D845F] rounded-xl p-4 shadow-md">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-10 h-10 bg-[#5D845F] rounded-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-[#333333]">{message.sender.name} wants to finalize the trade</p>
                          <p className="text-xs text-[#6b6b6b]">{message.content}</p>
                        </div>
                      </div>
                      {!isOwn && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleRespondToCloseDeal(true)}
                            className="flex-1 bg-[#5D845F] hover:bg-[#4d6f4f] text-white py-2 rounded-lg font-semibold transition"
                          >
                            ✓ Confirm & Complete
                          </button>
                          <button
                            onClick={() => handleRespondToCloseDeal(false)}
                            className="flex-1 bg-[#8B5A5A] hover:bg-[#6d4545] text-white py-2 rounded-lg font-semibold transition"
                          >
                            ✕ Not Yet
                          </button>
                        </div>
                      )}
                      {isOwn && (
                        <p className="text-xs text-[#6b6b6b] text-center mt-2">Waiting for response...</p>
                      )}
                    </div>
                  </div>
                );
              }
              
              if (isCloseDealResponse) {
                const accepted = message.messageType === "CLOSE_DEAL_ACCEPTED";
                return (
                  <div key={message.id} className="flex justify-center">
                    <div className={`max-w-sm px-4 py-2 rounded-lg ${
                      accepted ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                      <p className="text-sm font-semibold text-center">{message.content}</p>
                    </div>
                  </div>
                );
              }
              
              return (
                <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-2 max-w-[70%] ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                    <img
                      src={message.sender.image || "https://raw.githubusercontent.com/kryptobolt07/assests/main/chat/profile_1.svg"}
                      alt={message.sender.name || "User"}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          isOwn ? "bg-[#5D845F] text-white" : "bg-gray-100 text-[#333333]"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <p className="text-xs text-[#B0A9A9] mt-1 px-2">
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="border-t border-[#EAEAEA] p-4 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
            <div className="flex gap-3 items-center relative">
              {bartr.status === "ACCEPTED" && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-3 bg-[#5D845F] hover:bg-[#4d6f4f] text-white rounded-full transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  {showMenu && (
                    <div className="absolute bottom-full left-0 mb-2 bg-white border border-[#EAEAEA] rounded-lg shadow-lg py-2 w-56 z-10">
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          // TODO: Implement photo upload
                          alert('Photo upload coming soon!');
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#5D845F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Send Photo</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleSendCloseDealRequest}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#5D845F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Request Deal Closure</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Message..."
                className="flex-1 px-4 py-3 rounded-full border border-[#EAEAEA] bg-[#F9F9F9] focus:outline-none focus:ring-2 focus:ring-[#5D845F] focus:bg-white transition"
              />
              <button
                type="submit"
                disabled={loading || !newMessage.trim()}
                className="px-6 py-3 bg-[#5D845F] hover:bg-[#4d6f4f] text-white rounded-full font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </form>
        </>
      )}
    </main>
  );
}

