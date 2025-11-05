import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { listingId, offeredListingId, message } = body;

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.userId === session.user.id) {
      return NextResponse.json({ error: "Cannot bartr with your own listing" }, { status: 400 });
    }

    const bartr = await prisma.bartr.create({
      data: {
        initiatorId: session.user.id,
        receiverId: listing.userId,
        listingId,
        offeredListingId: offeredListingId || null,
        message: message || null,
        status: "PENDING",
      },
    });

    await prisma.notification.create({
      data: {
        userId: listing.userId,
        type: "BARTR_REQUEST",
        title: "New Bartr Request",
        message: `Someone wants to trade for your ${listing.title}`,
      },
    });

    return NextResponse.json(bartr, { status: 201 });
  } catch (error) {
    console.error("Error creating bartr:", error);
    return NextResponse.json({ error: "Failed to create bartr" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bartrs = await prisma.bartr.findMany({
      where: {
        OR: [
          { initiatorId: session.user.id },
          { receiverId: session.user.id },
        ],
      },
      include: {
        listing: true,
        initiator: {
          select: { id: true, name: true, image: true },
        },
        receiver: {
          select: { id: true, name: true, image: true },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(bartrs);
  } catch (error) {
    console.error("Error fetching bartrs:", error);
    return NextResponse.json({ error: "Failed to fetch bartrs" }, { status: 500 });
  }
}

