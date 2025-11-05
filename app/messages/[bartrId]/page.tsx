import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ChatClient from "./ChatClient";

export default async function ChatPage({ params }: { params: Promise<{ bartrId: string }> }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
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
    notFound();
  }

  // Fetch the offered listing if it exists
  let offeredListing = null;
  if (bartr.offeredListingId) {
    offeredListing = await prisma.listing.findUnique({
      where: { id: bartr.offeredListingId },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        description: true,
        category: true,
        condition: true,
      },
    });
  }

  if (bartr.initiatorId !== session.user.id && bartr.receiverId !== session.user.id) {
    redirect("/messages");
  }

  return (
    <div className="bg-white text-[#333333] h-screen flex flex-col overflow-hidden">
      <ChatClient bartr={bartr} offeredListing={offeredListing} currentUserId={session.user.id} />
    </div>
  );
}

