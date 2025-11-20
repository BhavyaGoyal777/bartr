import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import connectDB from "@/lib/mongodb";
import { Listing, User } from "@/lib/models";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/Footer";
import BrowseClient from "./BrowseClient";
import mongoose from "mongoose";

export default async function BrowsePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  await connectDB();

  const listingsData = await Listing.find({
    status: { $in: ["ACTIVE", "TRADED"] }
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  // Populate user data
  const listings = (await Promise.all(
    listingsData.map(async (listing) => {
      // Convert userId string to ObjectId
      const userObjectId = mongoose.Types.ObjectId.isValid(listing.userId)
        ? new mongoose.Types.ObjectId(listing.userId)
        : listing.userId;

      const user = await User.findById(userObjectId)
        .select('_id name image')
        .lean();

      // Skip listings without valid users
      if (!user) {
        console.warn(`Skipping listing ${listing._id} - user not found: ${listing.userId}`);
        return null;
      }

      return {
        ...listing,
        _id: undefined,
        id: listing._id.toString(),
        user: {
          id: user._id.toString(),
          name: user.name,
          image: user.image,
        },
      };
    })
  )).filter(Boolean); // Remove null entries

  return (
    <div className="bg-white text-[#333333] min-h-screen pb-20 md:pb-0">
      <Navbar user={session.user} />
      
      <BrowseClient listings={listings} />

      <Footer />
      <MobileNav currentPath="/browse" />
    </div>
  );
}

