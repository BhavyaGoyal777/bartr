import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Bartr, Message, User, Notification } from "@/lib/models";
import { auth } from "@/lib/auth";

export async function POST(
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
    const body = await request.json();
    const { content, messageType = "TEXT" } = body;

    const bartr = await Bartr.findById(bartrId);

    if (!bartr) {
      return NextResponse.json({ error: "Bartr not found" }, { status: 404 });
    }

    if (bartr.initiatorId !== session.user.id && bartr.receiverId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const message = await Message.create({
      bartrId,
      senderId: session.user.id,
      content,
      messageType,
    });

    // Update bartr's updatedAt timestamp
    bartr.updatedAt = new Date();
    await bartr.save();

    const otherUserId = bartr.initiatorId === session.user.id ? bartr.receiverId : bartr.initiatorId;
    await Notification.create({
      userId: otherUserId,
      type: "NEW_MESSAGE",
      title: "New Message",
      message: `You have a new message`,
    });

    // Populate sender info
    const sender = await User.findById(session.user.id)
      .select('_id name image')
      .lean();

    const result = {
      ...message.toObject(),
      id: message._id.toString(),
      sender: sender ? {
        id: sender._id.toString(),
        name: sender.name,
        image: sender.image
      } : null,
    };

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json({ error: "Failed to create message" }, { status: 500 });
  }
}

