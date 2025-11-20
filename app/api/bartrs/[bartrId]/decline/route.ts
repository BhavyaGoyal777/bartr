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
      return NextResponse.json({ error: "Only receiver can decline" }, { status: 403 });
    }

    bartr.status = "DECLINED";
    await bartr.save();

    await Notification.create({
      userId: bartr.initiatorId,
      type: "BARTR_DECLINED",
      title: "Bartr Declined",
      message: "Your bartr request was declined",
    });

    const result = {
      ...bartr.toObject(),
      id: bartr._id.toString(),
      messages: [], // Initialize messages as empty array for client compatibility
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error declining bartr:", error);
    return NextResponse.json({ error: "Failed to decline bartr" }, { status: 500 });
  }
}

