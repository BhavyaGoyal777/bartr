"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavbarProps {
  user?: {
    name?: string | null;
    image?: string | null;
  } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();

  return (
    <header className="bg-white py-4 px-6 md:px-12 lg:px-24 border-b border-[#EAEAEA] hidden md:block">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="font-koulen text-2xl md:text-3xl text-[#5D845F] tracking-wider">
          BARTR
        </Link>

        <nav className="flex items-center gap-6">
          {user ? (
            <>
              <Link
                href="/browse"
                className={`text-sm ${
                  pathname === "/browse"
                    ? "font-semibold text-[#5D845F]"
                    : "text-[#333333] hover:text-[#5D845F]"
                }`}
              >
                Browse
              </Link>
              <Link
                href="/messages"
                className={`text-sm ${
                  pathname === "/messages"
                    ? "font-semibold text-[#5D845F]"
                    : "text-[#333333] hover:text-[#5D845F]"
                }`}
              >
                Messages
              </Link>
              <Link
                href="/listings/create"
                className="text-sm px-4 py-2 rounded-[10px] bg-[#5D845F] hover:bg-[#4d6f4f] text-white border border-[#EAEAEA] transition"
              >
                Post Item
              </Link>
              <Link
                href="/profile"
                className={`relative ${
                  pathname === "/profile" ? "border-2 border-[#5D845F] rounded-full p-0.5" : ""
                }`}
              >
                <img
                  src={user.image || "https://raw.githubusercontent.com/kryptobolt07/assests/main/chat/profile_1.svg"}
                  alt="profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-6 py-2 border border-[#EAEAEA] text-[#333333] rounded-[10px] hover:bg-gray-50 transition"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2 bg-[#5D845F] text-white rounded-[10px] hover:bg-[#4d6f4f] transition"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

