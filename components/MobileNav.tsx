"use client";

import Link from "next/link";

interface MobileNavProps {
  currentPath: string;
}

export default function MobileNav({ currentPath }: MobileNavProps) {
  const isActive = (path: string) => currentPath === path;

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-[#EAEAEA] flex justify-around items-center py-3 md:hidden z-10">
      <Link href="/browse" className={`flex flex-col items-center ${isActive("/browse") ? "text-[#333333] font-medium" : "text-[#B0A9A9] hover:text-[#333333]"}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
        </svg>
        <span className="text-xs">Browse</span>
      </Link>

      <Link href="/listings/create" className={`flex flex-col items-center ${isActive("/listings/create") ? "text-[#333333] font-medium" : "text-[#B0A9A9] hover:text-[#333333]"}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        <span className="text-xs">Post Item</span>
      </Link>

      <Link href="/messages" className={`flex flex-col items-center ${isActive("/messages") ? "text-[#333333] font-medium" : "text-[#B0A9A9] hover:text-[#333333]"}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h8m-8 4h5m9 5l-3-3H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v12z" />
        </svg>
        <span className="text-xs">Chat</span>
      </Link>

      <Link href="/profile" className={`flex flex-col items-center ${isActive("/profile") ? "text-[#333333] font-medium" : "text-[#B0A9A9] hover:text-[#333333]"}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.485 0 4.847.576 6.879 1.804M12 11a4 4 0 100-8 4 4 0 000 8z" />
        </svg>
        <span className="text-xs">Profile</span>
      </Link>
    </nav>
  );
}

