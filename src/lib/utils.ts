import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function stripHtml(text: string | null): string {
  if (!text) return "";
  return text
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/&nbsp;/g, " ") // Replace &nbsp; with space
    .replace(/&amp;/g, "&") // Replace &amp; with &
    .replace(/&lt;/g, "<") // Replace &lt; with <
    .replace(/&gt;/g, ">") // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/&#39;/g, "'") // Replace &#39; with '
    .trim();
}

export function formatNumber(num: number): string {
  if (num === null || num === undefined) return "";
  if (num >= 1000000) {
    const formatted = (num / 1000000).toFixed(1);
    return (formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted) + 'M';
  }
  if (num >= 1000) {
    const formatted = (num / 1000).toFixed(1);
    return (formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted) + 'K';
  }
  return num.toString();
}
