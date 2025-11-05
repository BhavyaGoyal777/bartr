import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/browse");
  }

  return (
    <div className="bg-[#FAFAFA] text-[#333333] min-h-screen flex flex-col">
      <Navbar user={null} />

      <main className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-10 md:py-20 flex-1">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="relative order-2 md:order-1 flex justify-center">
            <div className="relative w-full aspect-square max-w-lg">
              <Image
                src="/reference/home/Ellipse1.svg"
                alt=""
                width={500}
                height={500}
                className="absolute inset-0 w-full h-full object-contain opacity-70"
              />
              <Image
                src="/reference/home/Ellipse2.svg"
                alt=""
                width={500}
                height={500}
                className="absolute inset-0 w-full h-full object-contain opacity-80"
              />
              <Image
                src="/reference/home/phone.svg"
                alt="Phone"
                width={300}
                height={300}
                className="absolute top-0 left-0 w-3/5 md:w-2/3 z-10"
              />
              <Image
                src="/reference/home/man_with_laptop.svg"
                alt="Man"
                width={300}
                height={300}
                className="absolute bottom-0 right-0 w-3/5 md:w-2/3 z-10"
              />
              <Image
                src="/reference/home/plant1.svg"
                alt="Plant"
                width={80}
                height={80}
                className="absolute bottom-4 left-4 w-16 md:w-20 opacity-90"
              />
              <Image
                src="/reference/home/plant2.svg"
                alt="Plant"
                width={80}
                height={80}
                className="absolute top-12 right-4 w-16 md:w-20 opacity-90"
              />
              <Image
                src="/reference/home/plant3.svg"
                alt="Plant"
                width={80}
                height={80}
                className="absolute top-1/3 right-8 w-16 md:w-20 opacity-90"
              />
            </div>
          </div>

          <div className="order-1 md:order-2 text-center md:text-left">
            <h2 className="font-koulen text-5xl md:text-6xl text-[#5D845F] tracking-wider mb-4 md:mb-6">
              BARTR
            </h2>
            <p className="text-[15px] sm:text-[16px] md:text-[18px] text-[#333333] leading-relaxed max-w-xl mx-auto md:mx-0">
              BARTR connects neighbors to swap goods and services — no money, just trades. Exchange
              what you don't need for what you do.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row justify-center md:justify-start gap-3">
              <Link
                href="/signup"
                className="bg-[#5D845F] text-white px-6 py-3 rounded-[10px] hover:bg-[#4d6f4f] transition shadow-md border border-[#EAEAEA] text-center"
              >
                Get Started
              </Link>
              <Link
                href="#"
                className="border border-[#EAEAEA] text-[#333333] px-6 py-3 rounded-[10px] hover:bg-gray-50 transition shadow-sm text-center"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
