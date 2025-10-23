import { Geist, Ubuntu_Mono } from "next/font/google";
import localFont from "next/font/local";

const speda = localFont({
  src: [
    { path: "../../../public/fonts/Speda-Bold.ttf", weight: "700" },
    { path: "../../../public/fonts/Speda.ttf", weight: "400" },
  ],
  fallback: ["monospace", "sans-serif"],
  variable: "--font-speda",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  fallback: ["sans-serif"],
  weight: ["300", "400", "700"],
});

const geistMono = Ubuntu_Mono({
  variable: "--font-ubuntu-mono",
  subsets: ["latin"],
  fallback: ["monospace"],
  weight: ["400", "700"],
});

export default { geistSans, geistMono, speda };
