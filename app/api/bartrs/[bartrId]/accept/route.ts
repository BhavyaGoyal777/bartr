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

    if (bartr.receiverId !== session.user.id) {
      return NextResponse.json({ error: "Only receiver can accept" }, { status: 403 });
    }

    const updatedBartr = await prisma.bartr.update({
      where: { id: bartrId },
      data: { status: "ACCEPTED" },
    });

    await prisma.notification.create({
      data: {
        userId: bartr.initiatorId,
        type: "BARTR_ACCEPTED",
        title: "Bartr Accepted",
        message: "Your bartr request was accepted!",
      },
    });

    return NextResponse.json(updatedBartr);
  } catch (error) {
    console.error("Error accepting bartr:", error);
    return NextResponse.json({ error: "Failed to accept bartr" }, { status: 500 });
  }
}

