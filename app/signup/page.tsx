"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/sign-up/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (response.ok) {
        router.push("/login?registered=true");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to create account");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignup = async (provider: "google" | "github") => {
    try {
      const res = await fetch("/api/auth/sign-in/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });

      if (res.redirected) {
        window.location.href = res.url;
        return;
      }

      const location = res.headers.get("location");
      if (location) {
        window.location.href = location;
        return;
      }

      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await res.json();
        if (data?.redirect && data?.url) {
          window.location.href = data.url;
          return;
        }
      }

      window.location.href = `/api/auth/callback/${provider}`;
    } catch (error) {
      console.error("Social signup error:", error);
    }
  };

  return (
    <div className="bg-white min-h-screen flex items-center justify-center p-4">
      <div className="relative w-full max-w-[420px] bg-white border border-[#D6D6D6] rounded-[20px] shadow-lg p-5 sm:p-6 md:p-8 mx-auto">
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-[80px] opacity-70">
          <Image
            src="/reference/signup/two_catuses.svg"
            alt="Cactus Decoration"
            width={80}
            height={80}
            className="w-full h-auto object-contain drop-shadow-[6px_5px_3px_#E3E3E3]"
          />
        </div>

        <div className="mb-6 md:mb-8 text-center mt-6">
          <h1 className="font-koulen text-[26px] sm:text-[30px] text-black">SIGN UP</h1>
          <p className="text-[16px] sm:text-[18px] text-black mt-1">to get started</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-[10px] text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 bg-white border border-[#EAEAEA] rounded-[10px] text-[14px] text-[#333333] placeholder:text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#5D845F] shadow-sm"
            required
          />
          <input
            type="email"
            placeholder="example@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 bg-white border border-[#EAEAEA] rounded-[10px] text-[14px] text-[#333333] placeholder:text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#5D845F] shadow-sm"
            required
          />
          <input
            type="password"
            placeholder="Password (min 8 characters)"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-3 bg-white border border-[#EAEAEA] rounded-[10px] text-[14px] text-[#333333] placeholder:text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#5D845F] shadow-sm"
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="w-full px-4 py-3 bg-white border border-[#EAEAEA] rounded-[10px] text-[14px] text-[#333333] placeholder:text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#5D845F] shadow-sm"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#5D845F] hover:bg-[#4d6f4f] text-white text-[14px] py-3 rounded-[10px] shadow-md border border-[#EAEAEA] mt-5 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Sign Up"}
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
            onClick={() => handleSocialSignup("google")}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[#EAEAEA] rounded-[10px] hover:bg-gray-50 transition"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google logo"
              className="w-4 h-4"
            />
            <span className="text-[#333333] text-[14px]">Sign up with Google</span>
          </button>

          <button
            onClick={() => handleSocialSignup("github")}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[#EAEAEA] rounded-[10px] hover:bg-gray-50 transition"
          >
            <img
              src="https://www.svgrepo.com/show/512317/github-142.svg"
              alt="GitHub logo"
              className="w-4 h-4"
            />
            <span className="text-[#333333] text-[14px]">Sign up with GitHub</span>
          </button>
        </div>

        <div className="text-center">
          <p className="text-[13px] sm:text-[14px] text-[#333333]">
            Already have an account?{" "}
            <Link href="/login" className="text-[#FF6B35] hover:text-[#e55a2b] font-semibold">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

