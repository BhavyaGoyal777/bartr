import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/Footer";
import CreateListingForm from "./CreateListingForm";

export default async function CreateListingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="bg-white text-[#333333] min-h-screen pb-20 md:pb-0">
      <Navbar user={session.user} />
      
      <CreateListingForm userId={session.user.id} />

      <Footer />
      <MobileNav currentPath="/listings/create" />
    </div>
  );
}

