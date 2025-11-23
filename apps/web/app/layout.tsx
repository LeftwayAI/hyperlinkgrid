import type { Metadata } from "next";
import localFont from "next/font/local";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Hyperlinkgrid",
  description: "Minimal web entry point for the Hyperlinkgrid project.",
  icons: {
    icon: "/assets/logo-white.svg",
  },
};

const satoshi = localFont({
  src: "./fonts/Satoshi-Variable.ttf",
  display: "swap",
  variable: "--font-satoshi"
});

const satoshiRegular = localFont({
  src: "./fonts/Satoshi-Regular.otf",
  display: "swap",
  weight: "400",
  variable: "--font-satoshi-regular"
});

const satoshiLightItalic = localFont({
  src: "./fonts/Satoshi-LightItalic.otf",
  display: "swap",
  weight: "300",
  style: "italic",
  variable: "--font-satoshi-light-italic"
});

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${satoshi.variable} ${satoshiRegular.variable} ${satoshiLightItalic.variable} ${GeistMono.variable}`}
    >
      <body className="bg-white text-black antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}


