import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
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
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
            description: true,
            category: true,
            condition: true,
          },
        },
        initiator: {
          select: { id: true, name: true, image: true },
        },
        receiver: {
          select: { id: true, name: true, image: true },
        },
        messages: {
          include: {
            sender: {
              select: { id: true, name: true, image: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!bartr) {
      return NextResponse.json({ error: "Bartr not found" }, { status: 404 });
    }

    if (bartr.initiatorId !== session.user.id && bartr.receiverId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(bartr);
  } catch (error) {
    console.error("Error fetching bartr:", error);
    return NextResponse.json({ error: "Failed to fetch bartr" }, { status: 500 });
  }
}

