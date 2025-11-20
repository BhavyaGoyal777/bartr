import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Bartr, Listing, User, Message } from "@/lib/models";
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bartrId: string }> }
) {
  try {
    await connectDB();

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bartrId } = await params;

    const bartr = await Bartr.findById(bartrId).lean();

    if (!bartr) {
      return NextResponse.json({ error: "Bartr not found" }, { status: 404 });
    }

    if (bartr.initiatorId !== session.user.id && bartr.receiverId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Populate related data
    const [listing, initiator, receiver, messages] = await Promise.all([
      Listing.findById(bartr.listingId)
        .select('_id title imageUrl description category condition')
        .lean(),
      User.findById(bartr.initiatorId)
        .select('_id name image')
        .lean(),
      User.findById(bartr.receiverId)
        .select('_id name image')
        .lean(),
      Message.find({ bartrId: bartr._id.toString() })
        .sort({ createdAt: 1 })
        .lean(),
    ]);

    // Populate senders for messages
    const messagesWithSender = await Promise.all(
      messages.map(async (msg) => {
        const sender = await User.findById(msg.senderId)
          .select('_id name image')
          .lean();
        return {
          ...msg,
          id: msg._id.toString(),
          sender: sender ? {
            id: sender._id.toString(),
            name: sender.name,
            image: sender.image
          } : null,
        };
      })
    );

    const result = {
      ...bartr,
      id: bartr._id.toString(),
      listing: listing ? {
        ...listing,
        id: listing._id.toString()
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
      messages: messagesWithSender,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching bartr:", error);
    return NextResponse.json({ error: "Failed to fetch bartr" }, { status: 500 });
  }
}

