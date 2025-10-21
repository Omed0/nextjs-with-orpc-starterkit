import { type ClassValue, clsx } from "clsx";
import { cache } from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const PublicEndpoint = cache(
  (pathname: string, PublicEndpoints: string[]): boolean => {
    return PublicEndpoints.some((endpoint) => {
      const regex = new RegExp(`^${endpoint}$`);
      return regex.test(pathname);
    });
  }
);
