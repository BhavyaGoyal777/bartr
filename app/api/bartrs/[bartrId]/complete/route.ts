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

    const bartr = await prisma.bartr.findUnique({
      where: { id: bartrId },
    });

    if (!bartr) {
      return NextResponse.json({ error: "Bartr not found" }, { status: 404 });
    }

    if (bartr.initiatorId !== session.user.id && bartr.receiverId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const isInitiator = bartr.initiatorId === session.user.id;
    
    // Update the confirmation status for the current user
    const updateData: any = {
      [isInitiator ? 'initiatorConfirmed' : 'receiverConfirmed']: true,
    };

    // Check if the other user has already confirmed
    const otherUserConfirmed = isInitiator ? bartr.receiverConfirmed : bartr.initiatorConfirmed;
    
    // If both users have confirmed, mark as COMPLETED
    if (otherUserConfirmed) {
      updateData.status = "COMPLETED";
      updateData.completedAt = new Date();
    }

    const updatedBartr = await prisma.bartr.update({
      where: { id: bartrId },
      data: updateData,
    });

    if (updatedBartr.status === "COMPLETED") {
      const otherUserId = bartr.initiatorId === session.user.id ? bartr.receiverId : bartr.initiatorId;
      await prisma.notification.create({
        data: {
          userId: otherUserId,
          type: "BARTR_COMPLETED",
          title: "Bartr Completed",
          message: "A bartr has been marked as completed. Please leave a review!",
        },
      });
    }

    return NextResponse.json(updatedBartr);
  } catch (error) {
    console.error("Error completing bartr:", error);
    return NextResponse.json({ error: "Failed to complete bartr" }, { status: 500 });
  }
}

