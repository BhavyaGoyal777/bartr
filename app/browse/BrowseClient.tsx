"use client";

import { useState } from "react";
import Link from "next/link";

interface Listing {
  id: string;
  title: string;
  imageUrl: string | null;
  category: string;
}

interface BrowseClientProps {
  listings: Listing[];
}

const categories = ["All", "Clothing", "Electronics", "Home Goods", "Books", "Furniture"];

export default function BrowseClient({ listings }: BrowseClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredListings = listings.filter((listing) => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || listing.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="max-w-6xl mx-auto px-4 py-3 md:py-8 md:px-12 lg:px-24">
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <h1 className="text-2xl font-bold text-[#333333] md:text-3xl">Browse</h1>
        <button className="text-[#333333] hover:text-[#5D845F] p-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="16" y1="4" x2="16" y2="20" />
              <circle cx="16" cy="7" r="1.5" fill="#333333"/>
              <line x1="8" y1="4" x2="8" y2="20" />
              <circle cx="8" cy="17" r="1.5" fill="#333333"/>
            </g>
          </svg>
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for items"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-12 rounded-xl bg-[#EAF0E8] border border-transparent placeholder:text-[#B0A9A9] focus:outline-none focus:ring-2 focus:ring-[#5D845F]"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B0A9A9]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
          </svg>
        </div>
      </div>

      <div className="mb-8 overflow-x-auto whitespace-nowrap hide-scrollbar">
        <div className="inline-flex gap-2 pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`text-sm px-4 py-2 rounded-xl font-medium transition ${
                selectedCategory === category
                  ? "bg-[#EAF0E8] text-[#333333]"
                  : "bg-[#F0F0F0] text-[#333333] hover:bg-[#EAEAEA]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
        {filteredListings.map((listing) => (
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

      {filteredListings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[#B0A9A9]">No items found</p>
        </div>
      )}
    </main>
  );
}

