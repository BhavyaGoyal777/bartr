"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authClient.signIn.email({
        email,
        password,
      });

      if (response.error) {
        setError(response.error.message || "Invalid credentials");
      } else {
        window.location.href = "/browse";
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen flex items-center justify-center p-4">
      <div className="relative w-full max-w-[420px] bg-white border border-[#D6D6D6] rounded-[20px] shadow-lg p-5 sm:p-6 md:p-8 mx-auto">
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-[80px] opacity-70">
          <Image
            src="/reference/login/single_cactus.svg"
            alt="Cactus Decoration"
            width={80}
            height={80}
            className="w-full h-auto object-contain drop-shadow-[6px_5px_3px_#E3E3E3]"
          />
        </div>

        <div className="mb-6 md:mb-8 text-center mt-6">
          <h1 className="font-koulen text-[26px] sm:text-[30px] text-black">LOGIN</h1>
          <p className="text-[16px] sm:text-[18px] text-black mt-1">to get started</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-[10px] text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-[#EAEAEA] rounded-[10px] text-[14px] text-[#333333] placeholder:text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#5D845F] shadow-sm"
            aria-label="Email"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-[#EAEAEA] rounded-[10px] text-[14px] text-[#333333] placeholder:text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#5D845F] shadow-sm"
            aria-label="Password"
            required
          />

          <div className="text-right pt-1">
            <Link
              href="#"
              className="text-[13px] sm:text-[14px] text-[#333333] hover:text-[#5D845F] transition"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#5D845F] hover:bg-[#4d6f4f] text-white text-[14px] py-3 rounded-[10px] shadow-md border border-[#EAEAEA] mt-5 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Continue"}
          </button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#EAEAEA]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white text-[#B0A9A9] text-[13px]">Or</span>
          </div>
        </div>

        <div className="space-y-3 mb-5">
          <button
            onClick={async () => {
              await authClient.signIn.social({
                provider: "google",
                callbackURL: "/browse",
              });
            }}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[#EAEAEA] rounded-[10px] hover:bg-gray-50 transition"
            aria-label="Login with Google"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google logo"
              className="w-4 h-4"
            />
            <span className="text-[#333333] text-[14px]">Login with Google</span>
          </button>

          <button
            onClick={async () => {
              await authClient.signIn.social({
                provider: "github",
                callbackURL: "/browse",
              });
            }}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[#EAEAEA] rounded-[10px] hover:bg-gray-50 transition"
            aria-label="Login with GitHub"
          >
            <img
              src="https://www.svgrepo.com/show/512317/github-142.svg"
              alt="GitHub logo"
              className="w-4 h-4"
            />
            <span className="text-[#333333] text-[14px]">Login with GitHub</span>
          </button>
        </div>

        <div className="text-center">
          <p className="text-[13px] sm:text-[14px] text-[#333333]">
            New User?{" "}
            <Link href="/signup" className="text-[#FF6B35] hover:text-[#e55a2b] font-semibold">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

