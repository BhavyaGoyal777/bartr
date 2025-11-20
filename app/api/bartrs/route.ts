import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Bartr, Listing, Notification, User, Message } from "@/lib/models";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { listingId, offeredListingId, message } = body;

    const listing = await Listing.findById(listingId);

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.userId === session.user.id) {
      return NextResponse.json({ error: "Cannot bartr with your own listing" }, { status: 400 });
    }

    const bartr = await Bartr.create({
      initiatorId: session.user.id,
      receiverId: listing.userId,
      listingId,
      offeredListingId: offeredListingId || undefined,
      message: message || undefined,
      status: "PENDING",
    });

    await Notification.create({
      userId: listing.userId,
      type: "BARTR_REQUEST",
      title: "New Bartr Request",
      message: `Someone wants to trade for your ${listing.title}`,
    });

    return NextResponse.json(bartr, { status: 201 });
  } catch (error) {
    console.error("Error creating bartr:", error);
    return NextResponse.json({ error: "Failed to create bartr" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bartrs = await Bartr.find({
      $or: [
        { initiatorId: session.user.id },
        { receiverId: session.user.id },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    // Populate related data
    const bartrsWithRelations = await Promise.all(
      bartrs.map(async (bartr) => {
        const [listing, initiator, receiver, messages] = await Promise.all([
          Listing.findById(bartr.listingId).lean(),
          User.findById(bartr.initiatorId).select('_id name image').lean(),
          User.findById(bartr.receiverId).select('_id name image').lean(),
          Message.find({ bartrId: bartr._id.toString() })
            .sort({ createdAt: -1 })
            .limit(1)
            .lean(),
        ]);

        return {
          ...bartr,
          id: bartr._id.toString(),
          listing: listing ? { ...listing, id: listing._id.toString() } : null,
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
          messages: messages.map(msg => ({ ...msg, id: msg._id.toString() })),
        };
      })
    );

    return NextResponse.json(bartrsWithRelations);
  } catch (error) {
    console.error("Error fetching bartrs:", error);
    return NextResponse.json({ error: "Failed to fetch bartrs" }, { status: 500 });
  }
}

