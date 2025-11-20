import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import connectDB from "@/lib/mongodb";
import { Listing } from "@/lib/models";
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

  await connectDB();

  const listingData = await Listing.findById(id).lean();

  if (!listingData) {
    notFound();
  }

  if (listingData.userId !== session.user.id) {
    redirect("/browse");
  }

  if (listingData.status === "TRADED") {
    redirect(`/listings/${id}`);
  }

  const listing = {
    ...listingData,
    _id: undefined,
    id: listingData._id.toString(),
  };

  return (
    <div className="bg-white text-[#333333] min-h-screen pb-20 md:pb-0">
      <Navbar user={session.user} />

      <EditListingForm listing={listing} />

      <Footer />
      <MobileNav currentPath="/browse" />
    </div>
  );
}
