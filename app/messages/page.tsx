import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/Footer";
import MessagesClient from "./MessagesClient";

export default async function MessagesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const bartrs = await prisma.bartr.findMany({
    where: {
      OR: [
        { initiatorId: session.user.id },
        { receiverId: session.user.id },
      ],
      status: {
        in: ["PENDING", "ACCEPTED", "COMPLETED"],
      },
    },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          imageUrl: true,
        },
      },
      initiator: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      receiver: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="bg-white text-[#333333] min-h-screen pb-20 md:pb-0">
      <Navbar user={session.user} />
      
      <MessagesClient bartrs={bartrs} currentUserId={session.user.id} />

      <Footer />
      <MobileNav currentPath="/messages" />
    </div>
  );
}

