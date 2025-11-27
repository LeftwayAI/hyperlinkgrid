"use client";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen max-h-[100dvh] flex-col justify-between gap-4 overflow-hidden bg-brand px-6 py-6 text-center text-white md:gap-8 md:px-12 md:py-10">
      <section className="flex flex-col items-center gap-5">
        <div className="grid gap-3 text-center text-base leading-relaxed text-white/90 sm:text-lg md:text-2xl mb-6">
          <span>1 grid.</span>
          <span>10,000 hyperlinks.</span>
          <span>$100 to add a hyperlink to the grid.</span>
          <span>$100K to 10 random winners when the last one sells.</span>
        </div>

        <Image
          src="/assets/logo-white.svg"
          width={120}
          height={120}
          alt="Hyperlinkgrid logo"
          className="drop-shadow-[0_0_16px_rgba(255,255,255,0.35)]"
        />

        <h1 className="flex justify-center items-baseline gap-0 tracking-brand text-3xl md:text-4xl">
          <span className="font-satoshi-regular text-white">Hyper</span>
          <span className="font-satoshi-light italic text-white">linkgrid</span>
        </h1>
        
        <div className="mt-4">
          <Link 
            href="/grid"
            className="inline-flex items-center gap-2 border border-white px-6 py-3 text-sm font-bold uppercase tracking-wider text-white hover:bg-white hover:text-brand transition-colors"
          >
            See The Grid <span className="text-lg leading-none">→</span>
          </Link>
        </div>
      </section>
      <section className="flex flex-col items-center gap-4 pb-4">
        <div className="flex flex-wrap items-center justify-center gap-5">
          <a
            className="inline-flex w-12 items-center justify-center"
            href="https://farcaster.xyz/hyperlinkgrid"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image src="/assets/fc.svg" width={36} height={36} alt="Farcaster logo" />
          </a>
          <a
            className="inline-flex w-12 items-center justify-center"
            href="https://x.com/hyperlinkgrid"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image src="/assets/x-logo.svg" width={28} height={28} alt="X logo" />
          </a>
        </div>
        <p className="text-base text-white mt-2">Notifications on.</p>
      </section>
    </main>
  );
}

