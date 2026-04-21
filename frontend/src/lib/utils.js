import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatKenyanNumber(phone) {
  if (!phone) return "";
  // Ensure it starts with 254
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "254" + cleaned.substring(1);
  } else if (!cleaned.startsWith("254")) {
    cleaned = "254" + cleaned;
  }
  return cleaned;
}
