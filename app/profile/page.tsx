import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import connectDB from "@/lib/mongodb";
import { User, Profile, Listing, Bartr, Review } from "@/lib/models";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/Footer";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  await connectDB();

  const user = await User.findById(session.user.id).lean();

  if (!user) {
    redirect("/login");
  }

  // Get profile
  const profile = await Profile.findOne({ userId: user._id.toString() }).lean();

  // Get active listings
  const listings = await Listing.find({
    userId: user._id.toString(),
    status: "ACTIVE"
  })
    .sort({ createdAt: -1 })
    .lean();

  // Get bartrs as initiator
  const bartrInitiatorData = await Bartr.find({
    initiatorId: user._id.toString()
  })
    .sort({ createdAt: -1 })
    .lean();

  const bartrInitiator = await Promise.all(
    bartrInitiatorData.map(async (bartr) => {
      const [listing, receiver] = await Promise.all([
        Listing.findById(bartr.listingId).lean(),
        User.findById(bartr.receiverId).lean()
      ]);

      const { _id, ...bartrData } = bartr;
      const listingClean = listing ? { ...listing, _id: undefined, id: listing._id.toString() } : null;
      const receiverClean = receiver ? { ...receiver, _id: undefined, id: receiver._id.toString() } : null;

      return {
        ...bartrData,
        id: _id.toString(),
        listing: listingClean,
        receiver: receiverClean,
      };
    })
  );

  // Get bartrs as receiver
  const bartrReceiverData = await Bartr.find({
    receiverId: user._id.toString()
  })
    .sort({ createdAt: -1 })
    .lean();

  const bartrReceiver = await Promise.all(
    bartrReceiverData.map(async (bartr) => {
      const [listing, initiator] = await Promise.all([
        Listing.findById(bartr.listingId).lean(),
        User.findById(bartr.initiatorId).lean()
      ]);

      const { _id, ...bartrData } = bartr;
      const listingClean = listing ? { ...listing, _id: undefined, id: listing._id.toString() } : null;
      const initiatorClean = initiator ? { ...initiator, _id: undefined, id: initiator._id.toString() } : null;

      return {
        ...bartrData,
        id: _id.toString(),
        listing: listingClean,
        initiator: initiatorClean,
      };
    })
  );

  // Get reviews received
  const reviewsReceivedData = await Review.find({
    revieweeId: user._id.toString()
  })
    .sort({ createdAt: -1 })
    .lean();

  const reviewsReceived = await Promise.all(
    reviewsReceivedData.map(async (review) => {
      const reviewer = await User.findById(review.reviewerId)
        .select('name image')
        .lean();

      const { _id, ...reviewData } = review;

      return {
        ...reviewData,
        id: _id.toString(),
        reviewer: reviewer ? {
          name: reviewer.name,
          image: reviewer.image
        } : null,
      };
    })
  );

  // Calculate stats
  const totalBartrs = await Bartr.countDocuments({
    $or: [
      { initiatorId: user._id.toString() },
      { receiverId: user._id.toString() }
    ],
    status: "COMPLETED"
  });

  const totalDonations = await Listing.countDocuments({
    userId: user._id.toString(),
    listingType: "DONATION",
    status: "COMPLETED"
  });

  const averageRating = reviewsReceived.length > 0
    ? reviewsReceived.reduce((sum, review) => sum + review.rating, 0) / reviewsReceived.length
    : 0;

  // Get completed bartrs
  const completedBartrsData = await Bartr.find({
    $or: [
      { initiatorId: user._id.toString() },
      { receiverId: user._id.toString() }
    ],
    status: "COMPLETED"
  })
    .sort({ completedAt: -1 })
    .lean();

  const completedBartrs = await Promise.all(
    completedBartrsData.map(async (bartr) => {
      const [listing, initiator, receiver] = await Promise.all([
        Listing.findById(bartr.listingId).select('_id title imageUrl').lean(),
        User.findById(bartr.initiatorId).select('_id name image').lean(),
        User.findById(bartr.receiverId).select('_id name image').lean()
      ]);

      // Destructure to exclude _id
      const { _id, ...bartrData } = bartr;

      return {
        ...bartrData,
        id: _id.toString(),
        listing: listing ? {
          id: listing._id.toString(),
          title: listing.title,
          imageUrl: listing.imageUrl
        } : null,
        initiator: initiator ? {
          id: initiator._id.toString(),
          name: initiator.name,
          image: initiator.image
        } : null,
        receiver: receiver ? {
          id: receiver._id.toString(),
          name: receiver.name,
          image: receiver.image
        } : null,
      };
    })
  );

  const userData = {
    ...user,
    _id: undefined,
    id: user._id.toString(),
    profile: profile ? {
      ...profile,
      _id: undefined,
      id: profile._id.toString()
    } : null,
    listings: listings.map(l => ({ ...l, _id: undefined, id: l._id.toString() })),
    bartrInitiator,
    bartrReceiver,
    reviewsReceived,
    completedBartrs,
    totalBartrs,
    totalDonations,
    averageRating,
  };

  return (
    <div className="bg-white text-[#333333] min-h-screen pb-20 md:pb-0">
      <Navbar user={session.user} />

      <ProfileClient
        user={userData}
        isOwnProfile={true}
      />

      <Footer />
      <MobileNav currentPath="/profile" />
    </div>
  );
}
