import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";

const rabar = localFont({
  src: [
    { path: "../../../public/fonts/rabar_15.ttf" },
    {
      path: "../../../public/fonts/rabar_37.ttf",
    },
  ],
  fallback: ["monospace", "sans-serif"],
  variable: "--font-rabar",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  fallback: ["sans-serif"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  fallback: ["monospace"],
});

export default { geistSans, geistMono, rabar };
  