import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toBS(date: Date): string {
  const adYear = date.getFullYear();
  const adMonth = date.getMonth() + 1;
  const adDay = date.getDate();
  const bsYear = adYear + 56 + (adMonth > 4 || (adMonth === 4 && adDay >= 13) ? 1 : 0);
  return `${bsYear}-${adMonth}-${adDay}`; 
}

export const translations: Record<string, Record<string, string>> = {
  en: {
    synced: "Synced",
    offline: "Offline Mode",
  },
  ne: {
    synced: "सिङ्क गरियो",
    offline: "अफलाइन मोड",
  }
};
