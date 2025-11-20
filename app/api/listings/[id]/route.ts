import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Listing } from "@/lib/models";
import { auth } from "@/lib/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const listing = await Listing.findById(id);

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (listing.status === "TRADED") {
      return NextResponse.json({ error: "Cannot delete a traded listing" }, { status: 400 });
    }

    // Soft delete - update status instead of deleting to preserve trade history
    listing.status = "INACTIVE";
    await listing.save();

    return NextResponse.json({ message: "Listing deleted" });
  } catch (error) {
    console.error("Error deleting listing:", error);
    return NextResponse.json({ error: "Failed to delete listing" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const listing = await Listing.findById(id);

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (listing.status === "TRADED") {
      return NextResponse.json({ error: "Cannot edit a traded listing" }, { status: 400 });
    }

    const body = await request.json();
    const { title, description, category, condition, listingType, swapPreferences, imageUrl } = body;

    listing.title = title;
    listing.description = description;
    listing.category = category;
    listing.condition = condition;
    listing.listingType = listingType;
    listing.swapPreferences = swapPreferences || undefined;
    if (imageUrl) listing.imageUrl = imageUrl;

    await listing.save();

    return NextResponse.json(listing);
  } catch (error) {
    console.error("Error updating listing:", error);
    return NextResponse.json({ error: "Failed to update listing" }, { status: 500 });
  }
}

