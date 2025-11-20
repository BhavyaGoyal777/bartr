import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import connectDB from "@/lib/mongodb";
import { Bartr, Listing, User, Message } from "@/lib/models";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/Footer";
import MessagesClient from "./MessagesClient";

export default async function MessagesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  await connectDB();

  const bartrsData = await Bartr.find({
    $or: [
      { initiatorId: session.user.id },
      { receiverId: session.user.id },
    ],
    status: { $in: ["PENDING", "ACCEPTED", "COMPLETED"] }
  })
    .sort({ updatedAt: -1 })
    .lean();

  const bartrs = await Promise.all(
    bartrsData.map(async (bartr) => {
      const [listing, initiator, receiver, messages] = await Promise.all([
        Listing.findById(bartr.listingId)
          .select('_id title imageUrl')
          .lean(),
        User.findById(bartr.initiatorId)
          .select('_id name image')
          .lean(),
        User.findById(bartr.receiverId)
          .select('_id name image')
          .lean(),
        Message.find({ bartrId: bartr._id.toString() })
          .sort({ createdAt: -1 })
          .limit(1)
          .lean()
      ]);

      return {
        ...bartr,
        _id: undefined,
        id: bartr._id.toString(),
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
        messages: messages.map(msg => ({
          ...msg,
          _id: undefined,
          id: msg._id.toString()
        }))
      };
    })
  );

  return (
    <div className="bg-white text-[#333333] min-h-screen pb-20 md:pb-0">
      <Navbar user={session.user} />

      <MessagesClient bartrs={bartrs} currentUserId={session.user.id} />

      <Footer />
      <MobileNav currentPath="/messages" />
    </div>
  );
}
