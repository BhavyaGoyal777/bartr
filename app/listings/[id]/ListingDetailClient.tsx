"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  listingType: string;
  swapPreferences: string | null;
  imageUrl: string | null;
  status: string;
  userId: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    profile: {
      location: string | null;
    } | null;
  };
}

interface UserListing {
  id: string;
  title: string;
  imageUrl: string | null;
}

interface ListingDetailClientProps {
  listing: Listing;
  currentUserId: string;
  userListings: UserListing[];
}

export default function ListingDetailClient({
  listing,
  currentUserId,
  userListings,
}: ListingDetailClientProps) {
  const router = useRouter();
  const [showBartrModal, setShowBartrModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwnListing = listing.userId === currentUserId;
  const isTraded = listing.status === "TRADED";

  const handleDelete = async () => {
    if (isTraded) {
      alert("Cannot delete a traded listing");
      return;
    }
    
    if (!confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/listings/${listing.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/browse");
      } else {
        alert("Failed to delete listing");
      }
    } catch (error) {
      console.error("Error deleting listing:", error);
      alert("An error occurred");
    } finally {
      setDeleting(false);
    }
  };

  const handleInitiateBartr = async () => {
    if (!selectedListing) {
      alert("Please select an item to offer");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/bartrs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          offeredListingId: selectedListing,
          message,
        }),
      });

      if (response.ok) {
        router.push("/messages");
      } else {
        alert("Failed to initiate bartr");
      }
    } catch (error) {
      console.error("Error initiating bartr:", error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  console.log('Listing imageUrl:', listing.imageUrl ? 'Has image' : 'No image', listing.imageUrl?.substring(0, 50));

  return (
    <>
      <div className="sticky top-0 z-10 bg-white border-b border-[#EAEAEA] shadow-sm">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4">
          <button
            onClick={() => router.push('/browse')}
            className="flex items-center gap-2 text-[#5D845F] hover:text-[#4d6f4f] transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-semibold">Back to Browse</span>
          </button>
        </div>
      </div>
      
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-12">
        <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="aspect-square bg-[#F7F7F7] rounded-2xl overflow-hidden mb-4 relative">
            <img
              src={listing.imageUrl || "https://i.imgur.com/Qj04L0z.png"}
              alt={listing.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Image failed to load:', listing.imageUrl?.substring(0, 100));
                e.currentTarget.src = "https://i.imgur.com/Qj04L0z.png";
              }}
            />
            {isTraded && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="bg-[#5D845F] text-white px-6 py-3 rounded-full text-lg font-bold">
                  TRADED
                </span>
              </div>
            )}
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
          <p className="text-[#5D845F] font-semibold mb-4">
            {listing.listingType === "BARTER" ? "For Trade" : "Free (Donation)"}
          </p>

          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[#EAEAEA]">
            <img
              src={listing.user.image || "https://raw.githubusercontent.com/kryptobolt07/assests/main/chat/profile_1.svg"}
              alt={listing.user.name || "User"}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <Link href={`/profile/${listing.user.id}`} className="font-semibold hover:text-[#5D845F]">
                {listing.user.name}
              </Link>
              {listing.user.profile?.location && (
                <p className="text-sm text-[#B0A9A9]">{listing.user.profile.location}</p>
              )}
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <h3 className="font-semibold mb-1">Description</h3>
              <p className="text-[#6b6b6b]">{listing.description}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-1">Category</h3>
              <p className="text-[#6b6b6b]">{listing.category}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-1">Condition</h3>
              <p className="text-[#6b6b6b]">{listing.condition}</p>
            </div>

            {listing.swapPreferences && (
              <div>
                <h3 className="font-semibold mb-1">Looking For</h3>
                <p className="text-[#6b6b6b]">{listing.swapPreferences}</p>
              </div>
            )}
          </div>

          {!isOwnListing && listing.status === "ACTIVE" && (
            <button
              onClick={() => setShowBartrModal(true)}
              className="w-full bg-[#5D845F] hover:bg-[#4d6f4f] text-white py-3 rounded-[10px] font-semibold transition"
            >
              {listing.listingType === "BARTER" ? "Initiate Bartr" : "Request Item"}
            </button>
          )}

          {!isOwnListing && isTraded && (
            <div className="bg-gray-100 border border-gray-300 text-gray-600 py-3 rounded-[10px] text-center font-semibold">
              This item has been traded
            </div>
          )}

          {isOwnListing && (
            <>
              {isTraded ? (
                <div className="bg-gray-100 border border-gray-300 text-gray-600 py-3 rounded-[10px] text-center font-semibold">
                  This item has been traded
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link
                    href={`/listings/${listing.id}/edit`}
                    className="flex-1 text-center border border-[#5D845F] text-[#5D845F] py-3 rounded-[10px] font-semibold hover:bg-[#5D845F] hover:text-white transition"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 border border-red-500 text-red-500 py-3 rounded-[10px] font-semibold hover:bg-red-500 hover:text-white transition disabled:opacity-50"
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showBartrModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Initiate Bartr</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Select an item to offer</label>
              <select
                value={selectedListing}
                onChange={(e) => setSelectedListing(e.target.value)}
                className="w-full px-4 py-3 rounded-[10px] border border-[#EAEAEA] focus:outline-none focus:ring-2 focus:ring-[#5D845F]"
              >
                <option value="">Choose an item...</option>
                {userListings.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Message (optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Add a message to the owner..."
                className="w-full px-4 py-3 rounded-[10px] border border-[#EAEAEA] focus:outline-none focus:ring-2 focus:ring-[#5D845F]"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowBartrModal(false)}
                className="flex-1 border border-[#EAEAEA] py-3 rounded-[10px] font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleInitiateBartr}
                disabled={loading || !selectedListing}
                className="flex-1 bg-[#5D845F] hover:bg-[#4d6f4f] text-white py-3 rounded-[10px] font-semibold transition disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      )}
      </main>
    </>
  );
}
