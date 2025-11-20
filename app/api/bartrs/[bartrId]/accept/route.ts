import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Bartr, Notification } from "@/lib/models";
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

    const bartr = await Bartr.findById(bartrId);

    if (!bartr) {
      return NextResponse.json({ error: "Bartr not found" }, { status: 404 });
    }

    if (bartr.receiverId !== session.user.id) {
      return NextResponse.json({ error: "Only receiver can accept" }, { status: 403 });
    }

    bartr.status = "ACCEPTED";
    await bartr.save();

    await Notification.create({
      userId: bartr.initiatorId,
      type: "BARTR_ACCEPTED",
      title: "Bartr Accepted",
      message: "Your bartr request was accepted!",
    });

    const result = {
      ...bartr.toObject(),
      id: bartr._id.toString(),
      messages: [], // Initialize messages as empty array for client compatibility
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error accepting bartr:", error);
    return NextResponse.json({ error: "Failed to accept bartr" }, { status: 500 });
  }
}

