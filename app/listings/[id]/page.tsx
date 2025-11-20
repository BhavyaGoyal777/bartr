import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import connectDB from "@/lib/mongodb";
import { Listing, User, Profile } from "@/lib/models";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/Footer";
import ListingDetailClient from "./ListingDetailClient";
import mongoose from "mongoose";

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;

  await connectDB();

  const listingData = await Listing.findById(id).lean();

  if (!listingData) {
    notFound();
  }

  // Get user and profile
  // Convert userId string to ObjectId
  const userObjectId = mongoose.Types.ObjectId.isValid(listingData.userId)
    ? new mongoose.Types.ObjectId(listingData.userId)
    : listingData.userId;

  let user = await User.findById(userObjectId).lean();

  // If not found, listing has invalid user reference
  if (!user) {
    console.error(`User not found for listing ${id}, userId: ${listingData.userId}`);
    notFound();
  }

  const profile = await Profile.findOne({ userId: user._id.toString() }).lean();

  const listing = {
    ...listingData,
    _id: undefined,
    id: listingData._id.toString(),
    user: {
      ...user,
      _id: undefined,
      id: user._id.toString(),
      profile: profile ? {
        ...profile,
        _id: undefined,
        id: profile._id.toString()
      } : null,
    },
  };

  // Get user's own listings for trading
  const userListings = session.user.id !== listingData.userId.toString()
    ? await Listing.find({
        userId: session.user.id,
        status: "ACTIVE",
      })
        .select('_id title imageUrl')
        .lean()
        .then(listings => listings.map(l => ({
          id: l._id.toString(),
          title: l.title,
          imageUrl: l.imageUrl,
        })))
    : [];

  return (
    <div className="bg-white text-[#333333] min-h-screen pb-20 md:pb-0">
      <Navbar user={session.user} />

      <ListingDetailClient
        listing={listing}
        currentUserId={session.user.id}
        userListings={userListings}
      />

      <Footer />
      <MobileNav currentPath="/browse" />
    </div>
  );
}
