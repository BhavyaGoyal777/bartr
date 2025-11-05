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
    const url = new URL(request.url);
    const reset = url.searchParams.get('reset') === 'true';

    const bartr = await prisma.bartr.findUnique({
      where: { id: bartrId },
    });

    if (!bartr) {
      return NextResponse.json({ error: "Bartr not found" }, { status: 404 });
    }

    if (bartr.initiatorId !== session.user.id && bartr.receiverId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // If reset flag is true, reset both confirmation flags
    if (reset) {
      console.log('Resetting confirmation flags for bartr:', bartrId);
      const updatedBartr = await prisma.bartr.update({
        where: { id: bartrId },
        data: {
          initiatorConfirmed: false,
          receiverConfirmed: false,
        },
      });
      console.log('Confirmation flags reset successfully');
      return NextResponse.json(updatedBartr);
    }

    const isInitiator = bartr.initiatorId === session.user.id;
    
    console.log('Complete request:', {
      bartrId,
      userId: session.user.id,
      isInitiator,
      currentStatus: bartr.status,
      initiatorConfirmed: bartr.initiatorConfirmed,
      receiverConfirmed: bartr.receiverConfirmed,
    });
    
    // Update the confirmation status for the current user
    const updateData: any = {
      [isInitiator ? 'initiatorConfirmed' : 'receiverConfirmed']: true,
    };

    // Check if the other user has already confirmed
    const otherUserConfirmed = isInitiator ? bartr.receiverConfirmed : bartr.initiatorConfirmed;
    
    console.log('Other user confirmed?', otherUserConfirmed);
    
    // If both users have confirmed, mark as COMPLETED
    if (otherUserConfirmed) {
      updateData.status = "COMPLETED";
      updateData.completedAt = new Date();
      console.log('Setting status to COMPLETED');
    } else {
      console.log('Waiting for other user to confirm');
    }

    console.log('Updating bartr with data:', updateData);
    
    const updatedBartr = await prisma.bartr.update({
      where: { id: bartrId },
      data: updateData,
      include: {
        listing: true,
      },
    });

    console.log('Updated bartr status:', updatedBartr.status);
    console.log('Updated bartr initiatorConfirmed:', updatedBartr.initiatorConfirmed);
    console.log('Updated bartr receiverConfirmed:', updatedBartr.receiverConfirmed);

    if (updatedBartr.status === "COMPLETED") {
      console.log('Trade is COMPLETED! Marking listings as TRADED...');
      // Mark the listing as TRADED
      console.log('Marking listing as TRADED:', bartr.listingId);
      await prisma.listing.update({
        where: { id: bartr.listingId },
        data: { status: "TRADED" },
      });

      // If there's an offered listing, mark it as TRADED too
      if (bartr.offeredListingId) {
        console.log('Marking offered listing as TRADED:', bartr.offeredListingId);
        await prisma.listing.update({
          where: { id: bartr.offeredListingId },
          data: { status: "TRADED" },
        });
      }

      // Increment bartr count for both users
      console.log('Incrementing bartr count for users:', bartr.initiatorId, bartr.receiverId);
      await prisma.user.update({
        where: { id: bartr.initiatorId },
        data: { 
          bartrCount: { increment: 1 },
        },
      });

      await prisma.user.update({
        where: { id: bartr.receiverId },
        data: { 
          bartrCount: { increment: 1 },
        },
      });
      console.log('Bartr counts incremented successfully');

      // Send notifications to both users
      const otherUserId = bartr.initiatorId === session.user.id ? bartr.receiverId : bartr.initiatorId;
      
      await prisma.notification.create({
        data: {
          userId: otherUserId,
          type: "BARTR_COMPLETED",
          title: "Bartr Completed",
          message: "A bartr has been marked as completed. The item is now marked as traded!",
        },
      });

      await prisma.notification.create({
        data: {
          userId: session.user.id,
          type: "BARTR_COMPLETED",
          title: "Bartr Completed",
          message: "You've successfully completed a bartr! The item is now marked as traded.",
        },
      });
    }

    console.log('Returning updated bartr with status:', updatedBartr.status);
    return NextResponse.json(updatedBartr);
  } catch (error) {
    console.error("Error completing bartr:", error);
    return NextResponse.json({ error: "Failed to complete bartr" }, { status: 500 });
  }
}

