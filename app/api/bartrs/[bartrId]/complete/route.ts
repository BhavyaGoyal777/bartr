import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Bartr, Listing, User, Notification } from "@/lib/models";
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
    const url = new URL(request.url);
    const reset = url.searchParams.get('reset') === 'true';

    const bartr = await Bartr.findById(bartrId);

    if (!bartr) {
      return NextResponse.json({ error: "Bartr not found" }, { status: 404 });
    }

    if (bartr.initiatorId !== session.user.id && bartr.receiverId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // If reset flag is true, reset both confirmation flags
    if (reset) {
      console.log('Resetting confirmation flags for bartr:', bartrId);
      bartr.initiatorConfirmed = false;
      bartr.receiverConfirmed = false;
      await bartr.save();
      console.log('Confirmation flags reset successfully');

      const resetResult = {
        ...bartr.toObject(),
        id: bartr._id.toString(),
        messages: [], // Initialize messages as empty array for client compatibility
      };

      return NextResponse.json(resetResult);
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
    if (isInitiator) {
      bartr.initiatorConfirmed = true;
    } else {
      bartr.receiverConfirmed = true;
    }

    // Check if the other user has already confirmed
    const otherUserConfirmed = isInitiator ? bartr.receiverConfirmed : bartr.initiatorConfirmed;

    console.log('Other user confirmed?', otherUserConfirmed);

    // If both users have confirmed, mark as COMPLETED
    if (otherUserConfirmed) {
      bartr.status = "COMPLETED";
      bartr.completedAt = new Date();
      console.log('Setting status to COMPLETED');
    } else {
      console.log('Waiting for other user to confirm');
    }

    console.log('Saving bartr');
    await bartr.save();

    console.log('Updated bartr status:', bartr.status);
    console.log('Updated bartr initiatorConfirmed:', bartr.initiatorConfirmed);
    console.log('Updated bartr receiverConfirmed:', bartr.receiverConfirmed);

    if (bartr.status === "COMPLETED") {
      console.log('Trade is COMPLETED! Marking listings as TRADED...');

      // Mark the listing as TRADED
      console.log('Marking listing as TRADED:', bartr.listingId);
      await Listing.findByIdAndUpdate(bartr.listingId, { status: "TRADED" });

      // If there's an offered listing, mark it as TRADED too
      if (bartr.offeredListingId) {
        console.log('Marking offered listing as TRADED:', bartr.offeredListingId);
        await Listing.findByIdAndUpdate(bartr.offeredListingId, { status: "TRADED" });
      }

      // Increment bartr count for both users
      console.log('Incrementing bartr count for users:', bartr.initiatorId, bartr.receiverId);
      await User.findByIdAndUpdate(bartr.initiatorId, { $inc: { bartrCount: 1 } });
      await User.findByIdAndUpdate(bartr.receiverId, { $inc: { bartrCount: 1 } });
      console.log('Bartr counts incremented successfully');

      // Send notifications to both users
      const otherUserId = bartr.initiatorId === session.user.id ? bartr.receiverId : bartr.initiatorId;

      await Notification.create({
        userId: otherUserId,
        type: "BARTR_COMPLETED",
        title: "Bartr Completed",
        message: "A bartr has been marked as completed. The item is now marked as traded!",
      });

      await Notification.create({
        userId: session.user.id,
        type: "BARTR_COMPLETED",
        title: "Bartr Completed",
        message: "You've successfully completed a bartr! The item is now marked as traded.",
      });
    }

    // Populate listing for response
    const listing = await Listing.findById(bartr.listingId).lean();
    const result = {
      ...bartr.toObject(),
      id: bartr._id.toString(),
      listing: listing ? { ...listing, id: listing._id.toString() } : null,
      messages: [], // Initialize messages as empty array for client compatibility
    };

    console.log('Returning updated bartr with status:', result.status);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error completing bartr:", error);
    return NextResponse.json({ error: "Failed to complete bartr" }, { status: 500 });
  }
}
