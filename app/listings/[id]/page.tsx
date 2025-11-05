import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/Footer";
import ListingDetailClient from "./ListingDetailClient";

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          profile: true,
        },
      },
    },
  });

  if (!listing) {
    notFound();
  }

  const userListings = session.user.id !== listing.userId
    ? await prisma.listing.findMany({
        where: {
          userId: session.user.id,
          status: "ACTIVE",
        },
        select: {
          id: true,
          title: true,
          imageUrl: true,
        },
      })
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

