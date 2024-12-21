/* eslint-disable @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const log = {
  info: (...args: any[]) => console.log("%c[INFO]", "color:aqua;", ...args),
  error: (...args: any[]) => console.error("%c[ERROR]", "color:red;", ...args),
  warn: (...args: any[]) => console.warn("%c[WARN]", "color:orange;", ...args),
  debug: (...args: any[]) =>
    console.debug("%c[DEBUG]", "color:purple;", ...args),
};
