import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
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

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: true,
      listings: {
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
      },
      bartrInitiator: {
        include: {
          listing: true,
          receiver: true,
        },
        orderBy: { createdAt: "desc" },
      },
      bartrReceiver: {
        include: {
          listing: true,
          initiator: true,
        },
        orderBy: { createdAt: "desc" },
      },
      reviewsReceived: {
        include: {
          reviewer: {
            select: { name: true, image: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const totalBartrs = await prisma.bartr.count({
    where: {
      OR: [{ initiatorId: user.id }, { receiverId: user.id }],
      status: "COMPLETED",
    },
  });

  const totalDonations = await prisma.listing.count({
    where: {
      userId: user.id,
      listingType: "DONATION",
      status: "COMPLETED",
    },
  });

  const averageRating = user.reviewsReceived.length > 0
    ? user.reviewsReceived.reduce((sum, review) => sum + review.rating, 0) / user.reviewsReceived.length
    : 0;

  return (
    <div className="bg-white text-[#333333] min-h-screen pb-20 md:pb-0">
      <Navbar user={session.user} />
      
      <ProfileClient
        user={{
          ...user,
          totalBartrs,
          totalDonations,
          averageRating,
        }}
        isOwnProfile={true}
      />

      <Footer />
      <MobileNav currentPath="/profile" />
    </div>
  );
}

