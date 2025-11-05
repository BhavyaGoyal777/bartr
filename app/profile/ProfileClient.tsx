"use client";

import { useState } from "react";
import Link from "next/link";

interface ProfileUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  bartrCount: number;
  profile: {
    bio: string | null;
    location: string | null;
    memberSince: Date;
  } | null;
  listings: Array<{
    id: string;
    title: string;
    imageUrl: string | null;
  }>;
  completedBartrs: Array<{
    id: string;
    status: string;
    completedAt: Date | null;
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
  }>;
  reviewsReceived: Array<{
    id: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
    reviewer: {
      name: string | null;
      image: string | null;
    };
  }>;
  totalBartrs: number;
  totalDonations: number;
  averageRating: number;
}

interface ProfileClientProps {
  user: ProfileUser;
  isOwnProfile: boolean;
}

export default function ProfileClient({ user, isOwnProfile }: ProfileClientProps) {
  const [activeTab, setActiveTab] = useState<"listings" | "history" | "badges" | "reviews">("listings");

  return (
    <main className="max-w-xl mx-auto px-4 md:px-6 py-0 md:py-8">
      <div className="flex justify-between items-center py-4 border-b md:hidden">
        <button className="text-[#333333] p-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-[#333333]">Profile</h1>
        <div className="w-6 h-6"></div>
      </div>

      <section className="text-center py-6 md:py-10">
        <div className="mb-4">
          <img
            src={user.image || "https://raw.githubusercontent.com/kryptobolt07/assests/main/chat/profile_1.svg"}
            alt={user.name || "User"}
            className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover mx-auto"
          />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-1">{user.name || "Anonymous User"}</h2>
        <p className="text-[#5D845F] text-sm font-semibold">
          {user.averageRating.toFixed(1)} ({user.reviewsReceived.length} reviews)
        </p>
        <p className="text-[#B0A9A9] text-sm mb-4">
          Joined {new Date(user.profile?.memberSince || new Date()).getFullYear()}
        </p>

        {user.profile?.bio && (
          <p className="text-sm text-[#6b6b6b] max-w-sm mx-auto mb-6">
            {user.profile.bio}
          </p>
        )}

        {user.profile?.location && (
          <div className="flex items-center justify-center text-sm text-[#333333] mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1 text-[#5D845F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{user.profile.location}</span>
          </div>
        )}

        {isOwnProfile && (
          <div className="md:flex justify-center hidden">
            <Link
              href="/profile/edit"
              className="text-sm px-6 py-2 rounded-[10px] border border-[#5D845F] text-[#5D845F] hover:bg-[#5D845F] hover:text-white transition"
            >
              Edit Profile
            </Link>
          </div>
        )}
      </section>

      <section className="flex justify-around items-center py-4 bg-gray-50 rounded-xl mb-8">
        <div className="text-center">
          <p className="text-lg font-bold">{user.bartrCount}</p>
          <p className="text-xs text-[#B0A9A9]">Total Bartrs</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-[#5D845F]">{user.averageRating.toFixed(1)}</p>
          <p className="text-xs text-[#B0A9A9]">Rating</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold">{user.totalDonations}</p>
          <p className="text-xs text-[#B0A9A9]">Donations</p>
        </div>
      </section>

      <nav className="flex justify-between md:justify-around text-base font-semibold border-b border-[#EAEAEA] mb-6">
        <button
          onClick={() => setActiveTab("listings")}
          className={`text-center pb-2 border-b-2 w-1/4 md:w-auto px-4 ${
            activeTab === "listings"
              ? "border-[#FF9EB9] text-[#333333]"
              : "border-transparent text-[#5D845F] hover:border-gray-300"
          }`}
        >
          Listings
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`text-center pb-2 border-b-2 w-1/4 md:w-auto px-4 ${
            activeTab === "history"
              ? "border-[#FF9EB9] text-[#333333]"
              : "border-transparent text-[#5D845F] hover:border-gray-300"
          }`}
        >
          History
        </button>
        <button
          onClick={() => setActiveTab("badges")}
          className={`text-center pb-2 border-b-2 w-1/4 md:w-auto px-4 ${
            activeTab === "badges"
              ? "border-[#FF9EB9] text-[#333333]"
              : "border-transparent text-[#5D845F] hover:border-gray-300"
          }`}
        >
          Badges
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={`text-center pb-2 border-b-2 w-1/4 md:w-auto px-4 ${
            activeTab === "reviews"
              ? "border-[#FF9EB9] text-[#333333]"
              : "border-transparent text-[#5D845F] hover:border-gray-300"
          }`}
        >
          Reviews
        </button>
      </nav>

      <section className="pb-12">
        {activeTab === "listings" && (
          <>
            <h3 className="text-xl font-bold mb-4">Active Listings</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3">
              {user.listings.map((listing) => (
                <Link href={`/listings/${listing.id}`} key={listing.id} className="block group">
                  <div className="aspect-square bg-[#F7F7F7] rounded-xl overflow-hidden mb-2">
                    <img
                      src={listing.imageUrl || "https://i.imgur.com/Qj04L0z.png"}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  </div>
                  <p className="text-base font-semibold text-[#333333]">{listing.title}</p>
                </Link>
              ))}
            </div>
            {user.listings.length === 0 && (
              <p className="text-center text-[#B0A9A9] py-8">No active listings</p>
            )}
          </>
        )}

        {activeTab === "history" && (
          <>
            <h3 className="text-xl font-bold mb-4">Bartr History</h3>
            <div className="space-y-4">
              {user.completedBartrs.map((bartr) => {
                const otherUser = bartr.initiator.id === user.id ? bartr.receiver : bartr.initiator;
                return (
                  <div key={bartr.id} className="border border-[#EAEAEA] rounded-xl p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 bg-[#F7F7F7] rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={bartr.listing.imageUrl || "https://i.imgur.com/Qj04L0z.png"}
                          alt={bartr.listing.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1">{bartr.listing.title}</h4>
                        <div className="flex items-center gap-2 mb-2">
                          <img
                            src={otherUser.image || "https://raw.githubusercontent.com/kryptobolt07/assests/main/chat/profile_1.svg"}
                            alt={otherUser.name || "User"}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <p className="text-xs text-[#6b6b6b]">
                            Traded with <span className="font-semibold">{otherUser.name}</span>
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#B0A9A9]">
                            {bartr.completedAt ? new Date(bartr.completedAt).toLocaleDateString() : "N/A"}
                          </span>
                          <span className="bg-[#5D845F] text-white px-2 py-1 rounded-full text-xs font-semibold">
                            {bartr.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {user.completedBartrs.length === 0 && (
              <p className="text-center text-[#B0A9A9] py-8">No completed bartrs yet</p>
            )}
          </>
        )}

        {activeTab === "badges" && (
          <>
            <h3 className="text-xl font-bold mb-4">Badges</h3>
            <p className="text-center text-[#B0A9A9] py-8">Badges feature coming soon</p>
          </>
        )}

        {activeTab === "reviews" && (
          <>
            <h3 className="text-xl font-bold mb-4">Reviews</h3>
            <div className="space-y-4">
              {user.reviewsReceived.map((review) => (
                <div key={review.id} className="border border-[#EAEAEA] rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={review.reviewer.image || "https://raw.githubusercontent.com/kryptobolt07/assests/main/chat/profile_1.svg"}
                      alt={review.reviewer.name || "Reviewer"}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-sm">{review.reviewer.name}</p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                  {review.comment && <p className="text-sm text-[#6b6b6b]">{review.comment}</p>}
                </div>
              ))}
            </div>
            {user.reviewsReceived.length === 0 && (
              <p className="text-center text-[#B0A9A9] py-8">No reviews yet</p>
            )}
          </>
        )}
      </section>
    </main>
  );
}

