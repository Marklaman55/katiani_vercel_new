import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatKenyanNumber(phone) {
  if (!phone) return "";
  // Remove all non-digits
  let cleaned = phone.toString().replace(/\D/g, "");
  
  // Remove leading 0 if present and replace with 254
  if (cleaned.startsWith("0")) {
    cleaned = "254" + cleaned.substring(1);
  }
  
  // Handle double 254 prefix like 2542547XXXXXXXX
  if (cleaned.startsWith("254254")) {
    cleaned = cleaned.substring(3); // Remove one "254"
  }

  // If it doesn't start with 254, add it (assuming it's a 9-digit number starting with 7 or 1)
  if (!cleaned.startsWith("254")) {
    if (cleaned.length === 9) {
      cleaned = "254" + cleaned;
    } else if (cleaned.length === 12 && cleaned.startsWith("254")) {
      // already correct
    } else {
      // fallback for other common formats
      cleaned = "254" + cleaned.slice(-9);
    }
  }
  
  return cleaned;
}
