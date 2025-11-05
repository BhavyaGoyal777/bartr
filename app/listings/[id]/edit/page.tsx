import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/Footer";
import EditListingForm from "./EditListingForm";

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id },
  });

  if (!listing) {
    notFound();
  }

  if (listing.userId !== session.user.id) {
    redirect("/browse");
  }

  return (
    <div className="bg-white text-[#333333] min-h-screen pb-20 md:pb-0">
      <Navbar user={session.user} />
      
      <EditListingForm listing={listing} />

      <Footer />
      <MobileNav currentPath="/browse" />
    </div>
  );
}

