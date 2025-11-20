import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import connectDB from "@/lib/mongodb";
import { Bartr, Listing, User, Message } from "@/lib/models";
import ChatClient from "./ChatClient";
import mongoose from "mongoose";

export default async function ChatPage({ params }: { params: Promise<{ bartrId: string }> }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const { bartrId } = await params;

  await connectDB();

  const bartrData = await Bartr.findById(bartrId).lean();

  if (!bartrData) {
    notFound();
  }

  if (bartrData.initiatorId !== session.user.id && bartrData.receiverId !== session.user.id) {
    redirect("/messages");
  }

  // Convert IDs to ObjectId
  const listingObjectId = mongoose.Types.ObjectId.isValid(bartrData.listingId)
    ? new mongoose.Types.ObjectId(bartrData.listingId)
    : bartrData.listingId;
  const initiatorObjectId = mongoose.Types.ObjectId.isValid(bartrData.initiatorId)
    ? new mongoose.Types.ObjectId(bartrData.initiatorId)
    : bartrData.initiatorId;
  const receiverObjectId = mongoose.Types.ObjectId.isValid(bartrData.receiverId)
    ? new mongoose.Types.ObjectId(bartrData.receiverId)
    : bartrData.receiverId;
  const offeredListingObjectId = bartrData.offeredListingId && mongoose.Types.ObjectId.isValid(bartrData.offeredListingId)
    ? new mongoose.Types.ObjectId(bartrData.offeredListingId)
    : bartrData.offeredListingId;

  // Fetch related data
  const [listing, initiator, receiver, messages, offeredListingData] = await Promise.all([
    Listing.findById(listingObjectId)
      .select('_id title imageUrl description category condition')
      .lean(),
    User.findById(initiatorObjectId)
      .select('_id name image')
      .lean(),
    User.findById(receiverObjectId)
      .select('_id name image')
      .lean(),
    Message.find({ bartrId: bartrData._id.toString() })
      .sort({ createdAt: 1 })
      .lean(),
    offeredListingObjectId
      ? Listing.findById(offeredListingObjectId)
          .select('_id title imageUrl description category condition')
          .lean()
      : null,
  ]);

  // Check if users exist
  if (!initiator || !receiver) {
    console.error(`Users not found for bartr ${bartrId}`, {
      initiatorId: bartrData.initiatorId,
      receiverId: bartrData.receiverId,
      initiatorFound: !!initiator,
      receiverFound: !!receiver
    });
    notFound();
  }

  // Populate senders for messages
  const messagesWithSender = await Promise.all(
    messages.map(async (msg) => {
      const senderObjectId = mongoose.Types.ObjectId.isValid(msg.senderId)
        ? new mongoose.Types.ObjectId(msg.senderId)
        : msg.senderId;

      const sender = await User.findById(senderObjectId)
        .select('_id name image')
        .lean();
      return {
        ...msg,
        _id: undefined,
        id: msg._id.toString(),
        sender: sender ? {
          id: sender._id.toString(),
          name: sender.name,
          image: sender.image
        } : null,
      };
    })
  );

  // Destructure to remove _id from bartrData
  const { _id, ...bartrClean } = bartrData;

  const bartr = {
    ...bartrClean,
    id: _id.toString(),
    listing: listing ? {
      id: listing._id.toString(),
      title: listing.title,
      imageUrl: listing.imageUrl,
      description: listing.description,
      category: listing.category,
      condition: listing.condition
    } : null,
    initiator: {
      id: initiator._id.toString(),
      name: initiator.name,
      image: initiator.image
    },
    receiver: {
      id: receiver._id.toString(),
      name: receiver.name,
      image: receiver.image
    },
    messages: messagesWithSender,
  };

  const offeredListing = offeredListingData ? {
    id: offeredListingData._id.toString(),
    title: offeredListingData.title,
    imageUrl: offeredListingData.imageUrl,
    description: offeredListingData.description,
    category: offeredListingData.category,
    condition: offeredListingData.condition
  } : null;

  return (
    <div className="bg-white text-[#333333] h-screen flex flex-col overflow-hidden">
      <ChatClient bartr={bartr} offeredListing={offeredListing} currentUserId={session.user.id} />
    </div>
  );
}
