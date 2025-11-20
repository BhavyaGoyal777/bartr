import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Listing, User } from "@/lib/models";
import { auth } from "@/lib/auth";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, category, condition, listingType, swapPreferences, imageUrl } = body;

    const listing = await Listing.create({
      title,
      description,
      category,
      condition,
      listingType,
      swapPreferences: swapPreferences || undefined,
      imageUrl: imageUrl || undefined,
      userId: session.user.id,
      status: "ACTIVE",
    });

    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    console.error("Error creating listing:", error);
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const where: any = { status: "ACTIVE" };

    if (category && category !== "All") {
      where.category = category;
    }

    if (search) {
      where.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const listings = await Listing.find(where)
      .sort({ createdAt: -1 })
      .lean();

    // Populate user data
    const listingsWithUser = await Promise.all(
      listings.map(async (listing) => {
        // Convert userId string to ObjectId
        const userObjectId = mongoose.Types.ObjectId.isValid(listing.userId)
          ? new mongoose.Types.ObjectId(listing.userId)
          : listing.userId;

        const user = await User.findById(userObjectId)
          .select('_id name image')
          .lean();
        return {
          ...listing,
          id: listing._id.toString(),
          user: user ? {
            id: user._id.toString(),
            name: user.name,
            image: user.image,
          } : null,
        };
      })
    );

    return NextResponse.json(listingsWithUser);
  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }
}

