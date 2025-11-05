import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bartrId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bartrId } = await params;
    const body = await request.json();
    const { content, messageType = "TEXT" } = body;

    const bartr = await prisma.bartr.findUnique({
      where: { id: bartrId },
    });

    if (!bartr) {
      return NextResponse.json({ error: "Bartr not found" }, { status: 404 });
    }

    if (bartr.initiatorId !== session.user.id && bartr.receiverId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const message = await prisma.message.create({
      data: {
        bartrId,
        senderId: session.user.id,
        content,
        messageType,
      },
      include: {
        sender: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    await prisma.bartr.update({
      where: { id: bartrId },
      data: { updatedAt: new Date() },
    });

    const otherUserId = bartr.initiatorId === session.user.id ? bartr.receiverId : bartr.initiatorId;
    await prisma.notification.create({
      data: {
        userId: otherUserId,
        type: "NEW_MESSAGE",
        title: "New Message",
        message: `You have a new message`,
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json({ error: "Failed to create message" }, { status: 500 });
  }
}

